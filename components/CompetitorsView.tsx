
import React, { useMemo, useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { BackIcon, SearchIcon, FilterIcon, TrendIcon, BarChart3, EyeIcon, UsersIcon, TargetIcon, BuildingIcon, TrophyIcon, AlertIcon, CheckIcon, BookmarkIcon, SortIcon } from './Icons';
import { smartStorage } from '../utils/smartStorage';
import { t } from '../utils/translations';

interface CompetitorsViewProps {
    tenders: AnalysisResult[];
    onBack: () => void;
}

interface EnhancedCompetitor {
    name: string;
    appearances: number;
    wins: number;
    winRate: number;
    tenders: { id: string, name: string, outcome: 'won' | 'lost' | 'unknown' }[];
    strategies: Record<string, number>;
    weaknesses: Record<string, number>;
    topStrategy: string;
    topWeakness: string;
    averageWinMargin?: number;
    marketShare: number;
    riskLevel: 'high' | 'medium' | 'low';
    competitiveIndex: number;
    recentActivity: number;
    marketSegments: string[];
    estimatedRevenue?: number;
    lastEncounter?: Date;
}

type SortField = 'appearances' | 'winRate' | 'competitiveIndex' | 'recentActivity' | 'marketShare';
type FilterType = 'all' | 'high-threat' | 'frequent' | 'recent' | 'winners';
type ViewMode = 'table' | 'cards' | 'analytics';

const CompetitorsView: React.FC<CompetitorsViewProps> = ({ tenders, onBack }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('cards');
    const [sortField, setSortField] = useState<SortField>('competitiveIndex');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompetitor, setSelectedCompetitor] = useState<EnhancedCompetitor | null>(null);
    const [bookmarkedCompetitors, setBookmarkedCompetitors] = useState<Set<string>>(new Set());

    // Load bookmarks from localStorage
    useEffect(() => {
        const savedBookmarks = smartStorage.getItem<string[]>('competitor-bookmarks');
        if (savedBookmarks) {
            setBookmarkedCompetitors(new Set(savedBookmarks));
        }
    }, []);

    // Toggle bookmark functionality
    const toggleBookmark = (competitorName: string) => {
        const newBookmarks = new Set(bookmarkedCompetitors);
        if (newBookmarks.has(competitorName)) {
            newBookmarks.delete(competitorName);
        } else {
            newBookmarks.add(competitorName);
        }
        setBookmarkedCompetitors(newBookmarks);
        smartStorage.setItem('competitor-bookmarks', [...newBookmarks], {
            compress: false,
            validate: true,
            ttl: 90 * 24 * 60 * 60 * 1000 // 90 days
        });
    };

    // Enhanced competitor analysis with market intelligence
    const competitorStats = useMemo((): EnhancedCompetitor[] => {
        const stats: Record<string, {
            name: string;
            appearances: number;
            wins: number;
            tenders: { id: string, name: string, outcome: 'won' | 'lost' | 'unknown' }[];
            strategies: Record<string, number>;
            weaknesses: Record<string, number>;
            totalValue: number;
            recentAppearances: number;
            lastSeen?: Date;
        }> = {};

        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const totalTenderValue = tenders.reduce((sum, t) => {
            const value = parseFloat(t.lotPassport?.estimatedValue?.replace(/[^0-9.]/g, '') || '0');
            return sum + (value || 0);
        }, 0);

        tenders.forEach(tender => {
            if (!tender.lotPassport) return;

            const tenderValue = parseFloat(tender.lotPassport.estimatedValue?.replace(/[^0-9.]/g, '') || '0') || 0;
            const tenderDate = tender.analysisDate ? new Date(tender.analysisDate) : new Date();
            const isRecent = tenderDate >= threeMonthsAgo;

            const processCompetitor = (name: string, isWinner: boolean, outcome: 'won' | 'lost' | 'unknown' = 'unknown') => {
                if (!name || name === "N/A") return;

                if (!stats[name]) {
                    stats[name] = {
                        name,
                        appearances: 0,
                        wins: 0,
                        tenders: [],
                        strategies: {},
                        weaknesses: {},
                        totalValue: 0,
                        recentAppearances: 0
                    };
                }

                stats[name].appearances++;
                stats[name].totalValue += tenderValue;
                
                if (isRecent) {
                    stats[name].recentAppearances++;
                }
                
                if (!stats[name].lastSeen || tenderDate > stats[name].lastSeen!) {
                    stats[name].lastSeen = tenderDate;
                }

                if (isWinner) {
                    stats[name].wins++;
                }
                
                if (!stats[name].tenders.some(t => t.id === tender.id)) {
                    stats[name].tenders.push({ 
                        id: tender.id, 
                        name: tender.lotPassport?.itemName || 'Unknown', 
                        outcome 
                    });
                }
            };
            
            // Process confirmed winner
            if (tender.winnerInfo?.winnerCompany && tender.status === 'Lost') {
                processCompetitor(tender.winnerInfo.winnerCompany, true, 'won');
            }
            
            // Process predicted competitors
            (tender.competitorAnalysis || []).forEach(competitor => {
                const name = competitor.name;
                if (!name || name === "N/A") return;

                processCompetitor(name, false, 'lost');

                if (competitor.likelyStrategy) {
                    stats[name].strategies[competitor.likelyStrategy] = (stats[name].strategies[competitor.likelyStrategy] || 0) + 1;
                }
                competitor.weaknesses.forEach(w => {
                    stats[name].weaknesses[w] = (stats[name].weaknesses[w] || 0) + 1;
                });
            });
        });
        
        return Object.values(stats)
            .map(s => {
                const winRate = s.appearances > 0 ? (s.wins / s.appearances) * 100 : 0;
                const marketShare = totalTenderValue > 0 ? (s.totalValue / totalTenderValue) * 100 : 0;
                const recentActivity = s.recentAppearances;
                
                // Calculate competitive index (0-100)
                const competitiveIndex = Math.min(100, 
                    (winRate * 0.4) + 
                    (Math.min(s.appearances, 20) * 2) + 
                    (marketShare * 0.3) + 
                    (recentActivity * 2)
                );
                
                // Determine risk level
                const riskLevel: EnhancedCompetitor['riskLevel'] = 
                    competitiveIndex >= 70 ? 'high' :
                    competitiveIndex >= 40 ? 'medium' : 'low';
                
                // Extract market segments from tender names
                const segmentsArray = s.tenders.map(t => {
                    const name = t.name.toLowerCase();
                    if (name.includes('qurilish') || name.includes('bino')) return 'Qurilish';
                    if (name.includes('it') || name.includes('dastur')) return 'IT';
                    if (name.includes('tibbiyot') || name.includes('shifoxona')) return 'Tibbiyot';
                    if (name.includes('transport') || name.includes('avtomobil')) return 'Transport';
                    if (name.includes('ta\'lim') || name.includes('maktab')) return 'Ta\'lim';
                    return 'Boshqa';
                }).filter(Boolean);
                const segments = [...new Set(segmentsArray)];

                return {
                    name: s.name,
                    appearances: s.appearances,
                    wins: s.wins,
                    winRate,
                    tenders: s.tenders,
                    strategies: s.strategies,
                    weaknesses: s.weaknesses,
                    topStrategy: Object.entries(s.strategies).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Noma\'lum',
                    topWeakness: Object.entries(s.weaknesses).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Noma\'lum',
                    marketShare,
                    riskLevel,
                    competitiveIndex,
                    recentActivity,
                    marketSegments: segments,
                    estimatedRevenue: s.totalValue,
                    lastEncounter: s.lastSeen
                } as EnhancedCompetitor;
            })
            .sort((a, b) => {
                const modifier = sortOrder === 'desc' ? -1 : 1;
                return modifier * (a[sortField] > b[sortField] ? 1 : -1);
            });
            
    }, [tenders, sortField, sortOrder]);

    // Advanced filtering and searching
    const filteredCompetitors = useMemo(() => {
        let filtered = competitorStats;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(comp => 
                comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.topStrategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.marketSegments.some(segment => segment.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply type filter
        switch (filter) {
            case 'high-threat':
                filtered = filtered.filter(comp => comp.riskLevel === 'high');
                break;
            case 'frequent':
                filtered = filtered.filter(comp => comp.appearances >= 5);
                break;
            case 'recent':
                filtered = filtered.filter(comp => comp.recentActivity > 0);
                break;
            case 'winners':
                filtered = filtered.filter(comp => comp.winRate > 20);
                break;
        }

        return filtered;
    }, [competitorStats, searchQuery, filter]);

    // Market intelligence calculations
    const getMarketInsights = () => {
        const total = competitorStats.length;
        const highThreat = competitorStats.filter(c => c.riskLevel === 'high').length;
        const recentlyActive = competitorStats.filter(c => c.recentActivity > 0).length;
        const dominantPlayers = competitorStats.filter(c => c.marketShare > 5).length;
        const avgCompetitiveIndex = competitorStats.reduce((sum, c) => sum + c.competitiveIndex, 0) / total || 0;
        
        return { total, highThreat, recentlyActive, dominantPlayers, avgCompetitiveIndex };
    };

    const insights = getMarketInsights();

    // Risk and threat level styling
    const getRiskColor = (level: EnhancedCompetitor['riskLevel']) => {
        switch (level) {
            case 'high': return 'border-status-danger bg-status-danger/10 text-status-danger';
            case 'medium': return 'border-status-warning bg-status-warning/10 text-status-warning';
            case 'low': return 'border-status-success bg-status-success/10 text-status-success';
        }
    };

    const getCompetitiveIndexColor = (index: number) => {
        if (index >= 70) return 'text-status-danger';
        if (index >= 40) return 'text-status-warning';
        return 'text-status-success';
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    return (
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-surface to-black/30 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-brand-primary/20 relative overflow-hidden animate-slide-up">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-accent opacity-10"></div>
            </div>
            
            <div className="relative z-10">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
                            {t('competitors-elite-market-intelligence')}
                        </h1>
                        <p className="text-text-secondary text-lg">{t('competitors-analysis-and-market-intelligence')}</p>
                    </div>
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-3 bg-gradient-to-r from-black/30 to-black/20 text-text-primary font-semibold py-3 px-6 rounded-xl border border-border/50 hover:border-brand-primary/50 transition-all duration-300 transform hover:scale-105"
                    >
                        <BackIcon className="w-5 h-5" /> {t('competitors-back')}
                    </button>
                </div>

                {/* Market Intelligence Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-black/30 to-black/10 p-4 rounded-xl border border-border/50 text-center">
                        <div className="text-2xl font-bold text-text-primary">{insights.total}</div>
                        <div className="text-sm text-text-secondary">{t('competitors-total')}</div>
                    </div>
                    <div className="bg-status-danger/10 p-4 rounded-xl border border-status-danger/30 text-center">
                        <div className="text-2xl font-bold text-status-danger">{insights.highThreat}</div>
                        <div className="text-sm text-status-danger">{t('competitors-high-risk')}</div>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-xl border border-accent/30 text-center">
                        <div className="text-2xl font-bold text-accent">{insights.recentlyActive}</div>
                        <div className="text-sm text-accent">{t('competitors-active')}</div>
                    </div>
                    <div className="bg-brand-primary/10 p-4 rounded-xl border border-brand-primary/30 text-center">
                        <div className="text-2xl font-bold text-brand-primary">{insights.avgCompetitiveIndex.toFixed(0)}</div>
                        <div className="text-sm text-brand-primary">{t('competitors-average-index')}</div>
                    </div>
                </div>

                {/* Advanced Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder={t('competitors-search-placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary placeholder-text-secondary transition-all duration-300"
                        />
                    </div>
                    
                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="px-4 py-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary transition-all duration-300"
                    >
                        <option value="all">{t('competitors-all')}</option>
                        <option value="high-threat">{t('competitors-high-risk-filter')}</option>
                        <option value="frequent">{t('competitors-frequent')}</option>
                        <option value="recent">{t('competitors-recent')}</option>
                        <option value="winners">{t('competitors-winners')}</option>
                    </select>
                    
                    {/* Sort */}
                    <select
                        value={`${sortField}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-') as [SortField, 'asc' | 'desc'];
                            setSortField(field);
                            setSortOrder(order);
                        }}
                        className="px-4 py-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary transition-all duration-300"
                    >
                        <option value="competitiveIndex-desc">{t('competitors-sort-by-index')}</option>
                        <option value="winRate-desc">{t('competitors-sort-by-win-rate')}</option>
                        <option value="appearances-desc">{t('competitors-sort-by-appearances')}</option>
                        <option value="recentActivity-desc">{t('competitors-sort-by-activity')}</option>
                        <option value="marketShare-desc">{t('competitors-sort-by-market-share')}</option>
                    </select>
                    
                    {/* View Mode */}
                    <div className="flex bg-black/20 rounded-lg border border-border/50 p-1">
                        {(['table', 'cards', 'analytics'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2 rounded-md transition-all duration-300 font-semibold ${
                                    viewMode === mode
                                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                }`}
                            >
                                {mode === 'table' ? t('competitors-table-view') : mode === 'cards' ? t('competitors-cards-view') : t('competitors-analytics-view')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                {filteredCompetitors.length === 0 ? (
                    <div className="text-center py-16">
                        {competitorStats.length === 0 ? (
                            <div>
                                <div className="text-6xl mb-4">🏆</div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">{t('competitors-no-data-title')}</h3>
                                <p className="text-text-secondary max-w-md mx-auto">
                                    {t('competitors-no-data-description')}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">{t('competitors-no-results-title')}</h3>
                                <p className="text-text-secondary">{t('competitors-no-results-description')}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {viewMode === 'cards' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCompetitors.map((competitor) => {
                                    const isBookmarked = bookmarkedCompetitors.has(competitor.name);
                                    
                                    return (
                                        <div 
                                            key={competitor.name} 
                                            className={`group p-6 rounded-xl border-l-4 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                                                getRiskColor(competitor.riskLevel)
                                            }`}
                                            onClick={() => setSelectedCompetitor(competitor)}
                                        >
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                                                        {competitor.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            competitor.riskLevel === 'high' ? 'bg-status-danger/20 text-status-danger' :
                                                            competitor.riskLevel === 'medium' ? 'bg-status-warning/20 text-status-warning' :
                                                            'bg-status-success/20 text-status-success'
                                                        }`}>
                                                            {competitor.riskLevel === 'high' ? t('competitors-high-risk-label') : 
                                                             competitor.riskLevel === 'medium' ? t('competitors-medium-risk-label') : t('competitors-low-risk-label')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(competitor.name);
                                                    }}
                                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                                        isBookmarked 
                                                            ? 'text-yellow-400 bg-yellow-400/10' 
                                                            : 'text-text-secondary hover:text-yellow-400 hover:bg-yellow-400/10'
                                                    }`}
                                                    title={isBookmarked ? t('competitors-remove-bookmark') : t('competitors-bookmark')}
                                                >
                                                    <BookmarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            {/* Statistics */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-text-primary">{competitor.appearances}</div>
                                                    <div className="text-xs text-text-secondary">{t('competitors-appearances')}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-status-success">{competitor.winRate.toFixed(0)}%</div>
                                                    <div className="text-xs text-text-secondary">{t('competitors-wins')}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Competitive Index */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-text-secondary">{t('competitors-competitive-index')}</span>
                                                    <span className={`font-bold ${getCompetitiveIndexColor(competitor.competitiveIndex)}`}>
                                                        {competitor.competitiveIndex.toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-black/20 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            competitor.competitiveIndex >= 70 ? 'bg-status-danger' :
                                                            competitor.competitiveIndex >= 40 ? 'bg-status-warning' :
                                                            'bg-status-success'
                                                        }`}
                                                        style={{ width: `${Math.min(competitor.competitiveIndex, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            {/* Key Info */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">{t('competitors-key-strategy')}:</span>
                                                    <span className="text-text-primary font-medium truncate ml-2">{competitor.topStrategy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">{t('competitors-market-share')}:</span>
                                                    <span className="text-brand-primary font-bold">{competitor.marketShare.toFixed(1)}%</span>
                                                </div>
                                                {competitor.lastEncounter && (
                                                    <div className="flex justify-between">
                                                        <span className="text-text-secondary">{t('competitors-last-encounter')}:</span>
                                                        <span className="text-accent">{competitor.lastEncounter.toLocaleDateString('uz-UZ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {viewMode === 'table' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-text-primary uppercase bg-gradient-to-r from-black/30 to-black/20 border border-border/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left rounded-l-lg">{t('competitors-name')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-risk')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-appearances')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-wins')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-win-percentage')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-market-share')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-competitive-index')}</th>
                                            <th className="px-6 py-4 text-center">{t('competitors-activity')}</th>
                                            <th className="px-6 py-4 text-center rounded-r-lg">{t('competitors-actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCompetitors.map((competitor, index) => {
                                            const isBookmarked = bookmarkedCompetitors.has(competitor.name);
                                            
                                            return (
                                                <tr 
                                                    key={competitor.name} 
                                                    className={`border-b border-border/30 hover:bg-black/20 transition-colors ${
                                                        index % 2 === 0 ? 'bg-black/5' : 'bg-transparent'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${
                                                                competitor.riskLevel === 'high' ? 'bg-status-danger' :
                                                                competitor.riskLevel === 'medium' ? 'bg-status-warning' :
                                                                'bg-status-success'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-bold text-text-primary">{competitor.name}</div>
                                                                <div className="text-xs text-text-secondary">{competitor.topStrategy}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            competitor.riskLevel === 'high' ? 'bg-status-danger/20 text-status-danger' :
                                                            competitor.riskLevel === 'medium' ? 'bg-status-warning/20 text-status-warning' :
                                                            'bg-status-success/20 text-status-success'
                                                        }`}>
                                                            {competitor.riskLevel === 'high' ? t('competitors-high-risk-label') : 
                                                             competitor.riskLevel === 'medium' ? t('competitors-medium-risk-label') : t('competitors-low-risk-label')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-semibold">{competitor.appearances}</td>
                                                    <td className="px-6 py-4 text-center font-semibold text-status-success">{competitor.wins}</td>
                                                    <td className="px-6 py-4 text-center font-bold">{competitor.winRate.toFixed(1)}%</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 bg-black/20 rounded-full h-2">
                                                                <div 
                                                                    className="h-2 rounded-full bg-brand-primary transition-all duration-500"
                                                                    style={{ width: `${Math.min(competitor.marketShare * 10, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-brand-primary font-semibold">{competitor.marketShare.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-bold ${getCompetitiveIndexColor(competitor.competitiveIndex)}`}>
                                                            {competitor.competitiveIndex.toFixed(0)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                competitor.recentActivity > 0 ? 'bg-status-success animate-pulse' : 'bg-text-secondary/30'
                                                            }`}></div>
                                                            <span>{competitor.recentActivity}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedCompetitor(competitor)}
                                                                className="p-2 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-300"
                                                                title={t('competitors-view-details')}
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleBookmark(competitor.name)}
                                                                className={`p-2 rounded-lg transition-all duration-300 ${
                                                                    isBookmarked 
                                                                        ? 'text-yellow-400 bg-yellow-400/10' 
                                                                        : 'text-text-secondary hover:text-yellow-400 hover:bg-yellow-400/10'
                                                                }`}
                                                                title={isBookmarked ? t('competitors-remove-bookmark') : t('competitors-bookmark')}
                                                            >
                                                                <BookmarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {viewMode === 'analytics' && (
                            <div className="space-y-8">
                                {/* Market Dominance Chart */}
                                <div className="bg-gradient-to-r from-black/30 to-black/10 p-6 rounded-xl border border-border/50">
                                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
                                        <BarChart3 strokeWidth={2} />
                                        {t('competitors-market-dominance')}
                                    </h3>
                                    <div className="space-y-4">
                                        {filteredCompetitors.slice(0, 10).map((competitor, index) => (
                                            <div key={competitor.name} className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-semibold text-text-primary">{competitor.name}</span>
                                                        <span className="text-sm text-text-secondary">{competitor.marketShare.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-black/20 rounded-full h-3">
                                                        <div 
                                                            className="h-3 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700"
                                                            style={{ width: `${Math.min(competitor.marketShare * 2, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-semibold ${getCompetitiveIndexColor(competitor.competitiveIndex)}`}>
                                                    {competitor.competitiveIndex.toFixed(0)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Threat Assessment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-status-danger/10 to-status-danger/5 p-6 rounded-xl border border-status-danger/30">
                                        <h4 className="text-lg font-bold text-status-danger mb-4 flex items-center gap-2">
                                            <AlertIcon className="w-5 h-5" /> {t('competitors-high-threat-competitors')}
                                        </h4>
                                        <div className="space-y-3">
                                            {filteredCompetitors.filter(c => c.riskLevel === 'high').slice(0, 5).map((competitor) => (
                                                <div key={competitor.name} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                                    <span className="font-semibold text-text-primary">{competitor.name}</span>
                                                    <span className="text-status-danger font-bold">{competitor.winRate.toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-status-success/10 to-status-success/5 p-6 rounded-xl border border-status-success/30">
                                        <h4 className="text-lg font-bold text-status-success mb-4 flex items-center gap-2">
                                            <TrophyIcon className="w-5 h-5" /> {t('competitors-successful-competitors')}
                                        </h4>
                                        <div className="space-y-3">
                                            {filteredCompetitors
                                                .filter(c => c.wins > 0)
                                                .sort((a, b) => b.wins - a.wins)
                                                .slice(0, 5)
                                                .map((competitor) => (
                                                <div key={competitor.name} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                                    <span className="font-semibold text-text-primary">{competitor.name}</span>
                                                    <span className="text-status-success font-bold">{competitor.wins} {t('competitors-wins-label')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitorsView;