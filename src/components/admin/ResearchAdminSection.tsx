import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  deleteResearchArticle,
  emptyResearchArticle,
  listResearchArticlesAdmin,
  researchCompoundPath,
  seedResearchArticles,
  setResearchArticleStatus,
  upsertResearchArticle,
  type ResearchArticle,
  type ResearchArticleInput,
  type ResearchArticleStatus,
  type ResearchFaq,
  type ResearchFeatureRow,
  type ResearchGlanceRow,
  type ResearchRelated,
  type ResearchSectionBlock,
} from '@/lib/research-articles';
import { RESEARCH_SEED_ARTICLES } from '@/lib/research-seed-data';
import {
  parseResearchDocumentWithAi,
  readDocumentFileAsText,
} from '@/lib/research-ai';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA] text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#2ED1B4]';
const labelClass = 'block text-xs font-medium text-[#A9B3C7] mb-1';
const sectionTitleClass = 'text-sm font-semibold text-[#F4F6FA] mb-3 mt-6 first:mt-0';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function ArrayEditor<T>({
  title,
  items,
  onChange,
  blank,
  renderItem,
}: {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[#A9B3C7]">{title}</p>
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="text-xs text-[#2ED1B4] hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.35)] relative"
          >
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-2 right-2 text-[#EF4444] hover:opacity-80"
              aria-label="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {renderItem(item, index, (patch) => {
              const next = [...items];
              next[index] = { ...item, ...patch };
              onChange(next);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResearchAdminSection() {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<ResearchArticleInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [docText, setDocText] = useState('');
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const rows = await listResearchArticlesAdmin();
      setArticles(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load research articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setMessage(null);
    setError(null);
    setDocText('');
    setDocFileName(null);
    setEditing(emptyResearchArticle());
  };

  const openEdit = (article: ResearchArticle) => {
    setMessage(null);
    setError(null);
    setDocText('');
    setDocFileName(null);
    setEditing({ ...article, product_slug: article.product_slug || '' });
  };

  const handleSave = async (status: ResearchArticleStatus) => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      setError('Name and slug are required before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload: ResearchArticleInput = {
      ...editing,
      status,
      published_at:
        status === 'published'
          ? editing.published_at || new Date().toISOString()
          : editing.published_at,
    };
    const result = await upsertResearchArticle(payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      status === 'published'
        ? `Published “${result.article.name}”`
        : `Saved draft “${result.article.name}”`,
    );
    setEditing(null);
    setDocText('');
    setDocFileName(null);
    await load();
  };

  const handleAiProcess = async () => {
    if (!editing) return;
    setAiProcessing(true);
    setError(null);
    setMessage(null);
    const result = await parseResearchDocumentWithAi({
      documentText: docText,
      compoundName: editing.name || undefined,
    });
    setAiProcessing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing({
      ...result.article,
      id: editing.id,
      created_at: editing.created_at,
      updated_at: editing.updated_at,
      status: 'draft',
    });
    setMessage(
      result.truncated
        ? `AI filled the form from your document (text was truncated). Review, then save as draft or publish.${
            result.model ? ` Model: ${result.model}` : ''
          }`
        : `AI classified the document into headings and sections. Review, then save as draft or publish.${
            result.model ? ` Model: ${result.model}` : ''
          }`,
    );
  };

  const handleDocFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await readDocumentFileAsText(file);
      setDocText(text);
      setDocFileName(file.name);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not read that file');
    }
  };

  const handleDelete = async (article: ResearchArticle) => {
    if (!window.confirm(`Delete research page “${article.name}”? This cannot be undone.`)) return;
    const result = await deleteResearchArticle(article.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Deleted “${article.name}”`);
    if (editing?.id === article.id) setEditing(null);
    await load();
  };

  const handleToggleStatus = async (article: ResearchArticle) => {
    const next = article.status === 'published' ? 'draft' : 'published';
    const result = await setResearchArticleStatus(article.id, next);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      next === 'published'
        ? `Published “${article.name}”`
        : `Unpublished “${article.name}” (now draft)`,
    );
    await load();
  };

  const handleSeed = async (overwrite: boolean) => {
    setSeeding(true);
    setError(null);
    setMessage(null);
    const result = await seedResearchArticles(RESEARCH_SEED_ARTICLES, { overwrite });
    setSeeding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      overwrite
        ? `Seeded/overwrote ${result.upserted} articles`
        : `Seeded ${result.upserted} missing articles (existing left unchanged)`,
    );
    await load();
  };

  const patch = (partial: Partial<ResearchArticleInput>) => {
    setEditing((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#A9B3C7] max-w-2xl">
          Paste or upload a research doc → AI fills headings, body, tables and FAQs → save as draft
          or publish. Live pages:{' '}
          <code className="text-[#A78BFA]">/research/compounds/&#123;slug&#125;</code>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(244,246,250,0.12)] text-sm text-[#A9B3C7] hover:text-[#F4F6FA]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void handleSeed(false)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(244,246,250,0.12)] text-sm text-[#A9B3C7] hover:text-[#F4F6FA] disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> Seed defaults
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-semibold hover:from-[#7C4FED] hover:to-[#DB2777]"
          >
            <Sparkles className="w-4 h-4" /> New from document
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] text-sm text-[#EF4444]">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 rounded-xl border border-[rgba(46,209,180,0.35)] bg-[rgba(46,209,180,0.08)] text-sm text-[#2ED1B4]">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#A9B3C7]">Loading…</p>
      ) : articles.length === 0 ? (
        <div className="p-6 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] text-center">
          <p className="text-[#A9B3C7] mb-4">No research articles in the database yet.</p>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void handleSeed(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-semibold disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {seeding ? 'Seeding…' : 'Seed the 7 existing compounds'}
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(167,139,250,0.4)] text-sm font-semibold text-[#A78BFA]"
          >
            <Sparkles className="w-4 h-4" />
            Or start from a document
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[rgba(244,246,250,0.08)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                <th className="px-4 py-3 text-[#F4F6FA]">Name</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Slug</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Status</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Updated</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                >
                  <td className="px-4 py-3 text-[#F4F6FA] font-medium">{article.name}</td>
                  <td className="px-4 py-3 text-[#A9B3C7] font-mono text-xs">{article.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4]'
                          : 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7]'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#A9B3C7] text-xs">
                    {article.updated_at
                      ? new Date(article.updated_at).toLocaleString('en-AU')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(article)}
                        className="p-1.5 rounded-lg text-[#A9B3C7] hover:text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.1)]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(article)}
                        className="p-1.5 rounded-lg text-[#A9B3C7] hover:text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.1)]"
                        title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {article.status === 'published' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {article.status === 'published' && (
                        <a
                          href={researchCompoundPath(article.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[#A9B3C7] hover:text-[#2ED1B4]"
                          title="Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(article)}
                        className="p-1.5 rounded-lg text-[#A9B3C7] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {articles.length > 0 && (
        <p className="text-xs text-[#6B7280]">
          To force-refresh seed content over DB rows:{' '}
          <button
            type="button"
            disabled={seeding}
            onClick={() => {
              if (
                window.confirm(
                  'Overwrite all matching seed slugs with default copy? Custom edits will be lost.',
                )
              ) {
                void handleSeed(true);
              }
            }}
            className="text-[#2ED1B4] hover:underline disabled:opacity-50"
          >
            overwrite seed
          </button>
          .
        </p>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-8">
          <div className="w-full max-w-3xl rounded-2xl border border-[rgba(244,246,250,0.12)] bg-[#0B1020] shadow-2xl mb-10">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(244,246,250,0.08)] bg-[#0B1020]">
              <h2 className="text-lg font-bold text-[#F4F6FA]">
                {editing.id ? 'Edit research article' : 'New research article'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto">
              <div className="mb-6 rounded-2xl border border-[rgba(167,139,250,0.35)] bg-[rgba(139,92,246,0.08)] p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.2)]">
                    <Sparkles className="h-5 w-5 text-[#A78BFA]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F4F6FA]">AI document → article</p>
                    <p className="mt-1 text-xs text-[#A9B3C7]">
                      Upload a .txt / .md / .html file or paste research copy. OpenAI classifies it
                      into name, headings, sections, tables and FAQs. Uses the server{' '}
                      <code className="text-[#A78BFA]">OPENAI_API_KEY</code> secret.
                    </p>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.markdown,.html,.htm,.csv,.json,text/plain,text/markdown,text/html"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      void handleDocFile(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.14)] px-3 py-2 text-xs font-medium text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.04)]"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#A78BFA]" />
                    {docFileName ? `File: ${docFileName}` : 'Upload document'}
                  </button>
                  {docText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocText('');
                        setDocFileName(null);
                      }}
                      className="rounded-xl border border-[rgba(244,246,250,0.1)] px-3 py-2 text-xs text-[#A9B3C7] hover:text-[#F4F6FA]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  className={`${inputClass} min-h-[140px] mb-3`}
                  placeholder="Paste research overview, study notes, or client handoff text here…"
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                />

                <button
                  type="button"
                  disabled={aiProcessing || !docText.trim()}
                  onClick={() => void handleAiProcess()}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiProcessing ? 'AI processing…' : 'Process with AI'}
                </button>
              </div>

              <p className={sectionTitleClass}>Identity &amp; SEO</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <input
                    className={inputClass}
                    value={editing.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </Field>
                <Field label="Slug (URL)">
                  <input
                    className={inputClass}
                    value={editing.slug}
                    onChange={(e) =>
                      patch({
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, '-')
                          .replace(/-+/g, '-')
                          .replace(/^-|-$/g, ''),
                      })
                    }
                    placeholder="retatrutide"
                  />
                </Field>
                <Field label="Category / eyebrow">
                  <input
                    className={inputClass}
                    value={editing.category}
                    onChange={(e) => patch({ category: e.target.value, eyebrow: e.target.value })}
                  />
                </Field>
                <Field label="Product slug (vial image)">
                  <input
                    className={inputClass}
                    value={editing.product_slug || ''}
                    onChange={(e) => patch({ product_slug: e.target.value })}
                    placeholder="reta"
                  />
                </Field>
                <Field label="SEO title">
                  <input
                    className={inputClass}
                    value={editing.seo_title}
                    onChange={(e) => patch({ seo_title: e.target.value })}
                  />
                </Field>
                <Field label="Current status">
                  <div className="flex h-[42px] items-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        editing.status === 'published'
                          ? 'bg-[rgba(167,139,250,0.18)] text-[#A78BFA]'
                          : 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7]'
                      }`}
                    >
                      {editing.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="ml-2 text-xs text-[#6B7280]">
                      Use footer buttons to save
                    </span>
                  </div>
                </Field>
              </div>
              <Field label="SEO description">
                <textarea
                  className={`${inputClass} min-h-[70px]`}
                  value={editing.seo_description}
                  onChange={(e) => patch({ seo_description: e.target.value })}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Card title (hub)">
                  <input
                    className={inputClass}
                    value={editing.card_title}
                    onChange={(e) => patch({ card_title: e.target.value })}
                  />
                </Field>
                <Field label="Author name (optional)">
                  <input
                    className={inputClass}
                    value={editing.author_name || ''}
                    onChange={(e) => patch({ author_name: e.target.value || null })}
                  />
                </Field>
              </div>
              <Field label="Card description (hub)">
                <textarea
                  className={`${inputClass} min-h-[70px]`}
                  value={editing.card_description}
                  onChange={(e) => patch({ card_description: e.target.value })}
                />
              </Field>

              <p className={sectionTitleClass}>Hero</p>
              <Field label="Eyebrow (overrides category display if set)">
                <input
                  className={inputClass}
                  value={editing.eyebrow || editing.category}
                  onChange={(e) => patch({ eyebrow: e.target.value })}
                />
              </Field>
              <Field label="H1">
                <input
                  className={inputClass}
                  value={editing.h1}
                  onChange={(e) => patch({ h1: e.target.value })}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  className={inputClass}
                  value={editing.subtitle}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                />
              </Field>
              <Field label="Intro (paragraphs separated by blank lines)">
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={editing.intro}
                  onChange={(e) => patch({ intro: e.target.value })}
                />
              </Field>

              <p className={sectionTitleClass}>What is…</p>
              <Field label="Heading">
                <input
                  className={inputClass}
                  value={editing.what_is_heading}
                  onChange={(e) => patch({ what_is_heading: e.target.value })}
                />
              </Field>
              <Field label="Body">
                <textarea
                  className={`${inputClass} min-h-[100px]`}
                  value={editing.what_is_body}
                  onChange={(e) => patch({ what_is_body: e.target.value })}
                />
              </Field>
              <ArrayEditor<ResearchFeatureRow>
                title="Feature table rows"
                items={editing.feature_rows}
                onChange={(feature_rows) => patch({ feature_rows })}
                blank={() => ({ feature: '', details: '' })}
                renderItem={(item, _i, update) => (
                  <div className="grid sm:grid-cols-2 gap-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="Feature"
                      value={item.feature}
                      onChange={(e) => update({ feature: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Details"
                      value={item.details}
                      onChange={(e) => update({ details: e.target.value })}
                    />
                  </div>
                )}
              />

              <p className={sectionTitleClass}>Mechanism</p>
              <Field label="Heading">
                <input
                  className={inputClass}
                  value={editing.mechanism_heading}
                  onChange={(e) => patch({ mechanism_heading: e.target.value })}
                />
              </Field>
              <Field label="Intro">
                <textarea
                  className={`${inputClass} min-h-[70px]`}
                  value={editing.mechanism_intro}
                  onChange={(e) => patch({ mechanism_intro: e.target.value })}
                />
              </Field>
              <ArrayEditor<ResearchSectionBlock>
                title="Mechanism subsections"
                items={editing.mechanism_sections}
                onChange={(mechanism_sections) => patch({ mechanism_sections })}
                blank={() => ({ title: '', body: '' })}
                renderItem={(item, _i, update) => (
                  <div className="space-y-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="H3 title"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                    <textarea
                      className={`${inputClass} min-h-[70px]`}
                      placeholder="Body"
                      value={item.body}
                      onChange={(e) => update({ body: e.target.value })}
                    />
                  </div>
                )}
              />
              <Field label="Mechanism footer (supports [label](url))">
                <textarea
                  className={`${inputClass} min-h-[70px]`}
                  value={editing.mechanism_footer}
                  onChange={(e) => patch({ mechanism_footer: e.target.value })}
                />
              </Field>

              <p className={sectionTitleClass}>Findings</p>
              <Field label="Heading">
                <input
                  className={inputClass}
                  value={editing.findings_heading}
                  onChange={(e) => patch({ findings_heading: e.target.value })}
                />
              </Field>
              <ArrayEditor<ResearchSectionBlock>
                title="Findings subsections"
                items={editing.findings_sections}
                onChange={(findings_sections) => patch({ findings_sections })}
                blank={() => ({ title: '', body: '', link_label: '', link_url: '' })}
                renderItem={(item, _i, update) => (
                  <div className="space-y-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="H3 title"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                    <textarea
                      className={`${inputClass} min-h-[90px]`}
                      placeholder="Body"
                      value={item.body}
                      onChange={(e) => update({ body: e.target.value })}
                    />
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        className={inputClass}
                        placeholder="Link label"
                        value={item.link_label || ''}
                        onChange={(e) => update({ link_label: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="https://..."
                        value={item.link_url || ''}
                        onChange={(e) => update({ link_url: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              />

              <ArrayEditor<ResearchGlanceRow>
                title="Glance table rows"
                items={editing.glance_rows}
                onChange={(glance_rows) => patch({ glance_rows })}
                blank={() => ({ area: '', investigated: '', distinction: '' })}
                renderItem={(item, _i, update) => (
                  <div className="space-y-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="Research area"
                      value={item.area}
                      onChange={(e) => update({ area: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="What studies investigated"
                      value={item.investigated}
                      onChange={(e) => update({ investigated: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Important distinction"
                      value={item.distinction}
                      onChange={(e) => update({ distinction: e.target.value })}
                    />
                  </div>
                )}
              />

              <p className={sectionTitleClass}>Safety &amp; COA</p>
              <Field label="Safety body (supports [label](url))">
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={editing.safety_body}
                  onChange={(e) => patch({ safety_body: e.target.value })}
                />
              </Field>
              <Field label="COA heading">
                <input
                  className={inputClass}
                  value={editing.coa_heading}
                  onChange={(e) => patch({ coa_heading: e.target.value })}
                />
              </Field>
              <Field label="COA body (• bullets and **bold** supported)">
                <textarea
                  className={`${inputClass} min-h-[140px]`}
                  value={editing.coa_body}
                  onChange={(e) => patch({ coa_body: e.target.value })}
                />
              </Field>

              <ArrayEditor<ResearchFaq>
                title="FAQs"
                items={editing.faqs}
                onChange={(faqs) => patch({ faqs })}
                blank={() => ({ q: '', a: '' })}
                renderItem={(item, _i, update) => (
                  <div className="space-y-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="Question"
                      value={item.q}
                      onChange={(e) => update({ q: e.target.value })}
                    />
                    <textarea
                      className={`${inputClass} min-h-[70px]`}
                      placeholder="Answer (supports [label](url))"
                      value={item.a}
                      onChange={(e) => update({ a: e.target.value })}
                    />
                  </div>
                )}
              />

              <ArrayEditor<ResearchRelated>
                title="Related links"
                items={editing.related}
                onChange={(related) => patch({ related })}
                blank={() => ({ label: '', slug: '', kind: 'research', href: '' })}
                renderItem={(item, _i, update) => (
                  <div className="grid sm:grid-cols-2 gap-2 pr-6">
                    <input
                      className={inputClass}
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => update({ label: e.target.value })}
                    />
                    <select
                      className={inputClass}
                      value={item.kind || 'research'}
                      onChange={(e) =>
                        update({
                          kind: e.target.value as 'product' | 'category' | 'research',
                        })
                      }
                    >
                      <option value="research">Research</option>
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                    </select>
                    <input
                      className={inputClass}
                      placeholder="Research slug (optional)"
                      value={item.slug || ''}
                      onChange={(e) => update({ slug: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Href e.g. https://peplab.ai/"
                      value={item.href || ''}
                      onChange={(e) => update({ href: e.target.value })}
                    />
                  </div>
                )}
              />
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-[rgba(244,246,250,0.08)] bg-[#0B1020]">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDocText('');
                  setDocFileName(null);
                }}
                className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.12)] text-sm text-[#A9B3C7]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || aiProcessing}
                onClick={() => void handleSave('draft')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(167,139,250,0.45)] text-sm font-semibold text-[#A78BFA] hover:bg-[rgba(167,139,250,0.1)] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save as draft'}
              </button>
              <button
                type="button"
                disabled={saving || aiProcessing}
                onClick={() => void handleSave('published')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-sm font-semibold text-white disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {saving ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
