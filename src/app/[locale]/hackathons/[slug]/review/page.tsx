import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { isUpcoming, todayInTashkent } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { getHackathonBySlug } from '@/lib/queries/hackathons';
import { getOwnReviewForHackathon } from '@/lib/queries/reviews';
import { Alert } from '@/components/ui/Alert';
import { buttonClasses } from '@/components/ui/Button';
import { ReviewForm } from '@/components/review/ReviewForm';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) return {};

  const t = await getTranslations({ locale, namespace: 'review.form' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: `/hackathons/${slug}/review`,
    title: t('title', { name: hackathon.name }),
    description: t('subtitle'),
    // A form page has nothing to offer search engines and should never outrank
    // the hackathon itself.
    noIndex: true,
  });
}

/**
 * The review form on its own route (PRD 7.4 allows modal *or* a dedicated
 * route; a route wins here because it is deep-linkable, back-button friendly,
 * and gives a five-category form real room on a 375px screen).
 *
 * Note this page is NOT auth-gated. A logged-out visitor sees and can fill in
 * the whole form; the auth dialog only appears on submit, opening on top of the
 * form so the draft underneath survives (PRD 6, "Trigger pattern").
 */
export default async function ReviewPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const t = await getTranslations('review');
  const tHackathon = await getTranslations('hackathon');

  const [existing] = await Promise.all([getOwnReviewForHackathon(hackathon.id)]);
  const upcoming = isUpcoming(hackathon.effectiveEndDate, todayInTashkent());

  // An event that has not happened yet cannot be reviewed. RLS enforces this;
  // here we simply explain it instead of showing a form doomed to fail.
  if (upcoming && hackathon.score.reviewCount === 0) {
    return (
      <div className="container-page max-w-2xl py-12">
        <Alert tone="warning" title={hackathon.name}>
          {t('errors.notParticipated')}
        </Alert>
        <Link href={`/hackathons/${slug}`} className={buttonClasses('secondary', 'md', 'mt-5')}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          {hackathon.name}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <Link
        href={`/hackathons/${slug}`}
        className="inline-flex items-center gap-1.5 text-meta font-medium text-ink-3 transition-colors hover:text-accent"
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        {hackathon.name}
      </Link>

      <header className="mt-4">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('form.eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">
          {existing ? t('form.editTitle') : t('form.title', { name: hackathon.name })}
        </h1>
        <p className="mt-3 text-body-lg text-ink-2">{t('form.subtitle')}</p>
      </header>

      {existing && (
        <Alert tone="info" className="mt-5">
          {tHackathon('editReview')}
        </Alert>
      )}

      <div className="mt-8">
        <ReviewForm
          hackathonId={hackathon.id}
          hackathonSlug={hackathon.slug}
          hackathonName={hackathon.name}
          existing={existing}
        />
      </div>
    </div>
  );
}
