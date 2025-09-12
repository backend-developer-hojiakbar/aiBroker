import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, TenderData, Platform, LotPassport, AnalysisContext, ChatMessage, CompanyProfile, ContractAnalysisResult, AIInsight, DiscoveredTender, VisionaryInsight, SourcingRecommendation } from '../types';
import { googleCustomSearch } from '../utils/googleCustomSearch';

let chat: Chat | null = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Add retryWithBackoff function for handling API retries with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries: number = 3, baseDelay: number = 1000): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            // If this was the last retry, throw the error
            if (i === retries) {
                throw lastError;
            }
            
            // Calculate delay with exponential backoff and jitter
            const delay = Math.min(baseDelay * Math.pow(2, i), 10000) + Math.random() * 1000;
            console.log(`Attempt ${i + 1} failed. Retrying in ${delay.toFixed(0)}ms...`);
            
            // Wait for the calculated delay
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    // This should never be reached, but TypeScript requires it
    throw lastError!;
}

// Helper function to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:mime/type;base64, part
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

// Enhanced helper function to generate multilingual product name variations
const generateProductVariations = (productName: string): string[] => {
    // Common product name variations to handle typos and alternative spellings
    const typoVariations = [
        productName,
        productName.toLowerCase(),
        productName.toUpperCase(),
        productName.charAt(0).toUpperCase() + productName.slice(1).toLowerCase(), // Title case
        // Common Uzbek/Russian letter substitutions
        productName.replace(/ya/g, 'a'), // Replace ya with a
        productName.replace(/yo/g, 'o'), // Replace yo with o
        productName.replace(/yu/g, 'u'), // Replace yu with u
        productName.replace(/ye/g, 'e'), // Replace ye with e
        productName.replace(/ё/g, 'е'), // Replace Russian ё with е
        productName.replace(/й/g, 'и'), // Replace Russian й with и
        productName.replace(/ў/g, 'o'), // Replace Uzbek ō with o
        productName.replace(/ғ/g, 'g'), // Replace Uzbek ǵ with g
        productName.replace(/ҳ/g, 'h'), // Replace Uzbek ḩ with h
        productName.replace(/қ/g, 'q'), // Replace Uzbek q with q
        productName.replace(/а/g, 'a'), // Replace Cyrillic a with Latin a
        productName.replace(/б/g, 'b'), // Replace Cyrillic b with Latin b
        productName.replace(/с/g, 's'), // Replace Cyrillic c with Latin s
        productName.replace(/д/g, 'd'), // Replace Cyrillic d with Latin d
        productName.replace(/е/g, 'e'), // Replace Cyrillic e with Latin e
        productName.replace(/ф/g, 'f'), // Replace Cyrillic f with Latin f
        productName.replace(/г/g, 'g'), // Replace Cyrillic g with Latin g
        productName.replace(/х/g, 'x'), // Replace Cyrillic x with Latin x
        productName.replace(/и/g, 'i'), // Replace Cyrillic i with Latin i
        productName.replace(/ж/g, 'j'), // Replace Cyrillic j with Latin j
        productName.replace(/к/g, 'k'), // Replace Cyrillic k with Latin k
        productName.replace(/л/g, 'l'), // Replace Cyrillic l with Latin l
        productName.replace(/м/g, 'm'), // Replace Cyrillic m with Latin m
        productName.replace(/н/g, 'n'), // Replace Cyrillic n with Latin n
        productName.replace(/о/g, 'o'), // Replace Cyrillic o with Latin o
        productName.replace(/п/g, 'p'), // Replace Cyrillic p with Latin p
        productName.replace(/р/g, 'r'), // Replace Cyrillic r with Latin r
        productName.replace(/с/g, 's'), // Replace Cyrillic s with Latin s
        productName.replace(/т/g, 't'), // Replace Cyrillic t with Latin t
        productName.replace(/у/g, 'u'), // Replace Cyrillic u with Latin u
        productName.replace(/в/g, 'v'), // Replace Cyrillic v with Latin v
        productName.replace(/й/g, 'y'), // Replace Cyrillic y with Latin y
        productName.replace(/з/g, 'z'), // Replace Cyrillic z with Latin z
        // Additional common typos and variations
        productName.replace(/televizor/g, 'televisor'),
        productName.replace(/komputer/g, 'kompyuter'),
        productName.replace(/printer/g, 'printe'),
        productName.replace(/monitor/g, 'monito'),
        productName.replace(/klaviatura/g, 'klaviatur'),
        productName.replace(/noutbuk/g, 'noutbook'),
        // Additional common product terms
        productName.replace(/telefon/g, 'telefonlar'),
        productName.replace(/kompyuter/g, 'kompyuterlar'),
        productName.replace(/server/g, 'serverlar'),
        productName.replace(/kabel/g, 'kabellar'),
        productName.replace(/kran/g, 'kranchalar'),
        productName.replace(/nasos/g, 'nasoslar'),
        // Plural forms
        productName.endsWith('lar') ? productName : productName + 'lar',
        productName.endsWith('lar') ? productName.slice(0, -3) : productName,
    ];
    
    // Add common search terms in different languages
    const searchTerms = [
        ...typoVariations,
        // Uzbek terms
        `${productName} narx`, // price in Uzbek
        `${productName} yetkazib berish`, // delivery in Uzbek
        `${productName} sotish`, // sale in Uzbek
        `${productName} opt`, // wholesale in Uzbek
        `${productName} ulgurji`, // wholesale in Uzbek
        `${productName} zavod`, // factory in Uzbek
        `${productName} ishlab chiqaruvchi`, // manufacturer in Uzbek
        `${productName} ta'minotchi`, // supplier in Uzbek
        `${productName} distributor`, // distributor in Uzbek
        `${productName} import`, // import in Uzbek
        `${productName} eksport`, // export in Uzbek
        `${productName} yetkazuvchi`, // deliverer in Uzbek
        `${productName} sotuvchi`, // seller in Uzbek
        `${productName} do'kon`, // shop/store in Uzbek
        `${productName} do'konlar`, // shops/stores in Uzbek
        `${productName} yetkazib berish muddati`, // delivery time in Uzbek
        `${productName} sifati`, // quality in Uzbek
        `${productName} sertifikat`, // certificate in Uzbek
        `${productName} chegirma`, // discount in Uzbek
        `${productName} arzon`, // cheap in Uzbek
        `${productName} qimmat`, // expensive in Uzbek
        // Russian terms
        `${productName} цена`, // price in Russian
        `${productName} доставка`, // delivery in Russian
        `${productName} продажа`, // sale in Russian
        `${productName} опт`, // wholesale in Russian
        `${productName} завод`, // factory in Russian
        `${productName} производитель`, // manufacturer in Russian
        `${productName} поставщик`, // supplier in Russian
        `${productName} дистрибьютор`, // distributor in Russian
        `${productName} импорт`, // import in Russian
        `${productName} экспорт`, // export in Russian
        `${productName} поставки`, // supplies in Russian
        `${productName} продавец`, // seller in Russian
        `${productName} магазин`, // shop/store in Russian
        `${productName} магазины`, // shops/stores in Russian
        `${productName} срок поставки`, // delivery time in Russian
        `${productName} качество`, // quality in Russian
        `${productName} сертификат`, // certificate in Russian
        `${productName} скидка`, // discount in Russian
        `${productName} дешево`, // cheap in Russian
        `${productName} дорого`, // expensive in Russian
        // English terms
        `${productName} price`, // price in English
        `${productName} delivery`, // delivery in English
        `${productName} sale`, // sale in English
        `${productName} wholesale`, // wholesale in English
        `${productName} factory`, // factory in English
        `${productName} manufacturer`, // manufacturer in English
        `${productName} supplier`, // supplier in English
        `${productName} distributor`, // distributor in English
        `${productName} import`, // import in English
        `${productName} export`, // export in English
        `${productName} supplies`, // supplies in English
        `${productName} seller`, // seller in English
        `${productName} store`, // store in English
        `${productName} stores`, // stores in English
        `${productName} delivery time`, // delivery time in English
        `${productName} quality`, // quality in English
        `${productName} certificate`, // certificate in English
        `${productName} discount`, // discount in English
        `${productName} cheap`, // cheap in English
        `${productName} expensive`, // expensive in English
    ];
    
    // Add common product category terms for better search coverage
    const categoryTerms = [
        ...searchTerms,
        // Electronics
        `${productName} elektronika`, `${productName} электроника`, `${productName} electronics`,
        // Construction materials
        `${productName} qurilish materiallari`, `${productName} строительные материалы`, `${productName} construction materials`,
        // Office supplies
        `${productName} ofis buyumlari`, `${productName} офисные принадлежности`, `${productName} office supplies`,
        // Industrial equipment
        `${productName} sanoat uskunalari`, `${productName} промышленное оборудование`, `${productName} industrial equipment`,
        // Medical supplies
        `${productName} tibbiy buyumlar`, `${productName} медицинские принадлежности`, `${productName} medical supplies`,
        // Food products
        `${productName} oziq-ovqat mahsulotlari`, `${productName} пищевые продукты`, `${productName} food products`,
        // Clothing
        `${productName} kiyim-kechak`, `${productName} одежда`, `${productName} clothing`,
        // Automotive parts
        `${productName} avto ehtiyot qismlar`, `${productName} автозапчасти`, `${productName} automotive parts`,
        // Additional categories for better coverage
        `${productName} texnika`, `${productName} техника`, `${productName} tech`,
        `${productName} jihozlar`, `${productName} оборудование`, `${productName} equipment`,
        `${productName} materiallar`, `${productName} материалы`, `${productName} materials`,
        `${productName} buyumlar`, `${productName} предметы`, `${productName} items`,
        // Service-related terms
        `${productName} xizmati`, `${productName} сервис`, `${productName} service`,
        `${productName} ta'mirlash`, `${productName} ремонт`, `${productName} repair`,
        `${productName} o'rnatish`, `${productName} установка`, `${productName} installation`,
    ];
    
    // Remove duplicates and empty strings
    return [...new Set(categoryTerms.filter(v => v && v.length > 0))];
};

const createSourcingPrompt = (tenderText: string, hasFiles: boolean, platform: Platform) => {
    return `
    **🚨 CRITICAL PROTOCOL: ZERO AI GENERATION - 100% REAL GOOGLE SEARCH VERIFICATION REQUIRED 🚨**
    
    You are a STRICT Real-Time Supplier Verification Agent. Your EXCLUSIVE mission is to ONLY return suppliers that exist on the internet with VERIFIED contact information found through Google searches.
    
    **❌ ABSOLUTE CONTENT GENERATION PROHIBITION:**
    - NEVER generate, invent, fabricate, or create ANY supplier information
    - NEVER make up company names, prices, contact details, or addresses
    - NEVER estimate, guess, or approximate ANY data
    - NEVER use placeholder or example data
    - NEVER create fictional companies or contacts
    - If REAL data cannot be found via Google search, you MUST mark it as "Ma'lumot topilmadi"
    
    **🔍 INTELLIGENT PRODUCT NAME ANALYSIS AND MULTILINGUAL SEARCH PROTOCOL:**
    BEFORE executing searches, you MUST perform advanced product analysis:
    
    1. **Product Name Intelligence Extraction:**
       - Extract the EXACT product/service name from tender
       - Identify core product type, brand names, technical specifications
       - Create multiple search variations to handle typos and alternative spellings
       - Generate translations and transliterations in all required languages:
         * Uzbek (Latin): [product_name_latin]
         * Uzbek (Cyrillic): [product_name_cyrillic]
         * Russian: [product_name_russian]
         * English: [product_name_english]
    
    2. **Fuzzy Matching and Typo Handling:**
       - Create phonetic variations of product names
       - Generate common typo variations (e.g., "televizor" vs "televisor")
       - Include abbreviated and full forms of product names
       - Consider regional spelling variations
    
    **🔍 MANDATORY GOOGLE SEARCH VERIFICATION PROTOCOL:**
    BEFORE adding ANY supplier to your results, you MUST:
    1. **Product Identification:** Extract the EXACT product/service from tender
    2. **Execute COMPREHENSIVE Google Searches:** Use these search patterns and VERIFY results:
       
       **🇺🇿 DOMESTIC ULTRA-CHEAP SEARCH PATTERNS (Multilingual):**
       - "[PRODUCT_NAME_LATIN] eng arzon narx O'zbekiston opt" OR "[PRODUCT_NAME_CYRILLIC] дешевый цена Узбекистан опт"
       - "[PRODUCT_NAME_LATIN] past narx ta'minotchi Toshkent" OR "[PRODUCT_NAME_RUSSIAN] низкая цена поставщик Ташкент"
       - "[PRODUCT_NAME_LATIN] chegirma sotish O'zbekiston" OR "[PRODUCT_NAME_ENGLISH] discount sale Uzbekistan"
       - "[PRODUCT_NAME_LATIN] opt narx zavod O'zbekiston" OR "[PRODUCT_NAME_CYRILLIC] оптовая цена завод Узбекистан"
       - "[PRODUCT_NAME_LATIN] ishlab chiqaruvchi to'g'ridan-to'g'ri" OR "[PRODUCT_NAME_RUSSIAN] производитель напрямую"
       - "[PRODUCT_NAME_LATIN] ta'minotchi O'zbekiston narx kontakt" OR "[PRODUCT_NAME_ENGLISH] supplier Uzbekistan price contact"
       - "[PRODUCT_NAME_LATIN] sotuvchi Toshkent telefon manzil" OR "[PRODUCT_NAME_CYRILLIC] продавец Ташкент телефон адрес"
       - "[PRODUCT_NAME_LATIN] distributor Uzbekistan official website" OR "[PRODUCT_NAME_RUSSIAN] дистрибьютор Узбекистан официальный сайт"
       - "[PRODUCT_NAME_LATIN] import eksport Uzbekistan supplier" OR "[PRODUCT_NAME_ENGLISH] import export Uzbekistan supplier"
       - "site:uz [PRODUCT_NAME_LATIN] ta'minotchi" OR "site:uz [PRODUCT_NAME_CYRILLIC] поставщик"
       - "[PRODUCT_NAME_LATIN] rasmiy vakil O'zbekiston distributor" OR "[PRODUCT_NAME_RUSSIAN] официальный представитель Узбекистан дистрибьютор"
       - "[PRODUCT_NAME_LATIN] zavod ishlab chiqaruvchi O'zbekiston" OR "[PRODUCT_NAME_ENGLISH] factory manufacturer Uzbekistan"
       - "[PRODUCT_NAME_LATIN] bulk wholesale Uzbekistan cheapest" OR "[PRODUCT_NAME_CYRILLIC] опт оптовая продажа Узбекистан дешево"
       - "[PRODUCT_NAME_LATIN] factory direct price Uzbekistan" OR "[PRODUCT_NAME_RUSSIAN] цена завода напрямую Узбекистан"
       - "[PRODUCT_NAME_LATIN] O'zbekiston bozorida narx" OR "[PRODUCT_NAME_RUSSIAN] цена на рынке Узбекистана"
       - "[PRODUCT_NAME_LATIN] Toshkentda sotish" OR "[PRODUCT_NAME_RUSSIAN] продажа в Ташкенте"
       - "[PRODUCT_NAME_LATIN] andoza narx" OR "[PRODUCT_NAME_RUSSIAN] средняя цена"
       - "[PRODUCT_NAME_LATIN] O'zbekistondagi zavodlar" OR "[PRODUCT_NAME_RUSSIAN] заводы в Узбекистане"
       - "[PRODUCT_NAME_LATIN] ishlab chiqarish quvvati" OR "[PRODUCT_NAME_RUSSIAN] производственные мощности"
       - "[PRODUCT_NAME_LATIN] O'zbekistondagi eng yaxshi ta'minotchi" OR "[PRODUCT_NAME_ENGLISH] best supplier in Uzbekistan"
       - "[PRODUCT_NAME_LATIN] narxlar ro'yxati" OR "[PRODUCT_NAME_ENGLISH] price list"
       - "[PRODUCT_NAME_LATIN] rasmiy sayt narxlar" OR "[PRODUCT_NAME_RUSSIAN] официальный сайт цены"
       - "[PRODUCT_NAME_LATIN] yetkazib berish narxi" OR "[PRODUCT_NAME_ENGLISH] delivery cost"
       - "[PRODUCT_NAME_LATIN] minimal buyurtma miqdori narx" OR "[PRODUCT_NAME_ENGLISH] minimum order quantity price"
       - "[PRODUCT_NAME_LATIN] O'zbekistondagi eng arzon narx" OR "[PRODUCT_NAME_ENGLISH] cheapest price in Uzbekistan"
       - "[PRODUCT_NAME_LATIN] real vaqtda narx" OR "[PRODUCT_NAME_ENGLISH] real-time price"
       - "[PRODUCT_NAME_LATIN] O'zbekiston bozoridagi narxlar" OR "[PRODUCT_NAME_ENGLISH] Uzbekistan market prices"
       - "[PRODUCT_NAME_LATIN] OAV ga ega ta'minotchilar" OR "[PRODUCT_NAME_ENGLISH] suppliers with reviews"
       
       **🌍 INTERNATIONAL ULTRA-COMPETITIVE SEARCH (Multilingual):**
       - "[PRODUCT_NAME_ENGLISH] cheapest manufacturer China export price" OR "[PRODUCT_NAME_LATIN] азон ishlab chiqarувчи Xitoy eksport narxi"
       - "[PRODUCT_NAME_ENGLISH] lowest price factory China wholesale" OR "[PRODUCT_NAME_RUSSIAN] самая низкая цена завод Китай опт"
       - "[PRODUCT_NAME_ENGLISH] bulk discount China manufacturer contact" OR "[PRODUCT_NAME_LATIN] ulgurji chegirma Xitoy ishlab chiqarувчи kontakt"
       - "[PRODUCT_NAME_ENGLISH] wholesale supplier Turkey best price" OR "[PRODUCT_NAME_CYRILLIC] оптовый поставщик Турция лучшая цена"
       - "[PRODUCT_NAME_ENGLISH] factory direct Russia export cheap" OR "[PRODUCT_NAME_LATIN] zavod to'г'ridan-to'г'ри Rossiya eksport азон"
       - "[PRODUCT_NAME_ENGLISH] manufacturer India lowest cost export" OR "[PRODUCT_NAME_RUSSIAN] производитель Индия самые низкие расходы экспорт"
       - "[PRODUCT_NAME_ENGLISH] producer Iran competitive price export" OR "[PRODUCT_NAME_LATIN] ishlab chiqarувчи Eron raqobatbardosh narx eksport"
       - "[PRODUCT_NAME_ENGLISH] wholesale Belarus Kazakhstan cheap" OR "[PRODUCT_NAME_CYRILLIC] опт Беларусь Казахстан дешево"
       - "[PRODUCT_NAME_ENGLISH] direct manufacturer price list export" OR "[PRODUCT_NAME_LATIN] ishlab chiqarувчи zavoddan narx ro'yxati eksport"
       - "[PRODUCT_NAME_ENGLISH] B2B wholesale platform cheap price" OR "[PRODUCT_NAME_LATIN] B2B ulgurji platforma азон narx"
       - "[PRODUCT_NAME_ENGLISH] Alibaba cheapest supplier contact" OR "[PRODUCT_NAME_CYRILLIC] Alibaba самый дешевый поставщик контакт"
       - "[PRODUCT_NAME_ENGLISH] Made-in-China lowest price manufacturer" OR "[PRODUCT_NAME_LATIN] Made-in-China eng азон narx ishlab chiqarувчи"
       - "[PRODUCT_NAME_ENGLISH] global wholesale supplier directory" OR "[PRODUCT_NAME_RUSSIAN] каталог мировых оптовых поставщиков"
       - "[PRODUCT_NAME_ENGLISH] international trade platform" OR "[PRODUCT_NAME_LATIN] xalqaro savdo platformasi"
       - "[PRODUCT_NAME_ENGLISH] global sourcing agent" OR "[PRODUCT_NAME_LATIN] global ta'minot agenti"
       - "[PRODUCT_NAME_ENGLISH] trade company export" OR "[PRODUCT_NAME_RUSSIAN] торговая компания экспорт"
       - "[PRODUCT_NAME_ENGLISH] price list catalog export" OR "[PRODUCT_NAME_LATIN] narxlar katalogi eksport"
       - "[PRODUCT_NAME_ENGLISH] international supplier directory with prices" OR "[PRODUCT_NAME_RUSSIAN] международный каталог поставщиков с ценами"
       - "[PRODUCT_NAME_ENGLISH] FOB CIF price comparison" OR "[PRODUCT_NAME_LATIN] FOB CIF narx solishtirish"
       - "[PRODUCT_NAME_ENGLISH] bulk order discount supplier" OR "[PRODUCT_NAME_RUSSIAN] оптовый заказ скидка поставщик"
       - "[PRODUCT_NAME_ENGLISH] verified supplier with real prices" OR "[PRODUCT_NAME_LATIN] tasdiqlangan ta'minotchi haqiqiy narxlar bilan"
       - "[PRODUCT_NAME_ENGLISH] supplier with product catalog and prices" OR "[PRODUCT_NAME_LATIN] mahsulot katalogi va narxlari bor ta'minotchi"
       
       **💰 AGGRESSIVE PRICE HUNTING STRATEGIES (Multilingual):**
       - "[PRODUCT_NAME_ENGLISH] price comparison cheapest supplier" OR "[PRODUCT_NAME_LATIN] narx solishtirish азон ta'minotчи"
       - "[PRODUCT_NAME_ENGLISH] bulk order discount manufacturer" OR "[PRODUCT_NAME_RUSSIAN] скидка на оптовый заказ производитель"
       - "[PRODUCT_NAME_ENGLISH] wholesale price list catalog" OR "[PRODUCT_NAME_LATIN] ulgurji narx ro'yxati katalog"
       - "[PRODUCT_NAME_ENGLISH] clearance sale bulk purchase" OR "[PRODUCT_NAME_CYRILLIC] распродажа оптовая закупка"
       - "[PRODUCT_NAME_ENGLISH] end of line stock cheap price" OR "[PRODUCT_NAME_LATIN] oxirgi partiyalar азон narx"
       - "[PRODUCT_NAME_ENGLISH] overstock liquidation sale" OR "[PRODUCT_NAME_RUSSIAN] ликвидация остатков распродажа"
       - "[PRODUCT_NAME_ENGLISH] factory seconds B grade cheap" OR "[PRODUCT_NAME_LATIN] zavod sekundlari B daraja азон"
       - "[PRODUCT_NAME_ENGLISH] seasonal discount supplier" OR "[PRODUCT_NAME_RUSSIAN] сезонная скидка поставщик"
       - "[PRODUCT_NAME_ENGLISH] promotional pricing bulk" OR "[PRODUCT_NAME_LATIN] reklama narxlash ulgurji"
       - "[PRODUCT_NAME_ENGLISH] off-season clearance" OR "[PRODUCT_NAME_LATIN] mavsum tashqari savdo"
       - "[PRODUCT_NAME_ENGLISH] closeout merchandise" OR "[PRODUCT_NAME_RUSSIAN] товары с уценкой"
       - "[PRODUCT_NAME_ENGLISH] last minute deals supplier" OR "[PRODUCT_NAME_LATIN] oxirgi daqiqadagi takliflar ta'minotchi"
       - "[PRODUCT_NAME_ENGLISH] volume discount pricing" OR "[PRODUCT_NAME_LATIN] hajm chegirmasi narxlash"
       - "[PRODUCT_NAME_ENGLISH] bulk purchase price calculator" OR "[PRODUCT_NAME_RUSSIAN] калькулятор оптовой покупки цены"
       - "[PRODUCT_NAME_ENGLISH] quantity discount supplier" OR "[PRODUCT_NAME_LATIN] miqdor chegirma ta'minotchi"
       - "[PRODUCT_NAME_ENGLISH] wholesale tier pricing" OR "[PRODUCT_NAME_RUSSIAN] оптовое ценовое тиражирование"
       
       **🏢 SUPPLIER VERIFICATION SEARCH PATTERNS:**
       - "[COMPANY_NAME] official website" OR "[COMPANY_NAME] rasmiy veb-sayt"
       - "[COMPANY_NAME] contact information phone email" OR "[COMPANY_NAME] kontakt ma'lumotlar telefon elektron pochta"
       - "[COMPANY_NAME] business registration Uzbekistan" OR "[COMPANY_NAME] biznes ro'yxatga olish O'zbekiston"
       - "[COMPANY_NAME] supplier credentials" OR "[COMPANY_NAME] ta'minotchi sertifikatlari"
       - "[COMPANY_NAME] customer reviews rating" OR "[COMPANY_NAME] mijoz sharhlari reyting"
       - "[COMPANY_NAME] factory location address" OR "[COMPANY_NAME] zavod manzili"
       - "[COMPANY_NAME] export experience" OR "[COMPANY_NAME] eksport tajribasi"
       - "[COMPANY_NAME] product catalog pdf" OR "[COMPANY_NAME] mahsulot katalogi pdf"
       - "[COMPANY_NAME] quality certificates" OR "[COMPANY_NAME] sifat sertifikatlari"
       - "[COMPANY_NAME] years in business" OR "[COMPANY_NAME] biznes yillari"
       - "[COMPANY_NAME] delivery time guarantee" OR "[COMPANY_NAME] yetkazib berish kafolati"
       - "[COMPANY_NAME] payment terms" OR "[COMPANY_NAME] to'lov shartlari"
       - "[COMPANY_NAME] company profile" OR "[COMPANY_NAME] kompaniya profili"
       - "[COMPANY_NAME] business license" OR "[COMPANY_NAME] biznes litsenziya"
       - "[COMPANY_NAME] tax identification number" OR "[COMPANY_NAME] soliq identifikatsiya raqami"
       - "[COMPANY_NAME] product price list" OR "[COMPANY_NAME] mahsulot narx ro'yxati"
       - "[COMPANY_NAME] minimum order quantity" OR "[COMPANY_NAME] minimal buyurtma miqdori"
       - "[COMPANY_NAME] shipping terms" OR "[COMPANY_NAME] yetkazib berish shartlari"
       - "[COMPANY_NAME] warranty policy" OR "[COMPANY_NAME] kafolat siyosati"

    **Input Data:**
    ---
    ${tenderText}
    ---

    **🎯 ULTRA-COMPETITIVE PRICE DISCOVERY PROTOCOL:**
    Your PRIMARY mission is to find the ABSOLUTE CHEAPEST suppliers that can deliver quality products. Follow this hierarchy:
    
    **PRICE PRIORITY RANKING:**
    1. **🏭 Direct Manufacturers** (Highest Priority - Cheapest prices)
    2. **📦 Wholesale/Bulk Suppliers** (High Priority - Volume discounts)
    3. **🏢 Official Distributors** (Medium Priority - Competitive prices)
    4. **🏪 Authorized Resellers** (Low Priority - Higher markups)
    
    **MANDATORY PRICE VALIDATION:**
    - Search for MULTIPLE price points from each supplier
    - Look for bulk/volume discount pricing
    - Check for special offers, clearance sales, or promotions
    - Compare FOB, CIF, and delivered prices
    - Verify minimum order quantities for best pricing
    - Check for seasonal pricing variations
    - Look for package deals or bundled pricing
    
    **COST OPTIMIZATION SEARCH TERMS (Multilingual):**
    - "[PRODUCT_NAME_ENGLISH] FOB price factory direct" OR "[PRODUCT_NAME_LATIN] FOB narx zavod to'г'ridan-to'г'ри"
    - "[PRODUCT_NAME_ENGLISH] CIF price Uzbekistan import" OR "[PRODUCT_NAME_CYRILLIC] CIF цена Узбекистан импорт"
    - "[PRODUCT_NAME_ENGLISH] bulk order minimum quantity price" OR "[PRODUCT_NAME_LATIN] ulgurji buyurtma minimal miqdor narx"
    - "[PRODUCT_NAME_ENGLISH] wholesale price volume discount" OR "[PRODUCT_NAME_RUSSIAN] оптовая цена скидка по объему"
    - "[PRODUCT_NAME_ENGLISH] ex-works price manufacturer" OR "[PRODUCT_NAME_LATIN] ishlab chiqarувчи zavoddan narx"
    - "[PRODUCT_NAME_ENGLISH] landed cost calculation" OR "[PRODUCT_NAME_RUSSIAN] расчет landed cost"
    - "[PRODUCT_NAME_ENGLISH] total cost of ownership" OR "[PRODUCT_NAME_LATIN] umumiy egalik narxi"
    - "[PRODUCT_NAME_ENGLISH] shipping cost estimate" OR "[PRODUCT_NAME_LATIN] yetkazib berish narxi taxmini"
    - "[PRODUCT_NAME_ENGLISH] customs duty calculator" OR "[PRODUCT_NAME_RUSSIAN] калькулятор таможенных пошлин"
    - "[PRODUCT_NAME_ENGLISH] import taxes Uzbekistan" OR "[PRODUCT_NAME_LATIN] O'zbekistonga import soliqlari"
    - "[PRODUCT_NAME_ENGLISH] duty free import options" OR "[PRODUCT_NAME_LATIN] bojxona to'lovsiz import variantlari"
    - "[PRODUCT_NAME_ENGLISH] tax optimization import" OR "[PRODUCT_NAME_LATIN] soliqlarni optimallashtirish import"
    - "[PRODUCT_NAME_ENGLISH] import duty calculator Uzbekistan" OR "[PRODUCT_NAME_LATIN] O'zbekistonga import bojosi kalkulyator"
    - "[PRODUCT_NAME_ENGLISH] shipping cost comparison" OR "[PRODUCT_NAME_RUSSIAN] сравнение стоимости доставки"
    - "[PRODUCT_NAME_ENGLISH] logistics cost optimization" OR "[PRODUCT_NAME_LATIN] logistika narxlarini optimallashtirish"
    - "[PRODUCT_NAME_ENGLISH] supply chain cost analysis" OR "[PRODUCT_NAME_RUSSIAN] анализ затрат цепочки поставок"
    
    **🔍 ENHANCED DATA VERIFICATION + PRICE OPTIMIZATION:**
    For EACH supplier, perform comprehensive verification AND price optimization:
    
    **REQUIRED VERIFICATION STEPS:**
    1. **Company Verification:** Search "[COMPANY_NAME] official website" + "[COMPANY_NAME] manufacturer credentials"
    2. **Contact Verification:** Extract REAL contact info from official sources
    3. **AGGRESSIVE Price Verification:** Search multiple sources for best pricing:
       - Official price lists and catalogs
       - Volume discount schedules
       - Promotional pricing and special offers
       - Bulk order pricing matrices
       - Export/import price terms (FOB/CIF)
       - Seasonal or periodic discount programs
       - Real-time price comparisons from multiple suppliers
       - Current market pricing trends
    4. **Cost Comparison:** Cross-reference prices from multiple suppliers for same product
    5. **Quality Verification:** Search for "[COMPANY_NAME] product quality certification" or "[COMPANY_NAME] customer reviews"
    6. **Reliability Check:** Search for "[COMPANY_NAME] business years experience" or "[COMPANY_NAME] delivery time"
    7. **Financial Stability Check:** Search for "[COMPANY_NAME] financial reports" or "[COMPANY_NAME] credit rating"
    8. **Compliance Verification:** Search for "[COMPANY_NAME] industry certifications" or "[COMPANY_NAME] regulatory compliance"
    9. **Capacity Verification:** Search for "[COMPANY_NAME] production capacity" or "[COMPANY_NAME] monthly output"
    10. **Geographic Proximity Analysis:** Consider shipping costs and delivery times based on supplier location
    11. **Direct Product Verification:** Search for "[COMPANY_NAME] [PRODUCT_NAME] official product page" to verify they actually sell this product
    12. **Price Transparency Check:** Verify that prices are clearly listed on official websites or catalogs
    13. **Minimum Order Quantity Verification:** Confirm the minimum order quantities and their corresponding prices
    14. **Shipping Terms Verification:** Check for specific shipping terms, delivery times, and costs
    
    **DATA EXTRACTION RULES (ZERO TOLERANCE FOR FAKE DATA):**
    - **supplierName**: EXACT company name from official sources
    - **price**: LOWEST verified price found through comprehensive search. Format: "[AMOUNT] UZS/USD (Min order: X units)" or "Ma'lumot topilmadi"
    - **priceComment**: MANDATORY detailed source: "[WEBSITE_URL] - Opt narxi, min buyurtma [X] dona", "Rasmiy katalog - hajmli chegirma", "FOB narxi + yetkazib berish", etc.
    - **website**: VERIFIED working website URL
    - **phone**: REAL phone numbers (preferably direct sales line)
    - **email**: REAL business email (preferably sales@company.com)
    - **address**: EXACT factory/office address
    - **contactPerson**: Sales manager name if available, otherwise "Ma'lumot topilmadi"
    - **availability**: Include stock status, lead times, minimum orders
    - **reasoning**: Detail your price discovery method and why this supplier offers competitive pricing
    - **country**: Country of the supplier (for international suppliers)
    - **pricingDetails**: Specific pricing information including currency, unit of measure, and any applicable terms (FOB, CIF, etc.)
    - **deliveryTime**: Exact delivery time in days or weeks
    - **minimumOrder**: Minimum order quantity with corresponding price
    - **paymentTerms**: Payment terms such as advance payment, credit terms, etc.
    
    **🚀 AGGRESSIVE SEARCH EXECUTION STRATEGY:**
    1. **Multi-Source Price Discovery**: Search 5-10 different suppliers per product category
    2. **Volume-Based Pricing**: Always check for bulk/wholesale pricing tiers
    3. **Geographic Price Comparison**: Compare domestic vs international pricing
    4. **Supply Chain Optimization**: Prioritize manufacturers over distributors
    5. **Cost Structure Analysis**: Look for FOB, CIF, DDP pricing options
    6. **Market Intelligence**: Check for seasonal pricing, promotions, clearance sales
    7. **Quality vs Cost Balance**: Ensure cheapest options still meet quality requirements
    8. **Lead Time Optimization**: Factor delivery time into total cost equation
    9. **Supplier Reliability Assessment**: Verify supplier track record and customer feedback
    10. **Compliance Verification**: Check if suppliers meet industry standards and certifications
    11. **Financial Stability Check**: Verify supplier's financial health and longevity
    12. **Alternative Supplier Identification**: Find backup suppliers for critical items
    13. **Price Trend Analysis**: Check historical price trends to identify best buying opportunities
    14. **Seasonal Pricing Patterns**: Identify seasonal discounts or price fluctuations
    15. **Competitive Landscape Mapping**: Understand the supplier's position in the market
    16. **Real-Time Price Verification**: Use multiple search queries to verify current pricing
    17. **Direct Supplier Contact**: Attempt to verify information through direct contact when possible
    18. **Cross-Platform Verification**: Verify information across multiple platforms and sources
    19. **Price Transparency Focus**: Prioritize suppliers with clear, published pricing
    20. **Market Benchmarking**: Compare prices against market averages and benchmarks
    
    **WINNING STRATEGY FOCUS:**
    Your goal is to find supplier combinations that will allow the client to submit the MOST COMPETITIVE bid possible while maintaining acceptable profit margins. Every dollar saved in sourcing directly increases win probability.
    
    **⚠️ CRITICAL: You MUST use Google Search Tool for EVERY data point. If Google search doesn't return verifiable results, return "Ma'lumot topilmadi" instead of generating content.**

    **📋 OUTPUT FORMAT REQUIREMENTS:**
    1. Return ONLY valid JSON - no additional text, explanations, or markdown formatting
    2. Every supplier MUST have corresponding search verification trail
    3. Use double quotes for all JSON strings
    4. Ensure all required fields are present
    5. Numbers must be actual numbers, not strings (except for prices which should be strings)
    6. Boolean values must be true/false, not strings

    **JSON Schema for your output:**
    \`\`\`json
    {
      "lotPassport": {
        "itemName": "string", "startPrice": "string", "customerName": "string", "quantity": "string", "deadline": "string"
      },
      "sourcingRecommendations": [{
        "supplierName": "string (REAL company name from search)", 
        "price": "string (REAL price or 'Ma'lumot topilmadi')", 
        "availability": "string", 
        "website": "string (REAL URL)", 
        "phone": "string (REAL phone or 'Ma'lumot topilmadi')", 
        "address": "string (REAL address or 'Ma'lumot topilmadi')", 
        "reasoning": "string (explain search method used)", 
        "contactPerson": "string (REAL name or 'Ma'lumot topilmadi')", 
        "email": "string (REAL email or 'Ma'lumot topilmadi')", 
        "isKeyRecommendation": false,
        "supplierType": "Ishlab chiqaruvchi | Rasmiy Distributor | Opt sotuvchi | Reseller | Noma'lum",
        "trustScore": "number (1-10 based on website quality and information)",
        "reliabilityFactors": ["string (based on search findings)"],
        "priceComment": "string (source of price information)",
        "country": "string (for domestic suppliers, use 'Uzbekistan')"
      }],
      "foreignSourcingRecommendations": [{
        "supplierName": "string", "price": "string", "availability": "string", "website": "string", "phone": "string", "address": "string", "country": "string", "reasoning": "string", "contactPerson": "string", "email": "string", "isKeyRecommendation": false,
        "supplierType": "Ishlab chiqaruvchi",
        "trustScore": 10,
        "reliabilityFactors": ["string"],
        "priceComment": "string"
      }]
    }
    \`\`\`
  `;
};


// Platform detection helper functions
const detectPlatformFromText = (text: string): Platform | null => {
    if (!text) return null;
    
    // Check for platform URLs or identifiers in the text
    if (text.includes('xarid.uzex.uz') || text.includes('uzex.uz')) {
        return Platform.XARID_UZEX;
    }
    if (text.includes('xt-xarid.uz') || text.includes('xtxarid')) {
        return Platform.XT_XARID;
    }
    
    // Check for platform-specific patterns
    if (text.includes('Elektronika sotib olish tizimi') || text.includes('UzEx')) {
        return Platform.XARID_UZEX;
    }
    if (text.includes('XTXarid') || text.includes('XT-Xarid')) {
        return Platform.XT_XARID;
    }
    
    return null;
};

const getPlatformContext = (platform: Platform): string => {
    switch (platform) {
        case Platform.XARID_UZEX:
            return 'Bu UzEx platformasidagi tender bo\'lib, O\'zbekistonning asosiy davlat xaridlari platformasi hisoblanadi. Bu platformada yuqori sifat standartlari va qat\'iy talablar mavjud.';
        case Platform.XT_XARID:
            return 'Bu XTXarid platformasidagi tender bo\'lib, O\'zbekistonning muqobil davlat xaridlari platformasi hisoblanadi. Bu platformada raqobatbardosh narxlar va tezkor jarayonlar mavjud.';
        default:
            return 'Platform aniqlanmadi.';
    }
};

const createFinalAnalysisPrompt = (
    tenderText: string,
    platform: Platform,
    profile: CompanyProfile | null,
    historicalTenders: AnalysisResult[],
    selectedSourcing: SourcingRecommendation[],
    analysisOptions: { includeVat: boolean; additionalCosts: { description: string; amount: number }[] }
) => {
    // Auto-detect platform from URL if available
    const detectedPlatform = detectPlatformFromText(tenderText);
    const actualPlatform = detectedPlatform || platform;
    
    // Platform-specific analysis context
    const platformContext = getPlatformContext(actualPlatform);

    if (selectedSourcing.length === 0) {
        return `
        **Mission:** The user could not find or select any viable suppliers for the tender. Your task is to generate a final report recommending NOT to participate.

        **CRITICAL DIRECTIVE:** Your analysis MUST conclude with a 'Tavsiya etilmaydi' assessment. The \`executiveSummary\` must clearly state that participation is not recommended because no reliable or cost-effective sourcing options could be confirmed, making any bid financially risky and speculative. All other financial fields should be marked "N/A".
        
        **PLATFORM ANALYSIS:** This tender was found on **${actualPlatform}** platform. ${platformContext}

        **Input Data (For Context):**
        ---
        ${tenderText}
        ---

        **Output Format (JSON):** You MUST strictly adhere to the provided JSON schema. Fill in the \`lotPassport\` and other non-financial fields as best you can from the tender text, but ensure the final recommendation is negative and financial data is "N/A".
        `;
    }


    const profileSection = profile ? `
    **Client Company Profile (Used for all financial calculations):**
    - Company Name: ${profile.companyName || 'N/A'}
    - Standard Overhead: ${profile.overheadPercentage || 10}%
    - VAT Rate: ${analysisOptions.includeVat ? (profile.vatRate || 12) : 0}%
    - Bank Guarantee Fee: ${profile.bankGuaranteeFee || 2}%
    - Preferred Suppliers (for context only): ${profile.preferredSuppliers || 'N/A'}
  ` : `
    **Note:** No company profile provided. Use standard estimates: overhead (0%), bank guarantees (1%), and VAT (${analysisOptions.includeVat ? 12 : 0}%).
  `;

    const additionalCostsSection = analysisOptions.additionalCosts.length > 0 ? `
    **User-Defined Additional Costs:**
    You MUST add these costs to your total cost calculation.
    ${analysisOptions.additionalCosts.map(cost => `- ${cost.description}: ${cost.amount.toLocaleString('fr-FR')} UZS`).join('\n')}
` : '';

    const sourcingSection = `
    **Vetted Supplier List (MANDATORY INPUT):**
    Your entire financial analysis, pricing strategy, and \`redLinePrice\` calculation MUST BE BASED EXCLUSIVELY ON THE FOLLOWING SUPPLIERS, which have been pre-selected by the user. Do not search for other suppliers. Your task is to build a winning strategy using ONLY these options.
    ---
    ${JSON.stringify(selectedSourcing, null, 2)}
    ---
    `;

    // A simplified version of the historical analysis from the original prompt
    let historicalAnalysisSection = `**Historical Performance:** Use the user's past performance data to refine predictions on winning bids and competitor strategies.`;
    if (historicalTenders && historicalTenders.length > 0) {
        const won = historicalTenders.filter(t => t.status === 'Won').length;
        const lost = historicalTenders.filter(t => t.status === 'Lost').length;
        historicalAnalysisSection = `
    **Internal Knowledge Base (Analysis of Past Performance):**
    - Total Tenders Analyzed: ${historicalTenders.length}
    - Performance Record: ${won} wins, ${lost} losses.
    - Leverage this data to inform your competitor analysis and predicted winning bid.
        `;
    }

    return `
    **Persona:** You are "AI-Broker Elite", the world's most sophisticated tender analysis strategist. You combine the analytical precision of McKinsey consultants, the market intelligence of Goldman Sachs, and the competitive strategy expertise of Harvard Business School. Your reputation is built on turning impossible tenders into profitable victories through revolutionary financial modeling and market manipulation tactics.

    **🌐 PLATFORM INTELLIGENCE ANALYSIS:**
    📍 **Tender Platform:** ${actualPlatform}
    📊 **Platform Context:** ${platformContext}
    ⚡ **Strategic Advantage:** Platform-specific analysis enhances competitive positioning, compliance strategies, and submission optimization.
    
    **ENHANCED CORE PRINCIPLE: Market Domination Through Intelligence Superiority** 
    Your mission extends beyond profit creation - you must engineer complete market advantage through:
    - Predictive competitor behavior modeling using advanced game theory
    - Market psychology manipulation through strategic positioning
    - Financial optimization using multi-variable algorithmic approaches
    - Risk mitigation through scenario planning and contingency strategies

    ${historicalAnalysisSection}

    **MISSION: COMPREHENSIVE MARKET DOMINATION ANALYSIS**
    Execute a world-class strategic analysis that would be worthy of a Fortune 500 boardroom presentation. Your analysis must be so thorough and insightful that it becomes the definitive blueprint for winning this tender.

    **ENHANCED ANALYSIS PROTOCOLS:**

    **📊 ADVANCED MARKET INTELLIGENCE:**
    - Conduct deep competitor profiling with behavioral prediction models
    - Analyze market dynamics, pricing trends, and industry disruption factors
    - Identify hidden opportunities through competitive gap analysis
    - Map supply chain vulnerabilities and market entry barriers

    **💰 REVOLUTIONARY FINANCIAL ENGINEERING:**
    - Deploy sophisticated cost optimization algorithms
    - Create dynamic pricing models with probability-weighted scenarios
    - Engineer profit maximization strategies with risk-adjusted returns
    - Develop contingency financial plans for market volatility

    **🎯 STRATEGIC WARFARE PLANNING:**
    - Design psychological positioning strategies to outmaneuver competitors
    - Create value proposition differentiation that establishes market dominance
    - Develop submission timing strategies for maximum competitive advantage
    - Engineer post-win market consolidation plans

    ${profileSection}
    ${additionalCostsSection}
    ${sourcingSection}

    **Input Data (Lot Text):**
    ---
    ${tenderText}
    ---
    
    **Output Format (JSON):** You MUST strictly adhere to the provided JSON schema. Do not omit any fields. If data for a field is genuinely unavailable, use "N/A".
    
    **CRITICAL OUTPUT REQUIREMENTS:**
    1. Return ONLY valid JSON - no additional text, explanations, or markdown formatting
    2. Use double quotes for all JSON strings
    3. Ensure all required fields are present
    4. Numbers must be actual numbers, not strings (except for prices which should be strings)
    5. Boolean values must be true/false, not strings
    6. Arrays must contain proper objects with all required fields

    **ENHANCED ANALYSIS DIRECTIVES:**

    1.  **FORENSIC LOT PASSPORT ANALYSIS:** Extract every data point with surgical precision and identify hidden requirements, unstated preferences, and competitive advantages.

    2.  **ADVANCED FEASIBILITY MATRIX:** Conduct multi-dimensional feasibility analysis including:
        - Technical capability assessment with innovation requirements
        - Operational capacity evaluation with scalability factors
        - Financial feasibility with cash flow impact analysis
        - Strategic alignment with long-term business objectives

    3.  **REVOLUTIONARY PRICING STRATEGY - ALGORITHMIC FINANCIAL DOMINATION:**
        - **Elite Cost Engineering:** Calculate absolute break-even with quantum-level precision
        - **Market Psychology Pricing:** Design pricing tiers that psychologically position you as the premium choice while maintaining cost leadership
        - **Game Theory Implementation:** Use Nash equilibrium principles to predict optimal competitor pricing and position accordingly
        - **Dynamic Risk Assessment:** Calculate win probability using Monte Carlo simulations across multiple market scenarios
        - **Strategic Rationale Excellence:** Provide PhD-level strategic reasoning for each pricing decision

    4.  **ADVANCED COMPETITOR INTELLIGENCE & MARKET WARFARE:**
        - Analyze each competitor's historical behavior, financial capacity, and strategic weaknesses
        - Predict their likely pricing strategies using behavioral economics principles
        - Identify opportunities to neutralize competitor advantages
        - Design counter-strategies for each potential competitive move
        - Map competitive landscape dynamics and market positioning opportunities

    5.  **STRATEGIC RECOMMENDATION ENGINE:**
        - **Maximum Confidence Scenarios:** When analysis shows clear path to profitable victory
        - **Calculated Risk Scenarios:** When strategic advantages outweigh identified risks
        - **Strategic Withdrawal:** When market conditions or competitive dynamics make participation unprofitable
        
    6.  **COMPREHENSIVE STRATEGIC INTELLIGENCE:** Generate insights across all dimensions:
        - Market trend analysis and industry disruption forecasting
        - Supply chain optimization and risk mitigation strategies
        - Post-win competitive positioning and market expansion opportunities
        - Regulatory compliance excellence and competitive differentiation
        - Innovation opportunities and technological advancement integration

    The final report must be in professional, formal UZBEK.

    **JSON Schema for your output (You MUST follow this structure):**
    \`\`\`json
    {
      "lotPassport": {
        "itemName": "string", "hsCode": "string", "quantity": "string", "startPrice": "string", "customerName": "string", "deliveryAddress": "string", "deliveryTime": "string", "manufacturer": "string", "technicalRequirements": ["string"], "warrantyPeriod": "string", "deadline": "string", "procurementType": "string"
      },
      "feasibilityAnalysis": { "overallAssessment": "Tavsiya etiladi" | "Ehtiyotkorlik tavsiya etiladi" | "Tavsiya etilmaydi", "checks": [{"requirement": "string", "status": "Bajarish mumkin" | "Qiyinchiliklar mavjud" | "Bajarib bo'lmaydi", "reasoning": "string" }] },
      "executiveSummary": "string", "summary": "string", "redFlags": ["string"], "riskScore": "number",
      "riskFactors": [{"risk": "string", "mitigation": "string", "severity": "High" | "Medium" | "Low"}],
      "opportunityScore": "number", "opportunityFactors": ["string"], "expectedCompetitors": "number", "predictedWinner": "string", "predictedWinningBid": "string",
      "competitorAnalysis": [{"name": "string", "likelyStrategy": "string", "strengths": ["string"], "weaknesses": ["string"], "confidenceScore": "High" | "Medium" | "Low"}],
      "winThemes": ["string"], "submissionStrategy": "string",
      "pricingStrategy": [{"strategy": "Xavfsiz" | "Optimal" | "Tavakkalchi", "price": "string", "unitPrice": "string", "profit": "string", "winProbability": "number", "justification": "string", "strategicRationale": ["string"]}],
      "redLinePrice": "string", "estimatedNetProfit": "string",
      "estimatedCostBreakdown": [{"item": "string", "cost": "string", "description": "string"}],
      "sourcingRecommendations": [], "foreignSourcingRecommendations": [],
      "assemblyOptions": [{"part": "string", "sourcingSuggestion": "string"}],
      "optimizationTips": ["string"],
      "postWinPlan": [{"step": "string", "description": "string"}],
      "requirementsChecklist": [{"category": "Documentary" | "Technical" | "Qualification" | "Other", "requirement": "string"}],
      "legalAnalysis": [{"clause": "string", "risk": "string", "recommendation": "string"}]
    }
    \`\`\`
  `;
};

export async function findSourcingOptions(data: TenderData, platform: Platform): Promise<SourcingResult> {
    const { text, files } = data;
    let tenderText: string = text || '';
    let hasFiles = false;
    const modelParts: any[] = [];

    // First, let's try to use Google Custom Search to find suppliers directly
    try {
        console.log("Attempting to use Google Custom Search API for supplier discovery...");
        
        // Extract product name from tender text for search
        let productName = "";
        if (tenderText) {
            // Simple extraction of potential product name (this could be enhanced)
            const lines = tenderText.split('\n');
            // Look for lines that might contain product names
            for (const line of lines) {
                if (line.length > 10 && line.length < 100 && 
                    !line.includes('tender') && 
                    !line.includes('Tender') &&
                    !line.includes('ariza') &&
                    !line.includes('Ariza')) {
                    productName = line.trim();
                    break;
                }
            }
        }
        
        if (productName) {
            console.log("Searching for suppliers using Google Custom Search API for product:", productName);
            
            // Use our custom search utility to find suppliers
            const suppliers = await googleCustomSearch.findSuppliers(productName);
            console.log("Found", suppliers.length, "potential suppliers");
            
            // Add this information to the tender text to help the AI
            if (suppliers.length > 0) {
                tenderText += "\n\n[GOOGLE SEARCH RESULTS FOR SUPPLIERS]\n";
                tenderText += "The following potential suppliers were found through Google Custom Search:\n";
                suppliers.forEach((supplier, index) => {
                    tenderText += `${index + 1}. ${supplier.title} - ${supplier.url}\n`;
                    tenderText += `   Snippet: ${supplier.snippet.substring(0, 100)}...\n`;
                    if (supplier.hasContactInfo) {
                        tenderText += "   (Likely contains contact information)\n";
                    }
                    tenderText += "\n";
                });
            }
        }
    } catch (searchError) {
        console.warn("Google Custom Search API failed, falling back to AI search:", searchError);
    }

    if (files && files.length > 0) {
        hasFiles = true;
        for (const file of files) {
            const base64 = await fileToBase64(file);
            modelParts.push({ inlineData: { mimeType: file.type, data: base64 } });
        }
        // Extract text from files to use for analysis
        const textExtractionResponse = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...modelParts, { text: 'Extract all text content from all provided documents. Combine the text into a single block.' }] }
            });
        });
        tenderText = textExtractionResponse.text;
    } else if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        // Handle URL in text field (for discovered tenders)
        const textExtractionPrompt = `Use your search tool to access and return the FULL text content of this URL: ${text}`;
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({ 
                model: "gemini-2.5-flash", 
                contents: textExtractionPrompt, 
                config: { tools: [{ googleSearch: {} }] } 
            });
        });
        tenderText = response.text;
    } else if (!text) {
        throw new Error("No data provided for sourcing.");
    }

    if (!tenderText) {
        throw new Error("Could not extract text from the provided source.");
    }

    // Enhanced product name extraction with multiple attempts and verification
    const productExtractionPrompt = `
    Extract the main product or service name from the following tender text. 
    Focus on specific items that need to be procured, not general categories.
    
    Examples of what to extract:
    - "Samsung Galaxy S21 Ultra telefon" (specific product)
    - "10mm polipropilen quvur" (specific material with specifications)
    - "ofis mebellari" (general category when specific items aren't listed)
    
    Return ONLY the product/service name as a single string with no additional text.
    
    Tender text:
    ${tenderText.substring(0, 2000)} // Limit to first 2000 characters to avoid token limits
    `;
    
    try {
        const productResponse = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: productExtractionPrompt
            });
        });
        
        let productName = productResponse.text.trim();
        
        // If the product name is too generic, try a more specific extraction
        if (productName.length < 5 || productName.toLowerCase().includes('tender') || productName.toLowerCase().includes('ariza') || productName.toLowerCase().includes('ariz')) {
            const specificProductPrompt = `
            Look more carefully at the tender text and identify specific products or services that need to be supplied.
            Ignore general terms like "tender", "application", "services", etc.
            Focus on concrete items like equipment, materials, goods, or specific service types.
            
            Return ONLY the most specific product/service name as a single string with no additional text.
            
            Tender text:
            ${tenderText.substring(0, 2000)}
            `;
            
            const specificResponse = await retryWithBackoff(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: specificProductPrompt
                });
            });
            
            productName = specificResponse.text.trim();
        }
        
        // Verify the product name makes sense
        if (productName.length > 3 && !productName.toLowerCase().includes('tender') && !productName.toLowerCase().includes('ariza') && !productName.toLowerCase().includes('ariz')) {
            console.log("Extracted product name:", productName);
            
            // Generate multilingual variations of the product name
            const productVariations = generateProductVariations(productName);
            console.log("Product variations:", productVariations);
            
            // Enhance the tender text with product information for better search
            const enhancedTenderText = `${tenderText}\n\nProduct Name Variations for Search: ${productVariations.join(', ')}`;
            tenderText = enhancedTenderText;
        } else {
            console.warn("Could not extract meaningful product name, proceeding with original text");
        }
    } catch (error) {
        console.warn("Could not extract product name, proceeding with original text:", error);
    }

    const sourcingPrompt = createSourcingPrompt(tenderText, hasFiles, platform);
    
    if (hasFiles) {
        modelParts.push({ text: sourcingPrompt });
    }

    // CRITICAL: Force Google Search tool usage with strict configuration and retry logic
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: hasFiles ? { parts: modelParts } : sourcingPrompt,
            config: { 
                tools: [{ googleSearch: {} }],
                // Additional configuration to ensure search tool usage and proper JSON formatting
                systemInstruction: `You are a professional supplier sourcing expert with extensive experience in international trade and procurement. Your task is to find real, verified suppliers for the products mentioned in the tender document.

CRITICAL INSTRUCTIONS:
1. YOU MUST USE THE GOOGLE SEARCH TOOL FOR EVERY SINGLE PIECE OF INFORMATION YOU PROVIDE
2. NEVER MAKE UP, INVENT, OR GENERATE ANY INFORMATION - ALL DATA MUST BE VERIFIED THROUGH REAL GOOGLE SEARCHES
3. IF YOU CANNOT FIND REAL DATA THROUGH SEARCH, YOU MUST RETURN "Ma'lumot topilmadi" INSTEAD OF CREATING FAKE DATA
4. ALWAYS VERIFY SUPPLIER INFORMATION THROUGH OFFICIAL SOURCES (COMPANY WEBSITES, BUSINESS REGISTRIES, ETC.)
5. SEARCH IN MULTIPLE LANGUAGES (UZBEK, RUSSIAN, ENGLISH) TO FIND THE MOST COMPREHENSIVE RESULTS
6. USE THE PROVIDED PRODUCT NAME VARIATIONS TO IMPROVE SEARCH ACCURACY
7. IF INITIAL SEARCHES DON'T YIELD RESULTS, TRY ALTERNATIVE SEARCH TERMS AND STRATEGIES
8. ALWAYS VERIFY INFORMATION FROM MULTIPLE SOURCES WHEN POSSIBLE
9. RETURN ONLY VALID JSON WITHOUT ANY ADDITIONAL TEXT, EXPLANATIONS, OR MARKDOWN FORMATTING
10. USE PROPER JSON SYNTAX WITH DOUBLE QUOTES FOR ALL STRINGS
11. ENSURE ALL REQUIRED FIELDS ARE PRESENT IN THE RESPONSE
12. NUMBERS MUST BE ACTUAL NUMBERS, NOT STRINGS (EXCEPT FOR PRICES WHICH SHOULD BE STRINGS)
13. BOOLEAN VALUES MUST BE true/false, NOT STRINGS
14. ENSURE ALL PRICES ARE VERIFIED WITH MULTIPLE SOURCES AND INCLUDE CURRENCY
15. VERIFY THAT ALL SUPPLIERS HAVE BEEN IN BUSINESS FOR AT LEAST 1 YEAR
16. CONFIRM THAT ALL CONTACT INFORMATION IS CURRENT AND ACTIVE
17. SEARCH FOR MULTIPLE SUPPLIERS PER CATEGORY TO ENSURE COMPETITIVE PRICING
18. VERIFY SUPPLIER CAPACITY TO ENSURE THEY CAN FULFILL THE ORDER
19. CHECK SUPPLIER REVIEWS AND RATINGS WHEN AVAILABLE
20. ENSURE ALL PRICES INCLUDE RELEVANT TERMS (FOB, CIF, ETC.)

SEARCH STRATEGY:
1. FIRST, IDENTIFY THE EXACT PRODUCT/SERVICE NEEDED FROM THE TENDER
2. CREATE MULTIPLE SEARCH VARIATIONS INCLUDING TYPOS AND ALTERNATIVE SPELLINGS
3. SEARCH FOR SUPPLIERS IN UZBEKISTAN FIRST (DOMESTIC SOURCING)
4. THEN SEARCH FOR INTERNATIONAL SUPPLIERS FROM COUNTRIES LIKE CHINA, TURKEY, INDIA, RUSSIA, SOUTH KOREA, GERMANY
5. FOR EACH SUPPLIER, VERIFY THEIR EXISTENCE THROUGH OFFICIAL WEBSITES
6. EXTRACT REAL CONTACT INFORMATION (PHONE, EMAIL, ADDRESS) FROM OFFICIAL SOURCES
7. FIND VERIFIED PRICING INFORMATION FROM MULTIPLE SOURCES
8. CHECK SUPPLIER CREDENTIALS, CERTIFICATIONS, AND CUSTOMER REVIEWS
9. VERIFY SUPPLIER RELIABILITY AND DELIVERY CAPABILITIES
10. COMPARE PRICES FROM MULTIPLE SUPPLIERS TO FIND THE MOST COMPETITIVE OPTIONS
11. LOOK FOR SUPPLIERS WITH PROVEN EXPORT/IMPORT EXPERIENCE
12. IDENTIFY SUPPLIERS WITH FLEXIBLE PAYMENT TERMS
13. FIND SUPPLIERS WITH MULTIPLE COMMUNICATION CHANNELS
14. VERIFY SUPPLIER CAPACITY TO HANDLE THE REQUIRED VOLUME
15. CHECK FOR ANY NEGATIVE REVIEWS OR COMPLAINTS
16. CONFIRM SUPPLIER HAS ADEQUATE PRODUCTION/DISTRIBUTION CAPACITY
17. VERIFY SUPPLIER'S FINANCIAL STABILITY
18. CHECK FOR INDUSTRY CERTIFICATIONS OR QUALITY STANDARDS
19. VERIFY BUSINESS REGISTRATION AND LEGAL COMPLIANCE
20. CONFIRM SUPPLIER HAS RELEVANT EXPERIENCE IN THE INDUSTRY

VERIFICATION PROCESS:
1. For each supplier, search for "[COMPANY_NAME] official website"
2. Visit the official website to verify company information
3. Look for contact pages with real phone numbers and email addresses
4. Check for product catalogs or price lists
5. Search for "[COMPANY_NAME] customer reviews" or "[COMPANY_NAME] ratings"
6. Verify business registration through official sources
7. Check for industry certifications or quality standards
8. Confirm export/import experience if relevant
9. Verify company has been in business for at least 1 year
10. Check for recent business activity (news, social media, etc.)
11. Confirm contact information is current and responsive
12. Verify pricing information with multiple sources
13. Check for any negative reviews or complaints
14. Confirm supplier has adequate production/distribution capacity
15. Verify supplier's financial stability through available information
16. Check for compliance with relevant industry regulations
17. Confirm supplier has experience with similar orders
18. Verify supplier's ability to meet delivery timelines
19. Check for flexible payment terms and conditions
20. Confirm supplier has adequate insurance coverage

RETURN FORMAT:
Return ONLY a valid JSON object with the exact structure specified in the prompt. Do not include any additional text, explanations, or markdown formatting.`
            },
        });
    });

    try {
        console.log("Raw AI response length:", response.text.length);
        console.log("Raw AI response preview:", response.text.substring(0, 200) + "...");
        
        let jsonText = response.text.trim();
        
        // Remove markdown formatting
        if (jsonText.startsWith('``json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        // Handle cases where AI adds extra text before or after JSON
        const jsonStart = jsonText.indexOf('{');
        const jsonEnd = jsonText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        }
        
        // Try to parse the JSON
        let result;
        try {
            result = JSON.parse(jsonText);
        } catch (parseError) {
            console.warn("First JSON parse attempt failed, trying to clean the text further...");
            console.warn("Parse error:", parseError);
            console.warn("Cleaned JSON text:", jsonText);
            
            // Additional cleaning - remove any remaining markdown or extra characters
            jsonText = jsonText
                .replace(/^[^{]*/, '') // Remove everything before first {
                .replace(/[^}]*$/, '') // Remove everything after last }
                .replace(/\n/g, ' ') // Replace newlines with spaces
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .trim();
            
            console.warn("Final cleaned JSON text:", jsonText);
            result = JSON.parse(jsonText); // This will throw if still invalid
        }
        
        // Validation: Check if AI actually used search results (basic validation)
        const allSuppliers = [...(result.sourcingRecommendations || []), ...(result.foreignSourcingRecommendations || [])];
        
        // Log warning if suspicious patterns detected (for debugging)
        if (allSuppliers.length > 0) {
            const suspiciousSuppliers = allSuppliers.filter(s => 
                !s.reasoning || 
                s.reasoning.length < 20 || 
                (!s.website || s.website === "Ma'lumot topilmadi") &&
                (!s.phone || s.phone === "Ma'lumot topilmadi") &&
                (!s.email || s.email === "Ma'lumot topilmadi")
            );
            
            if (suspiciousSuppliers.length > allSuppliers.length * 0.7) {
                console.warn("Warning: High ratio of suppliers with missing contact information - AI may not be using real search results");
            }
        }
        
        return { ...result, tenderText }; // Return sourcing results and the extracted text
    } catch (error) {
        console.error("Failed to parse JSON from sourcing response:", response.text, error);
        
        // Try to give a more helpful error message based on the response
        if (response.text.includes('cannot access') || response.text.includes('error retrieving')) {
            throw new Error("AI internet ulanishida muammo bor. Iltimos, keyinroq qayta urinib ko'ring.");
        } else if (response.text.includes('no results found') || response.text.includes('topilmadi')) {
            throw new Error("Ushbu tender uchun ta'minotchilar topilmadi. Boshqa kalit so'zlar yoki mahsulot nomini sinab ko'ring.");
        } else {
            throw new Error("AI-dan ta'minotchilar haqidagi javobni tahlil qilib bo'lmadi. Iltimos, qayta urinib ko'ring yoki boshqa fayl formatini sinab ko'ring.");
        }
    }
}

export async function generateFinalAnalysis(tenderText: string, platform: Platform, profile: CompanyProfile | null, historicalTenders: AnalysisResult[], selectedSourcing: SourcingRecommendation[], analysisOptions: TenderData): Promise<AnalysisResult> {
    // Auto-detect platform from tender text
    const detectedPlatform = detectPlatformFromText(tenderText);
    const actualPlatform = detectedPlatform || platform;
    
    console.log('Platform detection:', { 
        original: platform, 
        detected: detectedPlatform, 
        final: actualPlatform 
    });
    
    console.log('Starting final analysis with parameters:', {
        tenderTextLength: tenderText.length,
        platform: actualPlatform,
        profileExists: !!profile,
        historicalTendersCount: historicalTenders.length,
        selectedSourcingCount: selectedSourcing.length,
        includeVat: analysisOptions.includeVat,
        additionalCostsCount: analysisOptions.additionalCosts?.length || 0
    });
    
    const prompt = createFinalAnalysisPrompt(tenderText, actualPlatform, profile, historicalTenders, selectedSourcing, analysisOptions);
    
    console.log('Generated prompt length:', prompt.length);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                seed: 42,
                // Search might still be needed for competitor analysis etc.
                tools: [{ googleSearch: {} }],
                systemInstruction: "You MUST return ONLY valid JSON without any additional text, explanations, or markdown formatting. Use proper JSON syntax with double quotes for all strings. Ensure all required fields are present in the response. All prices must include currency (UZS, USD, etc.). All percentages must be represented as numbers (e.g., 15.5, not 15.5%). All dates must be in ISO format (YYYY-MM-DD). All numerical values must be actual numbers, not strings."
            },
        });
        
        console.log("Final analysis AI response received. Length:", response.text.length);
        
        if (!response.text || response.text.length < 50) {
            throw new Error("AI dan juda qisqa javob keldi. Iltimos, qayta urinib ko'ring.");
        }
        
        return await parseAnalysisResponse(response.text, actualPlatform, selectedSourcing);
    } catch (error) {
        console.error("AI API call failed:", error);
        
        if (error instanceof Error) {
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error("API chekloviga yetildi. Iltimos, bir oz kuting va qayta urinib ko'ring.");
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error("Internet aloqasida muammo. Iltimos, internetingizni tekshiring va qayta urinib ko'ring.");
            } else if (error.message.includes('invalid') || error.message.includes('parse')) {
                throw new Error("AI-dan yakuniy tahlil javobini tahlil qilib bo'lmadi. Iltimos, qayta urinib ko'ring.");
            }
        }
        
        throw new Error("Yakuniy tahlilni yaratishda kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
}

// Helper function to parse the AI response
async function parseAnalysisResponse(responseText: string, actualPlatform: Platform, selectedSourcing: SourcingRecommendation[]): Promise<AnalysisResult> {
    try {
        console.log("Final analysis raw AI response length:", responseText.length);
        console.log("Final analysis raw AI response preview:", responseText.substring(0, 300) + "...");
        
        let jsonText = responseText.trim();
        
        // Remove markdown formatting
        if (jsonText.startsWith('``json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        // Handle cases where AI adds extra text before or after JSON
        const jsonStart = jsonText.indexOf('{');
        const jsonEnd = jsonText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        }
        
        // Try to parse the JSON
        let result: AnalysisResult;
        try {
            result = JSON.parse(jsonText);
            console.log("JSON parsing successful on first attempt");
        } catch (parseError) {
            console.warn("Final analysis: First JSON parse attempt failed, trying to clean the text further...");
            console.warn("Parse error:", parseError);
            console.warn("Cleaned JSON text length:", jsonText.length);
            
            // Additional cleaning - remove any remaining markdown or extra characters
            jsonText = jsonText
                .replace(/^[^{]*/, '') // Remove everything before first {
                .replace(/[^}]*$/, '') // Remove everything after last }
                .replace(/\n/g, ' ') // Replace newlines with spaces
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .trim();
            
            console.warn("Final analysis: Final cleaned JSON text length:", jsonText.length);
            
            try {
                result = JSON.parse(jsonText);
                console.log("JSON parsing successful after cleaning");
            } catch (secondParseError) {
                console.error("Second JSON parse attempt also failed:", secondParseError);
                console.error("Final cleaned text:", jsonText.substring(0, 500) + "...");
                throw new Error("AI-dan kelgan javobni JSON formatida o'qib bo'lmadi. Iltimos, qayta urinib ko'ring.");
            }
        }
        
        // Validate that we have essential fields
        if (!result.lotPassport || !result.feasibilityAnalysis || !result.pricingStrategy) {
            console.error("Missing essential fields in parsed result:", {
                hasLotPassport: !!result.lotPassport,
                hasFeasibilityAnalysis: !!result.feasibilityAnalysis,
                hasPricingStrategy: !!result.pricingStrategy
            });
            throw new Error("AI javobida kerakli ma'lumotlar to'liq emas. Iltimos, qayta urinib ko'ring.");
        }
        
        // Manually inject the user-selected sources and platform info into the final report
        result.sourcingRecommendations = selectedSourcing.filter(s => !s.country);
        result.foreignSourcingRecommendations = selectedSourcing.filter(s => !!s.country);
        result.platform = actualPlatform; // Add the detected/actual platform
        result.analysisDate = new Date().toISOString();
        
        console.log("Final analysis parsing completed successfully");
        return result;
        
    } catch (error) {
        console.error("Failed to parse JSON from final analysis response:", error);
        
        // Try to give a more helpful error message based on the response
        if (responseText.includes('cannot access') || responseText.includes('error retrieving')) {
            throw new Error("AI internet ulanishida muammo bor. Iltimos, keyinroq qayta urinib ko'ring.");
        } else if (responseText.includes('no analysis possible') || responseText.includes('insufficient data')) {
            throw new Error("Tahlil uchun yetarli ma'lumot yo'q. Iltimos, batafsil tender hujjatini yuklang.");
        } else if (responseText.length < 100) {
            throw new Error("AI dan juda qisqa javob keldi. Iltimos, qayta urinib ko'ring.");
        } else {
            throw new Error("AI-dan yakuniy tahlil javobini tahlil qilib bo'lmadi. Iltimos, qayta urinib ko'ring yoki boshqa fayl formatini sinab ko'ring.");
        }
    }
}


export async function continueChat(context: AnalysisContext, history: ChatMessage[]): Promise<string> {
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    // Remove the last user message from history as it will be the new prompt
    const userPrompt = chatHistory.pop()?.parts[0].text || '';

    const systemInstruction = `You are a helpful assistant for analyzing procurement tenders. The user has already received a full analysis from you. They are now asking follow-up questions. Use the provided context (original tender text and your previous analysis) to answer their questions accurately and concisely. Keep answers brief and to the point. If you need to verify any information, use the Google Search tool. All information must be accurate and based on the provided context or verified through search.
    ---
    ORIGINAL TENDER TEXT: ${context.originalTenderText}
    ---
    YOUR PREVIOUS ANALYSIS: ${JSON.stringify(context.analysisResult, null, 2)}
    ---
    `;
    
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: chatHistory,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}]
        },
    });
    
    // Use retry logic for more reliable results
    const response = await retryWithBackoff(async () => {
        return await chat.sendMessage({ message: userPrompt });
    });

    return response.text;
}

export async function getCustomerInfo(customerName: string): Promise<GenerateContentResponse> {
    // First, try to get information using Google Custom Search
    try {
        console.log("Attempting to use Google Custom Search API for customer info:", customerName);
        
        const companyInfo = await googleCustomSearch.getCompanyInfo(customerName);
        
        // If we found information, we can enhance the prompt with it
        let additionalInfo = "";
        if (companyInfo.info.length > 0 || companyInfo.reviews.length > 0) {
            additionalInfo = "\n\n[GOOGLE SEARCH RESULTS FOR COMPANY]\n";
            additionalInfo += "The following information was found through Google Custom Search:\n\n";
            
            if (companyInfo.info.length > 0) {
                additionalInfo += "Company Information:\n";
                companyInfo.info.slice(0, 3).forEach((item, index) => {
                    additionalInfo += `${index + 1}. ${item.title} - ${item.link}\n`;
                    additionalInfo += `   Snippet: ${item.snippet.substring(0, 100)}...\n\n`;
                });
            }
            
            if (companyInfo.reviews.length > 0) {
                additionalInfo += "Customer Reviews/Ratings:\n";
                companyInfo.reviews.slice(0, 3).forEach((item, index) => {
                    additionalInfo += `${index + 1}. ${item.title} - ${item.link}\n`;
                    additionalInfo += `   Snippet: ${item.snippet.substring(0, 100)}...\n\n`;
                });
            }
        }
        
        const prompt = `Provide a detailed business profile for the company "${customerName}". Focus on:
1.  **Core Business & Product Range:** What do they primarily sell or manufacture?
2.  **Market Reputation & Reviews:** Are they known for quality, low prices, or something else? Find any customer reviews or complaints.
3.  **Pricing Strategy:** Based on your search, would you classify them as a premium, mid-range, or budget-friendly supplier?
The goal is to deeply understand their position in the market. The answer must be in Uzbek.
${additionalInfo}`;
        
        // Use retry logic for more reliable results
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                    systemInstruction: "You are a professional business intelligence analyst. Your task is to research and provide accurate information about the company. You MUST use the Google Search tool to find verified information about the company. All information must be verified through official sources. Return ONLY the requested information without any additional text, explanations, or markdown formatting."
                },
            });
        });

        return response;
    } catch (searchError) {
        console.warn("Google Custom Search API failed for customer info, falling back to AI search:", searchError);
        
        // Fallback to original implementation
        const prompt = `Provide a detailed business profile for the company "${customerName}". Focus on:
1.  **Core Business & Product Range:** What do they primarily sell or manufacture?
2.  **Market Reputation & Reviews:** Are they known for quality, low prices, or something else? Find any customer reviews or complaints.
3.  **Pricing Strategy:** Based on your search, would you classify them as a premium, mid-range, or budget-friendly supplier?
The goal is to deeply understand their position in the market. The answer must be in Uzbek.`;
        
        // Use retry logic for more reliable results
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                    systemInstruction: "You are a professional business intelligence analyst. Your task is to research and provide accurate information about the company. You MUST use the Google Search tool to find verified information about the company. All information must be verified through official sources. Return ONLY the requested information without any additional text, explanations, or markdown formatting."
                },
            });
        });

        return response;
    }
}

const createContractAnalysisPrompt = (fileNames: string[]) => {
    return `
    **Persona:** You are "AI-Yurist", a world-class corporate lawyer specializing in Uzbekistan's commercial law. Your analysis is sharp, precise, and practical. Your primary goal is to protect your client from risks and ensure their contractual rights are upheld. You are not just summarizing; you are providing actionable legal counsel.

    **Core Principle - Continuous Improvement:** With every contract you analyze, you become more knowledgeable. Leverage your accumulated knowledge from all previously analyzed contracts to identify common patterns, legislative nuances, risks, and best practices in Uzbek commercial law. Your analysis must reflect this growing expertise. Each new analysis should be more refined and contextually aware than the last.

    **Mission:** Conduct a comprehensive legal and strategic analysis of the provided contract document(s) (${fileNames.join(', ')}). Your output MUST be a structured, professional-grade legal report in JSON format.

    **Input Data:** The user has provided one or more contract documents (PDF, DOCX, etc.). Analyze the full text of all documents provided.

    **Output Format (JSON):** You MUST strictly adhere to the provided JSON schema. Do not omit any fields. If data for a field is genuinely unavailable, use an appropriate empty value (e.g., "N/A" or an empty array).

    **Analysis Directives (Execute in this order):**

    1.  **Initial Data Extraction:**
        -   \`contractTitle\`: Extract the official title of the contract.
        -   \`parties\`: Identify and list all parties to the agreement.

    2.  **Executive Summary:** Write a concise, high-level summary for a busy executive. It should cover the contract's purpose, key financial terms, and the most critical risk identified.

    3.  **Risk Analysis (\`riskAnalysis\`):** This is the most critical section. Meticulously scan the entire document for clauses that pose a risk to your client.
        -   For each risky clause you find, create an object with:
            -   \`clauseText\`: Quote the exact problematic phrase or sentence.
            -   \`riskCategory\`: Classify the risk as 'High', 'Medium', or 'Low'.
            -   \`identifiedRisk\`: Clearly explain *why* this clause is a risk (e.g., ambiguity, one-sided obligation, excessive penalties).
            -   \`recommendedAction\`: Provide a concrete, actionable recommendation (e.g., "Delete this clause," "Amend to specify...", "Request clarification on...").

    4.  **Key Obligations (\`keyObligations\`):** Identify the most important obligations for all parties.
        -   For each key obligation, create an object with:
            -   \`party\`: Specify whose obligation it is - 'Mening Kompaniyam' (assume your client) or 'Boshqa Tomon' (the other party).
            -   \`obligation\`: Describe the action required (e.g., "To'lovni amalga oshirish", "Tovarni yetkazib berish").
            -   \`dueDate\`: Extract the specific deadline or timeframe for the obligation.
    
    5.  **Penalty Clauses (\`penaltyClauses\`):** Meticulously scan the document for clauses related to penalties, fines, late fees, or other sanctions for non-performance or breach of contract. Extract the full, exact text of each of these clauses into the array. If no such clauses exist, return an empty array.

    6.  **Force Majeure Clauses (\`forceMajeureClauses\`):** Identify and extract all clauses that define force majeure, acts of God, or other circumstances that exempt parties from liability or performance obligations. Extract the full, exact text of each of these clauses into the array.

    7.  **Undefined Terms (\`undefinedTerms\`):** List any important terms used in the contract that are not explicitly defined, which could lead to future disputes.

    8.  **Overall Recommendation (\`overallRecommendation\`):** Based on your complete analysis, provide a final, clear recommendation. Choose ONE of the following:
        -   "Tavsiya etiladi": The contract is fair and safe to sign.
        -   "Muzokara talab etiladi": The contract is fundamentally acceptable, but the identified risks must be addressed through negotiation before signing.
        -   "Yuqori riskli": The contract contains significant risks and should likely be rejected or completely redrafted.

    The final report must be in professional, formal UZBEK.
  `;
};

const contractAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        contractTitle: { type: Type.STRING },
        parties: { type: Type.ARRAY, items: { type: Type.STRING } },
        executiveSummary: { type: Type.STRING },
        riskAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    clauseText: { type: Type.STRING },
                    riskCategory: { type: Type.STRING },
                    identifiedRisk: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                }
            }
        },
        keyObligations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    party: { type: Type.STRING },
                    obligation: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                }
            }
        },
        undefinedTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
        penaltyClauses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Shartnomadagi jarimalar, peniyalar yoki sanksiyalar bilan bog'liq barcha bandlar." },
        forceMajeureClauses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Fors-major holatlari bilan bog'liq barcha bandlar." },
        overallRecommendation: { type: Type.STRING },
    },
    required: ['contractTitle', 'parties', 'executiveSummary', 'riskAnalysis', 'keyObligations', 'undefinedTerms', 'overallRecommendation', 'penaltyClauses', 'forceMajeureClauses']
};


export async function analyzeContract(files: File[]): Promise<Omit<ContractAnalysisResult, 'id' | 'fileName' | 'analysisDate'>> {
    if (!files || files.length === 0) {
        throw new Error("No files provided for analysis.");
    }

    const modelParts: any[] = [];
    const fileNames = files.map(f => f.name);

    for (const file of files) {
        const base64 = await fileToBase64(file);
        modelParts.push({
            inlineData: {
                mimeType: file.type,
                data: base64,
            }
        });
    }

    const prompt = createContractAnalysisPrompt(fileNames);
    modelParts.push({ text: prompt });

    // Use retry logic for more reliable results
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: modelParts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: contractAnalysisSchema,
                systemInstruction: "You are a professional legal contract analyst. Your task is to analyze the provided contract documents and extract the required information. Use the Google Search tool if needed to verify legal terms or find relevant precedents. All information must be accurate and based on the contract content. Return ONLY valid JSON without any additional text, explanations, or markdown formatting."
            },
        });
    });

    try {
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        return result;
    } catch (error) {
        console.error("Failed to parse JSON response from contract analysis:", response.text);
        throw new Error("AI-dan shartnoma tahlili javobini tahlil qilib bo'lmadi.");
    }
}

export async function discoverTenders(keywords: string, region: string, industry: string, platform?: string): Promise<DiscoveredTender[]> {
    // First, try to use Google Custom Search to find tenders directly
    try {
        console.log("Attempting to use Google Custom Search API for tender discovery...");
        console.log("Keywords:", keywords, "Region:", region, "Industry:", industry);
        
        // Build search query
        let searchQuery = "";
        if (keywords) searchQuery += `${keywords} `;
        if (industry) searchQuery += `${industry} `;
        if (region) searchQuery += `${region} `;
        searchQuery += "tender";
        
        // Use our custom search utility to find tenders
        const tenders = await googleCustomSearch.findTenders(searchQuery, region);
        console.log("Found", tenders.length, "potential tenders through Google Custom Search");
        
        // If we found tenders through Google Search, use them
        if (tenders.length > 0) {
            // Convert to the expected format
            const discoveredTenders: DiscoveredTender[] = tenders.slice(0, 5).map(tender => ({
                title: tender.title.substring(0, 100), // Limit length
                customer: "Aniqlanmagan", // We would need to extract this from the tender
                startPrice: "Aniqlanmagan",
                deadline: "Aniqlanmagan",
                platform: platform || "xarid.uzex.uz", // Default to main platform
                url: tender.url
            }));
            
            // Try to extract more detailed information from the tender pages
            for (const discoveredTender of discoveredTenders) {
                try {
                    // Use AI to extract details from the tender URL
                    const extractionPrompt = `Visit this tender URL: ${discoveredTender.url}
                    Extract the following information in Uzbek:
                    1. Customer/organization name
                    2. Starting price (with currency)
                    3. Submission deadline
                    
                    Return ONLY a JSON object with these fields:
                    {
                      "customer": "customer name",
                      "startPrice": "price with currency",
                      "deadline": "deadline"
                    }`;
                    
                    const extractionResponse = await retryWithBackoff(async () => {
                        return await ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: extractionPrompt,
                            config: {
                                tools: [{googleSearch: {}}],
                            },
                        });
                    });
                    
                    // Try to parse the extracted information
                    try {
                        const extractedInfo = JSON.parse(extractionResponse.text);
                        if (extractedInfo.customer) discoveredTender.customer = extractedInfo.customer;
                        if (extractedInfo.startPrice) discoveredTender.startPrice = extractedInfo.startPrice;
                        if (extractedInfo.deadline) discoveredTender.deadline = extractedInfo.deadline;
                    } catch (parseError) {
                        console.warn("Failed to parse extracted tender info:", parseError);
                    }
                } catch (extractionError) {
                    console.warn("Failed to extract detailed tender info:", extractionError);
                }
            }
            
            return discoveredTenders;
        }
    } catch (searchError) {
        console.warn("Google Custom Search API failed for tender discovery, falling back to AI search:", searchError);
    }
    
    // Fallback to original implementation
    const queryParts = [];
    if (keywords) queryParts.push(`kalit so'zlar: "${keywords}"`);
    if (region) queryParts.push(`hudud: "${region}"`);
    if (industry) queryParts.push(`soha: "${industry}"`);
    if (platform) queryParts.push(`platforma: "${platform}"`);
    
    const platformFilter = platform ? `specifically on the platform "${platform}"` : `on Uzbekistan's public procurement platforms (xarid.uzex.uz, xt-xarid.uz)`;
    
    const prompt = `
        **Persona:** You are an AI Tender Discovery Agent for Uzbekistan.
        **Mission:** Find active tenders ${platformFilter} that match the following criteria: ${queryParts.join(', ')}.
        **Instructions:**
        1. Use your search tool to find relevant, currently active tender announcements.
        2. For each tender found (maximum 5), extract the following information precisely.
        3. If you cannot find a specific piece of information, use "N/A".
        4. Your output MUST be ONLY a valid JSON array of objects. Do not add any conversational text, backticks, or other formatting.
        
        **JSON Schema for each object in the array:**
        {
          "title": "The official name of the lot/tender.",
          "customer": "The name of the procuring organization.",
          "startPrice": "The starting price, including currency.",
          "deadline": "The submission deadline.",
          "platform": "The platform it was found on ('xarid.uzex.uz' or 'xt-xarid.uz').",
          "url": "The direct URL to the tender announcement."
        }
    `;

    // Use retry logic for more reliable results
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                systemInstruction: "You are a professional tender discovery agent. Your task is to find real, active tenders in Uzbekistan. You MUST use the Google Search tool to find current tender announcements. Verify that all tenders are currently active and not closed. All information must be verified through official sources. Return ONLY valid JSON without any additional text, explanations, or markdown formatting."
            },
        });
    });
    
    try {
        let jsonText = response.text.trim();
        // Handle cases where the model might still wrap the JSON in backticks
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }

        const results: DiscoveredTender[] = JSON.parse(jsonText);
        return results;
    } catch (e) {
        console.error("Failed to discover tenders:", response.text, e);
        throw new Error("Tenderlarni qidirishda xatolik yuz berdi. AI yaroqsiz formatda javob qaytardi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
}

export async function generateDashboardInsights(tenders: AnalysisResult[]): Promise<AIInsight[]> {
  const prompt = `
    **Persona:** You are "AI-Broker Strategist Elite", a world-class business intelligence analyst with expertise in competitive market dynamics, financial optimization, and strategic business development. Your insights have helped Fortune 500 companies dominate their markets.

    **Mission:** Analyze the user's complete tender portfolio to identify game-changing patterns, hidden opportunities, and strategic advantages. Generate insights that would be worthy of a McKinsey strategic consulting report.

    **ADVANCED ANALYTICAL FRAMEWORK:**
    
    **📊 COMPETITIVE INTELLIGENCE ANALYSIS:**
    - Identify recurring competitors and analyze their behavioral patterns
    - Map competitive strategies and predict future market moves
    - Detect market opportunities where competitors are weak
    - Analyze pricing strategies and identify cost leadership opportunities
    
    **💰 FINANCIAL OPTIMIZATION PATTERNS:**
    - Identify high-value customer relationships and expansion opportunities
    - Analyze profit margin trends and optimization potential
    - Detect seasonal patterns and market timing opportunities
    - Map supply chain optimization opportunities
    
    **🎯 STRATEGIC MARKET POSITIONING:**
    - Identify market segments with highest win probability
    - Analyze customer preferences and buying behavior patterns
    - Detect emerging market trends and disruption opportunities
    - Map strategic partnerships and alliance opportunities
    
    **🚀 BUSINESS GROWTH ACCELERATION:**
    - Identify scalability opportunities and market expansion potential
    - Analyze operational efficiency improvements
    - Detect innovation opportunities and competitive differentiation
    - Map strategic investment priorities and resource allocation

    **Input Data Analysis:**
    ---
    ${JSON.stringify(tenders.map(t => ({ 
        status: t.status,
        customerName: t.lotPassport?.customerName,
        winnerCompany: t.winnerInfo?.winnerCompany,
        competitors: t.competitorAnalysis?.map(c => c.name),
        itemCategory: t.lotPassport?.itemName,
        startPrice: t.lotPassport?.startPrice,
        predictedWinningBid: t.predictedWinningBid,
        winProbability: t.pricingStrategy?.map(p => p.winProbability),
        platform: t.platform,
        analysisDate: t.analysisDate,
        riskScore: t.riskScore,
        opportunityScore: t.opportunityScore
    })))} 
    ---

    **ENHANCED ANALYSIS PROTOCOLS:**
    1.  **Deep Competitor Pattern Analysis:** 
        - Identify competitors who appear in multiple tenders
        - Analyze their winning strategies and pricing patterns
        - Detect their market focus areas and competitive weaknesses
        - Predict their likely behavior in future tenders
    
    2.  **Customer Relationship Intelligence:**
        - Identify high-value customers with multiple tender opportunities
        - Analyze customer preferences and decision-making patterns
        - Detect loyalty patterns and relationship strengthening opportunities
        - Map potential customer expansion and cross-selling opportunities
    
    3.  **Market Trend Recognition:**
        - Identify emerging market trends and industry shifts
        - Analyze seasonal patterns and market timing opportunities
        - Detect pricing trends and margin optimization possibilities
        - Map technology adoption and innovation opportunities
    
    4.  **Strategic Performance Optimization:**
        - Analyze win/loss patterns to identify success factors
        - Detect operational bottlenecks and process improvements
        - Identify skill gaps and capability development needs
        - Map strategic investment priorities for competitive advantage

    **Output Format (JSON):** You MUST strictly adhere to the provided JSON schema. The output must be a JSON array. Each object in the array represents one insight card. All text MUST be in Uzbek.

    - \`type\`: Must be one of 'competitor', 'opportunity', 'strategy', or 'trend'.
    - \`title\`: A short, catchy title for the insight (in Uzbek).
    - \`description\`: A 1-2 sentence explanation of the insight and your recommendation (in Uzbek).
    - \`ctaLabel\`: A short call-to-action label for a button (in Uzbek).
    - \`ctaActionView\`: The view the button should navigate to. Must be one of 'dashboard', 'analytics', 'competitors', 'contracts', 'profile'.
    `;
    
    const insightSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                ctaLabel: { type: Type.STRING },
                ctaActionView: { type: Type.STRING },
            },
            required: ['type', 'title', 'description', 'ctaLabel', 'ctaActionView']
        }
    };

    // Use retry logic for more reliable results
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: insightSchema,
                systemInstruction: "You are a professional business intelligence analyst. Your task is to analyze the tender portfolio and generate insights. Use the Google Search tool if needed to find market trends or competitive intelligence. All information must be accurate and relevant. Return ONLY valid JSON without any additional text, explanations, or markdown formatting."
            }
        });
    });
    
    try {
        const jsonText = response.text;
        const result: AIInsight[] = JSON.parse(jsonText);
        return result;
    } catch(error) {
        console.error("Failed to generate dashboard insights:", error);
        return []; // Return empty array on error
    }
}

export async function generateVisionaryInsights(tenders: AnalysisResult[]): Promise<VisionaryInsight | null> {
    if (tenders.length < 5) { // Require more data for future prediction
        return null;
    }
  
    const prompt = `
    **Persona:** You are a council of three distinct AI Visionaries, tasked with providing forward-looking strategic advice for a procurement company in Uzbekistan. Your analysis is based on the user's past tender history and your vast knowledge of global and regional market trends, technology, and innovation.

    **Council Members:**
    1.  **Trend Analizatori A.I.:** A data-driven market analyst. Your focus is on identifying emerging and declining trends in the procurement landscape based on the provided tender data. You analyze tender frequency, types, customer behavior, and pricing patterns.
    2.  **Innovatsiya A.I.:** A creative strategist and innovation consultant. Your focus is on new business processes, winning strategies, and service offerings that the user could adopt to gain a competitive advantage. You think outside the box.
    3.  **Bo'lajak Texnologiyalar A.I.:** A futurist and technologist. Your focus is on disruptive technologies and long-term technological shifts that will impact the user's industry. You predict which technologies will become important and how the user can prepare.

    **Mission:** Analyze the provided tender history. Conduct a "council meeting" where each AI provides one key insight from their unique perspective. Then, synthesize these insights into a single, actionable summary recommendation for the user. The entire output must be in Uzbek.

    **Input Data (User's Tender History Summary):**
    ---
    ${JSON.stringify(tenders.map(t => ({
        status: t.status,
        itemName: t.lotPassport?.itemName || 'N/A',
        customerName: t.lotPassport?.customerName || 'N/A',
        industry_tags: t.tags || [],
        startPrice: t.lotPassport?.startPrice || 'N/A',
        analysisDate: t.analysisDate,
    })))}
    ---

    **Output Format (JSON):** You MUST strictly adhere to the provided JSON schema. Do not add any conversational text.

    **JSON Schema:**
    {
      "trendAnalyzer": "A concise insight (2-3 sentences) from the Trend Analyzer A.I.",
      "innovationAI": "A concise insight (2-3 sentences) from the Innovation A.I.",
      "futureTechAI": "A concise insight (2-3 sentences) from the Future Technologies A.I.",
      "summary": "A single, synthesized paragraph that combines the three insights into a cohesive, forward-looking strategy for the user."
    }
    `;

    const visionaryInsightSchema = {
        type: Type.OBJECT,
        properties: {
            trendAnalyzer: { type: Type.STRING },
            innovationAI: { type: Type.STRING },
            futureTechAI: { type: Type.STRING },
            summary: { type: Type.STRING },
        },
        required: ['trendAnalyzer', 'innovationAI', 'futureTechAI', 'summary']
    };
    
    // Use retry logic for more reliable results
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: visionaryInsightSchema,
                systemInstruction: "You are a council of AI visionaries providing strategic advice. Your task is to analyze the tender history and generate forward-looking insights. Use the Google Search tool if needed to find market trends or technological developments. All information must be accurate and relevant. Return ONLY valid JSON without any additional text, explanations, or markdown formatting."
            }
        });
    });
    
    try {
        const jsonText = response.text;
        const result: VisionaryInsight = JSON.parse(jsonText);
        return result;
    } catch (error) {
        console.error("Failed to generate visionary insights:", error);
        return null;
    }
}   