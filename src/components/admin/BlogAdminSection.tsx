import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  blogPostPath,
  deleteBlogPost,
  emptyBlogPost,
  listBlogPostsAdmin,
  setBlogPostStatus,
  upsertBlogPost,
  type BlogPost,
  type BlogPostInput,
  type BlogPostStatus,
} from '@/lib/blog-posts';
import {
  generateBlogCover,
  generateBlogPostFromTopic,
  suggestBlogTopics,
  type BlogTopicSuggestion,
} from '@/lib/blog-ai';

const inputClass =
  'w-full px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA] text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[rgba(167,139,250,0.55)]';
const labelClass = 'block text-xs font-medium text-[#A9B3C7] mb-1.5';

type EditorStep = 'topics' | 'edit';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelClass}>
        {label}
        {hint ? <span className="ml-1 font-normal text-[#6B7280]">· {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogAdminSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<BlogPostInput | null>(null);
  const [step, setStep] = useState<EditorStep>('topics');
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<BlogTopicSuggestion[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topicSeed, setTopicSeed] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<BlogTopicSuggestion | null>(null);
  const [coverGenerating, setCoverGenerating] = useState(false);
  const [rowCoverId, setRowCoverId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setPosts(await listBlogPostsAdmin());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeEditor = () => {
    setEditing(null);
    setStep('topics');
    setTopics([]);
    setSelectedTopic(null);
    setCustomTopic('');
    setTopicSeed('');
  };

  const openNew = () => {
    setMessage(null);
    setError(null);
    setEditing(emptyBlogPost());
    setStep('topics');
    setTopics([]);
    setSelectedTopic(null);
    setCustomTopic('');
  };

  const openEdit = (post: BlogPost) => {
    setMessage(null);
    setError(null);
    setEditing({ ...post });
    setStep('edit');
    setTopics([]);
    setSelectedTopic(null);
  };

  const patch = (partial: Partial<BlogPostInput>) => {
    setEditing((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const handleSuggestTopics = async () => {
    setTopicsLoading(true);
    setError(null);
    setMessage(null);
    const result = await suggestBlogTopics({ count: 8, seed: topicSeed });
    setTopicsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTopics(result.topics);
    setMessage(`AI suggested ${result.topics.length} topics. Pick one, then generate a draft.`);
  };

  const handleGenerate = async () => {
    const topic =
      selectedTopic ||
      (customTopic.trim()
        ? { title: customTopic.trim(), angle: '', keywords: [], why: '' }
        : null);
    if (!topic) {
      setError('Select a suggested topic or enter a custom topic title.');
      return;
    }
    setGenerating(true);
    setError(null);
    setMessage(null);
    const result = await generateBlogPostFromTopic(topic);
    setGenerating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing({
      ...result.post,
      id: editing?.id,
      created_at: editing?.created_at,
      updated_at: editing?.updated_at,
      topic_source: selectedTopic ? 'suggested' : 'custom',
      status: 'draft',
    });
    setStep('edit');
    setMessage('Draft generated. Review SEO and body, then save as draft or publish.');
  };

  const handleGenerateCover = async () => {
    if (!editing) return;
    setCoverGenerating(true);
    setError(null);
    setMessage(null);
    const result = await generateBlogCover({
      title: editing.title,
      excerpt: editing.excerpt,
      slug: editing.slug,
    });
    setCoverGenerating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    patch({ cover_image_url: result.coverImageUrl });
    setMessage('Cover image generated. Save or publish to keep it.');
  };

  const handleRowCover = async (post: BlogPost) => {
    if (
      post.cover_image_url &&
      !window.confirm(`Replace the current cover image for “${post.title}” with a new AI image?`)
    ) {
      return;
    }
    setRowCoverId(post.id);
    setError(null);
    setMessage(null);
    const result = await generateBlogCover({ postId: post.id });
    setRowCoverId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`New cover image saved for “${post.title}”.`);
    await load();
  };

  const handleSave = async (status: BlogPostStatus) => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim()) {
      setError('Add a title and URL slug before saving.');
      return;
    }
    if (!editing.seo_title.trim() || !editing.seo_description.trim()) {
      setError('Fill SEO title and SEO description before saving.');
      return;
    }
    if (!editing.body_markdown.trim()) {
      setError('Add blog body content before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await upsertBlogPost({
      ...editing,
      status,
      published_at:
        status === 'published'
          ? editing.published_at || new Date().toISOString()
          : editing.published_at,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      status === 'published'
        ? `Published “${result.post.title}”`
        : `Saved draft “${result.post.title}”`,
    );
    closeEditor();
    await load();
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete blog post “${post.title}”? This cannot be undone.`)) return;
    const result = await deleteBlogPost(post.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Deleted “${post.title}”`);
    if (editing?.id === post.id) closeEditor();
    await load();
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    const result = await setBlogPostStatus(post.id, next);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      next === 'published'
        ? `Published “${post.title}”`
        : `Unpublished “${post.title}” (now draft)`,
    );
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-[#A9B3C7]">
          Ask AI for topic ideas, pick one, generate a draft, then review SEO and publish to /blog.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.12)] px-3 py-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA]"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-3 py-2 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> New blog post
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#EF4444]">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-[rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.08)] p-3 text-sm text-[#A78BFA]">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#A9B3C7]">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-8 text-center">
          <p className="mb-4 text-[#A9B3C7]">No blog posts yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> Suggest topics with AI
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[rgba(244,246,250,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.8)] text-[#A9B3C7]">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Updated</th>
                <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[rgba(244,246,250,0.06)]">
                  <td className="px-4 py-3 text-[#F4F6FA]">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded-md border border-[rgba(244,246,250,0.1)] object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-[rgba(244,246,250,0.15)] text-[#4B5468]">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                      )}
                      <span className="truncate font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        post.status === 'published'
                          ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                          : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#A9B3C7] whitespace-nowrap">
                    {post.updated_at
                      ? new Date(post.updated_at).toLocaleDateString('en-AU')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-nowrap items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="rounded-lg p-2 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#F4F6FA]"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={rowCoverId !== null}
                        onClick={() => void handleRowCover(post)}
                        className="rounded-lg p-2 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#C4B5FD] disabled:opacity-40"
                        title={post.cover_image_url ? 'Regenerate AI cover image' : 'Generate AI cover image'}
                      >
                        {rowCoverId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(post)}
                        className="rounded-lg p-2 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#F4F6FA]"
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {post.status === 'published' ? (
                        <a
                          href={blogPostPath(post.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#F4F6FA]"
                          title="Open live"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleDelete(post)}
                        className="rounded-lg p-2 text-[#A9B3C7] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-6">
          <div className="relative my-4 w-full max-w-3xl rounded-2xl border border-[rgba(244,246,250,0.1)] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(244,246,250,0.08)] bg-[#111827] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#F4F6FA]">
                  {editing.id ? 'Edit blog post' : 'Create blog post'}
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {step === 'topics'
                    ? 'Step 1 — AI topics'
                    : 'Step 2 — Review draft & SEO'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl p-2 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#F4F6FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-5">
              {step === 'topics' && (
                <>
                  <Field label="Optional focus" hint="narrow AI suggestions">
                    <input
                      className={inputClass}
                      value={topicSeed}
                      onChange={(e) => setTopicSeed(e.target.value)}
                      placeholder="e.g. HPLC COA literacy, peptide storage, Australian research supply"
                    />
                  </Field>
                  <button
                    type="button"
                    disabled={topicsLoading}
                    onClick={() => void handleSuggestTopics()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    {topicsLoading ? 'Suggesting…' : 'Suggest topics with AI'}
                  </button>

                  {topics.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#A9B3C7]">
                        Choose a topic
                      </p>
                      {topics.map((topic) => {
                        const active = selectedTopic?.title === topic.title;
                        return (
                          <button
                            key={topic.title}
                            type="button"
                            onClick={() => {
                              setSelectedTopic(topic);
                              setCustomTopic('');
                            }}
                            className={`w-full rounded-xl border p-4 text-left transition-colors ${
                              active
                                ? 'border-[rgba(167,139,250,0.55)] bg-[rgba(139,92,246,0.12)]'
                                : 'border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.4)] hover:border-[rgba(244,246,250,0.18)]'
                            }`}
                          >
                            <p className="font-medium text-[#F4F6FA]">{topic.title}</p>
                            {topic.angle ? (
                              <p className="mt-1 text-sm text-[#A9B3C7]">{topic.angle}</p>
                            ) : null}
                            {topic.why ? (
                              <p className="mt-1 text-xs text-[#6B7280]">{topic.why}</p>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <Field label="Or custom topic title">
                    <input
                      className={inputClass}
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        if (e.target.value.trim()) setSelectedTopic(null);
                      }}
                      placeholder="Type your own topic…"
                    />
                  </Field>

                  <button
                    type="button"
                    disabled={generating || (!selectedTopic && !customTopic.trim())}
                    onClick={() => void handleGenerate()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2ED1B4] px-4 py-2.5 text-sm font-semibold text-[#070A12] disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    {generating ? 'Generating draft…' : 'Generate blog draft'}
                  </button>
                </>
              )}

              {step === 'edit' && (
                <>
                  {!editing.id && (
                    <button
                      type="button"
                      onClick={() => setStep('topics')}
                      className="text-sm text-[#A78BFA] hover:underline"
                    >
                      ← Back to topics
                    </button>
                  )}
                  <Field label="Title">
                    <input
                      className={inputClass}
                      value={editing.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        patch({
                          title,
                          slug: editing.slug || slugify(title),
                          seo_title: editing.seo_title || `${title} | PEPLAB Australia`,
                        });
                      }}
                    />
                  </Field>
                  <Field label="URL slug" hint="/blog/your-slug">
                    <input
                      className={inputClass}
                      value={editing.slug}
                      onChange={(e) => patch({ slug: slugify(e.target.value) })}
                    />
                  </Field>
                  <Field label="Excerpt" hint="blog index card">
                    <textarea
                      className={`${inputClass} min-h-[80px]`}
                      value={editing.excerpt}
                      onChange={(e) => patch({ excerpt: e.target.value })}
                    />
                  </Field>
                  <Field label="SEO title">
                    <input
                      className={inputClass}
                      value={editing.seo_title}
                      onChange={(e) => patch({ seo_title: e.target.value })}
                    />
                  </Field>
                  <Field label="SEO description">
                    <textarea
                      className={`${inputClass} min-h-[80px]`}
                      value={editing.seo_description}
                      onChange={(e) => patch({ seo_description: e.target.value })}
                    />
                  </Field>
                  <Field label="Cover image" hint="paste a URL or generate with AI">
                    <div className="flex gap-2">
                      <input
                        className={inputClass}
                        value={editing.cover_image_url}
                        onChange={(e) => patch({ cover_image_url: e.target.value })}
                        placeholder="https://…"
                      />
                      <button
                        type="button"
                        disabled={coverGenerating || !editing.title.trim()}
                        onClick={() => void handleGenerateCover()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {coverGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                        {coverGenerating
                          ? 'Generating…'
                          : editing.cover_image_url
                            ? 'Regenerate'
                            : 'Generate with AI'}
                      </button>
                    </div>
                    {coverGenerating ? (
                      <p className="mt-2 text-xs text-[#6B7280]">This usually takes 20–60 seconds.</p>
                    ) : null}
                    {editing.cover_image_url ? (
                      <img
                        src={editing.cover_image_url}
                        alt="Cover preview"
                        className="mt-3 aspect-[16/9] w-full rounded-xl border border-[rgba(244,246,250,0.1)] object-cover"
                      />
                    ) : null}
                  </Field>
                  <Field label="Author">
                    <input
                      className={inputClass}
                      value={editing.author_name || ''}
                      onChange={(e) => patch({ author_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Body" hint="Markdown">
                    <textarea
                      className={`${inputClass} min-h-[280px] font-mono text-xs leading-relaxed`}
                      value={editing.body_markdown}
                      onChange={(e) => patch({ body_markdown: e.target.value })}
                    />
                  </Field>
                </>
              )}
            </div>

            {step === 'edit' && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-[rgba(244,246,250,0.08)] bg-[#111827] px-5 py-4">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-[rgba(244,246,250,0.12)] px-4 py-2.5 text-sm text-[#A9B3C7] hover:text-[#F4F6FA]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave('draft')}
                  className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.12)] px-4 py-2.5 text-sm font-medium text-[#F4F6FA] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave('published')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2ED1B4] px-4 py-2.5 text-sm font-semibold text-[#070A12] disabled:opacity-50"
                >
                  <Eye className="h-4 w-4" />
                  {saving ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
