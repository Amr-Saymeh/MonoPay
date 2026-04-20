import { useLanguage } from '@/src/providers/LanguageProvider';

export function useI18n() {
  return useLanguage();
}
