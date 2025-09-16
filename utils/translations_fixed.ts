/**
 * Translation utility for AI-Broker Elite
 * Supports Uzbek (Latin), Uzbek (Cyrillic), Russian, and English languages
 */

// Define the structure for translations
interface Translations {
  [key: string]: {
    'uz-latn': string;
    'uz-cyrl': string;
    'ru': string;
    'en': string;
  };
}

// Current language state - initialize from localStorage if available
let currentLanguage: 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' = 'uz-latn';

// Check localStorage for saved language on initial load
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
}

// Define all the translations
const translations: Translations = {
  // Dashboard translations
  'dashboard-title': {
    'uz-latn': 'Boshqaruv Paneli',
    'uz-cyrl': 'Бошқарув Панели',
    'ru': 'Панель управления',
    'en': 'Dashboard'
  },
  'analytics-title': {
    'uz-latn': 'Statistika va Tahlil',
    'uz-cyrl': 'Статистика ва Таҳлил',
    'ru': 'Статистика и анализ',
    'en': 'Analytics and Analysis'
  },
  // ... (other translations)

  // Language selector
  'language-selector': {
    'uz-latn': 'Tilni tanlang',
    'uz-cyrl': 'Тилни танланг',
    'ru': 'Выберите язык',
    'en': 'Select Language'
  },
  'language-names': {
    'uz-latn': 'O\'zbek (Lotin)',
    'uz-cyrl': 'Ўзбек (Кирилл)',
    'ru': 'Русский',
    'en': 'English'
  }
};

// Function to set the current language
export function setLanguage(lang: 'uz-latn' | 'uz-cyrl' | 'ru' | 'en') {
  currentLanguage = lang;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('ai-broker-language', lang);
  }
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Function to get the current language
export function getCurrentLanguage(): 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' {
  return currentLanguage;
}

// Function to get translated text by key
export function t(key: string): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }
  return translation[currentLanguage] || translation['en'] || translation['uz-latn'] || key;
}

// Export default object with all translation functions
export default {
  t,
  setLanguage,
  getCurrentLanguage
};

// Initialize with default language from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
}
