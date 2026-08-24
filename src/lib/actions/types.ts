import { type FieldErrors } from '@/lib/validation/schemas';

/**
 * Every server action returns this shape instead of throwing.
 *
 * `error` is a stable code, never a sentence: the client renders it through
 * next-intl so failures are localized like the rest of the UI, and a Postgres
 * message never leaks to the browser.
 */
export type ActionErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'validation'
  | 'notFound'
  | 'duplicate'
  | 'rateLimited'
  | 'notStarted'
  | 'ownVote'
  | 'alreadyReported'
  | 'unknown';

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorCode; fieldErrors?: FieldErrors };

export function ok(): ActionResult<undefined>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: ActionErrorCode, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}
