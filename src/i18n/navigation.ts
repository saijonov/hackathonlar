import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation primitives. Always import `Link` from here rather
 * than from `next/link` so the active locale prefix is preserved.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
