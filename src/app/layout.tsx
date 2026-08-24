import { type ReactNode } from 'react';

/**
 * next-intl owns the real document shell in `app/[locale]/layout.tsx`, because
 * `<html lang>` depends on the active locale. Next still requires a root
 * layout to exist for routes outside `[locale]` (the global not-found), so
 * this one only passes children through.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
