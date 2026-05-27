import type { TLocale } from '@cio/db/types';

export const LANGUAGE: Record<TLocale, string> = {
  ru: 'Russian',
  da: 'Danish',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  pl: 'Polish',
  pt: 'Portuguese',
  vi: 'Vietnamese'
};

export const LANGUAGES = [{ id: 'ru', text: LANGUAGE.ru }];
