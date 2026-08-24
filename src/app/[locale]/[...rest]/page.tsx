import { notFound } from 'next/navigation';

/**
 * Catch-all that renders the designed 404 (PRD 11) for any unmatched path
 * under a locale.
 *
 * Without it, `/uz/nope` fell through to Next's built-in black-and-white error
 * page: `[locale]/not-found.tsx` only handles `notFound()` thrown *inside* the
 * segment, not URLs that match no route at all. The middleware locale-prefixes
 * every non-asset request, so this catches everything.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
