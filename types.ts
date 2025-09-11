export enum Platform {
  XARID_UZEX = 'xarid.uzex.uz',
  XT_XARID = 'xt-xarid.uz',
}

export type TenderStatus = 'Analyzed' | 'Won' | 'Lost' | 'Did not participate';

export interface TenderData {
  text?: string;
  files?: File[];
  includeVat: boolean;
  additionalCosts: { description: string; amount: number }[];
}

export interface FeasibilityCheck {
  requirement: string;
  status: "Bajarish mumkin" | "Qiyinchiliklar mavjud" | "Bajarib bo'lmaydi";
  reasoning: string;
}

export interface FeasibilityAnalysis {
  overallAssessment: "Tavsiya etiladi" | "Ehtiyotkorlik tavsiya etiladi" | "Tavsiya etilmaydi";
  checks: FeasibilityCheck[];
}


/**
 * Contains all structured data extracted from the tender document.
 */
export interface LotPassport {
  itemName: string;
  hsCode: string;
  quantity: string;
  startPrice: string;
  customerName: string;
  deliveryAddress: string;
  deliveryTime: string;
  manufacturer: string;
  technicalRequirements: string[];
  warrantyPeriod: string;
  deadline?: string;
  procurementType?: string; // e.g., 'Auction', 'Request for Quotation'
}

/**
 * Defines a specific pricing strategy with detailed financial projections.
 */
export interface PricingTier {
  strategy: 'Xavfsiz' | 'Optimal' | 'Tavakkalchi';
  price: string; // Total price
  unitPrice: string; // Price per unit
  profit: string;
  winProbability: number;
  justification: string;
  strategicRationale: string[]; // New: Detailed rationale as a step-by-step array
}

export interface SourcingRecommendation {
  supplierName: string;
  price: string;
  availability: string; // e.g., "В наличии", "Под заказ", "15 шт."
  website?: string;
  phone?: string;
  address?: string;
  country?: string; // New: To specify country for foreign suppliers
  reasoning: string;
  contactPerson?: string;
  email?: string;
  isKeyRecommendation?: boolean;
  isSelected?: boolean;
  supplierType: 'Ishlab chiqaruvchi' | 'Rasmiy Distributor' | 'Opt sotuvchi' | 'Reseller' | 'Noma\'lum';
  trustScore: number; // A score from 1-10 indicating reliability
  reliabilityFactors: string[]; // List of positive factors found (e.g., "Official website", "Positive reviews")
  priceComment?: string; // e.g., "Verified from catalog", "Estimated market price"
}

export interface SourcingResult {
    sourcingRecommendations: SourcingRecommendation[];
    foreignSourcingRecommendations: SourcingRecommendation[];
    tenderText: string;
    lotPassport: Partial<LotPassport>;
}

export interface PostWinStep {
    step: string;
    description: string;
}

export interface LegalClause {
    clause: string;
    risk: string;
    recommendation: string;
}

export interface Requirement {
    category: 'Documentary' | 'Technical' | 'Qualification' | 'Other';
    requirement: string;
}

export interface RiskFactor {
    risk: string;
    mitigation: string;
    severity: 'High' | 'Medium' | 'Low'; // New: Risk severity
}

/**
 * Information about the winning bid, used for feedback and learning.
 */
export interface WinnerInfo {
    winnerPrice?: string;
    winnerCompany?: string;
    actualCost?: string;
    actualDeliveryDate?: string;
    deliveryDifficulties?: string;
    customsDuties?: string;
    certificationCosts?: string;
}

/**
 * Analysis of a potential competitor for the tender.
 */
export interface CompetitorInsight {
    name: string;
    likelyStrategy: string;
    strengths: string[]; // New: To provide a balanced view
    weaknesses: string[];
    confidenceScore: 'High' | 'Medium' | 'Low';
}

/**
 * The primary data structure for a complete tender analysis result.
 */
export interface AnalysisResult {
  id: string;
  analysisDate: string;
  status: TenderStatus;
  platform: Platform;
  url?: string;
  lotPassport: LotPassport;
  feasibilityAnalysis: FeasibilityAnalysis;
  executiveSummary: string; // New: High-level summary
  summary: string;
  riskScore: number;
  riskFactors: RiskFactor[]; 
  redFlags?: string[]; 
  opportunityScore: number;
  opportunityFactors: string[];
  expectedCompetitors: number;
  predictedWinner?: string;
  predictedWinningBid?: string;
  competitorAnalysis: CompetitorInsight[]; // New: Detailed competitor analysis
  winThemes: string[]; // New: Strategic themes for the proposal
  submissionStrategy: string; // New: Tactical advice on submission
  pricingStrategy: PricingTier[];
  redLinePrice: string;
  estimatedNetProfit: string;
  estimatedCostBreakdown: {
    item: string;
    cost: string;
    description: string;
  }[];
  sourcingRecommendations: SourcingRecommendation[];
  foreignSourcingRecommendations?: SourcingRecommendation[]; // New: For international suppliers
  assemblyOptions?: { part: string; sourcingSuggestion: string; }[];
  optimizationTips?: string[];
  postWinPlan: PostWinStep[];
  requirementsChecklist: Requirement[];
  legalAnalysis: LegalClause[];
  isArchived: boolean;
  isWatched: boolean;
  winnerInfo?: WinnerInfo;
  tags?: string[];
  assignedAgentId?: string;
  analysisType?: 'manual' | 'auto';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}

/**
 * The context provided to the chat interface for answering questions.
 */
export interface AnalysisContext {
  originalTenderText: string;
  platform: Platform;
  analysisResult: AnalysisResult;
}

/**
 * Represents the user's UI preferences.
 */
export interface UIPreferences {
  theme: 'default' | 'corporate' | 'cosmos' | 'energy';
  iconStyle: 'line' | 'bold';
}

/**
 * Represents settings for automated tender discovery and analysis.
 */
export interface AutomationSettings {
  isEnabled: boolean;
  keywords: string;
  region: string;
  industry: string;
  scanIntervalMinutes: number; // e.g., 30, 60, 240
}

/**
 * Represents a sales agent in the company.
 */
export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Represents the user's company profile for personalized analysis.
 */
export interface CompanyProfile {
  companyName: string;
  overheadPercentage: number;
  vatRate: number;
  bankGuaranteeFee: number;
  preferredSuppliers: string;
  salesAgents?: SalesAgent[];
  uiPreferences?: UIPreferences;
  automationSettings?: AutomationSettings;
}

// --- New Types for Contract Analysis ---

export interface ContractClauseAnalysis {
    clauseText: string;
    riskCategory: 'High' | 'Medium' | 'Low';
    identifiedRisk: string;
    recommendedAction: string;
}

export interface ContractObligation {
    party: 'Mening Kompaniyam' | 'Boshqa Tomon';
    obligation: string;
    dueDate: string;
}

export interface ContractAnalysisResult {
  id: string;
  fileName: string;
  analysisDate: string;
  contractTitle: string;
  parties: string[];
  executiveSummary: string;
  riskAnalysis: ContractClauseAnalysis[];
  keyObligations: ContractObligation[];
  undefinedTerms: string[];
  penaltyClauses: string[];
  forceMajeureClauses: string[];
  overallRecommendation: "Tavsiya etiladi" | "Muzokara talab etiladi" | "Yuqori riskli";
}

// --- New Types for AI Insights ---
export type InsightType = 'competitor' | 'opportunity' | 'strategy' | 'trend';

export type InsightActionView = 'dashboard' | 'analytics' | 'competitors' | 'contracts' | 'profile';

export interface AIInsight {
  type: InsightType;
  title: string;
  description: string;
  ctaLabel: string;
  ctaActionView: InsightActionView;
}

export interface DiscoveredTender {
  title: string;
  customer: string;
  startPrice: string;
  deadline: string;
  platform: Platform;
  url: string;
}

// New type for AI Visionary Insights
export interface VisionaryInsight {
  trendAnalyzer: string;
  innovationAI: string;
  futureTechAI: string;
  summary: string;
}