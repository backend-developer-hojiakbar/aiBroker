import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, TenderData, Platform, LotPassport, AnalysisContext, ChatMessage, CompanyProfile, ContractAnalysisResult, AIInsight, DiscoveredTender, VisionaryInsight, SourcingResult, SourcingRecommendation } from '../types';

let chat: Chat | null = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        // Add more language-specific variations as needed
    ];
    
    // Add common search terms in different languages
    const searchTerms = [
        ...typoVariations,
        `${productName} narx`, // price in Uzbek
        `${productName} цена`, // price in Russian
        `${productName} price`, // price in English
        `${productName} yetkazib berish`, // delivery in Uzbek
        `${productName} доставка`, // delivery in Russian
        `${productName} delivery`, // delivery in English
        `${productName} sotish`, // sale in Uzbek
        `${productName} продажа`, // sale in Russian
        `${productName} sale`, // sale in English
    ];
    
    // Remove duplicates and empty strings
    return [...new Set(searchTerms.filter(v => v && v.length > 0))];
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
       
       **🌍 INTERNATIONAL ULTRA-COMPETITIVE SEARCH (Multilingual):**
       - "[PRODUCT_NAME_ENGLISH] cheapest manufacturer China export price" OR "[PRODUCT_NAME_LATIN] arzon ishlab chiqaruvchi Xitoy eksport narxi"
       - "[PRODUCT_NAME_ENGLISH] lowest price factory China wholesale" OR "[PRODUCT_NAME_RUSSIAN] самая низкая цена завод Китай опт"
       - "[PRODUCT_NAME_ENGLISH] bulk discount China manufacturer contact" OR "[PRODUCT_NAME_LATIN] ulgurji chegirma Xitoy ishlab chiqaruvchi kontakt"
       - "[PRODUCT_NAME_ENGLISH] wholesale supplier Turkey best price" OR "[PRODUCT_NAME_CYRILLIC] оптовый поставщик Турция лучшая цена"
       - "[PRODUCT_NAME_ENGLISH] factory direct Russia export cheap" OR "[PRODUCT_NAME_LATIN] zavod to'g'ridan-to'g'ri Rossiya eksport arzon"
       - "[PRODUCT_NAME_ENGLISH] manufacturer India lowest cost export" OR "[PRODUCT_NAME_RUSSIAN] производитель Индия самые низкие расходы экспорт"
       - "[PRODUCT_NAME_ENGLISH] producer Iran competitive price export" OR "[PRODUCT_NAME_LATIN] ishlab chiqaruvchi Eron raqobatbardosh narx eksport"
       - "[PRODUCT_NAME_ENGLISH] wholesale Belarus Kazakhstan cheap" OR "[PRODUCT_NAME_CYRILLIC] опт Беларусь Казахстан дешево"
       - "[PRODUCT_NAME_ENGLISH] direct manufacturer price list export" OR "[PRODUCT_NAME_LATIN] ishlab chiqaruvchi zavoddan narx ro'yxati eksport"
       - "[PRODUCT_NAME_ENGLISH] B2B wholesale platform cheap price" OR "[PRODUCT_NAME_LATIN] B2B ulgurji platforma arzon narx"
       - "[PRODUCT_NAME_ENGLISH] Alibaba cheapest supplier contact" OR "[PRODUCT_NAME_CYRILLIC] Alibaba самый дешевый поставщик контакт"
       - "[PRODUCT_NAME_ENGLISH] Made-in-China lowest price manufacturer" OR "[PRODUCT_NAME_LATIN] Made-in-China eng arzon narx ishlab chiqaruvchi"
       
       **💰 AGGRESSIVE PRICE HUNTING STRATEGIES (Multilingual):**
       - "[PRODUCT_NAME_ENGLISH] price comparison cheapest supplier" OR "[PRODUCT_NAME_LATIN] narx solishtirish eng arzon ta'minotchi"
       - "[PRODUCT_NAME_ENGLISH] bulk order discount manufacturer" OR "[PRODUCT_NAME_RUSSIAN] скидка на оптовый заказ производитель"
       - "[PRODUCT_NAME_ENGLISH] wholesale price list catalog" OR "[PRODUCT_NAME_LATIN] ulgurji narx ro'yxati katalog"
       - "[PRODUCT_NAME_ENGLISH] clearance sale bulk purchase" OR "[PRODUCT_NAME_CYRILLIC] распродажа оптовая закупка"
       - "[PRODUCT_NAME_ENGLISH] end of line stock cheap price" OR "[PRODUCT_NAME_LATIN] oxirgi partiyalar arzon narx"
       - "[PRODUCT_NAME_ENGLISH] overstock liquidation sale" OR "[PRODUCT_NAME_RUSSIAN] ликвидация остатков распродажа"
       - "[PRODUCT_NAME_ENGLISH] factory seconds B grade cheap" OR "[PRODUCT_NAME_LATIN] zavod sekundlari B daraja arzon"

    **Input Data:**
    ---
    ${tenderText}
    ---

    **🎯 ULTRA-COMPETITIVE PRICE DISCOVERY PROTOCOL:**
    Your PRIMARY mission is to find the ABSOLUTE CHEAPEST suppliers that can deliver quality products. Follow this hierarchy:
    
    **PRICE PRIORITY RANKING:**
    1. **ERSHEY Direct Manufacturers** (Highest Priority - Cheapest prices)
    2. **📦 Wholesale/Bulk Suppliers** (High Priority - Volume discounts)
    3. **🏢 Official Distributors** (Medium Priority - Competitive prices)
    4. **🏪 Authorized Resellers** (Low Priority - Higher markups)
    
    **MANDATORY PRICE VALIDATION:**
    - Search for MULTIPLE price points from each supplier
    - Look for bulk/volume discount pricing
    - Check for special offers, clearance sales, or promotions
    - Compare FOB, CIF, and delivered prices
    - Verify minimum order quantities for best pricing
    
    **COST OPTIMIZATION SEARCH TERMS (Multilingual):**
    - "[PRODUCT_NAME_ENGLISH] FOB price factory direct" OR "[PRODUCT_NAME_LATIN] FOB narx zavod to'g'ridan-to'g'ri"
    - "[PRODUCT_NAME_ENGLISH] CIF price Uzbekistan import" OR "[PRODUCT_NAME_CYRILLIC] CIF цена Узбекистан импорт"
    - "[PRODUCT_NAME_ENGLISH] bulk order minimum quantity price" OR "[PRODUCT_NAME_LATIN] ulgurji buyurtma minimal miqdor narx"
    - "[PRODUCT_NAME_ENGLISH] wholesale price volume discount" OR "[PRODUCT_NAME_RUSSIAN] оптовая цена скидка по объему"
    - "[PRODUCT_NAME_ENGLISH] ex-works price manufacturer" OR "[PRODUCT_NAME_LATIN] ishlab chiqaruvchi zavoddan narx"
    
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
    4. **Cost Comparison:** Cross-reference prices from multiple suppliers for same product
    
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
    
    **🚀 AGGRESSIVE SEARCH EXECUTION STRATEGY:**
    1. **Multi-Source Price Discovery**: Search 5-10 different suppliers per product category
    2. **Volume-Based Pricing**: Always check for bulk/wholesale pricing tiers
    3. **Geographic Price Comparison**: Compare domestic vs international pricing
    4. **Supply Chain Optimization**: Prioritize manufacturers over distributors
    5. **Cost Structure Analysis**: Look for FOB, CIF, DDP pricing options
    6. **Market Intelligence**: Check for seasonal pricing, promotions, clearance sales
    7. **Quality vs Cost Balance**: Ensure cheapest options still meet quality requirements
    8. **Lead Time Optimization**: Factor delivery time into total cost equation
    
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
        "priceComment": "string (source of price information)"
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

    if (files && files.length > 0) {
        hasFiles = true;
        for (const file of files) {
            const base64 = await fileToBase64(file);
            modelParts.push({ inlineData: { mimeType: file.type, data: base64 } });
        }
        // Extract text from files to use for analysis
        const textExtractionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...modelParts, { text: 'Extract all text content from all provided documents. Combine the text into a single block.' }] }
        });
        tenderText = textExtractionResponse.text;
    } else if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        // Handle URL in text field (for discovered tenders)
        const textExtractionPrompt = `Use your search tool to access and return the FULL text content of this URL: ${text}`;
        const response = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: textExtractionPrompt, 
            config: { tools: [{ googleSearch: {} }] } 
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
        const productResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: productExtractionPrompt
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
            
            const specificResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: specificProductPrompt
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

    // CRITICAL: Force Google Search tool usage with strict configuration
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: hasFiles ? { parts: modelParts } : sourcingPrompt,
        config: { 
            tools: [{ googleSearch: {} }],
            // Additional configuration to ensure search tool usage and proper JSON formatting
            systemInstruction: "You MUST use the Google Search tool for EVERY piece of supplier information. Do not proceed without real search verification. If you cannot find real data through Google search, return 'Ma'lumot topilmadi' instead of generating content. CRITICAL: Return ONLY valid JSON without any additional text, explanations, or markdown formatting. Use proper JSON syntax with double quotes for strings. Always search in multiple languages (Uzbek Latin, Uzbek Cyrillic, Russian, English) to find the most comprehensive results. Use the provided product name variations to improve search accuracy. For each supplier, you MUST verify contact information through official sources. Search for the exact company name plus terms like 'official website', 'contact information', 'phone number', 'email address' to verify authenticity. Never invent contact details."
        },
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
                systemInstruction: "You MUST return ONLY valid JSON without any additional text, explanations, or markdown formatting. Use proper JSON syntax with double quotes for all strings. Ensure all required fields are present in the response."
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

    const systemInstruction = `You are a helpful assistant for analyzing procurement tenders. The user has already received a full analysis from you. They are now asking follow-up questions. Use the provided context (original tender text and your previous analysis) to answer their questions accurately and concisely. Keep answers brief and to the point.
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
        },
    });
    
    const response = await chat.sendMessage({ message: userPrompt });

    return response.text;
}

export async function getCustomerInfo(customerName: string): Promise<GenerateContentResponse> {
    const prompt = `Provide a detailed business profile for the company "${customerName}". Focus on:
1.  **Core Business & Product Range:** What do they primarily sell or manufacture?
2.  **Market Reputation & Reviews:** Are they known for quality, low prices, or something else? Find any customer reviews or complaints.
3.  **Pricing Strategy:** Based on your search, would you classify them as a premium, mid-range, or budget-friendly supplier?
The goal is to deeply understand their position in the market. The answer must be in Uzbek.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    return response;
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: modelParts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: contractAnalysisSchema,
        },
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: insightSchema
            }
        });
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
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: visionaryInsightSchema,
            }
        });
        const jsonText = response.text;
        const result: VisionaryInsight = JSON.parse(jsonText);
        return result;
    } catch (error) {
        console.error("Failed to generate visionary insights:", error);
        return null;
    }
}