import { createClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';
import {
  TEST_PASSWORD,
  anonClient,
  createConfirmedUser,
  deleteUser,
  promoteToAdmin,
  serviceClient,
  uniqueEmail,
} from './helpers/supabase';

/**
 * PRD 15.5 — "Security checks: direct Supabase queries as anon confirming RLS
 * (pending hackathons hidden, anonymous identity unreachable, cross-user edits
 * rejected)."
 *
 * These deliberately bypass the UI. A defence that only exists in React is not
 * a defence: anyone can open the network tab, copy the anon key (it is public
 * by design) and talk to PostgREST directly. That is exactly what these tests
 * do.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function signedInClient(email: string) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`sign-in failed: ${error.message}`);
  return client;
}

test.describe('row level security, probed directly', () => {
  const userA = { id: '', email: '' };
  const userB = { id: '', email: '' };
  const adminUser = { id: '', email: '' };
  let pendingId = '';
  let reviewOfA = '';

  test.beforeAll(async () => {
    const admin = serviceClient();

    userA.email = uniqueEmail('rls-a');
    userA.id = await createConfirmedUser(userA.email, 'RLS User A');
    userB.email = uniqueEmail('rls-b');
    userB.id = await createConfirmedUser(userB.email, 'RLS User B');
    adminUser.email = uniqueEmail('rls-admin');
    adminUser.id = await createConfirmedUser(adminUser.email, 'RLS Admin');
    await promoteToAdmin(adminUser.id);

    // A pending hackathon submitted by A.
    const { data: pending, error } = await admin
      .from('hackathons')
      .insert({
        slug: `e2e-rls-pending-${Date.now()}`,
        name: 'E2E RLS Pending Hackathon',
        description_en: 'Pending record used to prove moderation is enforced in the database.',
        format: 'online',
        status: 'pending',
        submitted_by: userA.id,
      })
      .select('id')
      .single();
    if (error) throw error;
    pendingId = pending.id;

    // A review written by A on an approved, past hackathon.
    const { data: hackathon } = await admin
      .from('hackathons')
      .select('id')
      .eq('slug', 'president-tech-award-2024-hackathon')
      .single();

    const { data: review, error: reviewError } = await admin
      .from('reviews')
      .insert({
        hackathon_id: hackathon!.id,
        user_id: userA.id,
        rating_organization: 4,
        rating_communication: 4,
        rating_judging: 4,
        rating_prizes: 4,
        rating_venue: 4,
        title: 'E2E RLS fixture review',
        body: 'Bu yozuv RLS qoidalarini tekshirish uchun yaratilgan va sinovdan soʼng oʼchiriladi.',
      })
      .select('id')
      .single();
    if (reviewError) throw reviewError;
    reviewOfA = review.id;
  });

  test.afterAll(async () => {
    const admin = serviceClient();
    await admin.from('hackathons').delete().eq('id', pendingId);
    await admin.from('reviews').delete().eq('id', reviewOfA);
    await deleteUser(userA.id);
    await deleteUser(userB.id);
    await deleteUser(adminUser.id);
  });

  test('anon cannot see pending hackathons through any surface', async () => {
    const supabase = anonClient();

    const table = await supabase.from('hackathons').select('id').eq('id', pendingId);
    expect(table.data ?? []).toHaveLength(0);

    const cards = await supabase.from('hackathon_cards').select('id').eq('id', pendingId);
    expect(cards.data ?? []).toHaveLength(0);

    const byStatus = await supabase.from('hackathons').select('id, status').eq('status', 'pending');
    expect(byStatus.data ?? []).toHaveLength(0);

    const admin = await supabase.from('admin_hackathons').select('id');
    expect(admin.error?.code).toBe('42501');
  });

  test('a signed-in user sees only their own pending submission, never anyone else in the queue', async () => {
    const clientA = await signedInClient(userA.email);
    const mine = await clientA.from('hackathons').select('id').eq('id', pendingId);
    expect(mine.data ?? []).toHaveLength(1);

    const clientB = await signedInClient(userB.email);
    const theirs = await clientB.from('hackathons').select('id').eq('id', pendingId);
    expect(theirs.data ?? []).toHaveLength(0);

    // And B cannot read the moderation view either.
    const queue = await clientB.from('admin_hackathons').select('id');
    expect(queue.data ?? []).toHaveLength(0);
  });

  test('anon cannot read the reviews table, only the anonymised view', async () => {
    const supabase = anonClient();

    const raw = await supabase.from('reviews').select('*');
    expect(raw.error?.code).toBe('42501');

    // Not even a single column.
    const oneColumn = await supabase.from('reviews').select('user_id');
    expect(oneColumn.error?.code).toBe('42501');

    // The view works and never carries a raw user_id column.
    const view = await supabase.from('public_reviews').select('*').limit(1);
    expect(view.error).toBeNull();
    expect(Object.keys(view.data?.[0] ?? {})).not.toContain('user_id');
  });

  test('anon cannot read profiles.role', async () => {
    const supabase = anonClient();

    const withRole = await supabase.from('profiles').select('id, role').limit(1);
    expect(withRole.error?.code).toBe('42501');

    // The public columns still work — display names appear on reviews.
    const publicColumns = await supabase.from('profiles').select('id, display_name').limit(1);
    expect(publicColumns.error).toBeNull();
  });

  test('a user cannot edit or delete another user\'s review', async () => {
    const clientB = await signedInClient(userB.email);

    const update = await clientB
      .from('reviews')
      .update({ title: 'hijacked' })
      .eq('id', reviewOfA)
      .select('id');
    // RLS filters the row out, so the update matches nothing.
    expect(update.data ?? []).toHaveLength(0);

    const remove = await clientB.from('reviews').delete().eq('id', reviewOfA).select('id');
    expect(remove.data ?? []).toHaveLength(0);

    // The original is untouched.
    const { data } = await serviceClient().from('reviews').select('title').eq('id', reviewOfA).single();
    expect(data?.title).toBe('E2E RLS fixture review');
  });

  test('a user cannot review the same hackathon twice', async () => {
    const clientA = await signedInClient(userA.email);
    const { data: hackathon } = await serviceClient()
      .from('hackathons')
      .select('id')
      .eq('slug', 'president-tech-award-2024-hackathon')
      .single();

    const duplicate = await clientA.from('reviews').insert({
      hackathon_id: hackathon!.id,
      user_id: userA.id,
      rating_organization: 1,
      rating_communication: 1,
      rating_judging: 1,
      rating_prizes: 1,
      rating_venue: 1,
      title: 'Second attempt',
      body: 'Ikkinchi marta sharh yozishga urinish — bu bazada taqiqlangan boʼlishi kerak.',
    });

    expect(duplicate.error?.code).toBe('23505');
  });

  test('a user cannot post a review as somebody else', async () => {
    const clientB = await signedInClient(userB.email);
    const { data: hackathon } = await serviceClient()
      .from('hackathons')
      .select('id')
      .eq('slug', 'navruz-hackathon-2025')
      .single();

    const forged = await clientB.from('reviews').insert({
      hackathon_id: hackathon!.id,
      user_id: userA.id, // not the caller
      rating_organization: 5,
      rating_communication: 5,
      rating_judging: 5,
      rating_prizes: 5,
      rating_venue: 5,
      title: 'Forged authorship',
      body: 'Boshqa foydalanuvchi nomidan sharh yozishga urinish — RLS buni rad etishi kerak.',
    });

    expect(forged.error?.code).toBe('42501');
  });

  test('a non-admin cannot change a hackathon status or any moderation field', async () => {
    const clientB = await signedInClient(userB.email);

    const approve = await clientB
      .from('hackathons')
      .update({ status: 'approved' })
      .eq('id', pendingId)
      .select('id');
    expect(approve.data ?? []).toHaveLength(0);

    // Even the submitter cannot approve their own submission.
    const clientA = await signedInClient(userA.email);
    const selfApprove = await clientA
      .from('hackathons')
      .update({ status: 'approved' })
      .eq('id', pendingId)
      .select('id');
    expect(selfApprove.data ?? []).toHaveLength(0);

    const { data } = await serviceClient()
      .from('hackathons')
      .select('status')
      .eq('id', pendingId)
      .single();
    expect(data?.status).toBe('pending');
  });

  test('a submitted hackathon cannot be inserted pre-approved', async () => {
    const clientB = await signedInClient(userB.email);

    const sneaky = await clientB.from('hackathons').insert({
      slug: `e2e-sneaky-${Date.now()}`,
      name: 'E2E Sneaky Pre-approved',
      description_en: 'An attempt to insert a hackathon that is already approved.',
      format: 'online',
      status: 'approved',
      submitted_by: userB.id,
    });

    // `status` is not even granted to the authenticated role at column level.
    expect(sneaky.error).not.toBeNull();
    expect(['42501', '42601', 'PGRST204']).toContain(sneaky.error?.code ?? '');
  });

  test('a user cannot promote themselves to admin', async () => {
    const clientB = await signedInClient(userB.email);

    const escalate = await clientB
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userB.id)
      .select('id');
    expect(escalate.error).not.toBeNull();

    const { data } = await serviceClient()
      .from('profiles')
      .select('role')
      .eq('id', userB.id)
      .single();
    expect(data?.role).toBe('user');
  });

  test('a non-admin cannot create organizers or official responses', async () => {
    const clientB = await signedInClient(userB.email);

    const organizer = await clientB
      .from('organizers')
      .insert({ slug: `e2e-fake-${Date.now()}`, name: 'E2E Fake Organizer' });
    expect(organizer.error?.code).toBe('42501');

    const response = await clientB
      .from('official_responses')
      .insert({ review_id: reviewOfA, body: 'Fake official response body', author_label: 'Fake' });
    expect(response.error?.code).toBe('42501');
  });

  test('an admin can moderate, so the policies are permissive for the right role', async () => {
    const clientAdmin = await signedInClient(adminUser.email);

    const queue = await clientAdmin.from('admin_hackathons').select('id').eq('id', pendingId);
    expect(queue.data ?? []).toHaveLength(1);

    const reviews = await clientAdmin.from('admin_reviews').select('author_id').eq('id', reviewOfA);
    expect(reviews.data?.[0]?.author_id).toBe(userA.id);
  });

  test('the service role key is never shipped to the browser', async ({ page }) => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    expect(serviceKey.length).toBeGreaterThan(20);

    const scripts: string[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/_next/static/') && response.url().endsWith('.js')) {
        scripts.push(await response.text().catch(() => ''));
      }
    });

    await page.goto('/en/submit');
    await page.waitForLoadState('load');

    const html = await page.content();
    expect(html).not.toContain(serviceKey);
    for (const script of scripts) {
      expect(script).not.toContain(serviceKey);
    }
    expect(scripts.length).toBeGreaterThan(0);
  });
});
