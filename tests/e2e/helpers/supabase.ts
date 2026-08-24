import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Bypasses RLS. Used only to arrange test state and to assert what an admin sees. */
export function serviceClient(): SupabaseClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Exactly what a logged-out visitor's browser can reach. */
export function anonClient(): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const TEST_PASSWORD = 'TestParol2026';

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.invalid`;
}

/** Creates a confirmed account without going through the UI. */
export async function createConfirmedUser(email: string, displayName: string): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  return data.user.id;
}

export async function promoteToAdmin(userId: string): Promise<void> {
  const admin = serviceClient();
  const { error } = await admin.from('profiles').update({ role: 'admin' }).eq('id', userId);
  if (error) throw new Error(`promoteToAdmin failed: ${error.message}`);
}

export async function deleteUser(userId: string): Promise<void> {
  const admin = serviceClient();
  await admin.auth.admin.deleteUser(userId).catch(() => undefined);
}

/** Removes everything a test run created, keeping the seeded catalogue intact. */
export async function cleanupTestUsers(): Promise<void> {
  const admin = serviceClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  for (const user of data?.users ?? []) {
    if (user.email?.includes('@example.invalid') && !user.email.startsWith('demo')) {
      await admin.auth.admin.deleteUser(user.id).catch(() => undefined);
    }
  }
  await admin.from('hackathons').delete().like('slug', 'e2e-%');
}

export async function hackathonIdBySlug(slug: string): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin.from('hackathons').select('id').eq('slug', slug).single();
  if (error || !data) throw new Error(`No hackathon "${slug}": ${error?.message}`);
  return data.id as string;
}

/** The id of the top review on a hackathon, as the page orders them. */
export async function firstReviewIdOf(hackathonSlug: string): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin
    .from('public_reviews')
    .select('id')
    .eq('hackathon_slug', hackathonSlug)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) throw new Error(`No reviews on "${hackathonSlug}": ${error?.message}`);
  return data.id as string;
}
