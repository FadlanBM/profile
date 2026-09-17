// Locale constants shared by Server and Client Components.
// Kept out of lib/i18n.tsx (a "use client" module) so server code can import
// and call these helpers directly.
export type Language = "id" | "en";

export const LANGUAGES: Language[] = ["id", "en"];
export const DEFAULT_LANGUAGE: Language = "id";

export function isLanguage(value: unknown): value is Language {
  return value === "id" || value === "en";
}
