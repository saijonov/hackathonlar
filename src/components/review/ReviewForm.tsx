'use client';

import { useCallback, useEffect, useId, useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Field, describedBy } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { SCORE_CATEGORIES, type ScoreCategory } from '@/lib/score';
import { PARTICIPATION_ROLES, type OwnReview, type ParticipatedAs } from '@/lib/types';
import { REVIEW_LIMITS, reviewSchema, toFieldErrors, type FieldErrors } from '@/lib/validation/schemas';
import { deleteReview, submitReview } from '@/lib/actions/reviews';
import { cn } from '@/lib/utils/cn';
import { StarRatingInput } from './StarRatingInput';

interface ReviewFormProps {
  hackathonId: string;
  hackathonSlug: string;
  hackathonName: string;
  existing: OwnReview | null;
}

type Ratings = Partial<Record<ScoreCategory, number>>;

interface Draft {
  ratings: Ratings;
  title: string;
  body: string;
  pros: string;
  cons: string;
  isAnonymous: boolean;
  participatedAs: ParticipatedAs;
}

const emptyDraft: Draft = {
  ratings: {},
  title: '',
  body: '',
  pros: '',
  cons: '',
  isAnonymous: false,
  participatedAs: 'participant',
};

/**
 * The review form (PRD 7.4).
 *
 * Two things drive its design:
 *
 * 1. **The draft must survive signing in.** A logged-out visitor can fill this
 *    in completely; pressing submit opens the auth dialog *on top of* the form
 *    (the provider owns it, so nothing unmounts) and re-submits automatically
 *    afterwards. The draft is also mirrored to localStorage, so it survives an
 *    accidental reload or an OAuth round trip through Google.
 *
 * 2. **Validation is the same zod schema the server runs.** The client copy is
 *    only for fast feedback; the server's copy is the one that decides.
 */
export function ReviewForm({ hackathonId, hackathonSlug, hackathonName, existing }: ReviewFormProps) {
  const t = useTranslations('review');
  const tCommon = useTranslations('common');
  const tScore = useTranslations('score');
  const tParticipation = useTranslations('participation');
  const tValidation = useTranslations('validation');
  const tActionError = useTranslations('actionError');

  const router = useRouter();
  const { isAuthenticated, openAuth } = useAuth();
  const [isPending, startTransition] = useTransition();
  const fieldId = useId();

  const storageKey = `hu:review-draft:${hackathonId}`;

  const initial = useMemo<Draft>(
    () =>
      existing
        ? {
            ratings: { ...existing.ratings },
            title: existing.title,
            body: existing.body,
            pros: existing.pros ?? '',
            cons: existing.cons ?? '',
            isAnonymous: existing.isAnonymous,
            participatedAs: existing.participatedAs,
          }
        : emptyDraft,
    [existing],
  );

  const [draft, setDraft] = useState<Draft>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<'created' | 'updated' | null>(null);

  // Restore a draft left behind by a reload or an OAuth round trip.
  useEffect(() => {
    if (existing) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setDraft({ ...emptyDraft, ...(JSON.parse(stored) as Partial<Draft>) });
    } catch {
      // A corrupt draft is not worth failing the page over.
    }
  }, [existing, storageKey]);

  useEffect(() => {
    if (existing || success) return;
    const isEmpty = !draft.title && !draft.body && Object.keys(draft.ratings).length === 0;
    try {
      if (isEmpty) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Private-mode quota errors must not break typing.
    }
  }, [draft, existing, storageKey, success]);

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const setRating = useCallback((category: ScoreCategory, value: number) => {
    setDraft((current) => ({ ...current, ratings: { ...current.ratings, [category]: value } }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`ratings.${category}`];
      return next;
    });
  }, []);

  const doSubmit = useCallback(() => {
    setFormError(null);

    const payload = {
      hackathonId,
      ratings: draft.ratings,
      title: draft.title,
      body: draft.body,
      pros: draft.pros,
      cons: draft.cons,
      isAnonymous: draft.isAnonymous,
      participatedAs: draft.participatedAs,
    };

    const parsed = reviewSchema.safeParse(payload);
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error);
      setFieldErrors(errors);
      // Move focus to the first problem so the failure is never off-screen.
      const first = document.querySelector<HTMLElement>('[data-invalid="true"]');
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await submitReview(payload);

      if (result.ok) {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        setSuccess(existing ? 'updated' : 'created');
        router.refresh();
        return;
      }

      if (result.error === 'unauthenticated') {
        openAuth({ reason: t('form.signInRequiredBody'), onSuccess: () => doSubmit() });
        return;
      }
      if (result.error === 'validation' && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }
      setFormError(tActionError(result.error));
    });
  }, [draft, existing, hackathonId, openAuth, router, storageKey, t, tActionError]);

  const handleDelete = () => {
    if (!existing) return;
    if (!window.confirm(t('form.deleteConfirm'))) return;

    startTransition(async () => {
      const result = await deleteReview(existing.id);
      if (result.ok) router.push(`/hackathons/${hackathonSlug}`);
      else setFormError(tActionError(result.error));
    });
  };

  if (success) {
    return (
      <div className="rounded-lg border border-good/30 bg-good-soft p-6 text-center">
        <CheckCircle2 size={32} strokeWidth={1.5} aria-hidden className="mx-auto text-good" />
        <h2 className="mt-3 text-h1 text-ink">{t('form.successTitle')}</h2>
        <p className="mt-1.5 text-body text-ink-2">
          {success === 'updated' ? t('form.updatedBody') : t('form.successBody')}
        </p>
        <Button
          className="mt-5"
          onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
        >
          {hackathonName}
        </Button>
      </div>
    );
  }

  const bodyLength = draft.body.trim().length;

  return (
    <form
      className="grid grid-cols-1 gap-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPending) doSubmit();
      }}
    >
      {formError && <Alert tone="danger">{formError}</Alert>}

      {!isAuthenticated && (
        <Alert tone="info" title={t('form.signInRequired')}>
          {t('form.signInRequiredBody')}
        </Alert>
      )}

      {/* ---------------------------------------------------------- Ratings */}
      <section className="grid grid-cols-1 gap-3">
        <div>
          <h2 className="text-h2">{t('form.ratingsTitle')}</h2>
          <p className="mt-1 text-meta text-ink-3">{t('form.ratingsHint')}</p>
        </div>

        {SCORE_CATEGORIES.map((category) => (
          <div key={category} data-invalid={fieldErrors[`ratings.${category}`] ? 'true' : undefined}>
            <StarRatingInput
              name={`rating-${category}`}
              label={tScore(`category.${category}`)}
              hint={tScore(`categoryHint.${category}`)}
              value={draft.ratings[category] ?? null}
              onChange={(value) => setRating(category, value)}
              error={
                fieldErrors[`ratings.${category}`]
                  ? tValidation(fieldErrors[`ratings.${category}`]!)
                  : null
              }
              disabled={isPending}
            />
          </div>
        ))}
      </section>

      {/* --------------------------------------------------------- Details */}
      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-h2">{t('form.detailsTitle')}</h2>

        <div data-invalid={fieldErrors.title ? 'true' : undefined}>
          <Field
            id={`${fieldId}-title`}
            label={t('form.titleLabel')}
            error={fieldErrors.title ? tValidation(fieldErrors.title) : null}
          >
            <Input
              id={`${fieldId}-title`}
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder={t('form.titlePlaceholder')}
              maxLength={REVIEW_LIMITS.titleMax}
              invalid={Boolean(fieldErrors.title)}
              disabled={isPending}
            />
          </Field>
        </div>

        <div data-invalid={fieldErrors.body ? 'true' : undefined}>
          <Field
            id={`${fieldId}-body`}
            label={t('form.bodyLabel')}
            hint={t('form.bodyHint', { min: REVIEW_LIMITS.bodyMin })}
            error={fieldErrors.body ? tValidation(fieldErrors.body) : null}
          >
            <Textarea
              id={`${fieldId}-body`}
              value={draft.body}
              onChange={(event) => update('body', event.target.value)}
              placeholder={t('form.bodyPlaceholder')}
              maxLength={REVIEW_LIMITS.bodyMax}
              rows={8}
              invalid={Boolean(fieldErrors.body)}
              disabled={isPending}
              aria-describedby={describedBy(`${fieldId}-body`, true, Boolean(fieldErrors.body))}
            />
          </Field>
          <p
            className={cn(
              'mt-1 text-right text-meta tabular-nums',
              bodyLength < REVIEW_LIMITS.bodyMin ? 'text-ink-3' : 'text-good',
            )}
          >
            {bodyLength} / {REVIEW_LIMITS.bodyMin}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id={`${fieldId}-pros`} label={t('form.prosLabel')} optional={tCommon('optional')}>
            <Textarea
              id={`${fieldId}-pros`}
              value={draft.pros}
              onChange={(event) => update('pros', event.target.value)}
              placeholder={t('form.prosPlaceholder')}
              maxLength={REVIEW_LIMITS.prosConsMax}
              rows={3}
              disabled={isPending}
            />
          </Field>

          <Field id={`${fieldId}-cons`} label={t('form.consLabel')} optional={tCommon('optional')}>
            <Textarea
              id={`${fieldId}-cons`}
              value={draft.cons}
              onChange={(event) => update('cons', event.target.value)}
              placeholder={t('form.consPlaceholder')}
              maxLength={REVIEW_LIMITS.prosConsMax}
              rows={3}
              disabled={isPending}
            />
          </Field>
        </div>

        <Field id={`${fieldId}-role`} label={tParticipation('label')}>
          <Select
            id={`${fieldId}-role`}
            value={draft.participatedAs}
            onChange={(event) => update('participatedAs', event.target.value as ParticipatedAs)}
            disabled={isPending}
          >
            {PARTICIPATION_ROLES.map((role) => (
              <option key={role} value={role}>
                {tParticipation(role)}
              </option>
            ))}
          </Select>
        </Field>
      </section>

      {/* ------------------------------------------------------- Anonymity */}
      <label
        className={cn(
          'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
          draft.isAnonymous ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-2',
        )}
      >
        <input
          type="checkbox"
          checked={draft.isAnonymous}
          onChange={(event) => update('isAnonymous', event.target.checked)}
          disabled={isPending}
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="min-w-0">
          <span className="block text-h3 text-ink">{t('form.anonymousLabel')}</span>
          {/* Honest microcopy — PRD 7.4 requires stating that a moderator can
              still see the author, in every locale. */}
          <span className="mt-1 block text-meta leading-relaxed text-ink-2">
            {t('form.anonymousHint')}
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" loading={isPending} data-testid="submit-review">
          {existing ? t('form.update') : t('form.submit')}
        </Button>

        {existing && (
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            {tCommon('delete')}
          </Button>
        )}
      </div>
    </form>
  );
}
