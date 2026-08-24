'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, describedBy } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { GoogleButton } from './GoogleButton';

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  reason?: string;
  initialMode?: 'signin' | 'signup';
}

const RESEND_COOLDOWN_SECONDS = 45;

/**
 * The whole email/password + OTP machine in one dialog.
 *
 * Flow, per PRD 6 and Supabase's current recommended API (verified against the
 * installed @supabase/auth-js types):
 *   signup  -> auth.signUp()                       -> 6-digit code by email
 *   verify  -> auth.verifyOtp({type: 'signup'})    -> session
 *   forgot  -> auth.resetPasswordForEmail()        -> 6-digit code by email
 *   reset   -> auth.verifyOtp({type: 'recovery'})  -> auth.updateUser({password})
 *
 * The email templates in supabase/templates/ use `{{ .Token }}` rather than a
 * magic link precisely so the user never leaves the page — and therefore never
 * loses the review draft sitting behind this dialog.
 */
export function AuthModal({
  open,
  onClose,
  onAuthenticated,
  reason,
  initialMode = 'signin',
}: AuthModalProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const fieldId = useId();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setNotice(null);
      setCode('');
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  /** Maps Supabase's English error strings onto localized copy. */
  const describeError = useCallback(
    (authError: AuthError | Error | null): string => {
      const message = authError?.message?.toLowerCase() ?? '';
      if (message.includes('invalid login credentials')) return t('errors.invalidCredentials');
      if (message.includes('already registered') || message.includes('already been registered'))
        return t('errors.emailTaken');
      if (message.includes('password') && (message.includes('weak') || message.includes('should')))
        return t('errors.weakPassword');
      if (message.includes('unable to validate email') || message.includes('invalid email'))
        return t('errors.invalidEmail');
      if (message.includes('token has expired') || message.includes('invalid otp') || message.includes('otp'))
        return t('errors.otpInvalid');
      if (message.includes('rate limit') || message.includes('too many') || message.includes('for security purposes'))
        return t('errors.rateLimited');
      if (message.includes('email not confirmed')) return t('errors.emailNotConfirmed');
      return t('errors.generic');
    },
    [t],
  );

  const run = useCallback(
    async (task: () => Promise<void>) => {
      setPending(true);
      setError(null);
      try {
        await task();
      } catch (caught) {
        setError(describeError(caught instanceof Error ? caught : null));
      } finally {
        setPending(false);
      }
    },
    [describeError],
  );

  const handleSignIn = () =>
    run(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(describeError(signInError));
        return;
      }
      onAuthenticated();
    });

  const handleSignUp = () =>
    run(async () => {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      });

      if (signUpError) {
        setError(describeError(signUpError));
        return;
      }

      // Supabase returns a decoy user with zero identities when the address is
      // already registered, so the API cannot be used to enumerate accounts.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(t('errors.emailTaken'));
        return;
      }

      // Confirmations are on, so there is no session yet — collect the code.
      if (data.session) {
        onAuthenticated();
        return;
      }

      setNotice(null);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setMode('verify');
    });

  const handleVerify = () =>
    run(async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'signup',
      });
      if (verifyError) {
        setError(describeError(verifyError));
        return;
      }
      onAuthenticated();
    });

  const handleResend = () =>
    run(async () => {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
      if (resendError) {
        setError(describeError(resendError));
        return;
      }
      setNotice(t('otp.resent'));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    });

  const handleForgot = () =>
    run(async () => {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) {
        setError(describeError(resetError));
        return;
      }
      setNotice(t('reset.codeSent', { email }));
      setCode('');
      setPassword('');
      setMode('reset');
    });

  const handleReset = () =>
    run(async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'recovery',
      });
      if (verifyError) {
        setError(describeError(verifyError));
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(describeError(updateError));
        return;
      }
      onAuthenticated();
    });

  const titles: Record<Mode, string> = {
    signin: t('modalTitle'),
    signup: t('signUp'),
    verify: t('otp.title'),
    forgot: t('reset.title'),
    reset: t('reset.title'),
  };

  const showCredentialForm = mode === 'signin' || mode === 'signup';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titles[mode]}
      description={
        mode === 'signin' || mode === 'signup'
          ? (reason ?? t('modalSubtitle'))
          : mode === 'verify'
            ? t('otp.body', { email })
            : t('reset.body')
      }
      placement="auto"
      size="sm"
    >
      <form
        className="grid grid-cols-1 gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          if (mode === 'signin') void handleSignIn();
          else if (mode === 'signup') void handleSignUp();
          else if (mode === 'verify') void handleVerify();
          else if (mode === 'forgot') void handleForgot();
          else void handleReset();
        }}
      >
        {error && <Alert tone="danger">{error}</Alert>}
        {notice && !error && <Alert tone="success">{notice}</Alert>}

        {showCredentialForm && (
          <>
            <GoogleButton onError={(message) => setError(message)} />
            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-line" />
              <span className="text-meta text-ink-3">{t('divider')}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        {mode === 'signup' && (
          <Field id={`${fieldId}-name`} label={t('displayName')}>
            <Input
              id={`${fieldId}-name`}
              name="displayName"
              autoComplete="name"
              required
              minLength={2}
              maxLength={60}
              placeholder={t('displayNamePlaceholder')}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </Field>
        )}

        {mode !== 'verify' && mode !== 'reset' && (
          <Field id={`${fieldId}-email`} label={t('email')}>
            <Input
              ref={emailRef}
              id={`${fieldId}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <Field
            id={`${fieldId}-password`}
            label={t('password')}
            hint={mode === 'signup' ? t('passwordHint') : undefined}
          >
            <Input
              id={`${fieldId}-password`}
              name="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={describedBy(`${fieldId}-password`, mode === 'signup', false)}
            />
          </Field>
        )}

        {(mode === 'verify' || mode === 'reset') && (
          <Field id={`${fieldId}-code`} label={t('otp.label')}>
            <Input
              id={`${fieldId}-code`}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              className="text-center font-display text-h1 tracking-[0.4em]"
            />
          </Field>
        )}

        {mode === 'reset' && (
          <Field id={`${fieldId}-newpass`} label={t('reset.newPassword')} hint={t('passwordHint')}>
            <Input
              id={`${fieldId}-newpass`}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
        )}

        <Button type="submit" loading={pending} className="w-full">
          {mode === 'signin' && t('signIn')}
          {mode === 'signup' && t('signUp')}
          {mode === 'verify' && t('otp.verify')}
          {mode === 'forgot' && t('reset.send')}
          {mode === 'reset' && t('reset.confirm')}
        </Button>

        {mode === 'verify' && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-meta">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="inline-flex items-center gap-1 text-ink-3 underline underline-offset-4 hover:text-ink"
            >
              <ArrowLeft size={14} aria-hidden />
              {t('otp.wrongEmail')}
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || pending}
              onClick={() => void handleResend()}
              className="inline-flex items-center gap-1 text-accent underline underline-offset-4 disabled:text-ink-3 disabled:no-underline"
            >
              <Mail size={14} aria-hidden />
              {cooldown > 0 ? t('otp.resendIn', { seconds: cooldown }) : t('otp.resend')}
            </button>
          </div>
        )}

        {mode === 'signin' && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-meta">
            <span className="text-ink-3">
              {t('noAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-semibold text-accent underline underline-offset-4"
              >
                {t('signUp')}
              </button>
            </span>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError(null);
                setNotice(null);
              }}
              className="text-ink-3 underline underline-offset-4 hover:text-ink"
            >
              {t('forgotPassword')}
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <p className="text-meta text-ink-3">
            {t('haveAccount')}{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className="font-semibold text-accent underline underline-offset-4"
            >
              {t('signIn')}
            </button>
          </p>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setNotice(null);
            }}
            className="inline-flex items-center gap-1 justify-self-start text-meta text-ink-3 underline underline-offset-4 hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            {tCommon('back')}
          </button>
        )}
      </form>
    </Modal>
  );
}
