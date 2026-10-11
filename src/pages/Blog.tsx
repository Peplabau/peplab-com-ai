import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import Footer from '@/sections/Footer';
import { blogPostPath, listPublishedBlogPosts, type BlogPost } from '@/lib/blog-posts';
import { BLOG_PATH } from '@/lib/routes';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO title={PAGE_SEO.blog.title} description={PAGE_SEO.blog.description} />
      <JsonLd
        id="blog-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
        ])}
      />
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <ContentPageHeader />

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.12)]">
                <Newspaper className="h-7 w-7 text-[#A78BFA]" />
              </div>
              <span className="eyebrow mb-4 block">LEARN</span>
              <h1 className="mb-4 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
                PEPLAB <span className="gradient-text">Blog</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-[#A9B3C7] sm:text-lg">
                Research literacy, COA guidance, and practical notes for Australian laboratory buyers.
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-10 text-center">
                <p className="text-[#A9B3C7]">No published posts yet. Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={blogPostPath(post.slug)}
                    className="group block rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-5 transition-colors hover:border-[rgba(167,139,250,0.35)] hover:bg-[rgba(17,24,39,0.85)] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {post.published_at ? (
                          <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#6B7280]">
                            {new Date(post.published_at).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        ) : null}
                        <h2 className="mb-2 text-xl font-semibold text-[#F4F6FA] group-hover:text-white sm:text-2xl">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="text-sm leading-relaxed text-[#A9B3C7] sm:text-base">
                            {post.excerpt}
                          </p>
                        ) : null}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
                        Read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
