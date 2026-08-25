'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ImageUp, LogOut, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { UPLOAD_LIMITS, isAllowedImage, profileSchema, toFieldErrors, type FieldErrors } from '@/lib/validation/schemas';
import { updateProfile } from '@/lib/actions/profile';
import { uploadImage } from '@/lib/actions/uploads';
import { type Profile } from '@/lib/types';

interface ProfileFormProps {
  profile: Profile;
  email: string | null;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tActionError = useTranslations('actionError');
  const router = useRouter();
  const { signOut } = useAuth();
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleUpload = (file: File) => {
    setError(null);
    if (!isAllowedImage(file, UPLOAD_LIMITS.avatarMaxBytes)) {
      setError(tValidation('invalid'));
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImage('avatars', formData);
      if (result.ok) setAvatarUrl(result.data.url);
      else setError(tActionError(result.error));
    });
  };

  const save = () => {
    setError(null);
    setSaved(false);

    const payload = { displayName, avatarUrl: avatarUrl ?? '' };
    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const result = await updateProfile(payload);
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else if (result.error === 'validation' && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setError(tActionError(result.error));
      }
    });
  };

  return (
    <form
      className="panel notch-br grid grid-cols-1 gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPending) save();
      }}
    >
      {error && <Alert tone="danger">{error}</Alert>}
      {saved && !error && <Alert tone="success">{t('saved')}</Alert>}

      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={displayName} src={avatarUrl} size={64} />
        <div className="grid grid-cols-1 gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept={UPLOAD_LIMITS.mimeTypes.join(',')}
            className="sr-only"
            // The visible Button is the operable control and carries the
            // accessible name; this input is only ever triggered by it, so
            // leaving it in the a11y tree would announce an unlabelled field.
            aria-hidden
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleUpload(file);
              event.target.value = '';
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <ImageUp size={15} strokeWidth={1.75} aria-hidden />
              {t('avatar')}
            </Button>
            {avatarUrl && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setAvatarUrl(null)}>
                <X size={15} strokeWidth={1.75} aria-hidden />
              </Button>
            )}
          </div>
          <p className="text-meta text-ink-3">{t('avatarHint')}</p>
        </div>
      </div>

      <Field
        id={`${fieldId}-name`}
        label={t('displayName')}
        hint={t('displayNameHint')}
        error={fieldErrors.displayName ? tValidation(fieldErrors.displayName) : null}
      >
        <Input
          id={`${fieldId}-name`}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={60}
          invalid={Boolean(fieldErrors.displayName)}
          disabled={isPending}
          data-testid="profile-display-name"
        />
      </Field>

      {email && (
        <Field id={`${fieldId}-email`} label={t('email')}>
          <Input id={`${fieldId}-email`} value={email} readOnly disabled />
        </Field>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={isPending} data-testid="profile-save">
          <Check size={16} strokeWidth={2} aria-hidden />
          {tCommon('save')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void signOut()}>
          <LogOut size={16} strokeWidth={1.75} aria-hidden />
          {t('signOut')}
        </Button>
      </div>
    </form>
  );
}
