import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';
import BlogCover from '@/components/BlogCover';
import {
  blogPostPath,
  blogReadingMinutes,
  formatBlogDate,
  listPublishedBlogPosts,
  type BlogPost,
} from '@/lib/blog-posts';
import { BLOG_PATH } from '@/lib/routes';

const MAX_POSTS = 3;

export default function HomeBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data.slice(0, MAX_POSTS));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="home-blog relative z-10 px-4 sm:px-6 lg:px-10 xl:px-12 py-12 lg:py-16" aria-busy="true">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[rgba(244,246,250,0.06)]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-[rgba(244,246,250,0.06)]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="home-blog relative z-10 px-4 sm:px-6 lg:px-10 xl:px-12 py-12 lg:py-16" aria-labelledby="home-blog-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#A78BFA]">
              <Newspaper className="h-3.5 w-3.5" />
              Learn
            </p>
            <h2 id="home-blog-heading" className="text-2xl font-bold text-[#F4F6FA] sm:text-3xl">
              From the <span className="gradient-text">PEPLAB Blog</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#A9B3C7] sm:text-base">
              Research literacy, COA guidance, and practical notes for Australian laboratory buyers.
            </p>
          </div>
          <Link
            to={BLOG_PATH}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#C4B5FD] transition-colors hover:text-white"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {posts.map((post) => {
            const date = formatBlogDate(post.published_at);
            const minutes = blogReadingMinutes(post.body_markdown);
            return (
              <Link
                key={post.id}
                to={blogPostPath(post.slug)}
                className="home-blog-card group flex flex-col overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(167,139,250,0.35)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <BlogCover
                    title={post.title}
                    imageUrl={post.cover_image_url}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7C8599]">
                    {date ? <span>{date}</span> : null}
                    {date ? <span className="h-1 w-1 rounded-full bg-[#4B5468]" /> : null}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {minutes} min
                    </span>
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-[#F4F6FA] sm:text-lg">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-[#A9B3C7]">{post.excerpt}</p>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
                    Read
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
