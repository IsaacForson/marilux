-- Storage bucket for studio uploads.
--
-- Created in SQL rather than the dashboard so a fresh environment is one
-- `npm run db:migrate` away from working.
--
-- Security shape:
--   * PUBLIC READ  — images are on a public marketing site; a signed URL per
--     request would add latency and cache-bust every image for nothing.
--   * NO PUBLIC WRITE — uploads go through /api/admin/media, which requires an
--     admin session and uses the server-only secret key. The anon/publishable
--     key deliberately has no insert, update or delete policy here.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marilux',
  'marilux',
  true,
  15728640,  -- 15 MB; uploads are compressed well below this before arriving
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read an object in this bucket. Nothing else is granted.
drop policy if exists "marilux public read" on storage.objects;
create policy "marilux public read"
  on storage.objects for select
  to public
  using (bucket_id = 'marilux');
