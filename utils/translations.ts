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
  };
}

// Current language state - initialize from localStorage if available
let currentLanguage: 'uz-latn' | 'uz-cyrl' | 'ru' = 'uz-latn';

// Check localStorage for saved language on initial load
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | null;
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
    'ru': 'Панель управления'
  },
  'analytics-title': {
    'uz-latn': 'Statistika va Tahlil',
    'uz-cyrl': 'Статистика ва Таҳлил',
    'ru': 'Статистика и анализ'
  },
  'contracts-title': {
    'uz-latn': 'Shartnomalar Tahlili',
    'uz-cyrl': 'Шартномалар Таҳлили',
    'ru': 'Анализ контрактов'
  },
  'profile-title': {
    'uz-latn': 'Kompaniya Profili',
    'uz-cyrl': 'Компания Профили',
    'ru': 'Профиль компании'
  },
  'input-title': {
    'uz-latn': 'Yangi Tahlil Yaratish',
    'uz-cyrl': 'Янги Таҳлил Яратиш',
    'ru': 'Создать новый анализ'
  },
  'loading-sourcing-title': {
    'uz-latn': 'Ta\'minot Manbalari Qidirilmoqda',
    'uz-cyrl': 'Таъминот Манбалари Қидирилмоқда',
    'ru': 'Поиск источников поставок'
  },
  'sourcing-selection-title': {
    'uz-latn': 'Ta\'minotchilarni Tanlash',
    'uz-cyrl': 'Таъминотчиларни Танлаш',
    'ru': 'Выбор поставщиков'
  },
  'loading-analysis-title': {
    'uz-latn': 'Tahlil Qilinmoqda',
    'uz-cyrl': 'Таҳлил Қилинмоқда',
    'ru': 'Анализ проводится'
  },
  'results-title': {
    'uz-latn': 'Tahlil Natijasi',
    'uz-cyrl': 'Таҳлил Натижаси',
    'ru': 'Результаты анализа'
  },
  'shared-report-title': {
    'uz-latn': 'Ulashilgan Hisobot',
    'uz-cyrl': 'Улашилган Ҳисобот',
    'ru': 'Общий отчет'
  },
  'loading-contract-title': {
    'uz-latn': 'Shartnoma Tahlil Qilinmoqda',
    'uz-cyrl': 'Шартнома Таҳлил Қилинмоқда',
    'ru': 'Анализ контракта проводится'
  },
  
  // Navigation items
  'nav-dashboard': {
    'uz-latn': 'Boshqaruv',
    'uz-cyrl': 'Бошқарув',
    'ru': 'Управление'
  },
  'nav-analytics': {
    'uz-latn': 'Statistika',
    'uz-cyrl': 'Статистика',
    'ru': 'Статистика'
  },
  'nav-contracts': {
    'uz-latn': 'Shartnomalar',
    'uz-cyrl': 'Шартномалар',
    'ru': 'Контракты'
  },
  'nav-profile': {
    'uz-latn': 'Profil',
    'uz-cyrl': 'Профил',
    'ru': 'Профиль'
  },
  
  // Common actions
  'new-analysis': {
    'uz-latn': 'Yangi Tahlil',
    'uz-cyrl': 'Янги Таҳлил',
    'ru': 'Новый анализ'
  },
  'search-placeholder': {
    'uz-latn': 'Qidirish (lot, buyurtmachi, agent...)',
    'uz-cyrl': 'Қидириш (лот, буюртмачи, агент...)',
    'ru': 'Поиск (лот, заказчик, агент...)'
  },
  'all-statuses': {
    'uz-latn': 'Barcha Statuslar',
    'uz-cyrl': 'Барча Статуслар',
    'ru': 'Все статусы'
  },
  'watched-items': {
    'uz-latn': '⭐ Kuzatuvdagilar',
    'uz-cyrl': '⭐ Кузатувдагилар',
    'ru': '⭐ В избранном'
  },
  'show-archived': {
    'uz-latn': 'Arxivni Ko\'rsatish',
    'uz-cyrl': 'Архивни Кўрсатиш',
    'ru': 'Показать архив'
  },
  
  // Dashboard specific translations
  'welcome-title': {
    'uz-latn': 'AI-Broker Elite\'ga Xush Kelibsiz!',
    'uz-cyrl': 'АИ-Брокер Елитега Хуш Келибсиз!',
    'ru': 'Добро пожаловать в AI-Broker Elite!'
  },
  'welcome-description': {
    'uz-latn': 'Dunyodagi eng kuchli tender tahlil tizimiga xush kelibsiz. AI-Broker Elite sizga raqobatchilardan ustun kelish, eng yuqori daromad olish va bozorni boshqarishda yordam beradi.',
    'uz-cyrl': 'Дунёдаги энг кучли тендер таҳлил тизимига хуш келибсиз. АИ-Брокер Елите сизга рақобатчилардан устун келиш, энг юқори даромад олиш ва бозорни бошқаришда ёрдам беради.',
    'ru': 'Добро пожаловать в самую мощную систему анализа тендеров в мире. AI-Broker Elite поможет вам превзойти конкурентов, получить максимальную прибыль и управлять рынком.'
  },
  'step-1-title': {
    'uz-latn': 'Elite Profil Sozlash',
    'uz-cyrl': 'Елит Профил Созлаш',
    'ru': 'Настройка профиля Elite'
  },
  'step-1-description': {
    'uz-latn': 'Kompaniya profilini mukammal sozlang: QQS stavkalari, ustama xarajatlar, sotuvchi agentlar va avtomatik tender qidiruv tizimini faollashtiring.',
    'uz-cyrl': 'Компания профилини муқаммал созланг: ҚҚС ставкалари, устама харажатлар, сотувчи агентлар ва автоматик тендер қидирув тизимини фаоллаштиринг.',
    'ru': 'Полностью настройте профиль компании: ставки НДС, дополнительные расходы, агентов по продаже и активируйте систему автоматического поиска тендеров.'
  },
  'step-1-button': {
    'uz-latn': 'Sozlash',
    'uz-cyrl': 'Созлаш',
    'ru': 'Настроить'
  },
  'step-2-title': {
    'uz-latn': 'AI Elite Tahlil',
    'uz-cyrl': 'АИ Елит Таҳлил',
    'ru': 'AI Elite анализ'
  },
  'step-2-description': {
    'uz-latn': 'Tender faylini yuklang va AI-ning eng ilg\'or tahlil algoritmlari orqali raqobatchilarni mag\'lub etish strategiyasini oling.',
    'uz-cyrl': 'Тендер файлни юкланг ва АИ-нинг энг илғор таҳлил алгоритмлари орқали рақобатчиларни магълуб этиш стратегиясини олинг.',
    'ru': 'Загрузите файл тендера и получите стратегию победы над конкурентами с помощью самых передовых алгоритмов анализа ИИ.'
  },
  'step-2-button': {
    'uz-latn': 'Boshlash',
    'uz-cyrl': 'Бошлаш',
    'ru': 'Начать'
  },
  'step-3-title': {
    'uz-latn': 'Bozorni Boshqarish',
    'uz-cyrl': 'Бозорни Бошқариш',
    'ru': 'Управление рынком'
  },
  'step-3-description': {
    'uz-latn': 'AI tavsiyalari asosida tenderlarni yuting, raqobatchilarni mag\'lub eting va bozoringizni kengaytiring.',
    'uz-cyrl': 'АИ тавсиялари асосида тендерларни ютинг, рақобатчиларни магълуб этинг ва бозорингизни кенгайтиринг.',
    'ru': 'Выигрывайте тендеры, побеждайте конкурентов и расширяйте свой рынок на основе рекомендаций ИИ.'
  },
  'step-3-button': {
    'uz-latn': 'G\'alaba',
    'uz-cyrl': 'Ғалаба',
    'ru': 'Победа'
  },
  'start-ai-analysis': {
    'uz-latn': 'AI Elite Tahlilni Boshlash',
    'uz-cyrl': 'АИ Елит Таҳлилни Бошлаш',
    'ru': 'Начать AI Elite анализ'
  },
  'accuracy': {
    'uz-latn': 'Aniqlik',
    'uz-cyrl': 'Аниқлик',
    'ru': 'Точность'
  },
  'faster': {
    'uz-latn': 'Tezroq',
    'uz-cyrl': 'Тезроқ',
    'ru': 'Быстрее'
  },
  'opportunity': {
    'uz-latn': 'Imkoniyat',
    'uz-cyrl': 'Имконият',
    'ru': 'Возможность'
  },
  'strategic-insights': {
    'uz-latn': 'Strategik Tavsiyalar',
    'uz-cyrl': 'Стратегик Тавсиялар',
    'ru': 'Стратегические рекомендации'
  },
  'ai-visionary-council': {
    'uz-latn': 'AI Vizionerlar Kengashi',
    'uz-cyrl': 'АИ Визионерлар Кенгаши',
    'ru': 'Совет AI Визионеров'
  },
  'trend-analyzer': {
    'uz-latn': 'Trend Analizatori A.I.',
    'uz-cyrl': 'Тренд Анализатори А.И.',
    'ru': 'Анализатор трендов A.I.'
  },
  'innovation-ai': {
    'uz-latn': 'Innovatsiya A.I.',
    'uz-cyrl': 'Инновация А.И.',
    'ru': 'Инновации A.I.'
  },
  'future-tech-ai': {
    'uz-latn': 'Bo\'lajak Texnologiyalar A.I.',
    'uz-cyrl': 'Бўлажак Технологиялар А.И.',
    'ru': 'Будущие технологии A.I.'
  },
  'no-tenders-title': {
    'uz-latn': 'Tahlillar Topilmadi',
    'uz-cyrl': 'Таҳлиллар Топилмади',
    'ru': 'Анализы не найдены'
  },
  'no-tenders-description': {
    'uz-latn': 'Filtrlarni o\'zgartirib ko\'ring yoki yangi tahlil yarating.',
    'uz-cyrl': 'Фильтрларни ўзгартириб кўринг ёки янги таҳлил яратинг.',
    'ru': 'Попробуйте изменить фильтры или создайте новый анализ.'
  },
  'selected-items': {
    'uz-latn': 'ta tanlandi',
    'uz-cyrl': 'та танланди',
    'ru': 'выбрано'
  },
  'archive-action': {
    'uz-latn': 'Arxivlash',
    'uz-cyrl': 'Архивлаш',
    'ru': 'Архивировать'
  },
  'unarchive-action': {
    'uz-latn': 'Arxivdan chiqarish',
    'uz-cyrl': 'Архивдан чиқариш',
    'ru': 'Извлечь из архива'
  },
  'delete-action': {
    'uz-latn': 'O\'chirish',
    'uz-cyrl': 'Ўчириш',
    'ru': 'Удалить'
  },
  'sort-by-newest': {
    'uz-latn': 'Saralash: Eng yangi',
    'uz-cyrl': 'Саралаш: Энг янги',
    'ru': 'Сортировка: Новейшие'
  },
  'sort-by-high-risk': {
    'uz-latn': 'Saralash: Yuqori risk',
    'uz-cyrl': 'Саралаш: Юқори риск',
    'ru': 'Сортировка: Высокий риск'
  },
  'sort-by-high-opportunity': {
    'uz-latn': 'Saralash: Yuqori imkoniyat',
    'uz-cyrl': 'Саралаш: Юқори имконият',
    'ru': 'Сортировка: Высокая возможность'
  },
  
  // Analytics specific translations
  'platform-filter': {
    'uz-latn': 'Platforma bo\'yicha filtrlash',
    'uz-cyrl': 'Платформа бўйича фильтрлаш',
    'ru': 'Фильтрация по платформе'
  },
  'all-platforms': {
    'uz-latn': 'Barcha platformalar',
    'uz-cyrl': 'Барча платформалар',
    'ru': 'Все платформы'
  },
  'filter-applied': {
    'uz-latn': 'Filtr qo\'llanilmoqda:',
    'uz-cyrl': 'Фильтр қўлланилмоқда:',
    'ru': 'Применяется фильтр:'
  },
  'remove-filter': {
    'uz-latn': 'Filterni olib tashlash',
    'uz-cyrl': 'Фильтрни олиб ташлаш',
    'ru': 'Удалить фильтр'
  },
  'elite-performance': {
    'uz-latn': 'Elite Samaradorlik Ko\'rsatkichlari',
    'uz-cyrl': 'Елит Самарадорлик Кўрсаткичлари',
    'ru': 'Показатели эффективности Elite'
  },
  'total-analyses': {
    'uz-latn': 'Jami Tahlillar',
    'uz-cyrl': 'Жами Таҳлиллар',
    'ru': 'Всего анализов'
  },
  'wins': {
    'uz-latn': 'G\'alabalar',
    'uz-cyrl': 'Ғалабалар',
    'ru': 'Победы'
  },
  'losses': {
    'uz-latn': 'Mag\'lubiyatlar',
    'uz-cyrl': 'Мағлубиятлар',
    'ru': 'Поражения'
  },
  'win-rate': {
    'uz-latn': 'G\'alaba Foizi',
    'uz-cyrl': 'Ғалаба Фоизи',
    'ru': 'Процент побед'
  },
  'avg-risk': {
    'uz-latn': 'O\'rtacha Risk',
    'uz-cyrl': 'Ўртacha Риск',
    'ru': 'Средний риск'
  },
  'opportunity-score': {
    'uz-latn': 'Imkoniyat Darajasi',
    'uz-cyrl': 'Имконият Даражаси',
    'ru': 'Уровень возможностей'
  },
  'high-value-tenders': {
    'uz-latn': 'Yuqori Qiymatli Tenderlar',
    'uz-cyrl': 'Юқори Қийматли Тендерлар',
    'ru': 'Высокоценные тендеры'
  },
  'target-customers': {
    'uz-latn': 'Maqsadli Mijozlar',
    'uz-cyrl': 'Мақсадли Мижозлар',
    'ru': 'Целевые клиенты'
  },
  'competition-level': {
    'uz-latn': 'Raqobat Darajasi',
    'uz-cyrl': 'Рақобат Даражаси',
    'ru': 'Уровень конкуренции'
  },
  'financial-indicators': {
    'uz-latn': 'Moliyaviy Ko\'rsatkichlar (Yutgan lotlar bo\'yicha)',
    'uz-cyrl': 'Молиявий Кўрсаткичлар (Ютган лотлар бўйича)',
    'ru': 'Финансовые показатели (по выигранным лотам)'
  },
  'total-profit': {
    'uz-latn': 'Jami Sof Foyda',
    'uz-cyrl': 'Жами Соф Фойда',
    'ru': 'Общая чистая прибыль'
  },
  'total-loss': {
    'uz-latn': 'Jami Sof Zarar',
    'uz-cyrl': 'Жами Соф Зарар',
    'ru': 'Общий чистый убыток'
  },
  'avg-profit-margin': {
    'uz-latn': 'O\'rtacha Foyda Marjasi',
    'uz-cyrl': 'Ўртacha Фойда Маржаси',
    'ru': 'Средняя маржа прибыли'
  },
  'results-ratio': {
    'uz-latn': 'Natijalar Nisbati',
    'uz-cyrl': 'Натижалар Нисбати',
    'ru': 'Соотношение результатов'
  },
  'strategic-risk': {
    'uz-latn': 'Strategik Risk Tahlili',
    'uz-cyrl': 'Стратегик Риск Таҳлили',
    'ru': 'Анализ стратегических рисков'
  },
  'opportunities-matrix': {
    'uz-latn': 'Imkoniyatlar Matritsasi',
    'uz-cyrl': 'Имкониятлар Матрицаси',
    'ru': 'Матрица возможностей'
  },
  'risk-index': {
    'uz-latn': 'Risk Indeksi',
    'uz-cyrl': 'Риск Индекси',
    'ru': 'Индекс риска'
  },
  'opportunity-index': {
    'uz-latn': 'Imkoniyat Indeksi',
    'uz-cyrl': 'Имконият Индекси',
    'ru': 'Индекс возможностей'
  },
  'agent-performance': {
    'uz-latn': 'Agentlar Samaradorligi',
    'uz-cyrl': 'Агентлар Самарадорлиги',
    'ru': 'Эффективность агентов'
  },
  'assigned': {
    'uz-latn': 'Biriktirilgan',
    'uz-cyrl': 'Бириктирилган',
    'ru': 'Назначено'
  },
  'won': {
    'uz-latn': 'Yutgan',
    'uz-cyrl': 'Ютган',
    'ru': 'Выиграно'
  },
  'no-data': {
    'uz-latn': 'Ma\'lumot yo\'q',
    'uz-cyrl': 'Маълумот йўқ',
    'ru': 'Нет данных'
  },
  'customer-analysis': {
    'uz-latn': 'Mijozlar Bo\'yicha Tahlil (Top 10)',
    'uz-cyrl': 'Мижозлар Бўйича Таҳлил (Топ 10)',
    'ru': 'Анализ клиентов (Топ 10)'
  },
  'risk-vs-opportunity': {
    'uz-latn': 'Risk vs Imkoniyat Xaritasi',
    'uz-cyrl': 'Риск vs Имконият Харитаси',
    'ru': 'Карта риска и возможностей'
  },
  'risk-axis': {
    'uz-latn': 'Risk →',
    'uz-cyrl': 'Риск →',
    'ru': 'Риск →'
  },
  'opportunity-axis': {
    'uz-latn': 'Imkoniyat →',
    'uz-cyrl': 'Имконият →',
    'ru': 'Возможность →'
  },
  
  // Contracts specific translations
  'elite-legal-intelligence': {
    'uz-latn': 'Elite Legal Intelligence',
    'uz-cyrl': 'Елит Легал Интеллект',
    'ru': 'Elite Legal Intelligence'
  },
  'contract-upload-description': {
    'uz-latn': 'AI-powered yuridik tahlil tizimi bilan shartnomalaringizdagi risklarni aniqlang va majburiyatlarni batafsil o\'rganing. Har bir tahlil sizning yuridik xavfsizligingizni oshiradi.',
    'uz-cyrl': 'АИ-паверед юридик таҳлил тизими билан шартномаларингиздаги рискларни аниқланг ва мажбуриятларни батафсил ўрганинг. Ҳар бир таҳлил сизнинг юридик хавфсизлигингизни оширади.',
    'ru': 'Определите риски в ваших контрактах и подробно изучите обязательства с помощью системы юридического анализа на базе ИИ. Каждый анализ повышает вашу юридическую безопасность.'
  },
  'analyzed-contracts': {
    'uz-latn': 'Tahlil Qilingan',
    'uz-cyrl': 'Таҳлил Қилинган',
    'ru': 'Проанализировано'
  },
  'bookmarked': {
    'uz-latn': 'Saqlangan',
    'uz-cyrl': 'Сақланган',
    'ru': 'Сохранено'
  },
  'file-upload': {
    'uz-latn': 'Fayl Yuklash',
    'uz-cyrl': 'Файл Юклаш',
    'ru': 'Загрузка файла'
  },
  'file-types-contracts': {
    'uz-latn': 'PDF, DOC, DOCX (max 10MB)',
    'uz-cyrl': 'ПДФ, ДОК, ДОКХ (мах 10МБ)',
    'ru': 'PDF, DOC, DOCX (макс. 10 МБ)'
  },
  'drag-drop-text': {
    'uz-latn': 'Fayl tanlang yoki shu yerga olib keling',
    'uz-cyrl': 'Файл танланг ёки шу ерга олиб келинг',
    'ru': 'Выберите файл или перетащите его сюда'
  },
  'multiple-files': {
    'uz-latn': 'Bir nechta faylni birdan yuklashingiz mumkin',
    'uz-cyrl': 'Бир нечта файлни бирдан юклашингиз мумкин',
    'ru': 'Вы можете загрузить несколько файлов одновременно'
  },
  'selected-files-contracts': {
    'uz-latn': 'Tanlangan fayllar',
    'uz-cyrl': 'Танланган файллар',
    'ru': 'Выбранные файлы'
  },
  'elite-contract-archive': {
    'uz-latn': 'Elite Contract Archive',
    'uz-cyrl': 'Елит Контракт Архиви',
    'ru': 'Архив контрактов Elite'
  },
  'contracts-found': {
    'uz-latn': 'ta shartnoma',
    'uz-cyrl': 'та шартнома',
    'ru': 'контрактов'
  },
  'filtered-from': {
    'uz-latn': 'ta dan filtrlangan',
    'uz-cyrl': 'та дан фильтрланган',
    'ru': 'отфильтровано из'
  },
  'search-contracts': {
    'uz-latn': 'Shartnoma qidirish...',
    'uz-cyrl': 'Шартнома қидириш...',
    'ru': 'Поиск контрактов...'
  },
  'all-risk-levels': {
    'uz-latn': 'Barcha risk darajalari',
    'uz-cyrl': 'Барча риск даражалари',
    'ru': 'Все уровни риска'
  },
  'high-risk': {
    'uz-latn': 'Yuqori risk',
    'uz-cyrl': 'Юқори риск',
    'ru': 'Высокий риск'
  },
  'medium-risk': {
    'uz-latn': 'O\'rta risk',
    'uz-cyrl': 'Ўрта риск',
    'ru': 'Средний риск'
  },
  'low-risk': {
    'uz-latn': 'Past risk',
    'uz-cyrl': 'Паст риск',
    'ru': 'Низкий риск'
  },
  'all-recommendations': {
    'uz-latn': 'Barcha tavsiyalar',
    'uz-cyrl': 'Барча тавсиялар',
    'ru': 'Все рекомендации'
  },
  'recommended': {
    'uz-latn': 'Tavsiya etiladi',
    'uz-cyrl': 'Тавсия этилади',
    'ru': 'Рекомендуется'
  },
  'negotiate': {
    'uz-latn': 'Muzokara kerak',
    'uz-cyrl': 'Музокара керак',
    'ru': 'Требуется переговоры'
  },
  'high-risk-contract': {
    'uz-latn': 'Yuqori riskli',
    'uz-cyrl': 'Юқори рискли',
    'ru': 'Высокий риск'
  },
  'sort-newest': {
    'uz-latn': 'Yangi',
    'uz-cyrl': 'Янги',
    'ru': 'Новейшие'
  },
  'sort-oldest': {
    'uz-latn': 'Eski',
    'uz-cyrl': 'Эски',
    'ru': 'Старые'
  },
  'sort-name-az': {
    'uz-latn': 'Nom A-Z',
    'uz-cyrl': 'Ном А-З',
    'ru': 'Имя А-Я'
  },
  'sort-risk': {
    'uz-latn': 'Risk',
    'uz-cyrl': 'Риск',
    'ru': 'Риск'
  },
  'view-details': {
    'uz-latn': 'Batafsil ko\'rish',
    'uz-cyrl': 'Батафсил кўриш',
    'ru': 'Подробнее'
  },
  'delete-contract': {
    'uz-latn': 'O\'chirish',
    'uz-cyrl': 'Ўчириш',
    'ru': 'Удалить'
  },
  'no-contracts-title': {
    'uz-latn': 'Shartnoma Tahlili Yo\'q',
    'uz-cyrl': 'Шартнома Таҳлили Йўқ',
    'ru': 'Нет анализа контрактов'
  },
  'no-contracts-description': {
    'uz-latn': 'Hali hech qanday shartnoma tahlil qilinmagan. Shartnoma faylini yuklab, AI-powered yuridik xulosa oling.',
    'uz-cyrl': 'Ҳали ҳеч қандай шартнома таҳлил қилинмаган. Шартнома файлни юклаб, АИ-паверед юридик хулоса олинг.',
    'ru': 'Пока не проанализировано ни одного контракта. Загрузите файл контракта и получите юридическое заключение на базе ИИ.'
  },
  'no-results-title': {
    'uz-latn': 'Filter bo\'yicha natija yo\'q',
    'uz-cyrl': 'Фильтр бўйича натижа йўқ',
    'ru': 'Нет результатов по фильтру'
  },
  'no-results-description': {
    'uz-latn': 'Qidiruv mezonlaringizni o\'zgartiring yoki filtrlarni tozalang.',
    'uz-cyrl': 'Қидирув мезонларингизни ўзгартиринг ёки фильтрларни тозаланг.',
    'ru': 'Измените критерии поиска или очистите фильтры.'
  },
  'clear-filters': {
    'uz-latn': 'Filtrlarni Tozalash',
    'uz-cyrl': 'Фильтрларни Тозалаш',
    'ru': 'Очистить фильтры'
  },
  'contract-details': {
    'uz-latn': 'Batafsil ko\'rish',
    'uz-cyrl': 'Батафсил кўриш',
    'ru': 'Подробный просмотр'
  },
  'overview': {
    'uz-latn': 'Umumiy Ko\'rinish',
    'uz-cyrl': 'Умумий Кўриниш',
    'ru': 'Обзор'
  },
  'risk-analysis': {
    'uz-latn': 'Risk Tahlili',
    'uz-cyrl': 'Риск Таҳлили',
    'ru': 'Анализ рисков'
  },
  'obligations': {
    'uz-latn': 'Majburiyatlar',
    'uz-cyrl': 'Мажбуриятлар',
    'ru': 'Обязательства'
  },
  'special-clauses': {
    'uz-latn': 'Maxsus Bandlar',
    'uz-cyrl': 'Махсус Бандлар',
    'ru': 'Специальные положения'
  },
  'timeline': {
    'uz-latn': 'Vaqt Jadvali',
    'uz-cyrl': 'Вақт Жадвали',
    'ru': 'График'
  },
  'total-clauses': {
    'uz-latn': 'Jami Bandlar',
    'uz-cyrl': 'Жами Бандлар',
    'ru': 'Всего положений'
  },
  'detailed-risk-analysis': {
    'uz-latn': 'Detallashtirilgan Risk Tahlili',
    'uz-cyrl': 'Деталласhtiрилган Риск Таҳлили',
    'ru': 'Детальный анализ рисков'
  },
  'main-obligations': {
    'uz-latn': 'Asosiy Majburiyatlar va Javobgarliklar',
    'uz-cyrl': 'Асосий Мажбуриятлар ва Жавобгарликлар',
    'ru': 'Основные обязательства и ответственность'
  },
  'penalties': {
    'uz-latn': 'Jarima va Sanksiyalar',
    'uz-cyrl': 'Жарима ва Санксиялар',
    'ru': 'Штрафы и санкции'
  },
  'force-majeure': {
    'uz-latn': 'Fors-major va Favqulodda Holatlari',
    'uz-cyrl': 'Форс-мажор ва Фавқулодда Ҳолатлари',
    'ru': 'Форс-мажор и чрезвычайные ситуации'
  },
  'no-penalty-clauses': {
    'uz-latn': 'Maxsus jarima bandlari topilmadi',
    'uz-cyrl': 'Махсус жарима бандлари топилмади',
    'ru': 'Специальные положения о штрафах не найдены'
  },
  'no-force-majeure': {
    'uz-latn': 'Fors-major bandlari topilmadi',
    'uz-cyrl': 'Форс-мажор бандлари топилмади',
    'ru': 'Положения форс-мажор не найдены'
  },
  'contract-timeline': {
    'uz-latn': 'Shartnoma Vaqt Jadvali',
    'uz-cyrl': 'Шартнома Вақт Жадвали',
    'ru': 'График контракта'
  },
  'print': {
    'uz-latn': 'Print',
    'uz-cyrl': 'Чоп этиш',
    'ru': 'Печать'
  },
  'close': {
    'uz-latn': 'Yopish',
    'uz-cyrl': 'Ёпиш',
    'ru': 'Закрыть'
  },
  
  // Competitors specific translations
  'elite-market-intelligence': {
    'uz-latn': 'Elite Market Intelligence',
    'uz-cyrl': 'Елит Маркет Интеллект',
    'ru': 'Elite Market Intelligence'
  },
  'competitors-title': {
    'uz-latn': 'Raqobatchilar Tahlili',
    'uz-cyrl': 'Рақобатчилар Таҳлили',
    'ru': 'Анализ конкурентов'
  },
  
  // Navigation items
  'dashboard': {
    'uz-latn': 'Boshqaruv paneli',
    'uz-cyrl': 'Бўшқарув панели',
    'ru': 'Панель управления'
  },
  'contracts': {
    'uz-latn': 'Shartnomalar',
    'uz-cyrl': 'Шартномалар',
    'ru': 'Контракты'
  },
  'competitors': {
    'uz-latn': 'Raqobatchilar',
    'uz-cyrl': 'Рақобатчилар',
    'ru': 'Конкуренты'
  },
  'back': {
    'uz-latn': 'Orqaga',
    'uz-cyrl': 'Орқага',
    'ru': 'Назад'
  },
  'total-competitors': {
    'uz-latn': 'Jami Raqobatchilar',
    'uz-cyrl': 'Жами Рақобатчилар',
    'ru': 'Всего конкурентов'
  },
  'high-threat-competitors': {
    'uz-latn': 'Yuqori Xavfli',
    'uz-cyrl': 'Юқори Хавфли',
    'ru': 'Высокий риск'
  },
  'active-competitors': {
    'uz-latn': 'Faol Raqobatchilar',
    'uz-cyrl': 'Фаол Рақобатчилар',
    'ru': 'Активные конкуренты'
  },
  'avg-competitive-index': {
    'uz-latn': 'O\'rtacha Indeks',
    'uz-cyrl': 'Ўртacha Индекс',
    'ru': 'Средний индекс'
  },
  'search-competitors': {
    'uz-latn': 'Raqobatchilarni qidirish...',
    'uz-cyrl': 'Рақобатчиларни қидириш...',
    'ru': 'Поиск конкурентов...'
  },
  'all-competitors': {
    'uz-latn': 'Barcha raqobatchilar',
    'uz-cyrl': 'Барча рақобатчилар',
    'ru': 'Все конкуренты'
  },
  'frequent-competitors': {
    'uz-latn': 'Tez-tez uchraydigan',
    'uz-cyrl': 'Тез-тез учрайдиган',
    'ru': 'Часто встречающиеся'
  },
  'recent-competitors': {
    'uz-latn': 'Yaqinda faol',
    'uz-cyrl': 'Яқинда фаол',
    'ru': 'Недавно активные'
  },
  'winning-competitors': {
    'uz-latn': 'G\'oliblar',
    'uz-cyrl': 'Ғолиблар',
    'ru': 'Победители'
  },
  'sort-competitive-index': {
    'uz-latn': 'Raqobat indeksi ↓',
    'uz-cyrl': 'Рақобат индекси ↓',
    'ru': 'Индекс конкуренции ↓'
  },
  'sort-win-rate': {
    'uz-latn': 'G\'alaba foizi ↓',
    'uz-cyrl': 'Ғалаба фоизи ↓',
    'ru': 'Процент побед ↓'
  },
  'sort-appearances': {
    'uz-latn': 'Ko\'rinishlar ↓',
    'uz-cyrl': 'Кўринишлар ↓',
    'ru': 'Появления ↓'
  },
  'sort-activity': {
    'uz-latn': 'Faollik ↓',
    'uz-cyrl': 'Фаоллик ↓',
    'ru': 'Активность ↓'
  },
  'sort-market-share': {
    'uz-latn': 'Bozor ulushi ↓',
    'uz-cyrl': 'Бозор улуши ↓',
    'ru': 'Доля рынка ↓'
  },
  'table-view': {
    'uz-latn': 'Jadval',
    'uz-cyrl': 'Жадвал',
    'ru': 'Таблица'
  },
  'cards-view': {
    'uz-latn': 'Kartalar',
    'uz-cyrl': 'Карталар',
    'ru': 'Карточки'
  },
  'analytics-view': {
    'uz-latn': 'Tahlil',
    'uz-cyrl': 'Таҳлил',
    'ru': 'Анализ'
  },
  'no-competitors-title': {
    'uz-latn': 'Raqobatchilar Ma\'lumoti Yo\'q',
    'uz-cyrl': 'Рақобатчилар Маълумоти Йўқ',
    'ru': 'Нет информации о конкурентах'
  },
  'no-competitors-description': {
    'uz-latn': 'Raqobatchilar ro\'yxatini shakllantirish uchun, yakunlangan tenderlarga \'Yutqazdim\' statusini belgilab, g\'olib kompaniya nomini kiriting. Tizim avtomatik ravishda raqobatchilaringiz portretini yaratadi.',
    'uz-cyrl': 'Рақобатчилар рўйхатини шакллантириш учун, якунланган тендерларга \'Ютқаздим\' статусини белгилаб, ғолиб компания номини киритинг. Тизим автоматик равишда рақобатчиларингиз портретини яратади.',
    'ru': 'Чтобы сформировать список конкурентов, установите статус "Проигран" для завершенных тендеров и введите имя победившей компании. Система автоматически создаст портрет ваших конкурентов.'
  },
  'high-risk-label': {
    'uz-latn': 'Yuqori xavf',
    'uz-cyrl': 'Юқори хавф',
    'ru': 'Высокий риск'
  },
  'medium-risk-label': {
    'uz-latn': 'O\'rta xavf',
    'uz-cyrl': 'Ўрта хавф',
    'ru': 'Средний риск'
  },
  'low-risk-label': {
    'uz-latn': 'Past xavf',
    'uz-cyrl': 'Паст хавф',
    'ru': 'Низкий риск'
  },
  'competitive-index': {
    'uz-latn': 'Raqobat Indeksi',
    'uz-cyrl': 'Рақобат Индекси',
    'ru': 'Индекс конкуренции'
  },
  'key-strategy': {
    'uz-latn': 'Asosiy strategiya:',
    'uz-cyrl': 'Асосий стратегия:',
    'ru': 'Основная стратегия:'
  },
  'market-share': {
    'uz-latn': 'Bozor ulushi:',
    'uz-cyrl': 'Бозор улуши:',
    'ru': 'Доля рынка:'
  },
  'last-encounter': {
    'uz-latn': 'Oxirgi uchrashuv:',
    'uz-cyrl': 'Охирги учрашув:',
    'ru': 'Последняя встреча:'
  },
  'risk': {
    'uz-latn': 'Risk',
    'uz-cyrl': 'Риск',
    'ru': 'Риск'
  },
  'appearances': {
    'uz-latn': 'Ko\'rinishlar',
    'uz-cyrl': 'Кўринишлар',
    'ru': 'Появления'
  },
  'wins-label': {
    'uz-latn': 'G\'alabalar',
    'uz-cyrl': 'Ғалабалар',
    'ru': 'Победы'
  },
  'win-percentage': {
    'uz-latn': 'G\'alaba %',
    'uz-cyrl': 'Ғалаба %',
    'ru': 'Победы %'
  },
  'actions': {
    'uz-latn': 'Amallar',
    'uz-cyrl': 'Амаллар',
    'ru': 'Действия'
  },
  'bookmark': {
    'uz-latn': 'Saqlash',
    'uz-cyrl': 'Сақлаш',
    'ru': 'Сохранить'
  },
  'remove-bookmark': {
    'uz-latn': 'Saqlangandan olib tashlash',
    'uz-cyrl': 'Сақлангандан олиб ташлаш',
    'ru': 'Удалить из сохраненных'
  },
  'market-dominance': {
    'uz-latn': 'Bozor Hukmronligi Tahlili',
    'uz-cyrl': 'Бозор Ҳукмронлиги Таҳлили',
    'ru': 'Анализ доминирования на рынке'
  },
  'high-threat-competitors-analysis': {
    'uz-latn': 'Yuqori Xavfli Raqobatchilar',
    'uz-cyrl': 'Юқори Хавфли Рақобатчилар',
    'ru': 'Высокорисковые конкуренты'
  },
  'successful-competitors': {
    'uz-latn': 'Eng Muvaffaqiyatli Raqobatchilar',
    'uz-cyrl': 'Энг Муваффақиятли Рақобатчилар',
    'ru': 'Самые успешные конкуренты'
  },
  'competitors-market-share': {
    'uz-latn': 'Bozor ulushi',
    'uz-cyrl': 'Бозор улуши',
    'ru': 'Доля рынка'
  },
  'competitors-last-encounter': {
    'uz-latn': 'Oxirgi uchrashuv',
    'uz-cyrl': 'Охирги учрашув',
    'ru': 'Последняя встреча'
  },
  'competitors-appearances': {
    'uz-latn': 'Ko\'rinishlar',
    'uz-cyrl': 'Кўринишлар',
    'ru': 'Появления'
  },
  'competitors-wins': {
    'uz-latn': 'G\'alabalar',
    'uz-cyrl': 'Ғалабалар',
    'ru': 'Победы'
  },
  'competitors-win-percentage': {
    'uz-latn': 'G\'alaba %',
    'uz-cyrl': 'Ғалаба %',
    'ru': 'Победы %'
  },
  'competitors-remove-bookmark': {
    'uz-latn': 'Saqlangandan olib tashlash',
    'uz-cyrl': 'Сақлангандан олиб ташлаш',
    'ru': 'Удалить из сохраненных'
  },
  'competitors-bookmark': {
    'uz-latn': 'Saqlash',
    'uz-cyrl': 'Сақлаш',
    'ru': 'Сохранить'
  },
  'competitors-market-dominance': {
    'uz-latn': 'Bozor Hukmronligi Tahlili',
    'uz-cyrl': 'Бозор Ҳукмронлиги Таҳлили',
    'ru': 'Анализ доминирования на рынке'
  },
  'competitors-high-threat-competitors': {
    'uz-latn': 'Yuqori Xavfli Raqobatchilar',
    'uz-cyrl': 'Юқори Хавфли Рақобатчилар',
    'ru': 'Высокорисковые конкуренты'
  },
  'competitors-high-threat-competitors-analysis': {
    'uz-latn': 'Yuqori Xavfli Raqobatchilar',
    'uz-cyrl': 'Юқори Хавфли Рақобатчилар',
    'ru': 'Высокорисковые конкуренты'
  },
  
  // Language selector
  'language-selector': {
    'uz-latn': 'Tilni tanlang',
    'uz-cyrl': 'Тилни танланг',
    'ru': 'Выберите язык'
  },
  'uzbek-latin': {
    'uz-latn': 'O\'zbek (Lotin)',
    'uz-cyrl': 'Ўзбек (Лотин)',
    'ru': 'Узбекский (Латиница)'
  },
  'uzbek-cyrillic': {
    'uz-latn': 'O\'zbek (Kirill)',
    'uz-cyrl': 'Ўзбек (Кирилл)',
    'ru': 'Узбекский (Кириллица)'
  },
  'russian': {
    'uz-latn': 'Rus',
    'uz-cyrl': 'Рус',
    'ru': 'Русский'
  },
  
  // Dashboard Welcome Guide translations
  'dashboard-welcome-title': {
    'uz-latn': 'AI-Broker Elite\'ga Xush Kelibsiz!',
    'uz-cyrl': 'АИ-Брокер Елитега Хуш Келибсиз!',
    'ru': 'Добро пожаловать в AI-Broker Elite!'
  },
  'dashboard-welcome-description': {
    'uz-latn': 'Dunyodagi eng kuchli tender tahlil tizimiga xush kelibsiz. AI-Broker Elite sizga raqobatchilardan ustun kelish, eng yuqori daromad olish va bozorni boshqarishda yordam beradi.',
    'uz-cyrl': 'Дунёдаги энг кучли тендер таҳлил тизимига хуш келибсиз. АИ-Брокер Елите сизга рақобатчилардан устун келиш, энг юқори даромад олиш ва бозорни бошқаришда ёрдам беради.',
    'ru': 'Добро пожаловать в самую мощную систему анализа тендеров в мире. AI-Broker Elite поможет вам превзойти конкурентов, получить максимальную прибыль и управлять рынком.'
  },
  'dashboard-step-1-title': {
    'uz-latn': 'Elite Profil Sozlash',
    'uz-cyrl': 'Елит Профил Созлаш',
    'ru': 'Настройка профиля Elite'
  },
  'dashboard-step-1-description': {
    'uz-latn': 'Kompaniya profilini mukammal sozlang: QQS stavkalari, ustama xarajatlar, sotuvchi agentlar va avtomatik tender qidiruv tizimini faollashtiring.',
    'uz-cyrl': 'Компания профилини муқаммал созланг: ҚҚС ставкалари, устама харажатлар, сотувчи агентлар ва автоматик тендер қидирув тизимини фаоллаштиринг.',
    'ru': 'Полностью настройте профиль компании: ставки НДС, дополнительные расходы, агентов по продаже и активируйте систему автоматического поиска тендеров.'
  },
  'dashboard-step-1-button': {
    'uz-latn': 'Sozlash',
    'uz-cyrl': 'Созлаш',
    'ru': 'Настроить'
  },
  'dashboard-step-2-title': {
    'uz-latn': 'AI Elite Tahlil',
    'uz-cyrl': 'АИ Елит Таҳлил',
    'ru': 'AI Elite анализ'
  },
  'dashboard-step-2-description': {
    'uz-latn': 'Tender faylini yuklang va AI-ning eng ilg\'or tahlil algoritmlari orqali raqobatchilarni mag\'lub etish strategiyasini oling.',
    'uz-cyrl': 'Тендер файлни юкланг ва АИ-нинг энг илғор таҳлил алгоритмлари орқали рақобатчиларни магълуб этиш стратегиясини олинг.',
    'ru': 'Загрузите файл тендера и получите стратегию победы над конкурентами с помощью самых передовых алгоритмов анализа ИИ.'
  },
  'dashboard-step-2-button': {
    'uz-latn': 'Boshlash',
    'uz-cyrl': 'Бошлаш',
    'ru': 'Начать'
  },
  'dashboard-step-3-title': {
    'uz-latn': 'Bozorni Boshqarish',
    'uz-cyrl': 'Бозорни Бошқариш',
    'ru': 'Управление рынком'
  },
  'dashboard-step-3-description': {
    'uz-latn': 'AI tavsiyalari asosida tenderlarni yuting, raqobatchilarni mag\'lub eting va bozoringizni kengaytiring.',
    'uz-cyrl': 'АИ тавсиялари асосида тендерларни ютинг, рақобатчиларни магълуб этинг ва бозорингизни кенгайтиринг.',
    'ru': 'Выигрывайте тендеры, побеждайте конкурентов и расширяйте свой рынок на основе рекомендаций ИИ.'
  },
  'dashboard-step-3-button': {
    'uz-latn': 'G\'alaba',
    'uz-cyrl': 'Ғалаба',
    'ru': 'Победа'
  },
  'dashboard-start-ai-analysis': {
    'uz-latn': 'AI Elite Tahlilni Boshlash',
    'uz-cyrl': 'АИ Елит Таҳлилни Бошлаш',
    'ru': 'Начать AI Elite анализ'
  },
  'dashboard-accuracy': {
    'uz-latn': 'Aniqlik',
    'uz-cyrl': 'Аниқлик',
    'ru': 'Точность'
  },
  'dashboard-faster': {
    'uz-latn': 'Tezroq',
    'uz-cyrl': 'Тезроқ',
    'ru': 'Быстрее'
  },
  'dashboard-opportunity': {
    'uz-latn': 'Imkoniyat',
    'uz-cyrl': 'Имконият',
    'ru': 'Возможность'
  },
  'dashboard-visionary-council': {
    'uz-latn': 'AI Vizionerlar Kengashi',
    'uz-cyrl': 'АИ Визионерлар Кенгаши',
    'ru': 'Совет AI Визионеров'
  },
  'dashboard-trend-analyzer': {
    'uz-latn': 'Trend Analizatori A.I.',
    'uz-cyrl': 'Тренд Анализатори А.И.',
    'ru': 'Анализатор трендов A.I.'
  },
  'dashboard-innovation-ai': {
    'uz-latn': 'Innovatsiya A.I.',
    'uz-cyrl': 'Инновация А.И.',
    'ru': 'Инновации A.I.'
  },
  'dashboard-future-tech-ai': {
    'uz-latn': 'Bo\'lajak Texnologiyalar A.I.',
    'uz-cyrl': 'Бўлажак Технологиялар А.И.',
    'ru': 'Будущие технологии A.I.'
  },
  'dashboard-automatically-analyzed': {
    'uz-latn': 'Avtomatik tahlil qilingan',
    'uz-cyrl': 'Автоматик таҳлил қилинган',
    'ru': 'Автоматически проанализировано'
  },
  'dashboard-unknown-customer': {
    'uz-latn': 'Noma\'lum buyurtmachi',
    'uz-cyrl': 'Номаълум буюртмачи',
    'ru': 'Неизвестный заказчик'
  },
  'dashboard-potential-score': {
    'uz-latn': 'Potentsial Ball:',
    'uz-cyrl': 'Потенциал Балл:',
    'ru': 'Потенциальный балл:'
  },
  'dashboard-potential-score-description': {
    'uz-latn': 'Imkoniyat va Risk ballari asosida hisoblangan umumiy ko\'rsatkich.',
    'uz-cyrl': 'Имконият ва Риск баллари асосида ҳисобланган умумий кўрсаткич.',
    'ru': 'Общий показатель, рассчитанный на основе баллов Возможности и Риска.'
  },
  'dashboard-opportunity-label': {
    'uz-latn': 'Imkoniyat:',
    'uz-cyrl': 'Имконият:',
    'ru': 'Возможность:'
  },
  'dashboard-risk-label': {
    'uz-latn': 'Risk:',
    'uz-cyrl': 'Риск:',
    'ru': 'Риск:'
  },
  'dashboard-win-probability': {
    'uz-latn': 'G\'alaba ehtimoli (Optimal):',
    'uz-cyrl': 'Ғалаба эҳтимоли (Оптимал):',
    'ru': 'Вероятность победы (Оптимальная):'
  },
  'dashboard-expired': {
    'uz-latn': 'Tugagan',
    'uz-cyrl': 'Тугаган',
    'ru': 'Истекший'
  },
  'dashboard-days-left': {
    'uz-latn': 'kun qoldi',
    'uz-cyrl': 'кун қолди',
    'ru': 'дней осталось'
  },
  'dashboard-selected-items': {
    'uz-latn': 'ta tanlandi',
    'uz-cyrl': 'та танланди',
    'ru': 'выбрано'
  },
  'dashboard-archive-action': {
    'uz-latn': 'Arxivlash',
    'uz-cyrl': 'Архивлаш',
    'ru': 'Архивировать'
  },
  'dashboard-unarchive-action': {
    'uz-latn': 'Arxivdan chiqarish',
    'uz-cyrl': 'Архивдан чиқариш',
    'ru': 'Извлечь из архива'
  },
  'dashboard-delete-action': {
    'uz-latn': 'O\'chirish',
    'uz-cyrl': 'Ўчириш',
    'ru': 'Удалить'
  },
  'dashboard-watchlist': {
    'uz-latn': 'Kuzatuvga olish',
    'uz-cyrl': 'Кузатувга олиш',
    'ru': 'Добавить в избранное'
  },
  'dashboard-archive': {
    'uz-latn': 'Arxivlash',
    'uz-cyrl': 'Архивлаш',
    'ru': 'Архивировать'
  },
  'dashboard-delete': {
    'uz-latn': 'O\'chirish',
    'uz-cyrl': 'Ўчириш',
    'ru': 'Удалить'
  },
  
  // Competitors translations
  'competitors-elite-market-intelligence': {
    'uz-latn': 'Elite Market Intelligence',
    'uz-cyrl': 'Елит Маркет Интеллект',
    'ru': 'Elite Market Intelligence'
  },
  'competitors-analysis-and-market-intelligence': {
    'uz-latn': 'Raqobatchilar tahlili va bozor razvedkasi',
    'uz-cyrl': 'Рақобатчилар таҳлили ва бозор разведкаси',
    'ru': 'Анализ конкурентов и разведка рынка'
  },
  'competitors-back': {
    'uz-latn': 'Orqaga',
    'uz-cyrl': 'Орқага',
    'ru': 'Назад'
  },
  'competitors-total': {
    'uz-latn': 'Jami Raqobatchilar',
    'uz-cyrl': 'Жами Рақобатчилар',
    'ru': 'Всего конкурентов'
  },
  'competitors-high-risk': {
    'uz-latn': 'Yuqori Xavfli',
    'uz-cyrl': 'Юқори Хавфли',
    'ru': 'Высокий риск'
  },
  'competitors-active': {
    'uz-latn': 'Faol Raqobatchilar',
    'uz-cyrl': 'Фаол Рақобатчилар',
    'ru': 'Активные конкуренты'
  },
  'competitors-average-index': {
    'uz-latn': 'O\'rtacha Indeks',
    'uz-cyrl': 'Ўртacha Индекс',
    'ru': 'Средний индекс'
  },
  'competitors-search-placeholder': {
    'uz-latn': 'Raqobatchilarni qidirish...',
    'uz-cyrl': 'Рақобатчиларни қидириш...',
    'ru': 'Поиск конкурентов...'
  },
  'competitors-all': {
    'uz-latn': 'Barcha raqobatchilar',
    'uz-cyrl': 'Барча рақобатчилар',
    'ru': 'Все конкуренты'
  },
  'competitors-high-risk-filter': {
    'uz-latn': 'Yuqori xavfli',
    'uz-cyrl': 'Юқори хавфли',
    'ru': 'Высокий риск'
  },
  'competitors-frequent': {
    'uz-latn': 'Tez-tez uchraydigan',
    'uz-cyrl': 'Тез-тез учрайдиган',
    'ru': 'Часто встречающиеся'
  },
  'competitors-recent': {
    'uz-latn': 'Yaqinda faol',
    'uz-cyrl': 'Яқинда фаол',
    'ru': 'Недавно активные'
  },
  'competitors-winners': {
    'uz-latn': 'G\'oliblar',
    'uz-cyrl': 'Ғолиблар',
    'ru': 'Победители'
  },
  'competitors-sort-by-index': {
    'uz-latn': 'Raqobat indeksi ↓',
    'uz-cyrl': 'Рақобат индекси ↓',
    'ru': 'Индекс конкуренции ↓'
  },
  'competitors-sort-by-win-rate': {
    'uz-latn': 'G\'alaba foizi ↓',
    'uz-cyrl': 'Ғалаба фоизи ↓',
    'ru': 'Процент побед ↓'
  },
  'competitors-sort-by-appearances': {
    'uz-latn': 'Ko\'rinishlar ↓',
    'uz-cyrl': 'Кўринишлар ↓',
    'ru': 'Появления ↓'
  },
  'competitors-sort-by-activity': {
    'uz-latn': 'Faollik ↓',
    'uz-cyrl': 'Фаоллик ↓',
    'ru': 'Активность ↓'
  },
  'competitors-sort-by-market-share': {
    'uz-latn': 'Bozor ulushi ↓',
    'uz-cyrl': 'Бозор улуши ↓',
    'ru': 'Доля рынка ↓'
  },
  'competitors-table-view': {
    'uz-latn': 'Jadval',
    'uz-cyrl': 'Жадвал',
    'ru': 'Таблица'
  },
  'competitors-cards-view': {
    'uz-latn': 'Kartalar',
    'uz-cyrl': 'Карталар',
    'ru': 'Карточки'
  },
  'competitors-analytics-view': {
    'uz-latn': 'Tahlil',
    'uz-cyrl': 'Таҳлил',
    'ru': 'Анализ'
  },
  'competitors-no-data-title': {
    'uz-latn': 'Raqobatchilar Ma\'lumoti Yo\'q',
    'uz-cyrl': 'Рақобатчилар Маълумоти Йўқ',
    'ru': 'Нет информации о конкурентах'
  },
  'competitors-no-data-description': {
    'uz-latn': 'Raqobatchilar ro\'yxatini shakllantirish uchun, yakunlangan tenderlarga \'Yutqazdim\' statusini belgilab, g\'olib kompaniya nomini kiriting. Tizim avtomatik ravishda raqobatchilaringiz portretini yaratadi.',
    'uz-cyrl': 'Рақобатчилар рўйхатини шакллантириш учун, якунланган тендерларга \'Ютқаздим\' статусини белгилаб, ғолиб компания номини киритинг. Тизим автоматик равишда рақобатчиларингиз портретини яратади.',
    'ru': 'Чтобы сформировать список конкурентов, установите статус "Проигран" для завершенных тендеров и введите имя победившей компании. Система автоматически создаст портрет ваших конкурентов.'
  },
  'competitors-no-results-title': {
    'uz-latn': 'Natija Topilmadi',
    'uz-cyrl': 'Натижа Топилмади',
    'ru': 'Результаты не найдены'
  },
  'competitors-no-results-description': {
    'uz-latn': 'Qidiruv so\'rovingiz bo\'yicha hech narsa topilmadi. Iltimos, boshqa kalit so\'zlarni sinab ko\'ring.',
    'uz-cyrl': 'Қидирув сўровингиз бўйича ҳеч нарса топилмади. Илтимос, бошқа калит сўзларни синаб кўринг.',
    'ru': 'По вашему запросу ничего не найдено. Пожалуйста, попробуйте другие ключевые слова.'
  },
  'competitors-high-risk-label': {
    'uz-latn': 'Yuqori xavf',
    'uz-cyrl': 'Юқори хавф',
    'ru': 'Высокий риск'
  },
  'competitors-medium-risk-label': {
    'uz-latn': 'O\'rta xavf',
    'uz-cyrl': 'Ўрта хавф',
    'ru': 'Средний риск'
  },
  'competitors-low-risk-label': {
    'uz-latn': 'Past xavf',
    'uz-cyrl': 'Паст хавф',
    'ru': 'Низкий риск'
  },
  'competitors-competitive-index': {
    'uz-latn': 'Raqobat Indeksi',
    'uz-cyrl': 'Рақобат Индекси',
    'ru': 'Индекс конкуренции'
  },
  'competitors-market-share-value': {
    'uz-latn': 'Bozor ulushi',
    'uz-cyrl': 'Бозор улуши',
    'ru': 'Доля рынка'
  },
  'competitors-last-encounter-value': {
    'uz-latn': 'Oxirgi uchrashuv',
    'uz-cyrl': 'Охирги учрашув',
    'ru': 'Последняя встреча'
  },
  'competitors-appearances-value': {
    'uz-latn': 'Ko\'rinishlar',
    'uz-cyrl': 'Кўринишлар',
    'ru': 'Появления'
  },
  'competitors-wins-value': {
    'uz-latn': 'G\'alabalar',
    'uz-cyrl': 'Ғалабалар',
    'ru': 'Победы'
  },
  'competitors-win-percentage-value': {
    'uz-latn': 'G\'alaba %',
    'uz-cyrl': 'Ғалаба %',
    'ru': 'Победы %'
  },
  'competitors-actions-value': {
    'uz-latn': 'Amallar',
    'uz-cyrl': 'Амаллар',
    'ru': 'Действия'
  },
  'competitors-remove-bookmark-value': {
    'uz-latn': 'Saqlangandan olib tashlash',
    'uz-cyrl': 'Сақлангандан олиб ташлаш',
    'ru': 'Удалить из сохраненных'
  },
  'competitors-bookmark-value': {
    'uz-latn': 'Saqlash',
    'uz-cyrl': 'Сақлаш',
    'ru': 'Сохранить'
  },
  'competitors-market-dominance-value': {
    'uz-latn': 'Bozor Hukmronligi Tahlili',
    'uz-cyrl': 'Бозор Ҳукмронлиги Таҳлили',
    'ru': 'Анализ доминирования на рынке'
  },
  'competitors-high-threat-competitors-value': {
    'uz-latn': 'Yuqori Xavfli Raqobatchilar',
    'uz-cyrl': 'Юқори Хавфли Рақобатчилар',
    'ru': 'Высокорисковые конкуренты'
  },
  'competitors-successful-competitors-value': {
    'uz-latn': 'Eng Muvaffaqiyatli Raqobatchilar',
    'uz-cyrl': 'Энг Муваффақиятли Рақобатчилар',
    'ru': 'Самые успешные конкуренты'
  },
  'competitor-analysis-title': {
    'uz-latn': 'Raqobatchilar tahlili va bozor razvedkasi',
    'uz-cyrl': 'Рақобатчилар таҳлили ва бозор разведкаси',
    'ru': 'Анализ конкурентов и разведка рынка'
  },
  'competitor-analysis-value': {
    'uz-latn': 'Raqobatchilar',
    'uz-cyrl': 'Рақобатчилар',
    'ru': 'Конкуренты'
  },
  'ai-broker-elite-analysis-system': {
    'uz-latn': 'AI-Broker Elite Tahlil Tizimi',
    'uz-cyrl': 'АИ-Брокер Елит Тахлил Тизими',
    'ru': 'Система анализа AI-Broker Elite'
  },
  'ai-broker-elite-analysis-system-description': {
    'uz-latn': 'Eng ilgʻor AI texnologiyasi bilan tenderlaringizni tahlil qiling va raqobatchilardan ustun keling',
    'uz-cyrl': 'Энг илғор АИ технологияси билан тендерларингизни таҳлил қилинг ва рақобатчилардан устун келинг',
    'ru': 'Анализируйте свои тендеры с помощью передовых технологий ИИ и опережайте конкурентов'
  },
  'file-upload-instruction': {
    'uz-latn': 'Fayllarni tanlang yoki bu yerga torting',
    'uz-cyrl': 'Файлларни танланг ёки бу ерга тортиң',
    'ru': 'Выберите файлы или перетащите их сюда'
  },
  'file-upload-subtitle': {
    'uz-latn': 'Hujjatlar, texnik xususiyatlar, shartnomalar',
    'uz-cyrl': 'Ҳужжатлар, техник хусусиятлар, шартномалар',
    'ru': 'Документы, технические характеристики, контракты'
  },
  'file-upload-button': {
    'uz-latn': 'Fayl Tanlash',
    'uz-cyrl': 'Файл Танлаш',
    'ru': 'Выбрать файл'
  },
  'file-upload-limit': {
    'uz-latn': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (har biri max 10MB)',
    'uz-cyrl': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (ҳар бири макс 10МБ)',
    'ru': '.pdf, .doc(x), .xls(x), .txt, .png, .jpg (каждый макс. 10 МБ)'
  },
  'selected-files': {
    'uz-latn': 'Tanlangan fayllar:',
    'uz-cyrl': 'Танланган файллар:',
    'ru': 'Выбранные файлы:'
  },
  'financial-settings': {
    'uz-latn': 'Moliyaviy Sozlamalar',
    'uz-cyrl': 'Молиявий Созламалар',
    'ru': 'Финансовые настройки'
  },
  'vat-calculation': {
    'uz-latn': 'QQS bilan hisoblash',
    'uz-cyrl': 'ҚҚС билан ҳисоблаш',
    'ru': 'Расчет с НДС'
  },
  'vat-calculation-tooltip': {
    'uz-latn': 'Agar yoqilgan bo\'lsa, narx hisob-kitoblariga Profil sozlamalarida ko\'rsatilgan QQS foizi qo\'shiladi. Agar o\'chirilgan bo\'lsa, QQS 0% deb hisoblanadi.',
    'uz-cyrl': 'Агар ёқилган бўлса, нарх ҳисоб-китобларига Профил созламаларида кўрсатилган ҚҚС фоизи қўшилади. Агар ўчирилган бўлса, ҚҚС 0% деб ҳисобланади.',
    'ru': 'Если включено, к расчетам цены будет добавлен процент НДС, указанный в настройках профиля. Если выключено, НДС считается 0%.'
  },
  'additional-costs': {
    'uz-latn': 'Qo\'shimcha xarajatlar (bir martalik)',
    'uz-cyrl': 'Қўшимча харажатлар (бир марталик)',
    'ru': 'Дополнительные расходы (одноразовые)'
  },
  'additional-costs-tooltip': {
    'uz-latn': 'Logistika, bojxona, sertifikatlash kabi tenderga xos bo\'lgan qo\'shimcha xarajatlarni qo\'shing. Bu xarajatlar to\'g\'ridan-to\'g\'ri tannarxga qo\'shiladi.',
    'uz-cyrl': 'Логистика, божхона, сертификатлаш каби тендерга хос бўлган қўшимча харажатларни қўшинг. Бу харажатлар тўғридан-тўғри таннархга қўшилади.',
    'ru': 'Добавьте дополнительные расходы, характерные для тендера, такие как логистика, таможня, сертификация. Эти расходы добавляются прямо к себестоимости.'
  },
  'add-cost': {
    'uz-latn': 'Qo\'shish',
    'uz-cyrl': 'Қўшиш',
    'ru': 'Добавить'
  },
  'cost-description-placeholder': {
    'uz-latn': 'Xarajat izohi (masalan, Logistika)',
    'uz-cyrl': 'Харажат изоҳи (масалан, Логистика)',
    'ru': 'Описание расхода (например, Логистика)'
  },
  'cost-amount-placeholder': {
    'uz-latn': 'Summa (UZS)',
    'uz-cyrl': 'Сумма (УЗС)',
    'ru': 'Сумма (UZS)'
  },
  'select-platform': {
    'uz-latn': 'Manba-platformani tanlang',
    'uz-cyrl': 'Манба-платформани танланг',
    'ru': 'Выберите источник-платформу'
  },
  'select-platform-tooltip': {
    'uz-latn': 'AI tahlilni tanlangan platformaning o\'ziga xos jihatlarini hisobga olgan holda amalga oshiradi. To\'g\'ri tanlov tahlil aniqligini oshiradi.',
    'uz-cyrl': 'АИ таҳлилни танланган платформанинг ўзига хос жиҳатларини ҳисобга олган ҳолда амалга оширади. Тўғри танлов таҳлил аниқлигини оширади.',
    'ru': 'ИИ анализ проводится с учетом специфических особенностей выбранной платформы. Правильный выбор повышает точность анализа.'
  },
  'primary-platform': {
    'uz-latn': 'UzEx - Asosiy platforma',
    'uz-cyrl': 'УзЕх - Асосий платформа',
    'ru': 'UzEx - Основная платформа'
  },
  'alternative-platform': {
    'uz-latn': 'XTXarid - Muqobil platforma',
    'uz-cyrl': 'ХТХарид - Муқобил платформа',
    'ru': 'XTXarid - Альтернативная платформа'
  },
  'next-step': {
    'uz-latn': 'Keyingi Qadam:',
    'uz-cyrl': 'Кейинги Қадам:',
    'ru': 'Следующий шаг:'
  },
  'next-step-description': {
    'uz-latn': 'Tahlilni boshlaganingizdan so\'ng, AI avval internetdan potentsial ta\'minotchilarni qidiradi. Keyin siz ulardan eng ma\'qullarini tanlab, yakuniy moliyaviy tahlilni yaratasiz.',
    'uz-cyrl': 'Таҳлилни бошлаганингиздан сўнг, АИ аввал интернетдан потенциал таъминотчиларни қидиради. Кейин сиз улардан энг маъқулларини танлаб, якуний молиявий таҳлилни яратасиз.',
    'ru': 'После начала анализа ИИ сначала ищет потенциальных поставщиков в интернете. Затем вы выбираете из них наиболее подходящих и создаете окончательный финансовый анализ.'
  },
  'start-analysis': {
    'uz-latn': 'Tahlilni Boshlash',
    'uz-cyrl': 'Таҳлилни Бошлаш',
    'ru': 'Начать анализ'
  },
  'delete-contract-confirm': {
    'uz-latn': 'Bu shartnoma tahlilini o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.',
    'uz-cyrl': 'Бу шартнома таҳлилини ўчиришмоқчимисиз? Бу амални қайтариб бўлмайди.',
    'ru': 'Вы действительно хотите удалить этот анализ контракта? Это действие нельзя отменить.'
  }
};

// Function to set the current language
export function setLanguage(lang: 'uz-latn' | 'uz-cyrl' | 'ru') {
  currentLanguage = lang;
  // Dispatch event to notify components of language change
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Function to get the current language
export function getCurrentLanguage(): 'uz-latn' | 'uz-cyrl' | 'ru' {
  return currentLanguage;
}

// Function to get translated text by key
export function t(key: string): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }
  
  return translation[currentLanguage] || translation['uz-latn'] || key;
}

// Initialize with default language from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | null;
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
}

// Listen for language changes and save to localStorage
window.addEventListener('languageChanged', (event: CustomEvent) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('ai-broker-language', event.detail);
  }
});

// Ensure the language is properly set on page load
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLanguage = window.localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | null;
  if (savedLanguage) {
    currentLanguage = savedLanguage;
    // Dispatch event to notify components of language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: savedLanguage }));
  }
}

export default {
  t,
  setLanguage,
  getCurrentLanguage
};