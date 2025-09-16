/**
 * Translation utility for AI-Broker Elite
 * Supports Uzbek (Latin), Uzbek (Cyrillic), and Russian languages
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
const translations: Translations = {};

// Initialize translations
translations['dashboard-title'] = {
  'uz-latn': 'Boshqaruv Paneli',
  'uz-cyrl': 'Бошқарув Панели',
  'ru': 'Панель управления',
  'en': 'Dashboard'
};
translations['analytics-title'] = {
  'uz-latn': 'Statistika va Tahlil',
  'uz-cyrl': 'Статистика ва Таҳлил',
  'ru': 'Статистика и анализ',
  'en': 'Analytics and Analysis'
};
translations['contracts-title'] = {
  'uz-latn': 'Shartnomalar Tahlili',
  'uz-cyrl': 'Шартномалар Таҳлили',
  'ru': 'Анализ контрактов',
  'en': 'Contract Analysis'
};
translations['profile-title'] = {
  'uz-latn': 'Kompaniya Profili',
  'uz-cyrl': 'Компания Профили',
  'ru': 'Профиль компании',
  'en': 'Company Profile'
};
translations['input-title'] = {
  'uz-latn': 'Yangi Tahlil Yaratish',
  'uz-cyrl': 'Янги Таҳлил Яратиш',
  'ru': 'Создать новый анализ',
  'en': 'Create New Analysis'
};
translations['loading-sourcing-title'] = {
  'uz-latn': 'Ta\'minot Manbalari Qidirilmoqda',
  'uz-cyrl': 'Таъминот Манбалари Қидирилмоқда',
  'ru': 'Поиск источников поставок',
  'en': 'Searching for Supply Sources'
};
translations['sourcing-selection-title'] = {
  'uz-latn': 'Ta\'minotchilarni Tanlash',
  'uz-cyrl': 'Таъминотчиларни Танлаш',
  'ru': 'Выбор поставщиков',
  'en': 'Select Suppliers'
};
translations['loading-analysis-title'] = {
  'uz-latn': 'Tahlil Qilinmoqda',
  'uz-cyrl': 'Таҳлил Қилинмоқда',
  'ru': 'Анализ проводится',
  'en': 'Analysis in Progress'
};
translations['results-title'] = {
  'uz-latn': 'Tahlil Natijasi',
  'uz-cyrl': 'Таҳлил Натижаси',
  'ru': 'Результаты анализа',
  'en': 'Analysis Results'
};
translations['shared-report-title'] = {
  'uz-latn': 'Ulashilgan Hisobot',
  'uz-cyrl': 'Улашилган Ҳисобот',
  'ru': 'Общий отчет',
  'en': 'Shared Report'
};
translations['loading-contract-title'] = {
  'uz-latn': 'Shartnoma Tahlil Qilinmoqda',
  'uz-cyrl': 'Шартнома Таҳлил Қилинмоқда',
  'ru': 'Анализ контракта проводится',
  'en': 'Contract Analysis in Progress'
};

// Navigation items
translations['nav-dashboard'] = {
  'uz-latn': 'Boshqaruv',
  'uz-cyrl': 'Бошқарув',
  'ru': 'Управление',
  'en': 'Dashboard'
};
translations['nav-analytics'] = {
  'uz-latn': 'Statistika',
  'uz-cyrl': 'Статистика',
  'ru': 'Статистика',
  'en': 'Analytics'
};
translations['nav-contracts'] = {
  'uz-latn': 'Shartnomalar',
  'uz-cyrl': 'Шартномалар',
  'ru': 'Контракты',
  'en': 'Contracts'
};
translations['nav-profile'] = {
  'uz-latn': 'Profil',
  'uz-cyrl': 'Профил',
  'ru': 'Профиль',
  'en': 'Profile'
};

// Common actions
translations['new-analysis'] = {
  'uz-latn': 'Yangi Tahlil',
  'uz-cyrl': 'Янги Таҳлил',
  'ru': 'Новый анализ',
  'en': 'New Analysis'
};
translations['search-placeholder'] = {
  'uz-latn': 'Qidirish (lot, buyurtmachi, agent...)',
  'uz-cyrl': 'Қидириш (лот, буюртмачи, агент...)',
  'ru': 'Поиск (лот, заказчик, агент...)',
  'en': 'Search (lot, customer, agent...)'
};
translations['all-statuses'] = {
  'uz-latn': 'Barcha Statuslar',
  'uz-cyrl': 'Барча Статуслар',
  'ru': 'Все статусы',
  'en': 'All Statuses'
};
translations['watched-items'] = {
  'uz-latn': '⭐ Kuzatuvdagilar',
  'uz-cyrl': '⭐ Кузатувдагилар',
  'ru': '⭐ В избранном',
  'en': '⭐ Watched Items'
};
translations['show-archived'] = {
  'uz-latn': 'Arxivni Ko\'rsatish',
  'uz-cyrl': 'Архивни Кўрсатиш',
  'ru': 'Показать архив',
  'en': 'Show Archived'
};

// Dashboard specific translations
translations['welcome-title'] = {
  'uz-latn': 'AI-Broker Elite\'ga Xush Kelibsiz!',
  'uz-cyrl': 'АИ-Брокер Елитега Хуш Келибсиз!',
  'ru': 'Добро пожаловать в AI-Broker Elite!',
  'en': 'Welcome to AI-Broker Elite!'
};
translations['welcome-description'] = {
  'uz-latn': 'Dunyodagi eng kuchli tender tahlil tizimiga xush kelibsiz. AI-Broker Elite sizga raqobatchilardan ustun kelish, eng yuqori daromad olish va bozorni boshqarishda yordam beradi.',
  'uz-cyrl': 'Дунёдаги энг кучли тендер таҳлил тизимига хуш келибсиз. АИ-Брокер Елите сизга рақобатчилардан устун келиш, энг юқори даромад олиш ва бозорни бошқаришда ёрдам беради.',
  'ru': 'Добро пожаловать в самую мощную систему анализа тендеров в мире. AI-Broker Elite поможет вам превзойти конкурентов, получить максимальную прибыль и управлять рынком.',
  'en': 'Welcome to the world\'s most powerful tender analysis system. AI-Broker Elite will help you surpass competitors, achieve the highest profits, and manage your market.'
};
translations['step-1-title'] = {
  'uz-latn': 'Elite Profil Sozlash',
  'uz-cyrl': 'Елит Профил Созлаш',
  'ru': 'Настройка профиля Elite',
  'en': 'Elite Profile Setup'
};
translations['step-1-description'] = {
  'uz-latn': 'Kompaniya profilini mukammal sozlang: QQS stavkalari, ustama xarajatlar, sotuvchi agentlar va avtomatik tender qidiruv tizimini faollashtiring.',
  'uz-cyrl': 'Компания профилини муқаммал созланг: ҚҚС ставкалари, устама харажатлар, сотувчи агентлар ва автоматик тендер қидирув тизимини фаоллаштиринг.',
  'ru': 'Полностью настройте профиль компании: ставки НДС, дополнительные расходы, агентов по продаже и активируйте систему автоматического поиска тендеров.',
  'en': 'Fully configure your company profile: VAT rates, additional costs, sales agents, and activate the automatic tender search system.'
};
translations['step-1-button'] = {
  'uz-latn': 'Sozlash',
  'uz-cyrl': 'Созлаш',
  'ru': 'Настроить',
  'en': 'Setup'
};
translations['step-2-title'] = {
  'uz-latn': 'AI Elite Tahlil',
  'uz-cyrl': 'АИ Елит Таҳлил',
  'ru': 'Выберите язык',
  'en': 'Select Language'
};
translations['step-2-description'] = {
  'uz-latn': 'Tender faylini yuklang va AI-ning eng ilg\'or tahlil algoritmlari orqali raqobatchilarni mag\'lub etish strategiyasini oling.',
  'uz-cyrl': 'Тендер файлни юкланг ва АИ-нинг энг илғор таҳлил алгоритмлари орқали рақобатчиларни магълуб этиш стратегиясини олинг.',
  'ru': 'Загрузите файл тендера и получите стратегию победы над конкурентами с помощью самых передовых алгоритмов анализа ИИ.',
  'en': 'Upload the tender file and get a strategy to defeat competitors using AI\'s most advanced analysis algorithms.'
};
translations['step-2-button'] = {
  'uz-latn': 'Boshlash',
  'uz-cyrl': 'Бошлаш',
  'ru': 'Начать',
  'en': 'Start'
};
translations['step-3-title'] = {
  'uz-latn': 'Bozorni Boshqarish',
  'uz-cyrl': 'Бозорни Бошқариш',
  'ru': 'Управление рынком',
  'en': 'Market Management'
};
translations['step-3-description'] = {
  'uz-latn': 'AI tavsiyalari asosida tenderlarni yuting, raqobatchilarni mag\'lub eting va bozoringizni kengaytiring.',
  'uz-cyrl': 'АИ тавсиялари асосида тендерларни ютинг, рақобатчиларни магълуб этинг ва бозорингизни кенгайтиринг.',
  'ru': 'Выигрывайте тендеры, побеждайте конкурентов и расширяйте свой рынок на основе рекомендаций ИИ.',
  'en': 'Win tenders, defeat competitors, and expand your market based on AI recommendations.'
};
translations['step-3-button'] = {
  'uz-latn': 'G\'alaba',
  'uz-cyrl': 'Ғалаба',
  'ru': 'Победа',
  'en': 'Victory'
};
translations['start-ai-analysis'] = {
  'uz-latn': 'AI Elite Tahlilni Boshlash',
  'uz-cyrl': 'АИ Елит Таҳлилни Бошлаш',
  'ru': 'Начать AI Elite анализ',
  'en': 'Start AI Elite Analysis'
};
translations['accuracy'] = {
  'uz-latn': 'Aniqlik',
  'uz-cyrl': 'Аниқлик',
  'ru': 'Точность',
  'en': 'Accuracy'
};
translations['faster'] = {
  'uz-latn': 'Tezroq',
  'uz-cyrl': 'Тезроқ',
  'ru': 'Быстрее',
  'en': 'Faster'
};
translations['opportunity'] = {
  'uz-latn': 'Imkoniyat',
  'uz-cyrl': 'Имконият',
  'ru': 'Возможность',
  'en': 'Opportunity'
};
translations['strategic-insights'] = {
  'uz-latn': 'Strategik Tavsiyalar',
  'uz-cyrl': 'Стратегик Тавсиялар',
  'ru': 'Стратегические рекомендации',
  'en': 'Strategic Insights'
};
translations['ai-visionary-council'] = {
  'uz-latn': 'AI Vizionerlar Kengashi',
  'uz-cyrl': 'АИ Визионерлар Кенгаши',
  'ru': 'Совет AI Визионеров',
  'en': 'AI Visionary Council'
};
translations['trend-analyzer'] = {
  'uz-latn': 'Trend Analizatori A.I.',
  'uz-cyrl': 'Тренд Анализатори А.И.',
  'ru': 'Анализатор трендов A.I.',
  'en': 'Trend Analyzer A.I.'
};
translations['innovation-ai'] = {
  'uz-latn': 'Innovatsiya A.I.',
  'uz-cyrl': 'Инновация А.И.',
  'ru': 'Инновации A.I.',
  'en': 'Innovation A.I.'
};
translations['future-tech-ai'] = {
  'uz-latn': 'Bo\'lajak Texnologiyalar A.I.',
  'uz-cyrl': 'Бўлажак Технологиялар А.И.',
  'ru': 'Будущие технологии A.I.',
  'en': 'Future Technologies A.I.'
};
translations['no-tenders-title'] = {
  'uz-latn': 'Tahlillar Topilmadi',
  'uz-cyrl': 'Таҳлиллар Топилмади',
  'ru': 'Анализы не найдены',
  'en': 'Analyses Not Found'
};
translations['no-tenders-description'] = {
  'uz-latn': 'Filtrlarni o\'zgartirib ko\'ring yoki yangi tahlil yarating.',
  'uz-cyrl': 'Фильтрларни ўзгартириб кўринг ёки янги таҳлил яратинг.',
  'ru': 'Попробуйте изменить фильтры или создайте новый анализ.',
  'en': 'Try changing filters or create a new analysis.'
};
translations['selected-items'] = {
  'uz-latn': 'ta tanlandi',
  'uz-cyrl': 'та танланди',
  'ru': 'выбрано',
  'en': 'selected'
};
translations['archive-action'] = {
  'uz-latn': 'Arxivlash',
  'uz-cyrl': 'Архивлаш',
  'ru': 'Архивировать',
  'en': 'Archive'
};
translations['unarchive-action'] = {
  'uz-latn': 'Arxivdan chiqarish',
  'uz-cyrl': 'Архивдан чиқариш',
  'ru': 'Извлечь из архива',
  'en': 'Unarchive'
};
translations['delete-action'] = {
  'uz-latn': 'O\'chirish',
  'uz-cyrl': 'Ўчириш',
  'ru': 'Удалить',
  'en': 'Delete'
};
translations['sort-by-newest'] = {
  'uz-latn': 'Saralash: Eng yangi',
  'uz-cyrl': 'Саралаш: Энг янги',
  'ru': 'Сортировка: Новейшие',
  'en': 'Sort: Newest'
};
translations['sort-by-high-risk'] = {
  'uz-latn': 'Saralash: Yuqori risk',
  'uz-cyrl': 'Саралаш: Юқори риск',
  'ru': 'Сортировка: Высокий риск',
  'en': 'Sort: High Risk'
};
translations['sort-by-high-opportunity'] = {
  'uz-latn': 'Saralash: Yuqori imkoniyat',
  'uz-cyrl': 'Саралаш: Юқори имконият',
  'ru': 'Сортировка: Высокая возможность',
  'en': 'Sort: High Opportunity'
};

// Analytics specific translations
translations['platform-filter'] = {
  'uz-latn': 'Platforma bo\'yicha filtrlash',
  'uz-cyrl': 'Платформа бўйича фильтрлаш',
  'ru': 'Фильтрация по платформе',
  'en': 'Filter by Platform'
};
translations['all-platforms'] = {
  'uz-latn': 'Barcha platformalar',
  'uz-cyrl': 'Барча платформалар',
  'ru': 'Все платформы',
  'en': 'All Platforms'
};
translations['filter-applied'] = {
  'uz-latn': 'Filtr qo\'llanilmoqda:',
  'uz-cyrl': 'Фильтр қўлланилмоқда:',
  'ru': 'Применяется фильтр:',
  'en': 'Filter applied:'
};
translations['remove-filter'] = {
  'uz-latn': 'Filterni olib tashlash',
  'uz-cyrl': 'Фильтрни олиб ташлаш',
  'ru': 'Удалить фильтр',
  'en': 'Remove Filter'
};
translations['elite-performance'] = {
  'uz-latn': 'Elite Samaradorlik Ko\'rsatkichlari',
  'uz-cyrl': 'Елит Самарадорлик Кўрсаткичлари',
  'ru': 'Показатели эффективности Elite',
  'en': 'Elite Performance Metrics'
};
translations['total-analyses'] = {
  'uz-latn': 'Jami Tahlillar',
  'uz-cyrl': 'Жами Таҳлиллар',
  'ru': 'Всего анализов',
  'en': 'Total Analyses'
};
translations['wins'] = {
  'uz-latn': 'G\'alabalar',
  'uz-cyrl': 'Ғалабалар',
  'ru': 'Победы',
  'en': 'Wins'
};
translations['losses'] = {
  'uz-latn': 'Mag\'lubiyatlar',
  'uz-cyrl': 'Мағлубиятлар',
  'ru': 'Поражения',
  'en': 'Losses'
};
translations['win-rate'] = {
  'uz-latn': 'G\'alaba Foizi',
  'uz-cyrl': 'Ғалаба Фоизи',
  'ru': 'Процент побед',
  'en': 'Win Rate'
};
translations['avg-risk'] = {
  'uz-latn': 'O\'rtacha Risk',
  'uz-cyrl': 'Ўртacha Риск',
  'ru': 'Средний риск',
  'en': 'Average Risk'
};
translations['opportunity-score'] = {
  'uz-latn': 'Imkoniyat Darajasi',
  'uz-cyrl': 'Имконият Даражаси',
  'ru': 'Уровень возможностей',
  'en': 'Opportunity Score'
};
translations['high-value-tenders'] = {
  'uz-latn': 'Yuqori Qiymatli Tenderlar',
  'uz-cyrl': 'Юқори Қийматли Тендерлар',
  'ru': 'Высокоценные тендеры',
  'en': 'High-Value Tenders'
};
translations['target-customers'] = {
  'uz-latn': 'Maqsadli Mijozlar',
  'uz-cyrl': 'Мақсадли Мижозлар',
  'ru': 'Целевые клиенты',
  'en': 'Target Customers'
};
translations['competition-level'] = {
  'uz-latn': 'Raqobat Darajasi',
  'uz-cyrl': 'Рақобат Даражаси',
  'ru': 'Уровень конкуренции',
  'en': 'Competition Level'
};
translations['financial-indicators'] = {
  'uz-latn': 'Moliyaviy Ko\'rsatkichlar (Yutgan lotlar bo\'yicha)',
  'uz-cyrl': 'Молиявий Кўрсаткичлар (Ютган лотлар бўйича)',
  'ru': 'Финансовые показатели (по выигранным лотам)',
  'en': 'Financial Indicators (Based on Won Lots)'
};
translations['total-profit'] = {
  'uz-latn': 'Jami Sof Foyda',
  'uz-cyrl': 'Жами Соф Фойда',
  'ru': 'Общая чистая прибыль',
  'en': 'Total Net Profit'
};
translations['total-loss'] = {
  'uz-latn': 'Jami Sof Zarar',
  'uz-cyrl': 'Жами Соф Зарар',
  'ru': 'Общий чистый убыток',
  'en': 'Total Net Loss'
};
translations['avg-profit-margin'] = {
  'uz-latn': 'O\'rtacha Foyda Marjasi',
  'uz-cyrl': 'Ўртacha Фойда Маржаси',
  'ru': 'Средняя маржа прибыли',
  'en': 'Average Profit Margin'
};
translations['results-ratio'] = {
  'uz-latn': 'Natijalar Nisbati',
  'uz-cyrl': 'Натижалар Нисбати',
  'ru': 'Соотношение результатов',
  'en': 'Results Ratio'
};
translations['strategic-risk'] = {
  'uz-latn': 'Strategik Risk Tahlili',
  'uz-cyrl': 'Стратегик Риск Таҳлили',
  'ru': 'Анализ стратегических рисков',
  'en': 'Strategic Risk Analysis'
};
translations['opportunities-matrix'] = {
  'uz-latn': 'Imkoniyatlar Matritsasi',
  'uz-cyrl': 'Имкониятлар Матрицаси',
  'ru': 'Матрица возможностей',
  'en': 'Opportunities Matrix'
};
translations['risk-index'] = {
  'uz-latn': 'Risk Indeksi',
  'uz-cyrl': 'Риск Индекси',
  'ru': 'Индекс риска',
  'en': 'Risk Index'
};
translations['opportunity-index'] = {
  'uz-latn': 'Imkoniyat Indeksi',
  'uz-cyrl': 'Имконият Индекси',
  'ru': 'Индекс возможностей',
  'en': 'Opportunity Index'
};
translations['agent-performance'] = {
  'uz-latn': 'Agentlar Samaradorligi',
  'uz-cyrl': 'Агентлар Самарадорлиги',
  'ru': 'Эффективность агентов',
  'en': 'Agent Performance'
};
translations['assigned'] = {
  'uz-latn': 'Biriktirilgan',
  'uz-cyrl': 'Бириктирилган',
  'ru': 'Назначено',
  'en': 'Assigned'
};
translations['won'] = {
  'uz-latn': 'Yutgan',
  'uz-cyrl': 'Ютган',
  'ru': 'Выиграно',
  'en': 'Won'
};
translations['no-data'] = {
  'uz-latn': 'Ma\'lumot yo\'q',
  'uz-cyrl': 'Маълумот йўқ',
  'ru': 'Нет данных',
  'en': 'No Data'
};
translations['customer-analysis'] = {
  'uz-latn': 'Mijozlar Bo\'yicha Tahlil (Top 10)',
  'uz-cyrl': 'Мижозлар Бўйича Таҳлил (Топ 10)',
  'ru': 'Анализ клиентов (Топ 10)',
  'en': 'Customer Analysis (Top 10)'
};
translations['risk-vs-opportunity'] = {
  'uz-latn': 'Risk vs Imkoniyat Xaritasi',
  'uz-cyrl': 'Риск vs Имконият Харитаси',
  'ru': 'Карта риска и возможностей',
  'en': 'Risk vs Opportunity Map'
};
translations['risk-axis'] = {
  'uz-latn': 'Risk →',
  'uz-cyrl': 'Риск →',
  'ru': 'Риск →',
  'en': 'Risk →'
};
translations['opportunity-axis'] = {
  'uz-latn': 'Imkoniyat →',
  'uz-cyrl': 'Имконият →',
  'ru': 'Возможность →',
  'en': 'Opportunity →'
};

// Contracts specific translations
translations['elite-legal-intelligence'] = {
  'uz-latn': 'Elite Legal Intelligence',
  'uz-cyrl': 'Елит Легал Интеллидженс',
  'ru': 'Элитный правовой интеллект',
  'en': 'Elite Legal Intelligence'
};

translations['overview'] = {
  'uz-latn': 'Umumiy Ko\'rinish',
  'uz-cyrl': 'Умумий Кўриниш',
  'ru': 'Обзор',
  'en': 'Overview'
};

translations['obligations'] = {
  'uz-latn': 'Majburiyatlar',
  'uz-cyrl': 'Мажбуриятлар',
  'ru': 'Обязательства',
  'en': 'Obligations'
};

translations['obligation'] = {
  'uz-latn': 'Majburiyat',
  'uz-cyrl': 'Мажбурият',
  'ru': 'Обязательство',
  'en': 'Obligation'
};

translations['timeline'] = {
  'uz-latn': 'Vaqt Jadvali',
  'uz-cyrl': 'Вақт Жадвали',
  'ru': 'График',
  'en': 'Timeline'
};

translations['no-contracts-found'] = {
  'uz-latn': 'Shartnomalar topilmadi',
  'uz-cyrl': 'Шартномалар топилмади',
  'ru': 'Контракты не найдены',
  'en': 'No contracts found'
};

translations['upload-contracts-to-analyze'] = {
  'uz-latn': 'Tahlil qilish uchun shartnomalarni yuklang',
  'uz-cyrl': 'Таҳлил қилиш учун шартномаларни юкланг',
  'ru': 'Загрузите контракты для анализа',
  'en': 'Upload contracts to analyze'
};

translations['total-contracts'] = {
  'uz-latn': 'Jami shartnomalar',
  'uz-cyrl': 'Жами шартномалар',
  'ru': 'Всего контрактов',
  'en': 'Total Contracts'
};

translations['analyzed'] = {
  'uz-latn': 'Tahlil qilingan',
  'uz-cyrl': 'Таҳлил қилинган',
  'ru': 'Проанализировано',
  'en': 'Analyzed'
};

translations['pending'] = {
  'uz-latn': 'Kutilmoqda',
  'uz-cyrl': 'Кутилмоқда',
  'ru': 'В ожидании',
  'en': 'Pending'
};

translations['no-force-majeure-clauses'] = {
  'uz-latn': 'Force majeure shartlari topilmadi',
  'uz-cyrl': 'Форс мажор шартлари топилмади',
  'ru': 'Условия форс-мажора не найдены',
  'en': 'No force majeure clauses found'
};

translations['contract-upload-description'] = {
  'uz-latn': 'AI-powered yuridik tahlil tizimi bilan shartnomalaringizdagi risklarni aniqlang va majburiyatlarni batafsil o\'rganing. Har bir tahlil sizning yuridik xavfsizligingizni oshiradi.',
  'uz-cyrl': 'АИ-паверед юридик таҳлил тизими билан шартномаларингиздаги рискларни аниқланг ва мажбуриятларни батафсил ўрганинг. Ҳар бир таҳлил сизнинг юридик хавфсизлигингизни оширади.',
  'ru': 'Определите риски в ваших контрактах и подробно изучите обязательства с помощью системы юридического анализа на базе ИИ. Каждый анализ повышает вашу юридическую безопасность.',
  'en': 'Identify risks and thoroughly study obligations in your contracts with the AI-powered legal analysis system. Each analysis enhances your legal security.'
};

// Statistics Section
translations['statistics-title'] = {
  'uz-latn': 'Statistika',
  'uz-cyrl': 'Статистика',
  'ru': 'Статистика',
  'en': 'Statistics'
};

// Dashboard Statistics Cards
translations['dashboard-total-contracts'] = {
  'uz-latn': 'Umumiy shartnomalar',
  'uz-cyrl': 'Умумий шартномалар',
  'ru': 'Всего контрактов',
  'en': 'Total Contracts'
};

translations['dashboard-active-contracts'] = {
  'uz-latn': 'Faol shartnomalar',
  'uz-cyrl': 'Фаол шартномалар',
  'ru': 'Активные контракты',
  'en': 'Active Contracts'
};

translations['dashboard-completed-contracts'] = {
  'uz-latn': 'Yakunlangan shartnomalar',
  'uz-cyrl': 'Якунланган шартномалар',
  'ru': 'Завершенные контракты',
  'en': 'Completed Contracts'
};

translations['dashboard-cancelled-contracts'] = {
  'uz-latn': 'Bekor qilingan shartnomalar',
  'uz-cyrl': 'Бекор қилинган шартномалар',
  'ru': 'Отмененные контракты',
  'en': 'Cancelled Contracts'
};

// Contract Statuses
translations['status-draft'] = {
  'uz-latn': 'Qoralama',
  'uz-cyrl': 'Қоралама',
  'ru': 'Черновик',
  'en': 'Draft'
};

translations['status-active'] = {
  'uz-latn': 'Faol',
  'uz-cyrl': 'Фаол',
  'ru': 'Активный',
  'en': 'Active'
};

translations['status-pending'] = {
  'uz-latn': 'Kutilmoqda',
  'uz-cyrl': 'Кутилмоқда',
  'ru': 'В ожидании',
  'en': 'Pending'
};

translations['status-completed'] = {
  'uz-latn': 'Yakunlangan',
  'uz-cyrl': 'Якунланган',
  'ru': 'Завершенный',
  'en': 'Completed'
};

translations['status-terminated'] = {
  'uz-latn': 'Bekor qilingan',
  'uz-cyrl': 'Бекор қилинган',
  'ru': 'Расторгнут',
  'en': 'Terminated'
};

// Contract Actions
translations['view-contract'] = {
  'uz-latn': 'Shartnomani ko\'rish',
  'uz-cyrl': 'Шартномани кўриш',
  'ru': 'Просмотреть контракт',
  'en': 'View Contract'
};

translations['download-pdf'] = {
  'uz-latn': 'PDF yuklab olish',
  'uz-cyrl': 'PDF юклаб олиш',
  'ru': 'Скачать PDF',
  'en': 'Download PDF'
};

translations['share-contract'] = {
  'uz-latn': 'Ulashish',
  'uz-cyrl': 'Улашиш',
  'ru': 'Поделиться',
  'en': 'Share'
};

// Contract Details
translations['contract-number'] = {
  'uz-latn': 'Shartnoma raqami',
  'uz-cyrl': 'Шартнома рақами',
  'ru': 'Номер контракта',
  'en': 'Contract Number'
};

translations['contract-date'] = {
  'uz-latn': 'Shartnoma sanasi',
  'uz-cyrl': 'Шартнома санаси',
  'ru': 'Дата контракта',
  'en': 'Contract Date'
};

translations['contract-value'] = {
  'uz-latn': 'Shartnoma qiymati',
  'uz-cyrl': 'Шартнома қиймати',
  'ru': 'Стоимость контракта',
  'en': 'Contract Value'
};

translations['counterparty'] = {
  'uz-latn': 'Qarama-qarshi tomon',
  'uz-cyrl': 'Қарама-қарши томон',
  'ru': 'Контрагент',
  'en': 'Counterparty'
};

// Contract Filters
translations['filter-by-status'] = {
  'uz-latn': 'Holati bo\'yicha filtrlash',
  'uz-cyrl': 'Ҳолати бўйича филтрлаш',
  'ru': 'Фильтр по статусу',
  'en': 'Filter by Status'
};

translations['filter-by-date'] = {
  'uz-latn': 'Sana bo\'yicha filtrlash',
  'uz-cyrl': 'Сана бўйича филтрлаш',
  'ru': 'Фильтр по дате',
  'en': 'Filter by Date'
};

translations['filter-all'] = {
  'uz-latn': 'Barchasi',
  'uz-cyrl': 'Барчаси',
  'ru': 'Все',
  'en': 'All'
};

// Contract Alerts
translations['upcoming-payment'] = {
  'uz-latn': 'Yaqinlashayotgan to\'lov',
  'uz-cyrl': 'Яқинлашаётган тўлов',
  'ru': 'Предстоящий платеж',
  'en': 'Upcoming Payment'
};

translations['contract-expiring'] = {
  'uz-latn': 'Shartnoma muddati tugayapti',
  'uz-cyrl': 'Шартнома муддати тугаяпти',
  'ru': 'Срок действия контракта истекает',
  'en': 'Contract Expiring'
};

// Contract Analysis
translations['risk-level'] = {
  'uz-latn': 'Xavf darajasi',
  'uz-cyrl': 'Хавф даражаси',
  'ru': 'Уровень риска',
  'en': 'Risk Level'
};

translations['key-clauses'] = {
  'uz-latn': 'Asosiy bandlar',
  'uz-cyrl': 'Асосий бандар',
  'ru': 'Ключевые положения',
  'en': 'Key Clauses'
};

translations['recommendations'] = {
  'uz-latn': 'Tavsiyalar',
  'uz-cyrl': 'Тавсиялар',
  'ru': 'Рекомендации',
  'en': 'Recommendations'
};

translations['completed-contracts'] = {
  'uz-latn': 'Yakunlangan shartnomalar',
  'uz-cyrl': 'Якунланган шартномалар',
  'ru': 'Завершенные контракты',
  'en': 'Completed Contracts'
};

translations['total-amount'] = {
  'uz-latn': 'Umumiy summa',
  'uz-cyrl': 'Умумий сумма',
  'ru': 'Общая сумма',
  'en': 'Total Amount'
};

// File Upload Section
translations['file-upload'] = {
  'uz-latn': 'Fayl yuklash',
  'uz-cyrl': 'Файл юклаш',
  'ru': 'Загрузка файла',
  'en': 'File Upload'
};

translations['upload-description'] = {
  'uz-latn': 'Shartnoma yoki hujjatlarni yuklash uchun shu yerni bosing yoki sudrab keling',
  'uz-cyrl': 'Шартнома ёки ҳужжатларни юклаш учун шу ерни босинг ёки судраб келинг',
  'ru': 'Нажмите или перетащите файлы для загрузки контракта или документов',
  'en': 'Click or drag files to upload contract or documents'
};

translations['supported-formats'] = {
  'uz-latn': 'Qo\'llab-quvvatlanadigan formatlar: PDF, DOCX, XLSX (maksimal 10MB)',
  'uz-cyrl': 'Қўллаб-қувватланадиган форматлар: PDF, DOCX, XLSX (макс. 10MB)',
  'ru': 'Поддерживаемые форматы: PDF, DOCX, XLSX (макс. 10МБ)',
  'en': 'Supported formats: PDF, DOCX, XLSX (max 10MB)'
};

// Contracts Section
translations['elite-legal-intelligence'] = {
  'uz-latn': 'Elite Legal Intelligence',
  'uz-cyrl': 'Элит Легал Интеллидженс',
  'ru': 'Элитный правовой интеллект',
  'en': 'Elite Legal Intelligence'
};

translations['contract-upload-description'] = {
  'uz-latn': 'AI-powered yuridik tahlil tizimi bilan shartnomalaringizdagi risklarni aniqlang va majburiyatlarni batafsil o\'rganing. Har bir tahlil sizning yuridik xavfsizligingizni oshiradi.',
  'uz-cyrl': 'АИ-паверед юридик таҳлил тизими билан шартномаларингиздаги рискларни аниқланг ва мажбуриятларни батафсил ўрганинг. Ҳар бир таҳлил сизнинг юридик хавфсизлигингизни оширади.',
  'ru': 'Определите риски в ваших контрактах и подробно изучите обязательства с помощью системы юридического анализа на базе ИИ. Каждый анализ повышает вашу юридическую безопасность.',
  'en': 'Identify risks and thoroughly study obligations in your contracts with the AI-powered legal analysis system. Each analysis enhances your legal security.'
};

translations['total-value'] = {
  'uz-latn': 'Umumiy Qiymat',
  'uz-cyrl': 'Умумий Қиймат',
  'ru': 'Общая стоимость',
  'en': 'Total Value'
};

translations['contracts-in-analysis'] = {
  'uz-latn': 'Tahlil qilinmoqda',
  'uz-cyrl': 'Таҳлил қилинмоқда',
  'ru': 'В анализе',
  'en': 'In Analysis'
};

translations['analyzed-contracts-header'] = {
  'uz-latn': 'Tahlil Qilingan Shartnomalar',
  'uz-cyrl': 'Таҳлил Қилинган Шартномалар',
  'ru': 'Проанализированные контракты',
  'en': 'Analyzed Contracts'
};

// Buni translations.ts faylingizga qo'shing

translations['contract-history-title'] = {
  'uz-latn': 'Shartnomalar Ro\'yxati',
  'uz-cyrl': 'Шартномалар Рўйхати',
  'ru': 'Список контрактов',
  'en': 'Contract List'
};

translations['analyzed-contracts'] = {
  'uz-latn': 'Tahlil Qilingan Shartnomalar',
  'uz-cyrl': 'Таҳлил Қилинган Шартномалар',
  'ru': 'Проанализированные контракты',
  'en': 'Analyzed Contracts'
};

translations['no-contracts-found'] = {
  'uz-latn': 'Hech qanday shartnoma topilmadi',
  'uz-cyrl': 'Ҳеч қандай шартнома топилмади',
  'ru': 'Контракты не найдены',
  'en': 'No contracts found'
};

translations['upload-contracts-to-analyze'] = {
  'uz-latn': 'Shartnoma fayllarini yuklang va ularni tahlil qiling',
  'uz-cyrl': 'Шартнома файлларини юкланг ва уларни таҳлил қилинг',
  'ru': 'Загрузите файлы контрактов для анализа',
  'en': 'Upload contract files to analyze'
};

translations['contracts-title'] = {
  'uz-latn': 'Shartnomalar',
  'uz-cyrl': 'Шартномалар',
  'ru': 'Контракты',
  'en': 'Contracts'
};

translations['contract-number'] = {
  'uz-latn': 'Shartnoma raqami',
  'uz-cyrl': 'Шартнома рақами',
  'ru': 'Номер контракта',
  'en': 'Contract Number'
};

translations['contract-date'] = {
  'uz-latn': 'Sanasi',
  'uz-cyrl': 'Саноси',
  'ru': 'Дата',
  'en': 'Date'
};

translations['contract-status'] = {
  'uz-latn': 'Holati',
  'uz-cyrl': 'Ҳолати',
  'ru': 'Статус',
  'en': 'Status'
};

translations['contract-amount'] = {
  'uz-latn': 'Summasi',
  'uz-cyrl': 'Суммаси',
  'ru': 'Сумма',
  'en': 'Amount'
};

translations['contract-client'] = {
  'uz-latn': 'Mijoz',
  'uz-cyrl': 'Мижоз',
  'ru': 'Клиент',
  'en': 'Client'
};

translations['contract-description'] = {
  'uz-latn': 'Tavsif',
  'uz-cyrl': 'Тавсиф',
  'ru': 'Описание',
  'en': 'Description'
};

translations['view-contract'] = {
  'uz-latn': 'Ko\'rish',
  'uz-cyrl': 'Кўриш',
  'ru': 'Просмотр',
  'en': 'View'
};

translations['download-contract'] = {
  'uz-latn': 'Yuklab olish',
  'uz-cyrl': 'Юклаб олиш',
  'ru': 'Скачать',
  'en': 'Download'
};

// Contract Statuses
translations['status-draft'] = {
  'uz-latn': 'Qoralama',
  'uz-cyrl': 'Қоралама',
  'ru': 'Черновик',
  'en': 'Draft'
};

translations['status-active'] = {
  'uz-latn': 'Faol',
  'uz-cyrl': 'Фаол',
  'ru': 'Активный',
  'en': 'Active'
};

translations['status-completed'] = {
  'uz-latn': 'Yakunlangan',
  'uz-cyrl': 'Якунланган',
  'ru': 'Завершенный',
  'en': 'Completed'
};

translations['status-terminated'] = {
  'uz-latn': 'Bekor qilingan',
  'uz-cyrl': 'Бекор қилинган',
  'ru': 'Расторгнутый',
  'en': 'Terminated'
};

// Contract Actions
translations['action-edit'] = {
  'uz-latn': 'Tahrirlash',
  'uz-cyrl': 'Таҳрирлаш',
  'ru': 'Редактировать',
  'en': 'Edit'
};

translations['action-delete'] = {
  'uz-latn': 'O\'chirish',
  'uz-cyrl': 'Ўчириш',
  'ru': 'Удалить',
  'en': 'Delete'
};

translations['action-export'] = {
  'uz-latn': 'Eksport qilish',
  'uz-cyrl': 'Экспорт қилиш',
  'ru': 'Экспортировать',
  'en': 'Export'
};

translations['ai-analysis-tagline'] = {
  'uz-latn': 'Eng ilg\'or AI texnologiyasi bilan tenderlaringizni tahlil qiling va raqobatchilardan ustun turing',
  'uz-cyrl': 'Энг илғор АИ технологияси билан тендерларингизни таҳлил қилинг ва рақобатчилардан устун келинг',
  'ru': 'Анализируйте свои тендеры с помощью передовых технологий ИИ и опережайте конкурентов',
  'en': 'Analyze your tenders with cutting-edge AI technology and outperform competitors'
};
translations['file-upload-instruction'] = {
  'uz-latn': 'Fayllarni tanlang yoki bu yerga torting',
  'uz-cyrl': 'Файлларни танланг ёки бу ерга тортиң',
  'ru': 'Выберите файлы или перетащите их сюда',
  'en': 'Select files or drag them here'
};
translations['file-upload-subtitle'] = {
  'uz-latn': 'Hujjatlar, texnik xususiyatlar, shartnomalar',
  'uz-cyrl': 'Ҳужжатлар, техник хусусиятлар, шартномалар',
  'ru': 'Документы, технические характеристики, контракты',
  'en': 'Documents, technical specifications, contracts'
};
translations['file-upload-button'] = {
  'uz-latn': 'Fayl Tanlash',
  'uz-cyrl': 'Файл Танлаш',
  'ru': 'Выбрать файл',
  'en': 'Select File'
};
translations['file-upload-limit'] = {
  'uz-latn': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (har biri max 10MB)',
  'uz-cyrl': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (ҳар бири макс 10МБ)',
  'ru': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (каждый макс. 10 МБ)',
  'en': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (each max 10MB)'
};
translations['selected-files'] = {
  'uz-latn': 'Tanlangan fayllar:',
  'uz-cyrl': 'Танланган файллар:',
  'ru': 'Выбранные файлы:',
  'en': 'Selected files:'
};
translations['financial-settings'] = {
  'uz-latn': 'Moliyaviy Sozlamalar',
  'uz-cyrl': 'Молиявий Созламалар',
  'ru': 'Финансовые настройки',
  'en': 'Financial Settings'
};
translations['vat-calculation'] = {
  'uz-latn': 'QQS bilan hisoblash',
  'uz-cyrl': 'ҚҚС билан ҳисоблаш',
  'ru': 'Расчет с НДС',
  'en': 'VAT calculation'
};
translations['vat-calculation-tooltip'] = {
  'uz-latn': 'Agar yoqilgan bo\'lsa, narx hisob-kitoblariga Profil sozlamalarida ko\'rsatilgan QQS foizi qo\'shiladi. Agar o\'chirilgan bo\'lsa, QQS 0% deb hisoblanadi.',
  'uz-cyrl': 'Агар ёқилган бўлса, нарх ҳисоб-китобларига Профил созламаларида кўрсатилган ҚҚС фоизи қўшилади. Агар ўчирилган бўлса, ҚҚС 0% деб ҳисобланади.',
  'ru': 'Если включено, к расчетам цены будет добавлен процент НДС, указанный в настройках профиля. Если выключено, НДС считается 0%.',
  'en': 'If enabled, the VAT percentage specified in the Profile settings will be added to price calculations. If disabled, VAT is calculated as 0%.'
};
translations['additional-costs'] = {
  'uz-latn': 'Qo\'shimcha xarajatlar (bir martalik)',
  'uz-cyrl': 'Қўшимча харажатлар (бир марталик)',
  'ru': 'Дополнительные расходы (одноразовые)',
  'en': 'Additional costs (one-time)'
};
translations['additional-costs-tooltip'] = {
  'uz-latn': 'Logistika, bojxona, sertifikatlash kabi tenderga xos bo\'lgan qo\'shimcha xarajatlarni qo\'shing. Bu xarajatlar to\'g\'ridan-to\'g\'ri tannarxga qo\'shiladi.',
  'uz-cyrl': 'Логистика, божхона, сертификатлаш каби тендерга хос бўлган қўшимча харажатларни қўшинг. Бу харажатлар тўғридан-тўғри таннархга қўшилади.',
  'ru': 'Добавьте дополнительные расходы, характерные для тендера, такие как логистика, таможня, сертификация. Эти расходы добавляются прямо к себестоимости.',
  'en': 'Add additional expenses specific to the tender, such as logistics, customs, certification. These costs are added directly to the cost price.'
};
translations['add-cost'] = {
  'uz-latn': 'Qo\'shish',
  'uz-cyrl': 'Қўшиш',
  'ru': 'Добавить',
  'en': 'Add'
};
translations['cost-description-placeholder'] = {
  'uz-latn': 'Xarajat izohi (masalan, Logistika)',
  'uz-cyrl': 'Харажат изоҳи (масалан, Логистика)',
  'ru': 'Описание расхода (например, Логистика)',
  'en': 'Cost description (e.g., Logistics)'
};
translations['cost-amount-placeholder'] = {
  'uz-latn': 'Summa (UZS)',
  'uz-cyrl': 'Сумма (УЗС)',
  'ru': 'Сумма (UZS)',
  'en': 'Amount (UZS)'
};
translations['select-platform'] = {
  'uz-latn': 'Manba-platformani tanlang',
  'uz-cyrl': 'Манба-платформани танланг',
  'ru': 'Выберите источник-платформу',
  'en': 'Select source platform'
};
translations['select-platform-tooltip'] = {
  'uz-latn': 'AI tahlilni tanlangan platformaning o\'ziga xos jihatlarini hisobga olgan holda amalga oshiradi. To\'g\'ri tanlov tahlil aniqligini oshiradi.',
  'uz-cyrl': 'АИ таҳлилни танланган платформанинг ўзига хос жиҳатларини ҳисобга олган ҳолда амалга оширади. Тўғри танлов таҳлил аниқлигини оширади.',
  'ru': 'ИИ анализ проводится с учетом специфических особенностей выбранной платформы. Правильный выбор повышает точность анализа.',
  'en': 'AI analysis is performed taking into account the specific features of the selected platform. The correct choice increases the accuracy of the analysis.'
};
translations['primary-platform'] = {
  'uz-latn': 'UzEx - Asosiy platforma',
  'uz-cyrl': 'УзЕх - Асосий платформа',
  'ru': 'UzEx - Основная платформа',
  'en': 'UzEx - Main platform'
};
translations['alternative-platform'] = {
  'uz-latn': 'XTXarid - Muqobil platforma',
  'uz-cyrl': 'ХТХарид - Муқобил платформа',
  'ru': 'XTXarid - Альтернативная платформа',
  'en': 'XTXarid - Alternative platform'
};
translations['next-step'] = {
  'uz-latn': 'Keyingi Qadam:',
  'uz-cyrl': 'Кейинги Қадам:',
  'ru': 'Следующий шаг:',
  'en': 'Next Step:'
};
translations['next-step-description'] = {
  'uz-latn': 'Tahlilni boshlaganingizdan so\'ng, AI avval internetdan potentsial ta\'minotchilarni qidiradi. Keyin siz ulardan eng ma\'qullarini tanlab, yakuniy moliyaviy tahlilni yaratasiz.',
  'uz-cyrl': 'Таҳлилни бошлаганингиздан сўнг, АИ аввал интернетдан потенциал таъминотчиларни қидиради. Кейин сиз улардан энг маъқулларини танлаб, якуний молиявий таҳлилни яратасиз.',
  'ru': 'После начала анализа ИИ сначала ищет потенциальных поставщиков в интернете. Затем вы выбираете из них наиболее подходящих и создаете окончательный финансовый анализ.',
  'en': 'After starting the analysis, AI first searches for potential suppliers on the Internet. Then you select the most suitable ones from them and create a final financial analysis.'
};
translations['start-analysis'] = {
  'uz-latn': 'Tahlilni Boshlash',
  'uz-cyrl': 'Таҳлилни Бошлаш',
  'ru': 'Начать анализ',
  'en': 'Start Analysis'
};
translations['delete-contract-confirm'] = {
  'uz-latn': 'Bu shartnoma tahlilini o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.',
  'uz-cyrl': 'Бу шартнома таҳлилини ўчиришмоқчимисиз? Бу амални қайтариб бўлмайди.',
  'ru': 'Вы действительно хотите удалить этот анализ контракта? Это действие нельзя отменить.',
  'en': 'Are you sure you want to delete this contract analysis? This action cannot be undone.'
};

// Competitors translations
translations['competitors-win-percentage'] = {
  'uz-latn': 'G\'alaba %',
  'uz-cyrl': 'Ғалаба %',
  'ru': 'Победы %',
  'en': 'Win %'
};

translations['actions'] = {
  'uz-latn': 'Amallar',
  'uz-cyrl': 'Амаллар',
  'ru': 'Действия',
  'en': 'Actions'
};

translations['bookmark'] = {
  'uz-latn': 'Saqlash',
  'uz-cyrl': 'Сақлаш',
  'ru': 'Сохранить',
  'en': 'Bookmark'
};

translations['remove-bookmark'] = {
  'uz-latn': 'Saqlangandan olib tashlash',
  'uz-cyrl': 'Сақлангандан олиб ташлаш',
  'ru': 'Удалить из сохраненных',
  'en': 'Remove Bookmark'
};

// Statistics and Analysis Section
// Statistics Section
translations['statistics-title'] = {
  'uz-latn': 'Statistika va Tahlil',
  'uz-cyrl': 'Статистика ва Таҳлил',
  'ru': 'Статистика и анализ',
  'en': 'Statistics and Analysis'
};

translations['total-contracts'] = {
  'uz-latn': 'Jami shartnomalar',
  'uz-cyrl': 'Жами шартномалар',
  'ru': 'Всего контрактов',
  'en': 'Total Contracts'
};

translations['analyzed-contracts'] = {
  'uz-latn': 'Tahlil qilingan',
  'uz-cyrl': 'Таҳлил қилинган',
  'ru': 'Проанализировано',
  'en': 'Analyzed'
};

translations['loading-analysis-title'] = {
  'uz-latn': 'Tahlil jarayonida',
  'uz-cyrl': 'Таҳлил жараёнида',
  'ru': 'В процессе анализа',
  'en': 'In Analysis'
};

translations['elite-performance-indicators'] = {
  'uz-latn': 'Elite Samaradorlik Ko\'rsatkichlari',
  'uz-cyrl': 'Елит Самародорлик Ко\'рсаткичлари',
  'ru': 'Элитные показатели эффективности',
  'en': 'Elite Performance Indicators'
};

translations['won-label'] = {
  'uz-latn': 'Yutgan',
  'uz-cyrl': 'Ютган',
  'ru': 'Выиграно',
  'en': 'Won'
};

// Contract Details Section
translations['no-contracts-title'] = {
  'uz-latn': 'Shartnoma Tahlili Yo\'q',
  'uz-cyrl': 'Шартнома Таҳлили Йўқ',
  'ru': 'Нет анализа контрактов',
  'en': 'No Contract Analysis'
};
translations['no-contracts-description'] = {
  'uz-latn': 'Hali hech qanday shartnoma tahlil qilinmagan. Shartnoma faylini yuklab, AI-powered yuridik xulosa oling.',
  'uz-cyrl': 'Ҳали ҳеч қандай шартнома таҳлил қилинмаган. Шартнома файлни юклаб, АИ-паверед юридик хулоса олинг.',
  'ru': 'Пока не проанализировано ни одного контракта. Загрузите файл контракта и получите юридическое заключение на базе ИИ.',
  'en': 'No contracts have been analyzed yet. Upload a contract file and get an AI-powered legal conclusion.'
};

// Statistics Section
translations['statistics-title'] = {
  'uz-latn': 'Umumiy Statistika',
  'uz-cyrl': 'Умумий Статистика',
  'ru': 'Общая статистика',
  'en': 'General Statistics'
};

translations['total-contracts'] = {
  'uz-latn': 'Jami Shartnomalar',
  'uz-cyrl': 'Жами Шартномалар',
  'ru': 'Всего контрактов',
  'en': 'Total Contracts'
};

translations['active-contracts'] = {
  'uz-latn': 'Faol Shartnomalar',
  'uz-cyrl': 'Фаол Шартномалар',
  'ru': 'Активные контракты',
  'en': 'Active Contracts'
};

translations['completed-contracts'] = {
  'uz-latn': 'Yakunlangan Shartnomalar',
  'uz-cyrl': 'Якунланган Шартномалар',
  'ru': 'Завершенные контракты',
  'en': 'Completed Contracts'
};

translations['total-amount'] = {
  'uz-latn': 'Umumiy Summa',
  'uz-cyrl': 'Умумий Сумма',
  'ru': 'Общая сумма',
  'en': 'Total Amount'
};

// Contract Statuses
translations['status-draft'] = {
  'uz-latn': 'Qoralama',
  'uz-cyrl': 'Қоралама',
  'ru': 'Черновик',
  'en': 'Draft'
};

translations['status-active'] = {
  'uz-latn': 'Faol',
  'uz-cyrl': 'Фаол',
  'ru': 'Активный',
  'en': 'Active'
};

translations['status-pending'] = {
  'uz-latn': 'Kutilmoqda',
  'uz-cyrl': 'Кутилмоқда',
  'ru': 'В ожидании',
  'en': 'Pending'
};

translations['status-completed'] = {
  'uz-latn': 'Yakunlangan',
  'uz-cyrl': 'Якунланган',
  'ru': 'Завершенный',
  'en': 'Completed'
};

translations['status-terminated'] = {
  'uz-latn': 'Bekor qilingan',
  'uz-cyrl': 'Бекор қилинган',
  'ru': 'Расторгнут',
  'en': 'Terminated'
};

// Contract Actions
translations['view-contract'] = {
  'uz-latn': 'Shartnomani ko\'rish',
  'uz-cyrl': 'Шартномани кўриш',
  'ru': 'Просмотреть контракт',
  'en': 'View Contract'
};

translations['download-pdf'] = {
  'uz-latn': 'PDF yuklab olish',
  'uz-cyrl': 'PDF юклаб олиш',
  'ru': 'Скачать PDF',
  'en': 'Download PDF'
};

translations['share-contract'] = {
  'uz-latn': 'Ulashish',
  'uz-cyrl': 'Улашиш',
  'ru': 'Поделиться',
  'en': 'Share'
};

// Contract Details
translations['contract-number'] = {
  'uz-latn': 'Shartnoma raqami',
  'uz-cyrl': 'Шартнома рақами',
  'ru': 'Номер контракта',
  'en': 'Contract Number'
};

translations['contract-date'] = {
  'uz-latn': 'Shartnoma sanasi',
  'uz-cyrl': 'Шартнома санаси',
  'ru': 'Дата контракта',
  'en': 'Contract Date'
};

translations['contract-value'] = {
  'uz-latn': 'Shartnoma qiymati',
  'uz-cyrl': 'Шартнома қиймати',
  'ru': 'Стоимость контракта',
  'en': 'Contract Value'
};

translations['counterparty'] = {
  'uz-latn': 'Qarama-qarshi tomon',
  'uz-cyrl': 'Қарама-қарши томон',
  'ru': 'Контрагент',
  'en': 'Counterparty'
};

// Contract Filters
translations['filter-by-status'] = {
  'uz-latn': 'Holati bo\'yicha filtrlash',
  'uz-cyrl': 'Ҳолати бўйича филтрлаш',
  'ru': 'Фильтр по статусу',
  'en': 'Filter by Status'
};

translations['filter-by-date'] = {
  'uz-latn': 'Sana bo\'yicha filtrlash',
  'uz-cyrl': 'Сана бўйича филтрлаш',
  'ru': 'Фильтр по дате',
  'en': 'Filter by Date'
};

translations['filter-all'] = {
  'uz-latn': 'Barchasi',
  'uz-cyrl': 'Барчаси',
  'ru': 'Все',
  'en': 'All'
};

// Contract Alerts
translations['upcoming-payment'] = {
  'uz-latn': 'Yaqinlashayotgan to\'lov',
  'uz-cyrl': 'Яқинлашаётган тўлов',
  'ru': 'Предстоящий платеж',
  'en': 'Upcoming Payment'
};

translations['contract-expiring'] = {
  'uz-latn': 'Shartnoma muddati tugayapti',
  'uz-cyrl': 'Шартнома муддати тугаяпти',
  'ru': 'Срок действия контракта истекает',
  'en': 'Contract Expiring'
};

// Contract Analysis
translations['risk-level'] = {
  'uz-latn': 'Xavf darajasi',
  'uz-cyrl': 'Хавф даражаси',
  'ru': 'Уровень риска',
  'en': 'Risk Level'
};

translations['key-clauses'] = {
  'uz-latn': 'Asosiy bandlar',
  'uz-cyrl': 'Асосий бандар',
  'ru': 'Ключевые положения',
  'en': 'Key Clauses'
};

translations['recommendations'] = {
  'uz-latn': 'Tavsiyalar',
  'uz-cyrl': 'Тавсиялар',
  'ru': 'Рекомендации',
  'en': 'Recommendations'
};
translations['no-results-title'] = {
  'uz-latn': 'Filter bo\'yicha natija yo\'q',
  'uz-cyrl': 'Фильтр бўйича натижа йўқ',
  'ru': 'Нет результатов по фильтру',
  'en': 'No Results by Filter'
};
translations['no-results-description'] = {
  'uz-latn': 'Qidiruv mezonlaringizni o\'zgartiring yoki filtrlarni tozalang.',
  'uz-cyrl': 'Қидирув мезонларингизни ўзгартиринг ёки фильтрларни тозаланг.',
  'ru': 'Измените критерии поиска или очистите фильтры.',
  'en': 'Change your search criteria or clear the filters.'
};
translations['clear-filters'] = {
  'uz-latn': 'Filtrlarni Tozalash',
  'uz-cyrl': 'Фильтрларни Тозалаш',
  'ru': 'Очистить фильтры',
  'en': 'Clear Filters'
};
translations['contract-details'] = {
  'uz-latn': 'Batafsil ko\'rish',
  'uz-cyrl': 'Батафсил кўриш',
  'ru': 'Подробный просмотр',
  'en': 'Detailed View'
};
translations['overview'] = {
  'uz-latn': 'Umumiy Ko\'rinish',
  'uz-cyrl': 'Умумий Кўриниш',
  'ru': 'Обзор',
  'en': 'Overview'
};
translations['risk-analysis'] = {
  'uz-latn': 'Risk Tahlili',
  'uz-cyrl': 'Риск Таҳлили',
  'ru': 'Анализ рисков',
  'en': 'Risk Analysis'
};
translations['obligations'] = {
  'uz-latn': 'Majburiyatlar',
  'uz-cyrl': 'Мажбуриятлар',
  'ru': 'Обязательства',
  'en': 'Obligations'
};
translations['special-clauses'] = {
  'uz-latn': 'Maxsus Bandlar',
  'uz-cyrl': 'Махсус Бандлар',
  'ru': 'Специальные положения',
  'en': 'Special Clauses'
};
translations['timeline'] = {
  'uz-latn': 'Vaqt Jadvali',
  'uz-cyrl': 'Вақт Жадвали',
  'ru': 'График',
  'en': 'Timeline'
};
translations['total-clauses'] = {
  'uz-latn': 'Jami Bandlar',
  'uz-cyrl': 'Жами Бандлар',
  'ru': 'Всего положений',
  'en': 'Total Clauses'
};
translations['detailed-risk-analysis'] = {
  'uz-latn': 'Detallashtirilgan Risk Tahlili',
  'uz-cyrl': 'Деталласhtiрилган Риск Таҳлили',
  'ru': 'Детальный анализ рисков',
  'en': 'Detailed Risk Analysis'
};
translations['main-obligations'] = {
  'uz-latn': 'Asosiy Majburiyatlar va Javobgarliklar',
  'uz-cyrl': 'Асосий Мажбуриятлар ва Жавобгарликлар',
  'ru': 'Основные обязательства и ответственность',
  'en': 'Main Obligations and Responsibilities'
};
translations['penalties'] = {
  'uz-latn': 'Jarima va Sanksiyalar',
  'uz-cyrl': 'Жарима ва Санксиялар',
  'ru': 'Штрафы и санкции',
  'en': 'Penalties and Sanctions'
};
translations['force-majeure'] = {
  'uz-latn': 'Fors-major va Favqulodda Holatlari',
  'uz-cyrl': 'Форс-мажор ва Фавқулодда Ҳолатлари',
  'ru': 'Форс-мажор и чрезвычайные ситуации',
  'en': 'Force Majeure and Emergency Situations'
};
translations['no-penalty-clauses'] = {
  'uz-latn': 'Maxsus jarima bandlari topilmadi',
  'uz-cyrl': 'Махсус жарима бандлари топилмади',
  'ru': 'Специальные положения о штрафах не найдены',
  'en': 'No special penalty clauses found'
};
translations['no-force-majeure'] = {
  'uz-latn': 'Fors-major bandlari topilmadi',
  'uz-cyrl': 'Форс-мажор бандлари топилмади',
  'ru': 'Положения форс-мажор не найдены',
  'en': 'No force majeure clauses found'
};
translations['contract-timeline'] = {
  'uz-latn': 'Shartnoma Vaqt Jadvali',
  'uz-cyrl': 'Шартнома Вақт Жадвали',
  'ru': 'График контракта',
  'en': 'Contract Timeline'
};
translations['print'] = {
  'uz-latn': 'Print',
  'uz-cyrl': 'Чоп этиш',
  'ru': 'Печать',
  'en': 'Print'
};
translations['close'] = {
  'uz-latn': 'Yopish',
  'uz-cyrl': 'Ёпиш',
  'ru': 'Закрыть',
  'en': 'Close'
};

// Function to set the current language
export function setLanguage(lang: 'uz-latn' | 'uz-cyrl' | 'ru' | 'en') {
  currentLanguage = lang;
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
  
  return translation[currentLanguage] || translation['en'] || translation['uz-latn'] || key;
}

// Listen for language changes and save to localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', (event: any) => { // Use 'any' for event to access detail easily
    if (window.localStorage) {
      window.localStorage.setItem('ai-broker-language', event.detail);
    }
  });

  // Ensure the language is properly set on page load
  if (window.localStorage) {
    const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
    if (savedLanguage) {
      currentLanguage = savedLanguage;
      // Dispatch event to notify components of language change
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: savedLanguage }));
    }
  }
}

export default {
  t,
  setLanguage,
  getCurrentLanguage
};