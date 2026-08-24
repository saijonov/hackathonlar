'use client';

import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { deleteOrganizer, saveOrganizer } from '@/lib/actions/admin';
import { slugify } from '@/lib/validation/schemas';

export interface OrganizerRecord {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  telegram: string | null;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
}

export function OrganizerEditor({
  organizer,
  onDone,
}: {
  organizer: OrganizerRecord | null;
  onDone: () => void;
}) {
  const t = useTranslations('admin.organizers');
  const tSubmit = useTranslations('submit');
  const tCommon = useTranslations('common');
  const tActionError = useTranslations('actionError');
  const router = useRouter();
  const fieldId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: organizer?.name ?? '',
    slug: organizer?.slug ?? '',
    logoUrl: organizer?.logo_url ?? '',
    website: organizer?.website ?? '',
    telegram: organizer?.telegram ?? '',
    descriptionUz: organizer?.description_uz ?? '',
    descriptionRu: organizer?.description_ru ?? '',
    descriptionEn: organizer?.description_en ?? '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveOrganizer({
        ...(organizer ? { id: organizer.id } : {}),
        ...form,
        slug: form.slug || slugify(form.name),
      });
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(tActionError(result.error));
      }
    });
  };

  const remove = () => {
    if (!organizer) return;
    if (!window.confirm(t('deleteConfirm'))) return;
    startTransition(async () => {
      const result = await deleteOrganizer(organizer.id);
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(tActionError(result.error));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-line bg-paper-2/50 p-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field id={`${fieldId}-name`} label={tSubmit('organizer.name')}>
          <Input
            id={`${fieldId}-name`}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            data-testid="organizer-name"
          />
        </Field>
        <Field id={`${fieldId}-slug`} label={t('slug')}>
          <Input
            id={`${fieldId}-slug`}
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder={slugify(form.name)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field id={`${fieldId}-logo`} label={t('logoUrl')}>
          <Input id={`${fieldId}-logo`} value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
        </Field>
        <Field id={`${fieldId}-web`} label={tSubmit('organizer.website')}>
          <Input id={`${fieldId}-web`} value={form.website} onChange={(e) => set('website', e.target.value)} />
        </Field>
        <Field id={`${fieldId}-tg`} label={tSubmit('organizer.telegram')}>
          <Input id={`${fieldId}-tg`} value={form.telegram} onChange={(e) => set('telegram', e.target.value)} />
        </Field>
      </div>

      {(['Uz', 'Ru', 'En'] as const).map((code) => (
        <Field
          key={code}
          id={`${fieldId}-desc-${code}`}
          label={`${tSubmit('fields.description')} (${code.toLowerCase()})`}
        >
          <Textarea
            id={`${fieldId}-desc-${code}`}
            rows={2}
            value={form[`description${code}` as const]}
            onChange={(e) => set(`description${code}` as const, e.target.value)}
          />
        </Field>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} loading={isPending} data-testid="organizer-save">
          {tCommon('save')}
        </Button>
        <Button variant="ghost" onClick={onDone} disabled={isPending}>
          {tCommon('cancel')}
        </Button>
        {organizer && (
          <Button variant="danger" onClick={remove} disabled={isPending} className="ml-auto">
            <Trash2 size={15} strokeWidth={1.75} aria-hidden />
            {t('delete')}
          </Button>
        )}
      </div>
    </div>
  );
}
