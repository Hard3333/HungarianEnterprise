import { hu } from "./translations/hu";

export type TranslationKey = keyof typeof hu;

export function t(key: TranslationKey): string {
  return hu[key];
}
