import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite resolves the `@/*` paths from tsconfig.json natively; the
  // vite-tsconfig-paths plugin is no longer needed.
  resolve: { tsconfigPaths: true },
  test: {
    // Everything under test is a pure function or a JSON file; no DOM needed.
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    globals: false,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/supabase/database.types.ts', 'src/lib/queries/**', 'src/lib/actions/**'],
    },
  },
});
