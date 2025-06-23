declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module 'timezone-mock' {
  type TimeZone =
    | 'UTC'
    | 'US/Pacific'
    | 'US/Mountain'
    | 'US/Central'
    | 'US/Eastern'
    | 'Europe/London'
    | 'Europe/Paris'
    | 'Europe/Helsinki'
    | 'Australia/Sydney'
    | 'Asia/Tokyo';

  function register(timezone: TimeZone): void;
  function unregister(): void;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  // Add custom env vars as needed, e.g.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
