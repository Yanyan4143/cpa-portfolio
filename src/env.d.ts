/// <reference types="astro/client" />

declare namespace App {
  interface Locals {}
}

interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string;
  readonly GROQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
