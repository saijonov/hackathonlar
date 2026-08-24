'use client';

import { useId, useMemo, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, ImageUp, Plus, Search, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Monogram } from '@/components/brand/Monogram';
import { GeneratedCover } from '@/components/hackathon/GeneratedCover';
import { HACKATHON_FORMATS, type HackathonFormat } from '@/lib/types';
import {
  SUBMISSION_LIMITS,
  UPLOAD_LIMITS,
  hackathonSubmissionSchema,
  isAllowedImage,
  slugify,
  toFieldErrors,
  type FieldErrors,
} from '@/lib/validation/schemas';
import { submitHackathon } from '@/lib/actions/hackathons';
import { uploadImage } from '@/lib/actions/uploads';
import { cn } from '@/lib/utils/cn';

export interface OrganizerOption {
  id: string;
  slug: string;
  name: string;
}

interface SubmitFormProps {
  organizers: OrganizerOption[];
}

/**
 * "Add a hackathon" (PRD 7.5).
 *
 * The organizer picker searches the existing list first and only then offers an
 * inline "create new" — that ordering matters, because a duplicate organizer
 * silently splits an organizer's track record in two, which is precisely the
 * number this site exists to keep honest.
 */
export function SubmitForm({ organizers }: SubmitFormProps) {
  const t = useTranslations('submit');
  const tCommon = useTranslations('common');
  const tFormat = useTranslations('format');
  const tValidation = useTranslations('validation');
  const tActionError = useTranslations('actionError');

  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const { isAuthenticated, openAuth } = useAuth();
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [organizerId, setOrganizerId] = useState('');
  const [organizerQuery, setOrganizerQuery] = useState('');
  const [creatingOrganizer, setCreatingOrganizer] = useState(false);
  const [newOrganizerName, setNewOrganizerName] = useState('');
  const [newOrganizerWebsite, setNewOrganizerWebsite] = useState('');
  const [newOrganizerTelegram, setNewOrganizerTelegram] = useState('');
  const [city, setCity] = useState('');
  const [format, setFormat] = useState<HackathonFormat>('offline');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [tracksText, setTracksText] = useState('');
  const [website, setWebsite] = useState('');
  const [telegram, setTelegram] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [descriptionLocale, setDescriptionLocale] = useState<AppLocale>(locale);
  const [description, setDescription] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const selectedOrganizer = organizers.find((organizer) => organizer.id === organizerId) ?? null;

  const filteredOrganizers = useMemo(() => {
    const query = organizerQuery.trim().toLowerCase();
    if (!query) return organizers.slice(0, 8);
    return organizers.filter((organizer) => organizer.name.toLowerCase().includes(query)).slice(0, 8);
  }, [organizerQuery, organizers]);

  const tracks = useMemo(
    () =>
      tracksText
        .split(',')
        .map((track) => track.trim())
        .filter(Boolean)
        .slice(0, SUBMISSION_LIMITS.maxTracks),
    [tracksText],
  );

  const handleUpload = (file: File) => {
    setUploadError(null);

    if (!isAllowedImage(file, UPLOAD_LIMITS.coverMaxBytes)) {
      setUploadError(
        file.size > UPLOAD_LIMITS.coverMaxBytes ? t('cover.tooLarge') : t('cover.wrongType'),
      );
      return;
    }

    setUploading(true);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImage('covers', formData);
      setUploading(false);

      if (result.ok) setCoverUrl(result.data.url);
      else if (result.error === 'unauthenticated') openAuth();
      else setUploadError(tActionError(result.error));
    });
  };

  const buildPayload = () => ({
    name,
    organizerId: creatingOrganizer ? '' : organizerId,
    newOrganizerName: creatingOrganizer ? newOrganizerName : '',
    newOrganizerWebsite: creatingOrganizer ? newOrganizerWebsite : '',
    newOrganizerTelegram: creatingOrganizer ? newOrganizerTelegram : '',
    city: format === 'online' ? '' : city,
    format,
    startDate,
    endDate,
    prizePool,
    tracks,
    website,
    telegram,
    registrationUrl,
    coverUrl: coverUrl ?? '',
    descriptionLocale,
    description,
  });

  const doSubmit = () => {
    setFormError(null);
    const payload = buildPayload();

    const parsed = hackathonSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      document
        .querySelector<HTMLElement>('[data-invalid="true"]')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      const result = await submitHackathon(payload);

      if (result.ok) {
        setCreatedSlug(result.data.slug);
        router.refresh();
        return;
      }
      if (result.error === 'unauthenticated') {
        openAuth({ onSuccess: doSubmit });
        return;
      }
      if (result.error === 'validation' && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }
      setFormError(
        result.error === 'rateLimited' ? t('errors.rateLimited') : tActionError(result.error),
      );
    });
  };

  const errorFor = (key: string) => (fieldErrors[key] ? tValidation(fieldErrors[key]!) : null);

  if (createdSlug) {
    return (
      <div className="rounded-lg border border-good/30 bg-good-soft p-8 text-center">
        <CheckCircle2 size={36} strokeWidth={1.5} aria-hidden className="mx-auto text-good" />
        <h2 className="mt-3 text-h1 text-ink">{t('success.title')}</h2>
        <p className="mx-auto mt-2 max-w-md text-body text-ink-2">{t('success.body')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={buttonClasses('primary', 'md')}
            onClick={() => router.push('/profile')}
          >
            {t('success.toProfile')}
          </button>
          <button
            type="button"
            className={buttonClasses('secondary', 'md')}
            onClick={() => window.location.reload()}
          >
            {t('success.addAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid grid-cols-1 gap-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPending) doSubmit();
      }}
    >
      {formError && <Alert tone="danger">{formError}</Alert>}
      {!isAuthenticated && <Alert tone="info">{t('subtitle')}</Alert>}

      {/* ----------------------------------------------------------- Basics */}
      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-h2">{t('sections.basics')}</h2>

        <div data-invalid={fieldErrors.name ? 'true' : undefined}>
          <Field id={`${fieldId}-name`} label={t('fields.name')} error={errorFor('name')}>
            <Input
              id={`${fieldId}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('fields.namePlaceholder')}
              maxLength={SUBMISSION_LIMITS.nameMax}
              invalid={Boolean(fieldErrors.name)}
              disabled={isPending}
              data-testid="submit-name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id={`${fieldId}-format`} label={t('fields.format')}>
            <Select
              id={`${fieldId}-format`}
              value={format}
              onChange={(event) => setFormat(event.target.value as HackathonFormat)}
              disabled={isPending}
            >
              {HACKATHON_FORMATS.map((value) => (
                <option key={value} value={value}>
                  {tFormat(value)}
                </option>
              ))}
            </Select>
          </Field>

          <div data-invalid={fieldErrors.city ? 'true' : undefined}>
            <Field
              id={`${fieldId}-city`}
              label={t('fields.city')}
              hint={format === 'online' ? t('fields.cityOnlineHint') : undefined}
              error={errorFor('city')}
              optional={tCommon('optional')}
            >
              <Input
                id={`${fieldId}-city`}
                value={format === 'online' ? '' : city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('fields.cityPlaceholder')}
                disabled={isPending || format === 'online'}
                invalid={Boolean(fieldErrors.city)}
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id={`${fieldId}-start`} label={t('fields.startDate')} optional={tCommon('optional')}>
            <Input
              id={`${fieldId}-start`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isPending}
            />
          </Field>

          <div data-invalid={fieldErrors.endDate ? 'true' : undefined}>
            <Field
              id={`${fieldId}-end`}
              label={t('fields.endDate')}
              error={errorFor('endDate')}
              optional={tCommon('optional')}
            >
              <Input
                id={`${fieldId}-end`}
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={isPending}
                invalid={Boolean(fieldErrors.endDate)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Organizer */}
      <section className="grid grid-cols-1 gap-4" data-invalid={fieldErrors.organizerId ? 'true' : undefined}>
        <h2 className="text-h2">{t('sections.organizer')}</h2>

        {selectedOrganizer && !creatingOrganizer ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-accent bg-accent-soft p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Monogram name={selectedOrganizer.name} slug={selectedOrganizer.slug} size={32} />
              <span className="min-w-0 truncate font-display font-semibold text-ink">
                {selectedOrganizer.name}
              </span>
              <Badge tone="accent">{t('organizer.selected')}</Badge>
            </div>
            <button
              type="button"
              onClick={() => setOrganizerId('')}
              aria-label={tCommon('clearAll')}
              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-3 hover:bg-surface hover:text-ink"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : creatingOrganizer ? (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-paper-2/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-h3">{t('organizer.createTitle')}</h3>
              <button
                type="button"
                onClick={() => setCreatingOrganizer(false)}
                className="text-meta text-accent underline underline-offset-4"
              >
                {t('organizer.useExisting')}
              </button>
            </div>

            <Field id={`${fieldId}-org-name`} label={t('organizer.name')}>
              <Input
                id={`${fieldId}-org-name`}
                value={newOrganizerName}
                onChange={(event) => setNewOrganizerName(event.target.value)}
                maxLength={140}
                disabled={isPending}
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                id={`${fieldId}-org-web`}
                label={t('organizer.website')}
                optional={tCommon('optional')}
                error={errorFor('newOrganizerWebsite')}
              >
                <Input
                  id={`${fieldId}-org-web`}
                  type="url"
                  inputMode="url"
                  value={newOrganizerWebsite}
                  onChange={(event) => setNewOrganizerWebsite(event.target.value)}
                  placeholder="https://"
                  disabled={isPending}
                />
              </Field>
              <Field
                id={`${fieldId}-org-tg`}
                label={t('organizer.telegram')}
                optional={tCommon('optional')}
                error={errorFor('newOrganizerTelegram')}
              >
                <Input
                  id={`${fieldId}-org-tg`}
                  type="url"
                  inputMode="url"
                  value={newOrganizerTelegram}
                  onChange={(event) => setNewOrganizerTelegram(event.target.value)}
                  placeholder="https://t.me/"
                  disabled={isPending}
                />
              </Field>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <Field id={`${fieldId}-org-search`} label={t('organizer.search')} error={errorFor('organizerId')}>
              <div className="relative">
                <Search
                  size={17}
                  strokeWidth={1.75}
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                />
                <Input
                  id={`${fieldId}-org-search`}
                  value={organizerQuery}
                  onChange={(event) => setOrganizerQuery(event.target.value)}
                  placeholder={t('organizer.searchPlaceholder')}
                  className="pl-10"
                  disabled={isPending}
                  autoComplete="off"
                />
              </div>
            </Field>

            <ul className="grid grid-cols-1 gap-1.5">
              {filteredOrganizers.map((organizer) => (
                <li key={organizer.id}>
                  <button
                    type="button"
                    onClick={() => setOrganizerId(organizer.id)}
                    className="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent hover:bg-accent-soft"
                  >
                    <Monogram name={organizer.name} slug={organizer.slug} size={28} />
                    <span className="min-w-0 truncate text-body text-ink">{organizer.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2 text-meta text-ink-3">
              <span>{t('organizer.notFound')}</span>
              <button
                type="button"
                onClick={() => {
                  setCreatingOrganizer(true);
                  setNewOrganizerName(organizerQuery);
                  setOrganizerId('');
                }}
                className="inline-flex items-center gap-1 font-semibold text-accent underline underline-offset-4"
              >
                <Plus size={14} strokeWidth={2} aria-hidden />
                {t('organizer.createNew')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------ Description */}
      <section className="grid grid-cols-1 gap-4" data-invalid={fieldErrors.description ? 'true' : undefined}>
        <h2 className="text-h2">{t('sections.description')}</h2>

        <Field id={`${fieldId}-desc-locale`} label={t('fields.descriptionLanguage')}>
          <Select
            id={`${fieldId}-desc-locale`}
            value={descriptionLocale}
            onChange={(event) => setDescriptionLocale(event.target.value as AppLocale)}
            disabled={isPending}
          >
            {routing.locales.map((value) => (
              <option key={value} value={value}>
                {LOCALE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id={`${fieldId}-desc`}
          label={t('fields.description')}
          hint={t('fields.descriptionHint')}
          error={errorFor('description')}
        >
          <Textarea
            id={`${fieldId}-desc`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('fields.descriptionPlaceholder')}
            maxLength={SUBMISSION_LIMITS.descriptionMax}
            rows={6}
            invalid={Boolean(fieldErrors.description)}
            disabled={isPending}
            data-testid="submit-description"
          />
        </Field>
      </section>

      {/* ---------------------------------------------------------- Details */}
      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-h2">{t('sections.details')}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id={`${fieldId}-prize`} label={t('fields.prizePool')} optional={tCommon('optional')}>
            <Input
              id={`${fieldId}-prize`}
              value={prizePool}
              onChange={(event) => setPrizePool(event.target.value)}
              placeholder={t('fields.prizePoolPlaceholder')}
              maxLength={SUBMISSION_LIMITS.prizePoolMax}
              disabled={isPending}
            />
          </Field>

          <Field id={`${fieldId}-tracks`} label={t('fields.tracks')} optional={tCommon('optional')}>
            <Input
              id={`${fieldId}-tracks`}
              value={tracksText}
              onChange={(event) => setTracksText(event.target.value)}
              placeholder={t('fields.tracksPlaceholder')}
              disabled={isPending}
            />
          </Field>
        </div>

        {tracks.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tracks.map((track) => (
              <li key={track}>
                <Badge tone="neutral">{track}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------ Links */}
      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-h2">{t('sections.links')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id={`${fieldId}-web`} label={t('fields.website')} optional={tCommon('optional')} error={errorFor('website')}>
            <Input
              id={`${fieldId}-web`}
              type="url"
              inputMode="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://"
              disabled={isPending}
            />
          </Field>
          <Field id={`${fieldId}-tg`} label={t('fields.telegram')} optional={tCommon('optional')} error={errorFor('telegram')}>
            <Input
              id={`${fieldId}-tg`}
              type="url"
              inputMode="url"
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
              placeholder="https://t.me/"
              disabled={isPending}
            />
          </Field>
          <Field
            id={`${fieldId}-reg`}
            label={t('fields.registrationUrl')}
            optional={tCommon('optional')}
            error={errorFor('registrationUrl')}
          >
            <Input
              id={`${fieldId}-reg`}
              type="url"
              inputMode="url"
              value={registrationUrl}
              onChange={(event) => setRegistrationUrl(event.target.value)}
              placeholder="https://"
              disabled={isPending}
            />
          </Field>
        </div>
      </section>

      {/* ------------------------------------------------------------ Cover */}
      <section className="grid grid-cols-1 gap-3">
        <h2 className="text-h2">{t('sections.cover')}</h2>

        <div className="flex flex-wrap items-start gap-4">
          <div className="relative aspect-[16/9] w-full max-w-64 overflow-hidden rounded-lg border border-line">
            {coverUrl ? (
              <Image src={coverUrl} alt="" fill sizes="256px" className="object-cover" />
            ) : (
              <GeneratedCover slug={slugify(name) || 'hakaton'} name={name || '—'} titleless />
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={UPLOAD_LIMITS.mimeTypes.join(',')}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleUpload(file);
                event.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="secondary"
              loading={uploading}
              onClick={() =>
                isAuthenticated
                  ? fileInputRef.current?.click()
                  : openAuth({ onSuccess: () => fileInputRef.current?.click() })
              }
            >
              <ImageUp size={16} strokeWidth={1.75} aria-hidden />
              {coverUrl ? t('cover.replace') : t('cover.choose')}
            </Button>

            {coverUrl && (
              <Button type="button" variant="ghost" onClick={() => setCoverUrl(null)}>
                <X size={16} strokeWidth={1.75} aria-hidden />
                {t('cover.remove')}
              </Button>
            )}

            <p className={cn('max-w-64 text-meta', uploadError ? 'text-bad' : 'text-ink-3')}>
              {uploadError ?? t('cover.hint')}
            </p>
          </div>
        </div>
      </section>

      <div>
        <Button type="submit" size="lg" loading={isPending} data-testid="submit-hackathon">
          {t('submitButton')}
        </Button>
      </div>
    </form>
  );
}
