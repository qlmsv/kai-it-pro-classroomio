import type { TLocale } from '@cio/db/types';
import i18n from '@sveltekit-i18n/base';
import parser from '@sveltekit-i18n/parser-icu';
import { writable } from 'svelte/store';

export const config = {
  parser: parser(),
  loaders: [
    {
      locale: 'ru',
      key: '',
      loader: async () => (await import('../translations/ru.json')).default
    }
  ]
};

export const { t, loading, locales, locale, initialized, translations, loadTranslations } = new i18n(config);

export const selectedLocale = writable<string>('ru');
export const LOCALE_STORAGE_KEY = 'classroomio_locale';
export const LOCALE_COOKIE_KEY = 'classroomio_locale';

// Translations logs
loading.subscribe(async ($loading) => {
  if ($loading) {
    console.log('Loading translations...');

    await loading.toPromise();
  }
});

export function handleLocaleChange(newLocale: TLocale) {
  if (!newLocale) {
    return;
  }

  locale.set(newLocale);

  selectedLocale.set(newLocale);

  persistLocale(newLocale);
}

export function getPersistedLocale(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale) {
      return savedLocale;
    }
  } catch (error) {
    console.warn('Failed to read saved locale from localStorage', error);
  }

  const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_KEY}=([^;]*)`));
  return cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : null;
}

function persistLocale(newLocale: TLocale) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  } catch (error) {
    console.warn('Failed to save locale to localStorage', error);
  }

  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(newLocale)}; path=/; max-age=31536000; SameSite=Lax`;
}
