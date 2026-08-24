import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EyeOff, Pencil } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { getSessionUser } from '@/lib/auth/session';
import { getOwnReviews } from '@/lib/queries/reviews';
import { getOwnSubmissions } from '@/lib/queries/submissions';
import { type HackathonStatus } from '@/lib/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { ScoreMark } from '@/components/score/ScoreMark';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.profile' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/profile',
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

const STATUS_TONE: Record<HackathonStatus, BadgeTone> = {
  pending: 'mid',
  approved: 'good',
  rejected: 'bad',
};

/** PRD 7.7 — the user's own reviews and submissions, including their status. */
export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const appLocale = locale as AppLocale;
  const t = await getTranslations('profile');
  const tCommon = await getTranslations('common');
  const user = await getSessionUser();

  if (!user?.profile) {
    return (
      <div className="container-page max-w-xl py-16">
        <SignInPrompt />
      </div>
    );
  }

  const [reviews, submissions] = await Promise.all([getOwnReviews(), getOwnSubmissions()]);

  return (
    <div className="container-page max-w-4xl py-8 md:py-12">
      <header>
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
      </header>

      <div className="mt-8">
        <ProfileForm profile={user.profile} email={user.email} />
      </div>

      {/* -------------------------------------------------------- Reviews */}
      <section className="mt-12">
        <h2 className="border-b border-line pb-3 text-h1">{t('myReviews')}</h2>

        {reviews.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/hackathons/${review.hackathonSlug}`}
                      className="text-meta font-medium text-ink-3 hover:text-accent hover:underline"
                    >
                      {review.hackathonName}
                    </Link>
                    <p className="mt-1 text-h3 text-ink">{review.title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {review.isAnonymous && (
                        <Badge tone="accent" icon={<EyeOff size={11} strokeWidth={2} aria-hidden />}>
                          {t('anonymousBadge')}
                        </Badge>
                      )}
                      {review.status === 'hidden' && (
                        <Badge tone="bad">{t('status.rejected')}</Badge>
                      )}
                      <span className="text-meta text-ink-3">
                        <TimeAgo date={review.createdAt} />
                      </span>
                    </div>

                    {review.isAnonymous && (
                      <p className="mt-1.5 text-meta text-ink-3">{t('anonymousNote')}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <ScoreMark score={review.overall} size="sm" showCount={false} />
                    <Link
                      href={`/hackathons/${review.hackathonSlug}/review`}
                      className={buttonClasses('ghost', 'sm')}
                    >
                      <Pencil size={14} strokeWidth={1.75} aria-hidden />
                      {tCommon('edit')}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-5"
            compact
            title={t('reviewsEmpty')}
            action={
              <Link href="/hackathons" className={buttonClasses('primary', 'md')}>
                {t('reviewsEmptyCta')}
              </Link>
            }
          />
        )}
      </section>

      {/* ---------------------------------------------------- Submissions */}
      <section className="mt-12">
        <h2 className="border-b border-line pb-3 text-h1">{t('mySubmissions')}</h2>

        {submissions.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-3">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-h3 text-ink">
                    {submission.status === 'approved' ? (
                      <Link
                        href={`/hackathons/${submission.slug}`}
                        className="hover:text-accent hover:underline"
                      >
                        {submission.name}
                      </Link>
                    ) : (
                      submission.name
                    )}
                  </p>
                  <p className="mt-1 text-meta text-ink-3">
                    {formatDate(submission.startDate, appLocale) ?? ''}
                    {submission.city ? ` · ${submission.city}` : ''}
                  </p>
                  {submission.status === 'rejected' && submission.rejectionReason && (
                    <p className="mt-2 text-meta text-bad">
                      {t('rejectionReason')}: {submission.rejectionReason}
                    </p>
                  )}
                </div>

                <Badge tone={STATUS_TONE[submission.status]}>
                  {t(`status.${submission.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-5"
            compact
            title={t('submissionsEmpty')}
            action={
              <Link href="/submit" className={buttonClasses('primary', 'md')}>
                {t('submissionsEmptyCta')}
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
