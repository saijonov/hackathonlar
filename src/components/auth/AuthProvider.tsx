'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type Profile } from '@/lib/types';
import { AuthModal } from './AuthModal';

export interface OpenAuthOptions {
  /** One line explaining *why* we are asking, e.g. "sign in to write a review". */
  reason?: string;
  /** Runs after a successful sign-in, before the router refresh. */
  onSuccess?: () => void;
  mode?: 'signin' | 'signup';
}

interface AuthContextValue {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  openAuth: (options?: OpenAuthOptions) => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}

interface AuthProviderProps {
  children: ReactNode;
  /** Server-resolved session, so the first paint already knows who you are. */
  initialUserId: string | null;
  initialEmail: string | null;
  initialProfile: Profile | null;
}

/**
 * Holds the session and owns the single auth modal instance for the whole app.
 *
 * The modal living here — rather than inside each feature — is what makes
 * PRD 6's "trigger pattern" work: tapping "Sharh yozish" while logged out opens
 * the dialog *on top of* the review form, so the half-typed draft underneath is
 * never unmounted and the user lands back exactly where they were.
 */
export function AuthProvider({
  children,
  initialUserId,
  initialEmail,
  initialProfile,
}: AuthProviderProps) {
  const router = useRouter();
  const [userId, setUserId] = useState(initialUserId);
  const [email, setEmail] = useState(initialEmail);
  const [profile, setProfile] = useState(initialProfile);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OpenAuthOptions>({});
  const successRef = useRef<(() => void) | undefined>(undefined);

  // Keep client state in sync when the server re-renders with a new session.
  useEffect(() => {
    setUserId(initialUserId);
    setEmail(initialEmail);
    setProfile(initialProfile);
  }, [initialUserId, initialEmail, initialProfile]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Server components own the profile; pull the fresh one.
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const openAuth = useCallback((next: OpenAuthOptions = {}) => {
    successRef.current = next.onSuccess;
    setOptions(next);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setOpen(false);
    successRef.current = undefined;
  }, []);

  const handleAuthenticated = useCallback(() => {
    setOpen(false);
    const callback = successRef.current;
    successRef.current = undefined;
    callback?.();
    router.refresh();
  }, [router]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
    setProfile(null);
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      email,
      profile,
      isAuthenticated: Boolean(userId),
      isAdmin: profile?.role === 'admin',
      openAuth,
      closeAuth,
      signOut,
    }),
    [userId, email, profile, openAuth, closeAuth, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onClose={closeAuth}
        onAuthenticated={handleAuthenticated}
        reason={options.reason}
        initialMode={options.mode ?? 'signin'}
      />
    </AuthContext.Provider>
  );
}
