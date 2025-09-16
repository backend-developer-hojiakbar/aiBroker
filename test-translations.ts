import { t, setLanguage, getCurrentLanguage } from './utils/translations';

// Test all languages
const languages: ('uz-latn' | 'uz-cyrl' | 'ru' | 'en')[] = ['uz-latn', 'uz-cyrl', 'ru', 'en'];
const testKeys = [
  'dashboard-title',
  'nav-dashboard',
  'new-analysis',
  'language-selector',
  'uzbek-latin',
  'uzbek-cyrillic',
  'russian',
  'english'
];

console.log('Translation Test Results:');
console.log('========================');

languages.forEach(lang => {
  console.log(`\nTesting ${lang}:`);
  setLanguage(lang);
  
  testKeys.forEach(key => {
    const translation = t(key);
    console.log(`  ${key}: ${translation}`);
  });
});

console.log('\nCurrent language:', getCurrentLanguage());