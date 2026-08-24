'use client';

import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { HACKATHON_FORMATS, type AdminHackathon } from '@/lib/types';
import { createHackathon, updateHackathon, type AdminHackathonPatch } from '@/lib/actions/admin';

interface OrganizerOption {
  id: string;
  name: string;
}

interface HackathonEditorProps {
  hackathon: AdminHackathon | null;
  organizers: OrganizerOption[];
  onDone?: () => void;
  /** Save + approve in one step, for the moderation queue. */
  approveOnSave?: boolean;
}

/**
 * The admin hackathon form. Deliberately utilitarian and dense (PRD 7.8) —
 * the design ambition of Section 9 applies to the public site, not here.
 *
 * Used in three places: create-new, edit-existing, and "edit then approve"
 * inside the moderation queue.
 */
export function HackathonEditor({
  hackathon,
  organizers,
  onDone,
  approveOnSave = false,
}: HackathonEditorProps) {
  const t = useTranslations('admin');
  const tSubmit = useTranslations('submit');
  const tFormat = useTranslations('format');
  const tCommon = useTranslations('common');
  const tActionError = useTranslations('actionError');
  const router = useRouter();
  const fieldId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: hackathon?.name ?? '',
    organizer_id: hackathon?.organizerId ?? '',
    city: hackathon?.city ?? '',
    format: hackathon?.format ?? 'offline',
    start_date: hackathon?.startDate ?? '',
    end_date: hackathon?.endDate ?? '',
    prize_pool: hackathon?.prizePool ?? '',
    tracks: (hackathon?.tracks ?? []).join(', '),
    website: hackathon?.website ?? '',
    telegram: hackathon?.telegram ?? '',
    registration_url: hackathon?.registrationUrl ?? '',
    cover_url: hackathon?.coverUrl ?? '',
    description_uz: hackathon?.descriptions.uz ?? '',
    description_ru: hackathon?.descriptions.ru ?? '',
    description_en: hackathon?.descriptions.en ?? '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    setError(null);

    const patch: AdminHackathonPatch = {
      name: form.name,
      organizer_id: form.organizer_id || null,
      city: form.city || null,
      format: form.format,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      prize_pool: form.prize_pool || null,
      tracks: form.tracks
        .split(',')
        .map((track) => track.trim())
        .filter(Boolean),
      website: form.website || null,
      telegram: form.telegram || null,
      registration_url: form.registration_url || null,
      cover_url: form.cover_url || null,
      description_uz: form.description_uz || null,
      description_ru: form.description_ru || null,
      description_en: form.description_en || null,
      ...(approveOnSave ? { status: 'approved' as const, rejection_reason: null } : {}),
    };

    startTransition(async () => {
      const result = hackathon
        ? await updateHackathon(hackathon.id, patch)
        : await createHackathon(patch);

      if (result.ok) {
        router.refresh();
        onDone?.();
        return;
      }
      setError(tActionError(result.error));
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-paper-2/50 p-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field id={`${fieldId}-name`} label={tSubmit('fields.name')}>
          <Input id={`${fieldId}-name`} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>

        <Field id={`${fieldId}-org`} label={tSubmit('sections.organizer')}>
          <Select
            id={`${fieldId}-org`}
            value={form.organizer_id}
            onChange={(e) => set('organizer_id', e.target.value)}
          >
            <option value="">—</option>
            {organizers.map((organizer) => (
              <option key={organizer.id} value={organizer.id}>
                {organizer.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Field id={`${fieldId}-format`} label={tSubmit('fields.format')}>
          <Select id={`${fieldId}-format`} value={form.format} onChange={(e) => set('format', e.target.value)}>
            {HACKATHON_FORMATS.map((value) => (
              <option key={value} value={value}>
                {tFormat(value)}
              </option>
            ))}
          </Select>
        </Field>

        <Field id={`${fieldId}-city`} label={tSubmit('fields.city')}>
          <Input
            id={`${fieldId}-city`}
            value={form.format === 'online' ? '' : form.city}
            disabled={form.format === 'online'}
            onChange={(e) => set('city', e.target.value)}
          />
        </Field>

        <Field id={`${fieldId}-start`} label={tSubmit('fields.startDate')}>
          <Input
            id={`${fieldId}-start`}
            type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
          />
        </Field>

        <Field id={`${fieldId}-end`} label={tSubmit('fields.endDate')}>
          <Input
            id={`${fieldId}-end`}
            type="date"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field id={`${fieldId}-prize`} label={tSubmit('fields.prizePool')}>
          <Input id={`${fieldId}-prize`} value={form.prize_pool} onChange={(e) => set('prize_pool', e.target.value)} />
        </Field>
        <Field id={`${fieldId}-tracks`} label={tSubmit('fields.tracks')}>
          <Input id={`${fieldId}-tracks`} value={form.tracks} onChange={(e) => set('tracks', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field id={`${fieldId}-web`} label={tSubmit('fields.website')}>
          <Input id={`${fieldId}-web`} value={form.website} onChange={(e) => set('website', e.target.value)} />
        </Field>
        <Field id={`${fieldId}-tg`} label={tSubmit('fields.telegram')}>
          <Input id={`${fieldId}-tg`} value={form.telegram} onChange={(e) => set('telegram', e.target.value)} />
        </Field>
        <Field id={`${fieldId}-reg`} label={tSubmit('fields.registrationUrl')}>
          <Input
            id={`${fieldId}-reg`}
            value={form.registration_url}
            onChange={(e) => set('registration_url', e.target.value)}
          />
        </Field>
      </div>

      <Field id={`${fieldId}-cover`} label={tSubmit('sections.cover')}>
        <Input id={`${fieldId}-cover`} value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-3">
        {(['uz', 'ru', 'en'] as const).map((code) => (
          <Field key={code} id={`${fieldId}-desc-${code}`} label={`${tSubmit('fields.description')} (${code})`}>
            <Textarea
              id={`${fieldId}-desc-${code}`}
              rows={3}
              value={form[`description_${code}` as const]}
              onChange={(e) => set(`description_${code}` as const, e.target.value)}
            />
          </Field>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} loading={isPending} data-testid="admin-save-hackathon">
          {approveOnSave ? t('queue.approveAndEdit') : tCommon('save')}
        </Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}
