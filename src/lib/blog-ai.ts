import { CONFIG } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import {
  emptyBlogPost,
  type BlogPostInput,
} from '@/lib/blog-posts';

const AI_TIMEOUT_MS = 120_000;

export type BlogTopicSuggestion = {
  title: string;
  angle: string;
  keywords: string[];
  why: string;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asFilled(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  return '';
}

export function mergeAiPostIntoInput(
  ai: Record<string, unknown>,
  existing?: BlogPostInput | null,
): BlogPostInput {
  const base = emptyBlogPost();
  return {
    ...base,
    id: existing?.id,
    created_at: existing?.created_at,
    updated_at: existing?.updated_at,
    slug: asFilled(ai.slug, existing?.slug || ''),
    title: asFilled(ai.title, existing?.title || ''),
    excerpt: asFilled(ai.excerpt, existing?.excerpt || ''),
    body_markdown: asString(ai.body_markdown, existing?.body_markdown || ''),
    cover_image_url: asString(ai.cover_image_url, existing?.cover_image_url || ''),
    seo_title: asFilled(ai.seo_title, existing?.seo_title || ''),
    seo_description: asFilled(ai.seo_description, existing?.seo_description || ''),
    status: 'draft',
    author_name: asFilled(ai.author_name, existing?.author_name || 'PEPLAB') || 'PEPLAB',
    topic_source: existing?.topic_source || 'suggested',
    published_at: null,
  };
}

async function callBlogAi(
  body: Record<string, unknown>,
): Promise<
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string }
> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    return { ok: false, error: 'Please sign in again as admin, then retry.' };
  }

  const baseUrl = CONFIG.SUPABASE_URL.replace(/\/$/, '');
  const anonKey = CONFIG.SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    return { ok: false, error: 'Supabase is not configured in this environment.' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/functions/v1/blog-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      const msg =
        payload?.error != null
          ? String(payload.error)
          : payload?.message != null
            ? String(payload.message)
            : `Edge function failed (${res.status})`;
      return { ok: false, error: msg };
    }
    if (payload?.error != null) {
      return { ok: false, error: String(payload.error) };
    }
    return { ok: true, payload: payload || {} };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'AI request timed out. Please try again.' };
    }
    const message = err instanceof Error ? err.message : 'Failed to reach the AI edge function';
    if (/failed to fetch|networkerror|load failed/i.test(message)) {
      return {
        ok: false,
        error:
          'Could not reach the blog-ai function. Confirm it is deployed and OPENAI_API_KEY is set in Supabase secrets.',
      };
    }
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function suggestBlogTopics(opts?: {
  count?: number;
  seed?: string;
}): Promise<
  | { ok: true; topics: BlogTopicSuggestion[]; model?: string }
  | { ok: false; error: string }
> {
  const result = await callBlogAi({
    action: 'suggest_topics',
    count: opts?.count ?? 8,
    seed: opts?.seed?.trim() || undefined,
  });
  if (!result.ok) return result;

  const topicsRaw = Array.isArray(result.payload.topics) ? result.payload.topics : [];
  const topics: BlogTopicSuggestion[] = topicsRaw
    .map((t) => {
      const row = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>;
      const keywords = Array.isArray(row.keywords)
        ? row.keywords.map((k) => String(k)).filter(Boolean)
        : [];
      return {
        title: asString(row.title).trim(),
        angle: asString(row.angle).trim(),
        keywords,
        why: asString(row.why).trim(),
      };
    })
    .filter((t) => t.title);

  if (!topics.length) return { ok: false, error: 'AI returned no topics.' };
  return {
    ok: true,
    topics,
    model: asString(result.payload.model) || undefined,
  };
}

export async function generateBlogPostFromTopic(topic: {
  title: string;
  angle?: string;
  keywords?: string[];
}): Promise<
  | { ok: true; post: BlogPostInput; model?: string }
  | { ok: false; error: string }
> {
  if (!topic.title.trim()) return { ok: false, error: 'Choose or enter a topic title first.' };

  const result = await callBlogAi({
    action: 'generate_post',
    topic: {
      title: topic.title.trim(),
      angle: topic.angle?.trim() || undefined,
      keywords: topic.keywords || [],
    },
  });
  if (!result.ok) return result;

  const postRaw = result.payload.post;
  if (!postRaw || typeof postRaw !== 'object') {
    return { ok: false, error: 'AI did not return a structured post.' };
  }

  return {
    ok: true,
    post: mergeAiPostIntoInput(postRaw as Record<string, unknown>, {
      ...emptyBlogPost(),
      topic_source: 'suggested',
    }),
    model: asString(result.payload.model) || undefined,
  };
}
