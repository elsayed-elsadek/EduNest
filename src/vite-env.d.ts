/// <reference types="vite/client" />

/**
 * Typed, public Vite environment variables.
 *
 * Only variables prefixed with `VITE_` reach the browser, and their values are
 * inlined into the bundle at build time. Never put secrets here.
 */
interface ImportMetaEnv {
  /**
   * Absolute base URL of the EduNest backend, e.g. `https://api.example.com`.
   *
   * Optional in the type because it may be absent in development, where
   * `src/config/env.ts` falls back to the local backend. Production builds are
   * rejected when it is missing.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
