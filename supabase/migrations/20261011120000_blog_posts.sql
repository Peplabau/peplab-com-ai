-- Blog posts CMS (admin AI topic → draft → publish → public /blog pages).

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body_markdown text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  author_name text,
  topic_source text NOT NULL DEFAULT 'custom'
    CHECK (topic_source IN ('suggested', 'custom')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique_idx
  ON public.blog_posts (lower(trim(slug)));

CREATE INDEX IF NOT EXISTS blog_posts_status_idx
  ON public.blog_posts (status);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON public.blog_posts (published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS blog_posts_updated_idx
  ON public.blog_posts (updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_blog_posts_updated_at();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_posts_public_read_published ON public.blog_posts;
CREATE POLICY blog_posts_public_read_published ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS blog_posts_admin_select ON public.blog_posts;
CREATE POLICY blog_posts_admin_select ON public.blog_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS blog_posts_admin_insert ON public.blog_posts;
CREATE POLICY blog_posts_admin_insert ON public.blog_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS blog_posts_admin_update ON public.blog_posts;
CREATE POLICY blog_posts_admin_update ON public.blog_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS blog_posts_admin_delete ON public.blog_posts;
CREATE POLICY blog_posts_admin_delete ON public.blog_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
