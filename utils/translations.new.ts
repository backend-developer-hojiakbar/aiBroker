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

// Define all the translations
const translations: Translations = {
  // Language selector
  'language-selector': {
    'uz-latn': 'Tilni tanlang',
    'uz-cyrl': 'Тилни танланг',
    'ru': 'Выберите язык',
    'en': 'Select Language'
  },
  
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
  
  // ... (other translations will be added here)
  
  // Common UI elements
  'save': {
    'uz-latn': 'Saqlash',
    'uz-cyrl': 'Сақлаш',
    'ru': 'Сохранить',
    'en': 'Save'
  },
  'cancel': {
    'uz-latn': 'Bekor qilish',
    'uz-cyrl': 'Бекор қилиш',
    'ru': 'Отмена',
    'en': 'Cancel'
  },
  'delete': {
    'uz-latn': 'O\'chirish',
    'uz-cyrl': 'Ўчириш',
    'ru': 'Удалить',
    'en': 'Delete'
  },
  
  // Language names
  'language-names': {
    'uz-latn': 'O\'zbek (Lotin)',
    'uz-cyrl': 'Ўзбек (Лотин)',
    'ru': 'Узбекский (Латиница)',
    'en': 'Uzbek (Latin)'
  },
  'uzbek-cyrillic': {
    'uz-latn': 'O\'zbek (Kirill)',
    'uz-cyrl': 'Ўзбек (Кирилл)',
    'ru': 'Узбекский (Кириллица)',
    'en': 'Uzbek (Cyrillic)'
  },
  'russian': {
    'uz-latn': 'Rus',
    'uz-cyrl': 'Рус',
    'ru': 'Русский',
    'en': 'Russian'
  },
  'english': {
    'uz-latn': 'Ingliz',
    'uz-cyrl': 'Инглиз',
    'ru': 'Английский',
    'en': 'English'
  }
};

// Function to set the current language
export function setLanguage(lang: 'uz-latn' | 'uz-cyrl' | 'ru' | 'en') {
  currentLanguage = lang;
  // Save to localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('ai-broker-language', lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }
  // Dispatch event to notify components of language change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }
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
  
  // Try to get the translation for the current language, fall back to English, then Uzbek Latin, then the key itself
  return translation[currentLanguage] || translation['en'] || translation['uz-latn'] || key;
}

// Initialize with default language from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
    if (savedLanguage) {
      currentLanguage = savedLanguage;
    }
  } catch (e) {
    console.error('Failed to load language preference:', e);
  }
}

// Default export
const translationService = {
  t,
  setLanguage,
  getCurrentLanguage
};

export default translationService;
