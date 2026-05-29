/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
  };
}

declare module "*.css";
