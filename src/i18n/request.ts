import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Uzbekistan has a single timezone. Pinning it keeps server and client
    // renders byte-identical and makes "time ago" strings correct for the
    // audience regardless of where the page is rendered.
    timeZone: 'Asia/Tashkent',
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        dayMonth: { day: 'numeric', month: 'short' },
      },
      number: {
        score: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      },
    },
    onError(error) {
      // Missing messages must fail loudly in development (PRD 10: "zero
      // hardcoded strings in components"), but must never take down a page.
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    },
    getMessageFallback({ key, namespace }) {
      const path = [namespace, key].filter(Boolean).join('.');
      return process.env.NODE_ENV === 'development' ? `⟨${path}⟩` : (path.split('.').pop() ?? path);
    },
  };
});
