
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { AnalysisResult, TenderStatus, FeasibilityCheck, PricingTier, SourcingRecommendation, CompetitorInsight, CompanyProfile } from '../types';
import { getCustomerInfo } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import { smartStorage } from '../utils/smartStorage';
import { 
    ShareIcon, CopyIcon, BackIcon, OutcomeIcon, DownloadIcon, ArrowUpIcon, SummaryIcon,
    PassportIcon, TargetIcon, CheckCircleIcon, XCircleIcon, InfoIcon, ShieldCheckIcon,
    PriceIcon, SafeStrategyIcon, OptimalStrategyIcon,
    RiskyStrategyIcon, ChevronDownIcon, SupplierIcon, LinkIcon, RiskIcon,
    Lightbulb, SparklesIcon, TelescopeIcon, TrophyIcon, PhoneIcon, UserIcon, MailIcon,
    BookmarkIcon, EyeIcon, TrendIcon, BarChart3, SearchIcon, BotIcon, AnalyzeIcon, Settings
} from './Icons';
import { Card, InfoTooltip } from './Card';

// Enhanced interfaces for strategic intelligence
interface StrategicInsight {
    type: 'opportunity' | 'risk' | 'competitive' | 'market';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    actionItems: string[];
    priority: number;
}

interface MarketIntelligence {
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
    competitiveAdvantage: string[];
    marketTrends: { trend: string; impact: string; timeframe: string }[];
    industryBenchmarks: { metric: string; value: number; industry: number; percentile: number }[];
}

interface VisualizationPreferences {
    showAdvancedMetrics: boolean;
    enableRealTimeUpdates: boolean;
    preferredChartTypes: string[];
    dashboardLayout: 'compact' | 'detailed' | 'analytics';
}

interface DashboardState {
    activeView: 'overview' | 'deep-analysis' | 'strategic' | 'competitive';
    bookmarkedSections: Set<string>;
    pinnedInsights: StrategicInsight[];
    lastRefreshed: Date;
    preferences: VisualizationPreferences;
}


declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface AnalysisDashboardProps {
  result: AnalysisResult;
  allTenders: AnalysisResult[];
  companyProfile: CompanyProfile | null;
  onNavigate: (view: 'dashboard' | 'input') => void;
  onSetOutcome: (status: TenderStatus) => void;
  onAssignAgent: (tenderId: string, agentId: string) => void;
  isReadOnly?: boolean;
}

const parseCurrency = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
};

// --- Re-usable Mini Components ---

const Gauge: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-1000 ease-out" />
            </svg>
            <span className="text-2xl font-bold -mt-16" style={{ color }}>{value}</span>
            <span className="mt-12 text-xs font-semibold text-text-secondary">{label}</span>
        </div>
    );
};

const PassportItem: React.FC<{ label: string, value?: React.ReactNode, onInfoClick?: () => void, valueClassName?: string }> = ({ label, value, onInfoClick, valueClassName }) => (
    <div className="py-1.5 px-1 flex justify-between items-center text-xs border-b border-border/50 last:border-b-0 min-h-[34px]">
        <span className="font-semibold text-text-secondary w-2/5 flex-shrink-0">{label}</span>
        <div className={`font-medium text-text-primary text-right flex items-center justify-end gap-1 w-3/5 break-words ${valueClassName}`}>
            <span>{value || 'N/A'}</span>
            {onInfoClick && (
                <button onClick={onInfoClick} className="text-brand-primary text-xs font-bold hover:underline flex-shrink-0">(info)</button>
            )}
        </div>
    </div>
);

const FeasibilityStatusIcon: React.FC<{ status: FeasibilityCheck['status'] }> = ({ status }) => {
    switch (status) {
        case 'Bajarish mumkin': return <CheckCircleIcon className="text-status-success flex-shrink-0" />;
        case 'Qiyinchiliklar mavjud': return <InfoIcon className="text-status-warning flex-shrink-0 h-6 w-6" />;
        case "Bajarib bo'lmaydi": return <XCircleIcon className="text-status-danger flex-shrink-0" />;
        default: return null;
    }
};

const PricingTierCard: React.FC<{ tier: PricingTier }> = ({ tier }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Memoized strategy configuration
    const strategyConfig = useMemo(() => ({
        icons: { 'Xavfsiz': <SafeStrategyIcon />, 'Optimal': <OptimalStrategyIcon />, 'Tavakkalchi': <RiskyStrategyIcon /> },
        colors: { 'Xavfsiz': 'border-blue-500', 'Optimal': 'border-brand-primary', 'Tavakkalchi': 'border-accent' }
    }), []);
    
    const profitAnalysis = useMemo(() => {
        const value = parseCurrency(tier.profit);
        return {
            value,
            isProfit: value >= 0,
            className: value >= 0 ? 'text-status-success' : 'text-status-danger',
            label: value >= 0 ? 'Foyda' : 'Zarar'
        };
    }, [tier.profit]);
    
    const icon = strategyConfig.icons[tier.strategy];
    const borderColor = strategyConfig.colors[tier.strategy];

    return (
        <div className={`rounded-lg border bg-black/20 ${borderColor} flex flex-col`}>
            <div className='p-2 flex-grow flex flex-col'>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h4 className="font-bold text-sm">{tier.strategy}</h4>
                    </div>
                    <div className="font-bold text-sm text-status-success">{tier.winProbability}%</div>
                </div>
                <div className="text-center my-2 flex flex-col justify-center">
                    <p className="text-xl font-extrabold text-text-primary">{tier.price}</p>
                    <p className="text-xs text-text-secondary -mt-1">({tier.unitPrice} / dona)</p>
                    <p className={`text-sm font-bold ${profitAnalysis.className} mt-2`}>
                        {tier.profit} ({profitAnalysis.label})
                    </p>
                </div>
                <div className="flex-grow mt-3 border-t border-border/50 pt-2">
                     <p className="text-xs text-text-secondary text-center">{tier.justification}</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full px-2 py-1 flex justify-between items-center text-xs font-semibold text-text-secondary hover:bg-white/5 transition-colors border-t border-border/50 mt-auto">
                Hisob-kitob Tafsilotlari <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="p-3 border-t border-border/50 animate-fade-in text-xs">
                     <dl className="space-y-2">
                         {(tier.strategicRationale || []).map((step, i) => {
                             const parts = step.split(':');
                             const label = (parts[0] || '').replace(/'/g, "").trim();
                             const value = (parts.slice(1).join(':') || '').trim().replace(/^=/, '').trim();
                             
                             const isTotalCost = label === "UMUMIY XARAJAT (Zararsizlik Nuqtasi)";
                             const isProfitLine = label === "Mo'ljallangan Sof Foyda";
                             const isFinalPrice = label === "YAKUNIY UMUMIY NARX (Taklif)";
                             const needsSeparator = i === 2 || i === 5 || i === 8 || i === 9 || i === 12;
                             
                             const isProfitValueNegative = isProfitLine && value.startsWith('-');
                             
                             return (
                                 <div key={i} className={`flex justify-between items-start gap-4 ${needsSeparator ? 'pt-2 border-t border-border/30' : ''}`}>
                                     <dt className={`text-text-secondary ${isTotalCost || isProfitLine || isFinalPrice ? 'font-semibold' : ''}`}>{label}</dt>
                                     <dd className={`font-semibold text-right ${isFinalPrice ? 'text-lg text-brand-primary' : isProfitLine ? (isProfitValueNegative ? 'text-status-danger' : 'text-status-success') : 'text-text-primary'}`}>{value}</dd>
                                 </div>
                             );
                         })}
                    </dl>
                </div>
            )}
        </div>
    );
};

// --- Modals ---

const ShareModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surface backdrop-blur-xl border border-border rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-brand-primary mb-4">Hisobotni Ulashish</h3>
                <p className="text-sm text-text-secondary mb-4">Ushbu havolaga ega bo'lgan har bir kishi hisobotning faqat o'qish uchun mo'ljallangan versiyasini ko'rishi mumkin.</p>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-background border-border">
                    <input type="text" readOnly value={url} className="flex-grow bg-transparent outline-none text-sm text-text-primary" />
                    <button onClick={handleCopy} className="bg-brand-primary text-white px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 hover:shadow-glow transition-shadow"><CopyIcon /> {copied ? 'Nusxalandi!' : 'Nusxalash'}</button>
                </div>
            </div>
        </div>
    );
};

const CustomerInfoModal: React.FC<{ customerName: string; onClose: () => void; pastTenders: AnalysisResult[] }> = ({ customerName, onClose, pastTenders }) => {
    const [info, setInfo] = useState<GenerateContentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const customerHistory = useMemo(() => {
        const history = pastTenders.filter(t => t.lotPassport?.customerName === customerName); const won = history.filter(t => t.status === 'Won').length; const lost = history.filter(t => t.status === 'Lost').length; const participated = won + lost;
        return { total: history.length, won, lost, winRate: participated > 0 ? ((won / participated) * 100).toFixed(0) : 0 };
    }, [customerName, pastTenders]);
    React.useEffect(() => { const fetchInfo = async () => { try { const response = await getCustomerInfo(customerName); setInfo(response); } catch (err) { setError(err instanceof Error ? err.message : "Ma'lumot olishda xatolik"); } finally { setIsLoading(false); } }; fetchInfo(); }, [customerName]);
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surface backdrop-blur-xl border border-border rounded-lg p-6 w-full max-w-2xl shadow-xl flex flex-col h-[70vh]" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-brand-primary mb-4">{customerName} haqida ma'lumot</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 p-4 bg-background rounded-lg">
                    <div><p className="text-2xl font-bold">{customerHistory.total}</p><p className="text-xs">Jami tenderlar</p></div>
                    <div><p className="text-2xl font-bold text-status-success">{customerHistory.won}</p><p className="text-xs">Yutgan</p></div>
                    <div><p className="text-2xl font-bold text-status-danger">{customerHistory.lost}</p><p className="text-xs">Yutqazgan</p></div>
                    <div><p className="text-2xl font-bold text-brand-secondary">{customerHistory.winRate}%</p><p className="text-xs">G'alaba foizi</p></div>
                </div>
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                    {isLoading && <p>Google Search'dan ma'lumot yuklanmoqda...</p>} {error && <p className="text-status-danger">{error}</p>}
                    {info && (<div> <p className="whitespace-pre-wrap">{info.text}</p> <div className="pt-4 border-t border-border mt-4"> <h4 className="font-semibold text-sm">Manbalar:</h4> <ul className="list-disc list-inside text-sm text-brand-primary"> {info.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk, i) => (<li key={i}><a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{chunk.web?.title || chunk.web?.uri}</a></li>))} </ul> </div> </div>)}
                </div>
            </div>
        </div>
    );
};

const SupplierInfoModal: React.FC<{ supplierName: string; onClose: () => void; }> = ({ supplierName, onClose }) => {
    const [info, setInfo] = useState<GenerateContentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const fetchInfo = async () => {
            setIsLoading(true);
            setError('');
            setInfo(null);
            try {
                const response = await getCustomerInfo(supplierName);
                if (!response.text?.trim()) {
                    setError("Ushbu ta'minotchi haqida qo'shimcha ma'lumot topilmadi.");
                }
                setInfo(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Ma'lumot olishda xatolik yuz berdi");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInfo();
    }, [supplierName]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surface backdrop-blur-xl border border-border rounded-lg p-6 w-full max-w-2xl shadow-xl flex flex-col h-[70vh]" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-brand-primary mb-4 flex-shrink-0">{supplierName} haqida ma'lumot</h3>
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                    {isLoading && <p>Google Search'dan ma'lumot yuklanmoqda...</p>}
                    {error && !isLoading && <p className="text-status-danger">{error}</p>}
                    {info?.text && !isLoading && !error && (
                        <div>
                            <p className="whitespace-pre-wrap">{info.text}</p>
                            {info.candidates?.[0]?.groundingMetadata?.groundingChunks && info.candidates?.[0]?.groundingMetadata?.groundingChunks.length > 0 && (
                                <div className="pt-4 border-t border-border mt-4">
                                    <h4 className="font-semibold text-sm">Manbalar:</h4>
                                    <ul className="list-disc list-inside text-sm text-brand-primary">
                                        {info.candidates[0].groundingMetadata.groundingChunks.map((chunk, i) => (
                                            <li key={i}>
                                                <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {chunk.web?.title || chunk.web?.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="flex justify-end mt-4 flex-shrink-0">
                    <button onClick={onClose} className="bg-gray-700 text-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    );
};

const KeyTakeaways: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    // Memoized strategy and assessment calculations
    const analysisData = useMemo(() => {
        const optimalStrategy = (result.pricingStrategy || []).find(p => p.strategy === 'Optimal');
        const overallAssessmentStyles = {
            'Tavsiya etiladi': 'bg-status-success/10 text-status-success border-status-success',
            'Ehtiyotkorlik tavsiya etiladi': 'bg-status-warning/10 text-status-warning border-status-warning',
            'Tavsiya etilmaydi': 'bg-status-danger/10 text-status-danger border-status-danger'
        };
        const assessmentStyle = overallAssessmentStyles[result.feasibilityAnalysis?.overallAssessment] || 'bg-gray-500/10 text-gray-400 border-gray-500';
        
        return {
            optimalStrategy,
            assessmentStyle,
            redFlagsCount: result.redFlags?.length || 0
        };
    }, [result.pricingStrategy, result.feasibilityAnalysis?.overallAssessment, result.redFlags]);

    return (
        <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl rounded-2xl border border-brand-primary/30 p-6 mb-6 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 backdrop-blur-sm">
                        <SparklesIcon className="w-6 h-6 text-brand-primary" />
                    </div>
                    Muhim Xulosalar
                </h3>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-xs font-semibold text-brand-primary animate-pulse-glow">
                        AI Tahlil
                    </div>
                    <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Enhanced Feasibility Card */}
                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
                    <div className="relative bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3 text-text-secondary font-semibold mb-4 text-sm">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            Muvofiqlik Xulosasi
                        </div>
                        <div className={`p-4 rounded-xl border-l-4 text-center backdrop-blur-sm ${analysisData.assessmentStyle} hover:scale-105 transition-transform duration-300`}>
                            <p className="font-bold text-lg">{result.feasibilityAnalysis?.overallAssessment || 'Baholanmagan'}</p>
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-slide-in" style={{width: '85%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Strategy Card */}
                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
                    <div className="relative bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-brand-primary/30 hover:border-brand-primary/50 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3 text-text-secondary font-semibold mb-4 text-sm">
                            <div className="p-2 rounded-lg bg-brand-primary/20">
                                <OptimalStrategyIcon className="w-4 h-4 text-brand-primary" />
                            </div>
                            Tavsiya etilgan Strategiya
                        </div>
                        {analysisData.optimalStrategy ? (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
                                    {analysisData.optimalStrategy.price}
                                </p>
                                <div className="flex justify-between text-xs mt-3">
                                    <span className="px-2 py-1 bg-status-success/20 text-status-success rounded-full font-semibold">
                                        {analysisData.optimalStrategy.profit} Foyda
                                    </span>
                                    <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary rounded-full font-semibold">
                                        {analysisData.optimalStrategy.winProbability}% G\'alaba
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-text-secondary">
                                <p className="text-sm">Strategiya topilmadi</p>
                                <div className="mt-2 w-8 h-8 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin mx-auto"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Risk Card */}
                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
                    <div className="relative bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3 text-text-secondary font-semibold mb-4 text-sm">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <RiskIcon className="w-4 h-4 text-red-400" />
                            </div>
                            Xavfli Nuqtalar
                        </div>
                        {analysisData.redFlagsCount > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-status-danger font-bold text-lg">{analysisData.redFlagsCount}</span>
                                    <span className="text-xs text-text-secondary">Xavfli Nuqta</span>
                                </div>
                                <ul className="list-none space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                    {result.redFlags?.slice(0, 3).map((flag, i) => (
                                        <li key={i} className="text-xs text-status-danger flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-status-danger mt-2 flex-shrink-0"></span>
                                            <span className="line-clamp-2">{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                                {analysisData.redFlagsCount > 3 && (
                                    <p className="text-xs text-text-secondary text-center pt-2 border-t border-border/30">
                                        +{analysisData.redFlagsCount - 3} ko\'proq
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-status-success font-semibold mb-2">Jiddiy xavflar yo\'q</p>
                                <div className="w-12 h-12 rounded-full bg-status-success/20 flex items-center justify-center mx-auto">
                                    <CheckCircleIcon className="w-6 h-6 text-status-success" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Enhanced Strategic Insights Component
const StrategicInsightsPanel: React.FC<{ 
    insights: StrategicInsight[]; 
    marketIntelligence: MarketIntelligence;
    onToggleBookmark: (sectionId: string) => void;
    bookmarkedSections: Set<string>;
}> = ({ insights, marketIntelligence, onToggleBookmark, bookmarkedSections }) => {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
    
    const getInsightIcon = (type: StrategicInsight['type']) => {
        switch (type) {
            case 'opportunity': return <TrophyIcon className="w-5 h-5 text-status-success" />;
            case 'risk': return <RiskIcon className="w-5 h-5 text-status-danger" />;
            case 'competitive': return <TelescopeIcon className="w-5 h-5 text-brand-primary" />;
            case 'market': return <TrendIcon className="w-5 h-5 text-brand-secondary" />;
            default: return <BotIcon className="w-5 h-5 text-text-secondary" />;
        }
    };
    
    const getImpactColor = (impact: StrategicInsight['impact']) => {
        switch (impact) {
            case 'high': return 'border-status-danger bg-status-danger/10 text-status-danger';
            case 'medium': return 'border-status-warning bg-status-warning/10 text-status-warning';
            case 'low': return 'border-status-success bg-status-success/10 text-status-success';
        }
    };
    
    return (
        <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl rounded-2xl border border-brand-primary/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
                        <BotIcon className="w-5 h-5 text-brand-primary" />
                    </div>
                    Strategik Tahlil
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onToggleBookmark('strategic-insights')}
                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                            bookmarkedSections.has('strategic-insights') 
                                ? 'bg-brand-primary text-white' 
                                : 'bg-black/20 text-text-secondary hover:text-brand-primary'
                        }`}
                    >
                        <BookmarkIcon className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400">
                        {insights.length} Insight
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div 
                        key={index} 
                        className="group relative overflow-hidden rounded-xl border border-border/50 bg-black/20 backdrop-blur-sm hover:border-brand-primary/50 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-black/40 backdrop-blur-sm">
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">{insight.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImpactColor(insight.impact)}`}>
                                                {insight.impact === 'high' ? 'Yuqori' : insight.impact === 'medium' ? 'O\'rta' : 'Past'} Ta'sir
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                                                <span className="text-xs text-text-secondary">{insight.confidence}% Ishonch</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
                                    className="p-2 rounded-lg bg-black/40 hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform duration-300 ${
                                        expandedInsight === index ? 'rotate-180' : ''
                                    }`} />
                                </button>
                            </div>
                            
                            <p className="text-sm text-text-secondary mb-3 leading-relaxed">{insight.description}</p>
                            
                            {expandedInsight === index && (
                                <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in">
                                    <h5 className="font-semibold text-text-primary text-xs mb-2 uppercase tracking-wide">Harakat Rejalari:</h5>
                                    <ul className="space-y-2">
                                        {insight.actionItems.map((action, actionIndex) => (
                                            <li key={actionIndex} className="flex items-start gap-2 text-xs text-text-secondary">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></div>
                                                <span className="leading-relaxed">{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Market Intelligence Summary */}
            <div className="mt-6 pt-6 border-t border-border/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-blue-500/30">
                        <h4 className="font-semibold text-text-primary text-sm mb-2 flex items-center gap-2">
                            <TargetIcon className="w-4 h-4 text-blue-400" />
                            Bozor Pozitsiyasi
                        </h4>
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 capitalize">
                            {marketIntelligence.marketPosition === 'leader' ? 'Yetakchi' :
                             marketIntelligence.marketPosition === 'challenger' ? 'Da\'vogar' :
                             marketIntelligence.marketPosition === 'follower' ? 'Ergashuvchi' : 'Maxsus'}
                        </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-green-500/30">
                        <h4 className="font-semibold text-text-primary text-sm mb-2 flex items-center gap-2">
                            <TrendIcon className="w-4 h-4 text-green-400" />
                            Raqobat Ustunliklari
                        </h4>
                        <p className="text-sm text-text-secondary">
                            {marketIntelligence.competitiveAdvantage.length} ta asosiy ustunlik
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = React.memo(({ result, allTenders, companyProfile, onNavigate, onSetOutcome, onAssignAgent, isReadOnly = false }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeSourcingTab, setActiveSourcingTab] = useState<'local' | 'foreign'>('local');
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(null);
  
  // Enhanced dashboard state management
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activeView: 'overview',
    bookmarkedSections: new Set(),
    pinnedInsights: [],
    lastRefreshed: new Date(),
    preferences: {
      showAdvancedMetrics: true,
      enableRealTimeUpdates: false,
      preferredChartTypes: ['gauge', 'bar', 'trend'],
      dashboardLayout: 'detailed'
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStrategicInsights, setShowStrategicInsights] = useState(false);
  
  // Load preferences from SmartStorage
  useEffect(() => {
    const savedState = smartStorage.getItem<any>(`dashboard-state-${result.id}`);
    if (savedState) {
      try {
        setDashboardState(prev => ({ 
          ...prev, 
          ...savedState, 
          bookmarkedSections: new Set(savedState.bookmarkedSections || []),
          lastRefreshed: new Date(savedState.lastRefreshed || Date.now())
        }));
      } catch (error) {
        console.error('Error loading dashboard state:', error);
      }
    }
  }, [result.id]);
  
  // Save preferences to localStorage
  const saveDashboardState = useCallback((newState: Partial<DashboardState>) => {
    const updatedState = { ...dashboardState, ...newState };
    setDashboardState(updatedState);
    
    const stateToSave = {
      ...updatedState,
      bookmarkedSections: [...updatedState.bookmarkedSections],
      lastRefreshed: updatedState.lastRefreshed.toISOString()
    };
    
    smartStorage.setItem(`dashboard-state-${result.id}`, stateToSave, {
        compress: true,
        validate: true,
        ttl: 7 * 24 * 60 * 60 * 1000 // 7 days for dashboard state
    });
  }, [dashboardState, result.id]);

  const assignedAgent = companyProfile?.salesAgents?.find(agent => agent.id === result.assignedAgentId);
  
  // Strategic Intelligence Generation
  const strategicInsights = useMemo((): StrategicInsight[] => {
    const insights: StrategicInsight[] = [];
    
    // Market Opportunity Analysis
    if (result.opportunityScore > 70) {
      insights.push({
        type: 'opportunity',
        title: 'Yuqori Imkoniyat Darajasi',
        description: `Bu tender ${result.opportunityScore}% imkoniyat darajasiga ega. Strategik pozitsiyangizni mustahkamlash uchun ushbu imkoniyatdan foydalaning.`,
        impact: 'high',
        confidence: result.opportunityScore,
        actionItems: [
          'Taklifni yuqori sifatda tayyorlang',
          'Asosiy raqobatchilarni tahlil qiling',
          'Buyurtmachi bilan aloqa o\'rnatishni kuchaytiring'
        ],
        priority: 1
      });
    }
    
    // Risk Assessment Insights
    if (result.riskScore > 60) {
      insights.push({
        type: 'risk',
        title: 'Xavf Darajasi Yuqori',
        description: `${result.riskScore}% xavf darajasi aniqlandi. Ehtiyotkorlik bilan yondashish tavsiya etiladi.`,
        impact: 'high',
        confidence: result.riskScore,
        actionItems: [
          'Risk mitigation strategiyasini ishlab chiqing',
          'Moliyaviy himoya choralarini ko\'ring',
          'Alternativ yechimlarni tayyorlang'
        ],
        priority: 2
      });
    }
    
    // Competitive Intelligence
    const strongCompetitors = result.competitorAnalysis?.filter(c => 
      parseInt(c.confidenceScore.replace('%', '')) > 70
    ) || [];
    
    if (strongCompetitors.length > 0) {
      insights.push({
        type: 'competitive',
        title: 'Kuchli Raqobat Muhiti',
        description: `${strongCompetitors.length} ta kuchli raqobatchi aniqlandi. Raqobat strategiyasini qayta ko\'rib chiqish zarur.`,
        impact: 'medium',
        confidence: 85,
        actionItems: [
          'Raqobatchilar strategiyasini tahlil qiling',
          'O\'zingizning raqobat ustunliklaringizni aniqlang',
          'Narx strategiyasini moslang'
        ],
        priority: 3
      });
    }
    
    // Market Position Analysis
    const optimalStrategy = result.pricingStrategy?.find(p => p.strategy === 'Optimal');
    if (optimalStrategy) {
      // Handle both number and string with % cases for winProbability
      const winProbabilityValue = typeof optimalStrategy.winProbability === 'string' 
        ? parseFloat(optimalStrategy.winProbability.replace('%', ''))
        : optimalStrategy.winProbability;
      
      if (winProbabilityValue > 60) {
        insights.push({
          type: 'market',
          title: 'Optimal Pozitsiya',
          description: `Optimal strategiya ${winProbabilityValue}% g'alaba ehtimoli bilan kuchli pozitsiyani ta'minlaydi.`,
          impact: 'high',
          confidence: winProbabilityValue,
          actionItems: [
            'Optimal strategiyani qo\'llang',
            'Taklifni ushbu strategiya asosida tayyorlang',
            'Moliyaviy resurslarni optimal taqsimlang'
          ],
          priority: 1
        });
      }
    }
    
    return insights.sort((a, b) => a.priority - b.priority);
  }, [result]);
  


  // Assessment style for overview view
  const assessmentStyle = useMemo(() => {
    const overallAssessmentStyles = {
      'Tavsiya etiladi': 'bg-status-success/10 text-status-success border-status-success',
      'Ehtiyotkorlik tavsiya etiladi': 'bg-status-warning/10 text-status-warning border-status-warning',
      'Tavsiya etilmaydi': 'bg-status-danger/10 text-status-danger border-status-danger'
    };
    return overallAssessmentStyles[result.feasibilityAnalysis?.overallAssessment] || 'bg-gray-500/10 text-gray-400 border-gray-500';
  }, [result.feasibilityAnalysis?.overallAssessment]);

  // Function to render content based on active view
  const renderViewContent = () => {
    switch (dashboardState.activeView) {
      case 'overview':
        return (
          <>
            {/* Left Column - Basic Info */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card title="Lot Pasporti" icon={<PassportIcon />}>
                <div className="space-y-3">
                  <PassportItem label="Boshlang'ich Narx" value={result.lotPassport?.startPrice} valueClassName="text-brand-primary font-bold" />
                  <PassportItem label="Buyurtmachi" value={result.lotPassport?.customerName} onInfoClick={() => setShowCustomerInfo(true)} />
                  <PassportItem label="Tugash Sanasi" value={result.lotPassport?.deadline} />
                  <PassportItem label="Hajmi" value={result.lotPassport?.quantity} />
                </div>
              </Card>
              
              <Card title="Baholash" icon={<ShieldCheckIcon />}>
                <div className={`p-4 rounded-xl border-l-4 text-center ${assessmentStyle}`}>
                  <h4 className="font-bold">{result.feasibilityAnalysis?.overallAssessment || "Baholanmagan"}</h4>
                </div>
              </Card>
            </div>
            
            {/* Middle Column - Strategy */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card title="Strategik Xulosa" icon={<SummaryIcon />}>
                <p className="text-sm">{result.executiveSummary}</p>
              </Card>
              
              <Card title="Narx Strategiyasi" icon={<PriceIcon />}>
                <div className="grid grid-cols-1 gap-2">
                  {(result.pricingStrategy || []).map(tier => (
                    <div key={tier.strategy} className="p-3 bg-black/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{tier.strategy}</span>
                        <span className="text-brand-primary font-bold">{tier.price}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{tier.justification}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Right Column - Suppliers & Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card title="Raqobatchilar" icon={<TelescopeIcon />}>
                <div className="space-y-2">
                  <p className="text-xs"><strong>Bashorat G'olib:</strong> {result.predictedWinner}</p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {(result.competitorAnalysis || []).slice(0, 3).map((c, i) => (
                      <div key={i} className="p-2 bg-black/20 rounded-md">
                        <p className="font-bold text-sm">{c.name}</p>
                        <p className="text-xs text-text-secondary">{c.likelyStrategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              <Card title="Ta'minotchilar" icon={<SupplierIcon />}>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {(result.sourcingRecommendations || []).slice(0, 3).map((rec, i) => (
                    <div key={i} className="p-2 bg-black/20 rounded-lg">
                      <p className="font-bold text-sm">{rec.supplierName}</p>
                      <p className="text-xs text-brand-primary">{rec.price}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        );
        
      case 'deep-analysis':
        return (
          <div className="col-span-12 space-y-6">
            <Card title="🔍 Chuqur Moliyaviy Tahlil" icon={<AnalyzeIcon />} className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-4">Moliyaviy Ko'rsatkichlar</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-lg">
                      <p className="text-sm text-text-secondary">Prognozlangan Sof Foyda</p>
                      <p className="text-xl font-bold text-brand-primary">{result.estimatedNetProfit}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-lg">
                      <p className="text-sm text-text-secondary">Qizil Chiziq Narxi</p>
                      <p className="text-xl font-bold text-status-danger">{result.redLinePrice}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4">Xarajatlar Taqsimoti</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(result.estimatedCostBreakdown || []).map((cost, i) => (
                      <div key={i} className="flex justify-between p-2 bg-black/20 rounded">
                        <span className="text-sm">{cost.item}</span>
                        <span className="font-bold text-brand-primary">{cost.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card title="Bajarilish Tahlili" icon={<TargetIcon />}>
              <div className="space-y-3">
                {(result.feasibilityAnalysis?.checks || []).map((check, i) => (
                  <div key={i} className={`p-3 rounded-lg border-l-4 ${
                    check.status === 'Bajarish mumkin' ? 'bg-status-success/10 border-status-success' :
                    check.status === 'Qiyinchiliklar mavjud' ? 'bg-status-warning/10 border-status-warning' :
                    'bg-status-danger/10 border-status-danger'
                  }`}>
                    <h6 className="font-semibold">{check.requirement}</h6>
                    <p className="text-xs text-text-secondary mt-1">{check.reasoning}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      
      case 'strategic':
        return (
          <div className="col-span-12 space-y-6">
            <Card title="⚡ Strategik Rejalash" icon={<OptimalStrategyIcon />} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-4">G'alaba Mavzulari</h4>
                  <ul className="space-y-2">
                    {(result.winThemes || []).map((theme, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                        {theme}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4">Taqdim Strategiyasi</h4>
                  <p className="text-sm text-text-secondary bg-black/20 p-4 rounded-lg">
                    {result.submissionStrategy}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card title="G'alaba Keyin Reja" icon={<TrophyIcon />}>
              <div className="space-y-3">
                {(result.postWinPlan || []).map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                    <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h6 className="font-semibold">{step.step}</h6>
                      <p className="text-xs text-text-secondary mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      
      case 'competitive':
        return (
          <div className="col-span-12 space-y-6">
            <Card title="🎯 Raqobat Tahlili" icon={<TargetIcon />} className="bg-gradient-to-br from-red-500/10 to-orange-500/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-4">Asosiy Raqobatchilar</h4>
                  <div className="space-y-4">
                    {(result.competitorAnalysis || []).map((competitor, i) => (
                      <div key={i} className="p-4 bg-black/20 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-bold">{competitor.name}</h6>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            competitor.confidenceScore === 'High' ? 'bg-status-success text-white' :
                            competitor.confidenceScore === 'Medium' ? 'bg-status-warning text-black' :
                            'bg-status-danger text-white'
                          }`}>
                            {competitor.confidenceScore}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{competitor.likelyStrategy}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs font-semibold text-status-success mb-1">Kuchli Tomonlar</p>
                            <ul className="text-xs text-text-secondary">
                              {competitor.strengths?.slice(0, 2).map((strength, si) => (
                                <li key={si}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-status-danger mb-1">Zaif Tomonlar</p>
                            <ul className="text-xs text-text-secondary">
                              {competitor.weaknesses?.slice(0, 2).map((weakness, wi) => (
                                <li key={wi}>• {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4">Bozor Bashorati</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/20 rounded-lg">
                      <p className="text-sm text-text-secondary">Kutilayotgan Raqobatchilar Soni</p>
                      <p className="text-2xl font-bold text-brand-primary">{result.expectedCompetitors}</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <p className="text-sm text-text-secondary">Prognozlangan G'olib</p>
                      <p className="font-bold text-brand-secondary">{result.predictedWinner}</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <p className="text-sm text-text-secondary">Prognozlangan G'olib Narx</p>
                      <p className="font-bold text-brand-secondary">{result.predictedWinningBid}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card title="Raqobat Strategiyasi" icon={<OptimalStrategyIcon />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(result.pricingStrategy || []).map(tier => (
                  <div key={tier.strategy} className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    tier.strategy === 'Optimal' ? 'border-brand-primary bg-brand-primary/10' :
                    tier.strategy === 'Xavfsiz' ? 'border-status-success bg-status-success/10' :
                    'border-status-warning bg-status-warning/10'
                  }`}>
                    <div className="text-center mb-3">
                      <h5 className="font-bold text-lg">{tier.strategy}</h5>
                      <p className="text-2xl font-bold text-brand-primary">{tier.price}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>G'alaba Ehtimoli:</span>
                        <span className="font-bold">{tier.winProbability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Foyda:</span>
                        <span className="font-bold text-status-success">{tier.profit}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-3">{tier.justification}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      
      default:
        return <div className="col-span-12 text-center py-8">Tanlangan ko'rinish topilmadi</div>;
    }
  };
  
  // Market Intelligence Analytics
  const marketIntelligence = useMemo((): MarketIntelligence => {
    const totalTenders = allTenders?.length || 0;
    const wonTenders = allTenders?.filter(t => t.status === 'Won').length || 0;
    const winRate = totalTenders > 0 ? (wonTenders / totalTenders) * 100 : 0;
    
    let marketPosition: MarketIntelligence['marketPosition'] = 'follower';
    if (winRate > 70) marketPosition = 'leader';
    else if (winRate > 50) marketPosition = 'challenger';
    else if (winRate > 30) marketPosition = 'follower';
    else marketPosition = 'niche';
    
    return {
      marketPosition,
      competitiveAdvantage: [
        'AI-powered analysis capabilities',
        'Strategic intelligence integration',
        'Real-time market insights'
      ],
      marketTrends: [
        { trend: 'Digital transformation in tendering', impact: 'High', timeframe: '2024-2025' },
        { trend: 'Increased competition transparency', impact: 'Medium', timeframe: '2024' }
      ],
      industryBenchmarks: [
        { metric: 'Win Rate', value: winRate, industry: 45, percentile: winRate > 45 ? 75 : 25 }
      ]
    };
  }, [allTenders]);
  
  // Export and sharing functions
  const handleShare = useCallback(async () => {
    const reportData = {
      ...result,
      isShared: true,
      sharedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(reportData);
    const base64Str = btoa(encodeURIComponent(dataStr));
    const shareUrl = `${window.location.origin}${window.location.pathname}#report=${base64Str}`;
    setShareUrl(shareUrl);
    setShowShareModal(true);
  }, [result]);
  
  const handleExportToPdf = useCallback(() => {
    if (!window.jspdf || !window.html2canvas) {
      console.error('PDF export libraries not loaded');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('analysis-report-content');
    
    if (!element) {
      console.error('Report content element not found');
      return;
    }
    
    window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0A0C10'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = `tender-analysis-${result.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    }).catch(error => {
      console.error('PDF export failed:', error);
    });
  }, [result.id]);
  
  // Bookmark toggle function
  const toggleBookmark = useCallback((sectionId: string) => {
    const newBookmarks = new Set(dashboardState.bookmarkedSections);
    if (newBookmarks.has(sectionId)) {
      newBookmarks.delete(sectionId);
    } else {
      newBookmarks.add(sectionId);
    }
    saveDashboardState({ bookmarkedSections: newBookmarks });
  }, [dashboardState.bookmarkedSections, saveDashboardState]);


  return (
    <>
        <div id="top">
            {showShareModal && <ShareModal url={shareUrl} onClose={() => setShowShareModal(false)} />}
            {showCustomerInfo && <CustomerInfoModal customerName={result.lotPassport?.customerName || ''} onClose={() => setShowCustomerInfo(false)} pastTenders={allTenders} />}
            {selectedSupplierName && <SupplierInfoModal supplierName={selectedSupplierName} onClose={() => setSelectedSupplierName(null)} />}

        {/* --- Enhanced Header --- */}
        <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl rounded-2xl border border-brand-primary/30 p-6 mb-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                {/* Left Side: Navigation and Title */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button 
                        onClick={() => onNavigate('dashboard')} 
                        className="group relative flex-shrink-0 h-12 w-12 flex items-center justify-center bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 backdrop-blur-sm text-text-primary rounded-2xl shadow-xl border border-brand-primary/30 hover:from-brand-primary hover:to-brand-secondary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl" 
                        title="Boshqaruv Paneliga Qaytish"
                    >
                        <BackIcon className="w-5 h-5" />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-primary/0 to-brand-secondary/0 group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all duration-300"></div>
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary truncate" title={result.lotPassport?.itemName || 'N/A'}>
                                {result.lotPassport?.itemName || 'Nomsiz Tender'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    result.status === 'Won' ? 'bg-status-success/10 text-status-success border-status-success' :
                                    result.status === 'Lost' ? 'bg-status-danger/10 text-status-danger border-status-danger' :
                                    result.status === 'Did not participate' ? 'bg-gray-500/10 text-gray-400 border-gray-500' :
                                    'bg-brand-primary/10 text-brand-primary border-brand-primary'
                                }`}>
                                    {result.status === 'Analyzed' ? 'Tahlil qilindi' : 
                                     result.status === 'Won' ? 'Yutildi' :
                                     result.status === 'Lost' ? 'Yutqazildi' :
                                     result.status === 'Did not participate' ? 'Qatnashmadi' : result.status}
                                </div>
                                <button 
                                    onClick={() => toggleBookmark('main-tender')}
                                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                                        dashboardState.bookmarkedSections.has('main-tender') 
                                            ? 'bg-brand-primary text-white' 
                                            : 'bg-black/20 text-text-secondary hover:text-brand-primary'
                                    }`}
                                    title="Tenderni belgilash"
                                >
                                    <BookmarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-text-secondary">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                <span className="truncate">{result.lotPassport?.customerName || 'Noma\'lum Buyurtmachi'}</span>
                            </div>
                            {result.lotPassport?.deadline && (
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <span className="w-2 h-2 rounded-full bg-status-warning"></span>
                                    <span>Muddat: {result.lotPassport.deadline}</span>
                                </div>
                            )}
                            {assignedAgent && (
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <span className="w-2 h-2 rounded-full bg-status-success"></span>
                                    <span>Agent: {assignedAgent.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Right Side: Action Controls */}
                <div className="flex items-center gap-4">
                    {/* Analysis Progress Indicator */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-status-success animate-pulse"></div>
                            <span className="text-xs font-semibold text-text-primary">Tahlil yakunlandi</span>
                        </div>
                        <div className="text-xs text-text-secondary">
                            {new Date(dashboardState.lastRefreshed).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleShare}
                            className="group relative p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm text-blue-400 rounded-xl border border-blue-500/30 hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl" 
                            title="Hisobotni ulashish"
                        >
                            <ShareIcon className="w-5 h-5" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300"></div>
                        </button>
                        
                        <button 
                            onClick={handleExportToPdf}
                            className="group relative p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm text-green-400 rounded-xl border border-green-500/30 hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl" 
                            title="PDF sifatida yuklab olish"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-300"></div>
                        </button>
                        
                        <button 
                            onClick={() => setShowStrategicInsights(!showStrategicInsights)}
                            className={`group relative p-3 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                                showStrategicInsights 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500' 
                                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 hover:from-purple-500 hover:to-pink-500 hover:text-white'
                            }`}
                            title="Strategik ko'rsatkichlar"
                        >
                            <BotIcon className="w-5 h-5" />
                            {!showStrategicInsights && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300"></div>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Outcome Section (Conditional) */}
                {result.status === 'Analyzed' && !isReadOnly && (
                    <div className="w-full lg:w-auto flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 backdrop-blur-sm rounded-xl border border-brand-primary/30 animate-fade-in">
                        <div className="text-left lg:text-right">
                            <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                                <OutcomeIcon className="w-4 h-4 text-brand-primary" />
                                Tender Natijasi?
                            </h3>
                            <p className="text-xs text-text-secondary">AI-ni o'rgatish uchun kiriting</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                            <button 
                                onClick={() => onSetOutcome('Won')} 
                                className="group relative px-4 py-2 text-xs text-center rounded-xl bg-status-success/10 border border-status-success/30 hover:bg-status-success hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                                title="Yutdim"
                            >
                                <span className="font-bold flex items-center justify-center gap-1">
                                    ✅ Yutdim
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-status-success/0 group-hover:bg-status-success/20 transition-all duration-300"></div>
                            </button>
                            <button 
                                onClick={() => onSetOutcome('Lost')} 
                                className="group relative px-4 py-2 text-xs text-center rounded-xl bg-status-danger/10 border border-status-danger/30 hover:bg-status-danger hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                                title="Yutqazdim"
                            >
                                <span className="font-bold flex items-center justify-center gap-1">
                                    ❌ Yutqazdim
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-status-danger/0 group-hover:bg-status-danger/20 transition-all duration-300"></div>
                            </button>
                            <button 
                                onClick={() => onSetOutcome('Did not participate')} 
                                className="group relative px-4 py-2 text-xs text-center rounded-xl bg-gray-500/10 border border-gray-500/30 hover:bg-gray-500 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                                title="Qatnashmadim"
                            >
                                <span className="font-bold flex items-center justify-center gap-1">
                                    ➖ Qatnash.
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gray-500/0 group-hover:bg-gray-500/20 transition-all duration-300"></div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        

        <KeyTakeaways result={result} />
        
        {/* Strategic Insights Panel */}
        {strategicInsights.length > 0 && (
            <StrategicInsightsPanel 
                insights={strategicInsights}
                marketIntelligence={marketIntelligence}
                onToggleBookmark={toggleBookmark}
                bookmarkedSections={dashboardState.bookmarkedSections}
            />
        )}
        
        {/* Dashboard View Selector */}
        <div className="bg-gradient-to-r from-surface via-surface/95 to-black/30 backdrop-blur-xl rounded-2xl border border-brand-primary/30 p-4 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20">
                        <EyeIcon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary">Ko'rinish Rejimi</h3>
                        <p className="text-xs text-text-secondary">Tahlil chuqurligini tanlang</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-border/50">
                    {(
                        [
                            { id: 'overview', label: 'Umumiy', icon: '📊' },
                            { id: 'deep-analysis', label: 'Chuqur', icon: '🔍' },
                            { id: 'strategic', label: 'Strategik', icon: '⚡' },
                            { id: 'competitive', label: 'Raqobat', icon: '🎯' }
                        ] as const
                    ).map((view) => (
                        <button
                            key={view.id}
                            onClick={() => saveDashboardState({ activeView: view.id })}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                                dashboardState.activeView === view.id
                                    ? 'bg-brand-primary text-white shadow-lg'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-black/60'
                            }`}
                        >
                            <span>{view.icon}</span>
                            {view.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-black/40 border border-border/50 rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all duration-300"
                        />
                    </div>
                    
                    <button
                        onClick={() => saveDashboardState({ 
                            preferences: { 
                                ...dashboardState.preferences, 
                                enableRealTimeUpdates: !dashboardState.preferences.enableRealTimeUpdates 
                            }
                        })}
                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                            dashboardState.preferences.enableRealTimeUpdates
                                ? 'bg-brand-primary text-white'
                                : 'bg-black/40 text-text-secondary hover:text-brand-primary'
                        }`}
                        title="Real-time yangilanishlar"
                    >
                        <TrendIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* --- Enhanced Main Grid Layout --- */}
        <main id="analysis-report-content" className="grid grid-cols-12 gap-6">
            {/* Render content based on active view */}
            {renderViewContent()}
        </main>

        {/* Strategic Insights Panel */}
        {strategicInsights.length > 0 && showStrategicInsights && (
            <StrategicInsightsPanel 
                insights={strategicInsights}
                marketIntelligence={marketIntelligence}
                onToggleBookmark={toggleBookmark}
                bookmarkedSections={dashboardState.bookmarkedSections}
            />
        )}
        {/* Enhanced Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-30">
            {/* Quick Analytics Toggle */}
            <button 
                onClick={() => setShowStrategicInsights(!showStrategicInsights)}
                className={`group relative p-4 backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-300 hover:scale-110 ${
                    showStrategicInsights 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-purple-500/25' 
                        : 'bg-gradient-to-r from-surface via-surface/95 to-black/30 text-purple-400 border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/25'
                }`}
                title="Strategik Tahlilni Ko'rsatish/Yashirish"
            >
                <BotIcon className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white animate-pulse">
                    {strategicInsights.length}
                </div>
                {!showStrategicInsights && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300"></div>
                )}
            </button>
            
            {/* Quick Share */}
            <button 
                onClick={handleShare}
                className="group relative p-4 bg-gradient-to-r from-surface via-surface/95 to-black/30 backdrop-blur-xl text-blue-400 rounded-2xl border border-blue-500/30 hover:border-blue-500 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/25" 
                title="Hisobotni Tez Ulashish"
            >
                <ShareIcon className="w-6 h-6" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300"></div>
            </button>
            
            {/* Quick Export */}
            <button 
                onClick={handleExportToPdf}
                className="group relative p-4 bg-gradient-to-r from-surface via-surface/95 to-black/30 backdrop-blur-xl text-green-400 rounded-2xl border border-green-500/30 hover:border-green-500 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-green-500/25" 
                title="PDF Export"
            >
                <DownloadIcon className="w-6 h-6" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-300"></div>
            </button>
            
            {/* Scroll to Top */}
            <button 
                onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative p-4 bg-gradient-to-r from-surface via-surface/95 to-black/30 backdrop-blur-xl text-text-secondary rounded-2xl border border-border/50 hover:border-brand-primary hover:text-brand-primary shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-brand-primary/25" 
                title="Yuqoriga Chiqish"
            >
                <ArrowUpIcon className="w-6 h-6" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-primary/0 to-brand-secondary/0 group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all duration-300"></div>
            </button>
        </div>
        </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.result.id === nextProps.result.id &&
    prevProps.result.status === nextProps.result.status &&
    prevProps.result.lastModified === nextProps.result.lastModified &&
    prevProps.result.opportunityScore === nextProps.result.opportunityScore &&
    prevProps.result.riskScore === nextProps.result.riskScore &&
    prevProps.allTenders.length === nextProps.allTenders.length &&
    prevProps.companyProfile === nextProps.companyProfile &&
    prevProps.isReadOnly === nextProps.isReadOnly
  );
});

export default AnalysisDashboard;
