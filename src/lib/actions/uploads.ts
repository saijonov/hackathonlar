'use server';

import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { UPLOAD_LIMITS, isAllowedImage } from '@/lib/validation/schemas';
import { fail, ok, type ActionResult } from './types';

/**
 * Image upload for hackathon covers and avatars.
 *
 * Validated three times (PRD 12): in the browser for fast feedback, here in the
 * server action, and finally by the bucket's own `allowed_mime_types` /
 * `file_size_limit` — the only check an attacker cannot skip. Objects are
 * written to `<uid>/<random>.<ext>`, which is exactly what the storage RLS
 * policy permits, so one user can never overwrite another's file.
 */
export async function uploadImage(
  bucket: 'covers' | 'avatars',
  formData: FormData,
): Promise<ActionResult<{ url: string; path: string }>> {
  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  const file = formData.get('file');
  if (!(file instanceof File)) return fail('validation', { file: 'required' });

  const maxBytes =
    bucket === 'covers' ? UPLOAD_LIMITS.coverMaxBytes : UPLOAD_LIMITS.avatarMaxBytes;

  if (!isAllowedImage(file, maxBytes)) return fail('validation', { file: 'invalid' });

  const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: '31536000',
  });

  if (error) return fail('unknown');

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return ok({ url: publicUrl, path });
}
