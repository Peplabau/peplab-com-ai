/**
 * Edge Function: blog-ai
 *
 * Admin blog CMS helpers:
 *   - suggest_topics → topic cards for the editor to pick
 *   - generate_post  → full blog draft from a chosen topic
 *
 * Secrets: OPENAI_API_KEY (required), OPENAI_MODEL (optional, default gpt-4o-mini)
 * Auth: signed-in admin JWT (profiles.is_admin = true), verified inside this function.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-authorization, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: Response }
> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        500,
      ),
    };
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
  if (!token) {
    return {
      ok: false,
      response: jsonResponse({ error: "Unauthorized — admin JWT required" }, 401),
    };
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const {
    data: { user },
    error: userErr,
  } = await adminClient.auth.getUser(token);

  let userId = user?.id || "";
  if (userErr || !user) {
    const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const again = await userClient.auth.getUser();
    if (again.error || !again.data.user) {
      return {
        ok: false,
        response: jsonResponse({ error: "Invalid or expired session — sign in again" }, 401),
      };
    }
    userId = again.data.user.id;
  }

  const { data: profile, error: profileErr } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (profileErr || !profile?.is_admin) {
    return { ok: false, response: jsonResponse({ error: "Admin only" }, 403) };
  }

  return { ok: true, userId };
}

async function openAiJson(
  openaiKey: string,
  model: string,
  system: string,
  user: string,
  temperature = 0.5,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const openaiJson = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const msg =
      openaiJson?.error?.message ||
      openaiJson?.error ||
      `OpenAI request failed (${openaiRes.status})`;
    return { ok: false, error: String(msg) };
  }

  const content = openaiJson?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return { ok: false, error: "OpenAI returned empty content" };
  }

  try {
    return { ok: true, data: JSON.parse(content) as Record<string, unknown> };
  } catch {
    return { ok: false, error: "Failed to parse AI JSON response" };
  }
}

const SUGGEST_SYSTEM = `You are a content strategist for PEPLAB Australia (peplab.com.au), an independent Australian research peptide supplier.
Suggest blog topics that are educational, compliance-safe, and useful for research buyers.

Rules:
- Research-use / laboratory tone only. Never suggest dosing for human use or therapeutic claims.
- Prefer topics around HPLC/COA literacy, peptide science explainers, shipping/storage for research materials, Australia research-supply context, and how to read studies.
- Titles should be specific and SEO-friendly for Australia.
- Return ONLY JSON: { "topics": [ { "title": string, "angle": string, "keywords": string[], "why": string } ] }
- Provide exactly the requested count of topics.
- angle: 1 sentence on the editorial angle.
- why: 1 short sentence why it fits PEPLAB SEO / trust.`;

const GENERATE_SYSTEM = `You are a blog editor for PEPLAB Australia (peplab.com.au).
Write a complete educational blog draft as JSON.

Rules:
- Research-use only. No human dosing, medical advice, or disease-treatment claims.
- Clear Australian English. Practical for researchers and informed buyers.
- body_markdown: well-structured Markdown with ## / ### headings, short paragraphs, bullet lists where useful, and a short closing note that products are for research use only.
- Aim for roughly 800–1400 words of body_markdown.
- slug: lowercase kebab-case from the title.
- seo_title: ~50–60 chars, include PEPLAB Australia when natural.
- seo_description: 140–160 chars meta description.
- excerpt: 1–2 sentence teaser for the blog index card.
- author_name: "PEPLAB"
- cover_image_url: empty string (admin may add later)
- status: "draft"

Return ONLY JSON with keys:
{
  "slug": string,
  "title": string,
  "excerpt": string,
  "body_markdown": string,
  "cover_image_url": "",
  "seo_title": string,
  "seo_description": string,
  "author_name": "PEPLAB",
  "status": "draft"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      return jsonResponse(
        {
          error:
            "Missing OPENAI_API_KEY. Add it under Supabase → Edge Functions → Secrets, then redeploy blog-ai.",
        },
        500,
      );
    }

    const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
    const body = await req.json().catch(() => null);
    const action = String(body?.action ?? "").trim();

    if (action === "suggest_topics") {
      const count = Math.min(12, Math.max(4, Number(body?.count) || 8));
      const seed = String(body?.seed ?? "").trim();
      const userPrompt = [
        `Suggest ${count} blog topics for PEPLAB Australia.`,
        seed ? `Optional focus / seed: ${seed}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const result = await openAiJson(openaiKey, model, SUGGEST_SYSTEM, userPrompt, 0.7);
      if (!result.ok) return jsonResponse({ error: result.error }, 502);

      const topicsRaw = Array.isArray(result.data.topics) ? result.data.topics : [];
      const topics = topicsRaw
        .map((t: unknown) => {
          const row = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
          const keywords = Array.isArray(row.keywords)
            ? row.keywords.map((k) => String(k)).filter(Boolean)
            : [];
          return {
            title: String(row.title ?? "").trim(),
            angle: String(row.angle ?? "").trim(),
            keywords,
            why: String(row.why ?? "").trim(),
          };
        })
        .filter((t) => t.title);

      if (!topics.length) {
        return jsonResponse({ error: "AI returned no topics" }, 502);
      }

      return jsonResponse({ ok: true, topics, model });
    }

    if (action === "generate_post") {
      const topic = body?.topic && typeof body.topic === "object" ? body.topic : {};
      const title = String(topic.title ?? "").trim();
      if (!title) {
        return jsonResponse({ error: "topic.title is required" }, 400);
      }
      const angle = String(topic.angle ?? "").trim();
      const keywords = Array.isArray(topic.keywords)
        ? topic.keywords.map((k: unknown) => String(k)).filter(Boolean)
        : [];

      const userPrompt = [
        `Write a full blog draft for this topic.`,
        `Title: ${title}`,
        angle ? `Angle: ${angle}` : null,
        keywords.length ? `Keywords: ${keywords.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const result = await openAiJson(openaiKey, model, GENERATE_SYSTEM, userPrompt, 0.45);
      if (!result.ok) return jsonResponse({ error: result.error }, 502);

      const post = {
        ...result.data,
        status: "draft",
        cover_image_url: String(result.data.cover_image_url ?? ""),
        author_name: String(result.data.author_name ?? "PEPLAB") || "PEPLAB",
      };

      if (!String(post.title ?? "").trim() || !String(post.body_markdown ?? "").trim()) {
        return jsonResponse({ error: "AI did not return a complete post draft" }, 502);
      }

      return jsonResponse({ ok: true, post, model });
    }

    return jsonResponse(
      { error: 'Unknown action. Use "suggest_topics" or "generate_post".' },
      400,
    );
  } catch (err) {
    console.error("blog-ai:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    );
  }
});
