import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Global 404 for paths outside `/[locale]` (e.g. `/nope`).
 *
 * Rather than render a second, locale-less document shell, it sends the visitor
 * into the default locale, where the designed 404 lives with full navigation.
 */
export default function GlobalNotFound() {
  redirect(`/${routing.defaultLocale}/404`);
}
