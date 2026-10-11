import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import Footer from '@/sections/Footer';
import {
  blogPostPath,
  getPublishedBlogPostBySlug,
  type BlogPost,
} from '@/lib/blog-posts';
import { markdownToHtml } from '@/lib/markdown';
import { BLOG_PATH } from '@/lib/routes';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getPublishedBlogPostBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setPost(null);
          return;
        }
        setPost(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const html = useMemo(
    () => (post ? markdownToHtml(post.body_markdown) : ''),
    [post],
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />
        <div className="flex items-center justify-center py-24">
          <p className="text-[#A9B3C7]">Loading…</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <SEO title="Post not found | PEPLAB Blog" noIndex />
        <div className="min-h-screen" style={{ background: '#070A12' }}>
          <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />
          <main className="relative z-10 px-6 py-20 text-center">
            <h1 className="mb-4 text-2xl font-bold text-[#F4F6FA]">Post not found</h1>
            <p className="mb-6 text-[#A9B3C7]">This blog post is not published or the link is incorrect.</p>
            <Link to={BLOG_PATH} className="text-[#A78BFA] hover:underline">
              Back to Blog
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const path = blogPostPath(post.slug);

  return (
    <>
      <SEO
        title={post.seo_title || `${post.title} | PEPLAB`}
        description={post.seo_description || post.excerpt}
      />
      <JsonLd
        id={`blog-${post.slug}-breadcrumbs`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
          { name: post.title, path },
        ])}
      />
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
          <article className="mx-auto max-w-3xl">
            {post.published_at ? (
              <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.25em] text-[#6B7280]">
                {new Date(post.published_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {post.author_name ? ` · ${post.author_name}` : ''}
              </p>
            ) : null}
            <h1 className="mb-4 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mb-8 text-lg leading-relaxed text-[#A9B3C7]">{post.excerpt}</p>
            ) : null}
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt=""
                className="mb-10 w-full rounded-2xl border border-[rgba(244,246,250,0.08)] object-cover"
              />
            ) : null}
            <div
              className="blog-prose space-y-4 text-[#A9B3C7] leading-relaxed [&_a]:text-[#A78BFA] [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#F4F6FA] [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#F4F6FA] [&_li]:ml-5 [&_ol]:list-decimal [&_strong]:text-[#F4F6FA] [&_ul]:list-disc [&_blockquote]:border-l-2 [&_blockquote]:border-[rgba(167,139,250,0.4)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-[rgba(244,246,250,0.06)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[rgba(244,246,250,0.08)] [&_pre]:bg-[rgba(7,10,18,0.6)] [&_pre]:p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <p className="mt-12 border-t border-[rgba(244,246,250,0.08)] pt-6 text-sm text-[#6B7280]">
              For research use only. Not for human consumption. PEPLAB products are intended for
              laboratory research purposes only.
            </p>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
