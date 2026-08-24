import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { type SubmissionSummary } from '@/lib/types';
import { mapSubmission } from './mappers';

const SUBMISSION_COLUMNS =
  'id, slug, name, status, rejection_reason, created_at, city, format, start_date, end_date';

/**
 * The signed-in user's own submissions in every status (PRD 7.5 / 7.7).
 * Uses the session client so RLS is what decides visibility, not a WHERE clause
 * we could get wrong.
 */
export async function getOwnSubmissions(): Promise<SubmissionSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('hackathons')
    .select(SUBMISSION_COLUMNS)
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapSubmission);
}
