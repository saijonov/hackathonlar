const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324';

interface MailpitSummary {
  ID: string;
  To: Array<{ Address: string }>;
  Subject: string;
  Created: string;
}

/**
 * Reads the 6-digit sign-up code out of the local mail catcher.
 *
 * This is what lets the auth flow be tested for real rather than mocked: the
 * app calls Supabase, Supabase sends a genuine email through Mailpit, and the
 * test reads the same code a user would read.
 */
export async function waitForOtp(email: string, timeoutMs = 20_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const target = email.toLowerCase();

  while (Date.now() < deadline) {
    const response = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=50`);
    if (response.ok) {
      const { messages = [] } = (await response.json()) as { messages?: MailpitSummary[] };

      const match = messages.find((message) =>
        message.To?.some((recipient) => recipient.Address?.toLowerCase() === target),
      );

      if (match) {
        // The subject itself carries the code ("tasdiqlash kodi: 123456"), but
        // read the body too so a template change cannot silently break this.
        const fromSubject = /(\d{6})/.exec(match.Subject)?.[1];
        if (fromSubject) return fromSubject;

        const detail = await fetch(`${MAILPIT_URL}/api/v1/message/${match.ID}`);
        if (detail.ok) {
          const body = (await detail.json()) as { Text?: string; HTML?: string };
          const code = /\b(\d{6})\b/.exec(`${body.Text ?? ''} ${body.HTML ?? ''}`)?.[1];
          if (code) return code;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(`No OTP email arrived for ${email} within ${timeoutMs}ms`);
}

export async function clearMailbox(): Promise<void> {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' }).catch(() => undefined);
}
