import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Playwright does not read `.env.local`, but the helpers need the Supabase
 * keys to arrange test state. Load it here rather than requiring every
 * contributor to export the variables by hand.
 */
export default async function globalSetup() {
  for (const file of ['.env.local', '.env']) {
    try {
      const contents = readFileSync(join(process.cwd(), file), 'utf8');
      for (const line of contents.split('\n')) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (!key || process.env[key]) continue;
        process.env[key] = rawValue?.replace(/^["']|["']$/g, '') ?? '';
      }
    } catch {
      // Missing file is fine as long as the variables are exported already.
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Run `pnpm db:start` and copy the keys into .env.local.',
    );
  }

  // Remove accounts and submissions left behind by an earlier run so the suite
  // is re-runnable without a database reset. Imported lazily: the helper reads
  // the env vars that were only just loaded above.
  const { cleanupTestUsers } = await import('./helpers/supabase');
  await cleanupTestUsers();
}
