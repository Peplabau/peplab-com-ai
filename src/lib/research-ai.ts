import { supabase } from '@/lib/supabase';
import {
  DEFAULT_COA_BODY,
  emptyResearchArticle,
  type ResearchArticleInput,
  type ResearchFaq,
  type ResearchFeatureRow,
  type ResearchGlanceRow,
  type ResearchRelated,
  type ResearchSectionBlock,
} from '@/lib/research-articles';

async function edgeInvokeErrorMessage(error: {
  message?: string;
  context?: Response;
}): Promise<string> {
  const fallback = error.message || 'AI parse failed';
  try {
    const ctx = error.context;
    if (ctx && typeof ctx.json === 'function') {
      const body = (await ctx.clone().json()) as { error?: unknown; message?: unknown };
      if (body?.error != null) return String(body.error);
      if (body?.message != null) return String(body.message);
    }
  } catch {
    /* keep fallback */
  }
  return fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Merge OpenAI JSON into a ResearchArticleInput, keeping any existing id. */
export function mergeAiArticleIntoInput(
  ai: Record<string, unknown>,
  existing?: ResearchArticleInput | null,
): ResearchArticleInput {
  const base = emptyResearchArticle();
  const featureRows = asArray<ResearchFeatureRow>(ai.feature_rows)
    .map((r) => ({
      feature: asString(r?.feature),
      details: asString(r?.details),
    }))
    .filter((r) => r.feature || r.details);
  const mechanismSections = asArray<ResearchSectionBlock>(ai.mechanism_sections)
    .map((r) => ({
      title: asString(r?.title),
      body: asString(r?.body),
      link_label: asString(r?.link_label) || undefined,
      link_url: asString(r?.link_url) || undefined,
    }))
    .filter((r) => r.title || r.body);
  const findingsSections = asArray<ResearchSectionBlock>(ai.findings_sections)
    .map((r) => ({
      title: asString(r?.title),
      body: asString(r?.body),
      link_label: asString(r?.link_label) || undefined,
      link_url: asString(r?.link_url) || undefined,
    }))
    .filter((r) => r.title || r.body);
  const glanceRows = asArray<ResearchGlanceRow>(ai.glance_rows)
    .map((r) => ({
      area: asString(r?.area),
      investigated: asString(r?.investigated),
      distinction: asString(r?.distinction),
    }))
    .filter((r) => r.area || r.investigated || r.distinction);
  const faqs = asArray<ResearchFaq>(ai.faqs)
    .map((r) => ({ q: asString(r?.q), a: asString(r?.a) }))
    .filter((r) => r.q || r.a);
  const related = asArray<ResearchRelated>(ai.related)
    .map((r) => ({
      label: asString(r?.label),
      slug: asString(r?.slug) || undefined,
      kind: r?.kind,
      href: asString(r?.href) || undefined,
    }))
    .filter((r) => r.label);

  const name = asString(ai.name, existing?.name || base.name);
  const slug = asString(ai.slug, existing?.slug || base.slug)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    ...base,
    ...existing,
    slug,
    name,
    category: asString(ai.category, existing?.category || ''),
    product_slug: asString(ai.product_slug, existing?.product_slug || ''),
    card_title: asString(ai.card_title, existing?.card_title || `What is ${name}?`),
    card_description: asString(ai.card_description, existing?.card_description || ''),
    seo_title: asString(ai.seo_title, existing?.seo_title || `${name} Research | PEPLAB`),
    seo_description: asString(ai.seo_description, existing?.seo_description || ''),
    eyebrow: asString(ai.eyebrow, asString(ai.category, existing?.eyebrow || '')),
    h1: asString(ai.h1, existing?.h1 || `${name} Research Overview`),
    subtitle: asString(ai.subtitle, existing?.subtitle || ''),
    intro: asString(ai.intro, existing?.intro || ''),
    what_is_heading: asString(ai.what_is_heading, existing?.what_is_heading || `What Is ${name}?`),
    what_is_body: asString(ai.what_is_body, existing?.what_is_body || ''),
    feature_rows: featureRows.length ? featureRows : existing?.feature_rows?.length
      ? existing.feature_rows
      : base.feature_rows,
    mechanism_heading: asString(ai.mechanism_heading, existing?.mechanism_heading || ''),
    mechanism_intro: asString(ai.mechanism_intro, existing?.mechanism_intro || ''),
    mechanism_sections: mechanismSections.length
      ? mechanismSections
      : existing?.mechanism_sections?.length
        ? existing.mechanism_sections
        : base.mechanism_sections,
    mechanism_footer: asString(ai.mechanism_footer, existing?.mechanism_footer || ''),
    findings_heading: asString(ai.findings_heading, existing?.findings_heading || ''),
    findings_sections: findingsSections.length
      ? findingsSections
      : existing?.findings_sections?.length
        ? existing.findings_sections
        : base.findings_sections,
    glance_rows: glanceRows.length
      ? glanceRows
      : existing?.glance_rows?.length
        ? existing.glance_rows
        : base.glance_rows,
    safety_body: asString(ai.safety_body, existing?.safety_body || ''),
    coa_heading: asString(
      ai.coa_heading,
      existing?.coa_heading || `Understanding ${name} Testing and COAs`,
    ),
    coa_body: asString(ai.coa_body, existing?.coa_body || DEFAULT_COA_BODY),
    faqs: faqs.length ? faqs : existing?.faqs?.length ? existing.faqs : base.faqs,
    related: related.length ? related : existing?.related || [],
    status: 'draft',
    author_name: ai.author_name == null ? existing?.author_name ?? null : asString(ai.author_name) || null,
    published_at: null,
  };
}

export async function parseResearchDocumentWithAi(opts: {
  documentText: string;
  compoundName?: string;
}): Promise<
  | { ok: true; article: ResearchArticleInput; truncated?: boolean; model?: string }
  | { ok: false; error: string }
> {
  const document_text = opts.documentText.trim();
  if (!document_text) return { ok: false, error: 'Paste or upload a document first.' };

  const { data, error } = await supabase.functions.invoke('research-ai-parse', {
    body: {
      document_text,
      compound_name: opts.compoundName?.trim() || undefined,
    },
  });

  if (error) {
    return { ok: false, error: await edgeInvokeErrorMessage(error) };
  }
  if (data && typeof data === 'object' && 'error' in data && (data as { error: unknown }).error) {
    return { ok: false, error: String((data as { error: unknown }).error) };
  }

  const articleRaw = (data as { article?: Record<string, unknown> })?.article;
  if (!articleRaw || typeof articleRaw !== 'object') {
    return { ok: false, error: 'AI did not return a structured article.' };
  }

  return {
    ok: true,
    article: mergeAiArticleIntoInput(articleRaw),
    truncated: Boolean((data as { truncated?: boolean }).truncated),
    model: String((data as { model?: string }).model || ''),
  };
}

/** Read plain-text-ish files in the browser (.txt, .md, .html, .csv). */
export async function readDocumentFileAsText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const okExt = /\.(txt|md|markdown|html?|csv|json)$/i.test(name);
  const okType =
    file.type.startsWith('text/') ||
    file.type === 'application/json' ||
    file.type === '';
  if (!okExt && !okType) {
    throw new Error(
      'Use a .txt, .md, or .html file — or paste Word/PDF content into the box.',
    );
  }
  return file.text();
}
