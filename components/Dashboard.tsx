
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { AnalysisResult, TenderStatus, AIInsight, InsightActionView, InsightType, VisionaryInsight, CompanyProfile } from '../types';
import { PlusIcon, TrashIcon, ArchiveIcon, StarIcon, CheckIcon, BrainCircuitIcon, TelescopeIcon, Lightbulb, BarChart3, TrendingUpIcon, Settings, AnalyzeIcon, VisionaryCouncilIcon, TrendIcon, FutureTechIcon, BotIcon, UserIcon, TrophyIcon } from './Icons';
import { tenderSearchEngine, SearchResult } from '../utils/searchEngine';
import UniversalSearch from './UniversalSearch';

interface DashboardProps {
    tenders: AnalysisResult[];
    insights: AIInsight[];
    loadingInsights: boolean;
    visionaryInsight: VisionaryInsight | null;
    loadingVisionary: boolean;
    companyProfile: CompanyProfile | null;
    onSelect: (tender: AnalysisResult) => void;
    onDelete: (tenderId: string) => void;
    onArchive: (tenderId: string, archive: boolean) => void;
    onToggleWatchlist: (tenderId: string) => void;
    onNew: () => void;
    onBulkAction: (tenderIds: string[], action: 'archive' | 'unarchive' | 'delete') => void;
    onInsightAction: (actionView: InsightActionView) => void;
}

interface DashboardState {
    selectedTenders: Set<string>;
    searchQuery: string;
    filteredTenders: AnalysisResult[];
    sortBy: 'date' | 'status' | 'opportunity' | 'risk';
    sortOrder: 'asc' | 'desc';
    viewMode: 'grid' | 'list';
    filterStatus: TenderStatus | 'all';
    showArchived: boolean;
}

const statusStyles: Record<TenderStatus, string> = {
    'Analyzed': 'bg-blue-500/10 text-blue-300',
    'Won': 'bg-status-success/10 text-green-300',
    'Lost': 'bg-status-danger/10 text-red-300',
    'Did not participate': 'bg-gray-500/10 text-gray-300',
};

const WelcomeGuide: React.FC<{ onNew: () => void }> = ({ onNew }) => (
    <div className="text-center py-16 px-6 bg-gradient-to-br from-surface to-black/30 rounded-2xl border border-brand-primary/20 flex flex-col items-center animate-fade-in shadow-2xl">
        <div className="relative mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary/30 animate-pulse">
                <path d="m12 3-1.45 4.1-4.05 1.9 4.05 1.9L12 17l1.45-4.1 4.05-1.9-4.05-1.9L12 3z"/>
                <path d="M3 12h18"/><path d="M12 3v18"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to rounded-full animate-spin-slow opacity-20"></div>
            </div>
        </div>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to mb-4">AI-Broker Elite'ga Xush Kelibsiz!</h2>
        <p className="mt-2 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            Dunyodagi eng kuchli tender tahlil tizimiga xush kelibsiz. AI-Broker Elite sizga raqobatchilardan ustun kelish, eng yuqori daromad olish va bozorni boshqarishda yordam beradi.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 w-full max-w-4xl">
            {/* Step 1: Advanced Profile Setup */}
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-6 rounded-xl border border-brand-primary/30 hover:border-brand-primary/50 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto animate-pulse">1</div>
                <h3 className="font-bold text-xl text-text-primary mb-3 text-center">Elite Profil Sozlash</h3>
                <p className="text-sm text-text-secondary text-center leading-relaxed">
                    Kompaniya profilini mukammal sozlang: QQS stavkalari, ustama xarajatlar, sotuvchi agentlar va avtomatik tender qidiruv tizimini faollashtiring.
                </p>
                <div className="flex justify-center mt-4">
                    <a href="#profile" onClick={(e) => { e.preventDefault(); (document.querySelector('[title="Profil"]') as HTMLElement)?.click(); }} 
                       className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Sozlash
                    </a>
                </div>
            </div>
            
            {/* Step 2: AI-Powered Analysis */}
            <div className="bg-gradient-to-br from-brand-secondary/10 to-accent/10 p-6 rounded-xl border border-brand-secondary/30 hover:border-brand-secondary/50 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-secondary to-accent text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto animate-pulse">2</div>
                <h3 className="font-bold text-xl text-text-primary mb-3 text-center">AI Elite Tahlil</h3>
                <p className="text-sm text-text-secondary text-center leading-relaxed">
                    Tender faylini yuklang va AI-ning eng ilg'or tahlil algoritmlari orqali raqobatchilarni mag'lub etish strategiyasini oling.
                </p>
                <div className="flex justify-center mt-4">
                    <button onClick={onNew} className="bg-brand-secondary/20 hover:bg-brand-secondary/30 text-brand-secondary font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                        <AnalyzeIcon className="w-4 h-4" /> Boshlash
                    </button>
                </div>
            </div>
            
            {/* Step 3: Market Domination */}
            <div className="bg-gradient-to-br from-accent/10 to-status-success/10 p-6 rounded-xl border border-accent/30 hover:border-accent/50 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-status-success text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto animate-pulse">3</div>
                <h3 className="font-bold text-xl text-text-primary mb-3 text-center">Bozorni Boshqarish</h3>
                <p className="text-sm text-text-secondary text-center leading-relaxed">
                    AI tavsiyalari asosida tenderlarni yuting, raqobatchilarni mag'lub eting va bozoringizni kengaytiring.
                </p>
                <div className="flex justify-center mt-4">
                    <div className="bg-accent/20 text-accent font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                        <TrophyIcon className="w-4 h-4" /> G'alaba
                    </div>
                </div>
            </div>
        </div>
        
        <button onClick={onNew} className="mt-6 bg-gradient-to-r from-brand-gradient-from via-brand-secondary to-brand-gradient-to text-white font-bold py-4 px-12 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 shadow-lg flex items-center gap-3 mx-auto text-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <AnalyzeIcon className="w-6 h-6" /> AI Elite Tahlilni Boshlash
        </button>
        
        <div className="mt-8 grid grid-cols-3 gap-8 text-center max-w-md mx-auto">
            <div>
                <div className="text-2xl font-bold text-brand-primary">95%</div>
                <div className="text-xs text-text-secondary">Aniqlik</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-brand-secondary">3x</div>
                <div className="text-xs text-text-secondary">Tezroq</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-accent">∞</div>
                <div className="text-xs text-text-secondary">Imkoniyat</div>
            </div>
        </div>
    </div>
);


interface InsightCardProps {
    insight: AIInsight;
    onAction: (actionView: InsightActionView) => void;
}

const InsightCard: React.FC<InsightCardProps> = React.memo(({ insight, onAction }) => {
    const insightIcons: Record<InsightType, React.ReactNode> = {
        competitor: <TelescopeIcon />,
        opportunity: <TrendingUpIcon />,
        strategy: <Lightbulb />,
        trend: <BarChart3 />,
    };

    return (
        <div className="flex-shrink-0 w-80 bg-surface-light border border-brand-primary/20 rounded-lg p-4 flex flex-col justify-between shadow-lg animate-fade-in">
            <div>
                <div className="flex items-center gap-2 text-brand-primary">
                    {insightIcons[insight.type]}
                    <h4 className="font-bold">{insight.title}</h4>
                </div>
                <p className="text-sm text-text-secondary mt-2">{insight.description}</p>
            </div>
            <button
                onClick={() => onAction(insight.ctaActionView)}
                className="mt-4 w-full bg-brand-primary/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-primary transition-colors text-sm"
            >
                {insight.ctaLabel}
            </button>
        </div>
    );
});


const InsightsSection: React.FC<{ insights: AIInsight[]; isLoading: boolean; onAction: (actionView: InsightActionView) => void; }> = ({ insights, isLoading, onAction }) => {
    if (isLoading) {
        return (
             <div className="mb-6">
                 <div className="h-32 bg-surface rounded-lg border border-border animate-shimmer"></div>
             </div>
        )
    }

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary mb-4">
                <BrainCircuitIcon /> Strategik Tavsiyalar
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
                {insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} onAction={onAction} />
                ))}
            </div>
        </div>
    );
};


const AIVisionariesSection: React.FC<{ insight: VisionaryInsight | null; isLoading: boolean }> = ({ insight, isLoading }) => {
    if (isLoading) {
        return (
            <div className="mb-6">
                 <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary mb-4">
                    <VisionaryCouncilIcon /> AI Vizionerlar Kengashi
                </h2>
                <div className="h-48 bg-surface rounded-lg border border-border animate-shimmer"></div>
            </div>
        );
    }
    
    if (!insight) {
        return null; // Don't render if no insight is available (e.g., not enough tenders)
    }

    return (
        <div className="mb-8 p-6 bg-gradient-to-br from-surface to-black/30 rounded-2xl border border-border shadow-soft">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-text-primary mb-4">
                <VisionaryCouncilIcon /> AI Vizionerlar Kengashi
            </h2>
            <p className="text-md text-text-secondary mb-6 border-l-4 border-brand-secondary pl-4">{insight.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trend Analyzer */}
                <div className="bg-surface-light p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 text-brand-primary">
                        <TrendIcon />
                        <h4 className="font-bold text-lg">Trend Analizatori A.I.</h4>
                    </div>
                    <p className="text-sm text-text-secondary mt-3">{insight.trendAnalyzer}</p>
                </div>
                
                {/* Innovation AI */}
                <div className="bg-surface-light p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 text-brand-secondary">
                        <Lightbulb />
                        <h4 className="font-bold text-lg">Innovatsiya A.I.</h4>
                    </div>
                    <p className="text-sm text-text-secondary mt-3">{insight.innovationAI}</p>
                </div>

                {/* Future Technologies AI */}
                <div className="bg-surface-light p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 text-accent">
                        <FutureTechIcon />
                        <h4 className="font-bold text-lg">Bo'lajak Texnologiyalar A.I.</h4>
                    </div>
                    <p className="text-sm text-text-secondary mt-3">{insight.futureTechAI}</p>
                </div>
            </div>
        </div>
    );
};


interface TenderCardProps {
    tender: AnalysisResult;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onArchive: (e: React.MouseEvent) => void;
    onToggleWatchlist: (e: React.MouseEvent) => void;
    isSelected: boolean;
    onSelectionChange: (e: React.MouseEvent) => void;
    agentName?: string;
}

const TenderCard: React.FC<TenderCardProps> = React.memo(({ tender, onSelect, onDelete, onArchive, onToggleWatchlist, isSelected, onSelectionChange, agentName }) => {
    
    let deadlineDate: Date | null = null;
    try {
        const deadlineStr = tender.lotPassport?.deadline?.split(' ')[0].replace(/\./g, '-');
        if (deadlineStr) {
            const parts = deadlineStr.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                deadlineDate = new Date(`${year}-${month}-${day}`);
                if (isNaN(deadlineDate.getTime())) deadlineDate = null;
            }
        }
    } catch(e) {
        deadlineDate = null;
    }

    const daysLeft = deadlineDate ? Math.ceil((new Date(deadlineDate.setHours(23, 59, 59, 999)).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    let deadlineClass = 'text-text-secondary';
    let deadlineText = tender.lotPassport?.deadline || 'N/A';
    if (daysLeft !== null) {
        if (daysLeft < 0) {
            deadlineText = "Tugagan";
            deadlineClass = 'text-gray-500';
        } else {
            deadlineText = `${daysLeft} kun qoldi`;
            if (daysLeft < 3) deadlineClass = 'text-status-danger font-bold';
            else if (daysLeft < 7) deadlineClass = 'text-status-warning';
        }
    }
    
    const potentialScore = useMemo(() => Math.round(tender.opportunityScore * 0.7 + (100 - tender.riskScore) * 0.3), [tender.opportunityScore, tender.riskScore]);
    const potentialColorClass = potentialScore > 75 ? 'text-status-success' : potentialScore > 50 ? 'text-status-warning' : 'text-status-danger';
    const potentialBorderClass = potentialScore > 75 ? 'border-status-success' : potentialScore > 50 ? 'border-status-warning' : 'border-status-danger';


    return (
         <div className={`bg-surface border border-border rounded-lg shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col group relative ${isSelected ? 'ring-2 ring-brand-primary' : 'hover:-translate-y-1'}`}>
            <div onClick={onSelect} className="p-4 cursor-pointer flex flex-col flex-grow h-[200px]">
                {/* --- TOP ROW --- */}
                <div className="flex items-start justify-between">
                    {/* Checkbox */}
                    <div onClick={(e) => { e.stopPropagation(); onSelectionChange(e); }} className="flex items-center gap-2 z-20 p-1 -m-1">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-500 bg-surface'}`}>
                           {isSelected && <CheckIcon />}
                        </div>
                         {agentName && (
                            <div className="flex items-center gap-1 text-xs text-text-secondary" title={`Agent: ${agentName}`}>
                                <UserIcon />
                                <span className="font-semibold">{agentName.split(' ')[0]}</span>
                            </div>
                        )}
                         {tender.analysisType === 'auto' && !agentName && (
                            <div className="flex-shrink-0" title="Avtomatik tahlil qilingan">
                                <BotIcon className="w-5 h-5 text-brand-secondary" />
                            </div>
                        )}
                    </div>
                     {/* Status Badge / Action Icons Container */}
                    <div className="relative z-20 h-5 flex-shrink-0">
                         {/* Status Badge */}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity duration-200 group-hover:opacity-0 ${statusStyles[tender.status]}`}>{tender.status}</span>
                         {/* Action Icons - appear on hover */}
                        <div className="absolute top-0 right-0 flex items-center bg-surface-light rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           <button onClick={onToggleWatchlist} className="p-1.5 rounded-full text-accent" title="Kuzatuvga olish"><StarIcon filled={tender.isWatched} /></button>
                           <button onClick={onArchive} className="p-1.5 rounded-full text-text-secondary hover:text-text-primary" title="Arxivlash"><ArchiveIcon /></button>
                           <button onClick={onDelete} className="p-1.5 rounded-full text-text-secondary hover:text-status-danger" title="O'chirish"><TrashIcon /></button>
                        </div>
                    </div>
                </div>

                 {/* --- MAIN CONTENT AREA (with hover effect) --- */}
                <div className="relative flex-grow my-3 flex flex-col justify-between">
                    {/* Front of the card (visible by default) */}
                    <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
                        <h3 className="font-bold text-md text-text-primary leading-tight h-12 overflow-hidden" title={tender.lotPassport?.itemName || 'Nomsiz Tender'}>{tender.lotPassport?.itemName || 'Nomsiz Tender'}</h3>
                        <p className="text-sm text-text-secondary mt-1 truncate">{tender.lotPassport?.customerName || 'Noma\'lum buyurtmachi'}</p>
                    </div>

                    {/* Back of the card (visible on hover) */}
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex flex-col justify-center text-sm">
                        <p className="font-bold text-text-primary">Potentsial Ball:</p>
                        <p className="text-xs text-text-secondary mb-2">Imkoniyat va Risk ballari asosida hisoblangan umumiy ko'rsatkich.</p>
                        <div className="space-y-1 text-xs">
                           <p><strong>Imkoniyat:</strong> <span className="font-bold text-status-success">{tender.opportunityScore} / 100</span></p>
                           <p><strong>Risk:</strong> <span className="font-bold text-status-danger">{tender.riskScore} / 100</span></p>
                           <p><strong>G'alaba ehtimoli (Optimal):</strong> <span className="font-bold text-brand-primary">{(tender.pricingStrategy || []).find(p => p.strategy === 'Optimal')?.winProbability || 0}%</span></p>
                        </div>
                    </div>
                </div>
                
                {/* --- BOTTOM ROW (always visible) --- */}
                <div className="flex justify-between items-center text-center text-sm font-semibold z-10">
                    <p className={deadlineClass}>{deadlineText}</p>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${potentialBorderClass}`}>
                        <span className={potentialColorClass}>{potentialScore}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    return (
        prevProps.tender.id === nextProps.tender.id &&
        prevProps.tender.status === nextProps.tender.status &&
        prevProps.tender.isWatched === nextProps.tender.isWatched &&
        prevProps.tender.isArchived === nextProps.tender.isArchived &&
        prevProps.tender.opportunityScore === nextProps.tender.opportunityScore &&
        prevProps.tender.riskScore === nextProps.tender.riskScore &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.agentName === nextProps.agentName
    );
});

const BulkActionsToolbar: React.FC<{ count: number; onAction: (action: 'archive' | 'unarchive' | 'delete') => void; onClear: () => void; }> = ({ count, onAction, onClear }) => (
    <div className="fixed bottom-6 right-1/2 translate-x-1/2 bg-surface backdrop-blur-xl border border-border text-text-primary rounded-lg shadow-2xl p-3 flex items-center gap-4 z-50 animate-slide-up">
        <span className="font-bold text-md">{count} ta tanlandi</span>
        <div className="h-6 w-px bg-white/10"></div>
        <button onClick={() => onAction('archive')} className="bg-surface-light hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Arxivlash</button>
        <button onClick={() => onAction('unarchive')} className="bg-surface-light hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Arxivdan chiqarish</button>
        <button onClick={() => onAction('delete')} className="bg-status-danger/80 hover:bg-status-danger text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">O'chirish</button>
        <button onClick={onClear} className="text-xl font-light hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors">&times;</button>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ tenders, insights, loadingInsights, visionaryInsight, loadingVisionary, companyProfile, onSelect, onDelete, onArchive, onNew, onToggleWatchlist, onBulkAction, onInsightAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TenderStatus | 'All' | 'Watched'>('All');
    const [showArchived, setShowArchived] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'analysisDate' | 'riskScore' | 'opportunityScore'>('analysisDate');
    
    useEffect(() => {
        setSelectedIds([]);
    }, [searchTerm, statusFilter, showArchived]);
    
    const agentMap = useMemo(() => {
        const map = new Map<string, string>();
        if (companyProfile?.salesAgents) {
            for (const agent of companyProfile.salesAgents) {
                map.set(agent.id, agent.name);
            }
        }
        return map;
    }, [companyProfile]);

    const filteredTenders = useMemo(() => {
        return tenders
            .filter(t => t.isArchived === showArchived)
            .filter(t => {
                if (statusFilter === 'All') return true;
                if (statusFilter === 'Watched') return t.isWatched;
                return t.status === statusFilter;
            })
            .filter(t => {
                const agentName = t.assignedAgentId ? agentMap.get(t.assignedAgentId) || '' : '';
                return (t.lotPassport?.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.lotPassport?.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'riskScore':
                        return b.riskScore - a.riskScore;
                    case 'opportunityScore':
                        return b.opportunityScore - a.opportunityScore;
                    case 'analysisDate':
                    default:
                        return new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime();
                }
            });
    }, [tenders, searchTerm, statusFilter, showArchived, sortBy, agentMap]);
    
    const handleSelectionChange = useCallback((tenderId: string) => {
        setSelectedIds(prev => 
            prev.includes(tenderId) 
                ? prev.filter(id => id !== tenderId)
                : [...prev, tenderId]
        );
    }, []);

    const handleBulkAction = useCallback((action: 'archive' | 'unarchive' | 'delete') => {
        onBulkAction(selectedIds, action);
    }, [selectedIds, onBulkAction]);

    const handleClearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    // Memoized tender card handlers for better performance
    const tenderCardHandlers = useMemo(() => {
        const handlers = new Map<string, {
            handleSelect: () => void;
            handleDelete: (e: React.MouseEvent) => void;
            handleArchive: (e: React.MouseEvent) => void;
            handleToggleWatchlist: (e: React.MouseEvent) => void;
            handleSelectionChange: (e: React.MouseEvent) => void;
        }>();
        
        filteredTenders.forEach(tender => {
            handlers.set(tender.id, {
                handleSelect: () => onSelect(tender),
                handleDelete: (e: React.MouseEvent) => { e.stopPropagation(); onDelete(tender.id); },
                handleArchive: (e: React.MouseEvent) => { e.stopPropagation(); onArchive(tender.id, !tender.isArchived); },
                handleToggleWatchlist: (e: React.MouseEvent) => { e.stopPropagation(); onToggleWatchlist(tender.id); },
                handleSelectionChange: (e: React.MouseEvent) => handleSelectionChange(tender.id)
            });
        });
        
        return handlers;
    }, [filteredTenders, onSelect, onDelete, onArchive, onToggleWatchlist, handleSelectionChange]);

    // Memoized EmptyState component
    const EmptyState = useMemo(() => React.memo(() => (
         <div className="text-center py-20 px-6 bg-surface rounded-lg border border-border flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary/50 mb-4"><path d="m12 3-1.45 4.1-4.05 1.9 4.05 1.9L12 17l1.45-4.1 4.05-1.9-4.05-1.9L12 3z"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
            <h2 className="text-2xl font-bold text-text-primary">Tahlillar Topilmadi</h2>
            <p className="mt-2 text-text-secondary">
                Filtrlarni o'zgartirib ko'ring yoki yangi tahlil yarating.
            </p>
            <button onClick={onNew} className="mt-6 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                <PlusIcon /> Yangi Tahlil
            </button>
        </div>
    )), [onNew]);

    return (
        <div className="animate-fade-in space-y-6">
            {selectedIds.length > 0 && <BulkActionsToolbar count={selectedIds.length} onAction={handleBulkAction} onClear={handleClearSelection} />}
            
            <InsightsSection insights={insights} isLoading={loadingInsights} onAction={onInsightAction} />

            <AIVisionariesSection insight={visionaryInsight} isLoading={loadingVisionary} />

            {tenders.length > 0 && (
                <div className="p-3 bg-surface rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input 
                            type="text"
                            placeholder="Qidirish (lot, buyurtmachi, agent...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-brand-primary focus:border-brand-primary md:col-span-2"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="All">Barcha Statuslar</option>
                            <option value="Watched">⭐ Kuzatuvdagilar</option>
                            {Object.keys(statusStyles).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                         <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="analysisDate">Saralash: Eng yangi</option>
                            <option value="riskScore">Saralash: Yuqori risk</option>
                            <option value="opportunityScore">Saralash: Yuqori imkoniyat</option>
                        </select>
                    </div>
                     <div className="mt-3 flex justify-end items-center">
                         <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                            <input
                                type="checkbox"
                                checked={showArchived}
                                onChange={(e) => setShowArchived(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-500 bg-background text-brand-primary focus:ring-brand-primary"
                            />
                            Arxivni Ko'rsatish
                        </label>
                    </div>
                </div>
            )}
            
            {tenders.length === 0 ? <WelcomeGuide onNew={onNew} /> :
             filteredTenders.length === 0 ? <EmptyState /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredTenders.map(tender => {
                        const handlers = tenderCardHandlers.get(tender.id)!;
                        
                        return (
                            <TenderCard 
                                key={tender.id} 
                                tender={tender} 
                                agentName={tender.assignedAgentId ? agentMap.get(tender.assignedAgentId) : undefined}
                                onSelect={handlers.handleSelect} 
                                onDelete={handlers.handleDelete}
                                onArchive={handlers.handleArchive}
                                onToggleWatchlist={handlers.handleToggleWatchlist}
                                isSelected={selectedIds.includes(tender.id)}
                                onSelectionChange={handlers.handleSelectionChange}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
