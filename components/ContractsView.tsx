
import React, { useState, useRef, DragEvent, useMemo, useEffect, useCallback } from 'react';
import type { ContractAnalysisResult, ContractClauseAnalysis } from '../types';
import { ContractIcon, UploadIcon, FileIcon, XIcon, AnalyzeIcon, TrashIcon, EyeIcon, SearchIcon, FilterIcon, SortIcon, BookmarkIcon, CalendarIcon, AlertIcon, CheckIcon } from './Icons';
import { smartStorage } from '../utils/smartStorage';

interface ContractsViewProps {
    contracts: ContractAnalysisResult[];
    onAnalyze: (files: File[]) => void;
    activeContract: ContractAnalysisResult | null;
    setActiveContract: (contract: ContractAnalysisResult | null) => void;
    onDelete: (contractId: string) => void;
}

interface FilterType {
    search: string;
    risk: string;
    recommendation: string;
    dateRange: string;
    sortBy: string;
}

const AnalysisDetailModal: React.FC<{ contract: ContractAnalysisResult; onClose: () => void }> = ({ contract, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const riskCategoryStyles: Record<ContractClauseAnalysis['riskCategory'], string> = {
        'High': 'border-status-danger text-status-danger bg-status-danger/5',
        'Medium': 'border-status-warning text-status-warning bg-status-warning/5',
        'Low': 'border-status-success text-status-success bg-status-success/5',
    };
    
    const recommendationStyles = {
        'Tavsiya etiladi': 'bg-gradient-to-r from-status-success/20 to-status-success/10 text-status-success border-status-success',
        'Muzokara talab etiladi': 'bg-gradient-to-r from-status-warning/20 to-status-warning/10 text-status-warning border-status-warning',
        'Yuqori riskli': 'bg-gradient-to-r from-status-danger/20 to-status-danger/10 text-status-danger border-status-danger',
    };
    const recommendationStyle = recommendationStyles[contract.overallRecommendation];

    const tabs = [
        { id: 'overview', label: 'Umumiy Ko\'rinish', icon: '📊' },
        { id: 'risks', label: 'Risk Tahlili', icon: '⚠️' },
        { id: 'obligations', label: 'Majburiyatlar', icon: '📋' },
        { id: 'clauses', label: 'Maxsus Bandlar', icon: '📄' },
        { id: 'timeline', label: 'Vaqt Jadvali', icon: '📅' }
    ];

    const getRiskStats = () => {
        const high = contract.riskAnalysis.filter(r => r.riskCategory === 'High').length;
        const medium = contract.riskAnalysis.filter(r => r.riskCategory === 'Medium').length;
        const low = contract.riskAnalysis.filter(r => r.riskCategory === 'Low').length;
        return { high, medium, low, total: high + medium + low };
    };

    const riskStats = getRiskStats();


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl border border-brand-primary/30 rounded-3xl p-8 w-full max-w-6xl shadow-2xl flex flex-col h-[95vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Enhanced Header */}
                <div className="flex-shrink-0 border-b border-border/50 pb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
                                {contract.contractTitle}
                            </h3>
                            <div className="flex items-center gap-6 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>Tahlil: {new Date(contract.analysisDate).toLocaleDateString('uz-UZ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-4 h-4" />
                                    <span>{contract.fileName}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-text-secondary hover:text-text-primary transition-all duration-300 hover:scale-110"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Status Banner */}
                    <div className={`mt-6 p-4 rounded-xl border-l-4 text-center shadow-lg ${recommendationStyle}`}>
                        <div className="flex items-center justify-center gap-3">
                            {contract.overallRecommendation === 'Tavsiya etiladi' ? (
                                <CheckIcon className="w-6 h-6" />
                            ) : (
                                <AlertIcon className="w-6 h-6" />
                            )}
                            <h4 className="font-bold text-xl">{contract.overallRecommendation}</h4>
                        </div>
                    </div>

                    {/* Risk Statistics */}
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        <div className="bg-black/20 p-4 rounded-xl border border-border/50 text-center">
                            <div className="text-2xl font-bold text-text-primary">{riskStats.total}</div>
                            <div className="text-sm text-text-secondary">Jami Bandlar</div>
                        </div>
                        <div className="bg-status-danger/10 p-4 rounded-xl border border-status-danger/30 text-center">
                            <div className="text-2xl font-bold text-status-danger">{riskStats.high}</div>
                            <div className="text-sm text-status-danger">Yuqori Risk</div>
                        </div>
                        <div className="bg-status-warning/10 p-4 rounded-xl border border-status-warning/30 text-center">
                            <div className="text-2xl font-bold text-status-warning">{riskStats.medium}</div>
                            <div className="text-sm text-status-warning">O'rta Risk</div>
                        </div>
                        <div className="bg-status-success/10 p-4 rounded-xl border border-status-success/30 text-center">
                            <div className="text-2xl font-bold text-status-success">{riskStats.low}</div>
                            <div className="text-sm text-status-success">Past Risk</div>
                        </div>
                    </div>

                    {/* Sophisticated Tabs */}
                    <div className="mt-6">
                        <div className="flex space-x-1 bg-black/20 p-1 rounded-xl border border-border/50">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg transform scale-105'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Advanced Content Area */}
                <div className="flex-grow overflow-y-auto mt-6 pr-2">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-black/30 to-black/10 p-6 rounded-xl border border-border/50">
                                <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                    <span className="text-2xl">📋</span> Umumiy Xulosa
                                </h4>
                                <p className="text-text-secondary leading-relaxed">{contract.executiveSummary}</p>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-black/20 p-4 rounded-xl border border-border/50 text-center hover:border-brand-primary/50 transition-all duration-300">
                                    <div className="text-3xl mb-2">⚡</div>
                                    <div className="font-semibold text-text-primary">Tezkor Xulosa</div>
                                    <div className="text-sm text-text-secondary mt-1">AI tomonidan tavsiya</div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-border/50 text-center hover:border-brand-primary/50 transition-all duration-300">
                                    <div className="text-3xl mb-2">🎯</div>
                                    <div className="font-semibold text-text-primary">Asosiy Nuqtalar</div>
                                    <div className="text-sm text-text-secondary mt-1">{contract.keyObligations.length} ta majburiyat</div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-border/50 text-center hover:border-brand-primary/50 transition-all duration-300">
                                    <div className="text-3xl mb-2">📈</div>
                                    <div className="font-semibold text-text-primary">Risk Darajasi</div>
                                    <div className="text-sm text-text-secondary mt-1">{riskStats.high > 0 ? 'Yuqori' : riskStats.medium > 0 ? 'O\'rta' : 'Past'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'risks' && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                <span className="text-2xl">⚠️</span> Detallashtirilgan Risk Tahlili
                            </h4>
                            {contract.riskAnalysis.map((item, index) => (
                                <div key={index} className={`p-5 border-l-4 rounded-r-xl shadow-lg transition-all duration-300 hover:shadow-xl ${riskCategoryStyles[item.riskCategory]}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${riskCategoryStyles[item.riskCategory]}`}>
                                            {item.riskCategory} Risk
                                        </span>
                                        <div className="text-xs text-text-secondary">Band #{index + 1}</div>
                                    </div>
                                    <blockquote className="text-sm text-text-secondary italic border-l-2 border-gray-500 pl-4 mb-4 bg-black/10 p-3 rounded">
                                        "{item.clauseText}"
                                    </blockquote>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-status-danger mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="font-semibold text-text-primary">Aniqlangan Risk:</strong>
                                                <p className="text-text-secondary mt-1">{item.identifiedRisk}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-status-success mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="font-semibold text-status-success">Tavsiya Etilgan Chora:</strong>
                                                <p className="text-text-secondary mt-1">{item.recommendedAction}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'obligations' && (
                        <div className="space-y-6">
                            <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                <span className="text-2xl">📋</span> Asosiy Majburiyatlar va Javobgarliklar
                            </h4>
                            <div className="grid gap-4">
                                {contract.keyObligations.map((item, index) => (
                                    <div key={index} className="bg-gradient-to-r from-black/30 to-black/10 p-5 rounded-xl border border-border/50 hover:border-brand-primary/50 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <strong className="text-lg text-brand-primary">{item.party}</strong>
                                            </div>
                                            <div className="flex items-center gap-2 text-accent">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span className="text-sm font-semibold">{item.dueDate}</span>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary leading-relaxed pl-11">{item.obligation}</p>
                                        <div className="mt-3 pl-11">
                                            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm">
                                                <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                                Majburiyat #{index + 1}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'clauses' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                    <span className="text-2xl">⚡</span> Jarima va Sanksiyalar
                                </h4>
                                <div className="space-y-3">
                                    {contract.penaltyClauses.length > 0 ? contract.penaltyClauses.map((clause, index) => (
                                        <div key={index} className="bg-status-warning/5 border border-status-warning/30 p-4 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-status-warning rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    !
                                                </div>
                                                <blockquote className="text-text-secondary italic flex-1">
                                                    "{clause}"
                                                </blockquote>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 bg-black/10 rounded-xl border border-border/50">
                                            <div className="text-4xl mb-2">✅</div>
                                            <p className="text-text-secondary">Maxsus jarima bandlari topilmadi</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                    <span className="text-2xl">🌊</span> Fors-major va Favqulodda Holatlari
                                </h4>
                                <div className="space-y-3">
                                    {contract.forceMajeureClauses.length > 0 ? contract.forceMajeureClauses.map((clause, index) => (
                                        <div key={index} className="bg-blue-500/5 border border-blue-500/30 p-4 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                    <span className="text-xs">🌊</span>
                                                </div>
                                                <blockquote className="text-text-secondary italic flex-1">
                                                    "{clause}"
                                                </blockquote>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 bg-black/10 rounded-xl border border-border/50">
                                            <div className="text-4xl mb-2">ℹ️</div>
                                            <p className="text-text-secondary">Fors-major bandlari topilmadi</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <h4 className="font-bold text-xl text-text-primary mb-4 flex items-center gap-3">
                                <span className="text-2xl">📅</span> Shartnoma Vaqt Jadvali
                            </h4>
                            <div className="relative">
                                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-primary to-brand-secondary"></div>
                                {contract.keyObligations.map((item, index) => (
                                    <div key={index} className="relative flex items-start gap-6 pb-8">
                                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 bg-black/20 p-4 rounded-xl border border-border/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-semibold text-text-primary">{item.party}</h5>
                                                <span className="text-sm bg-brand-primary/20 text-brand-primary px-2 py-1 rounded">
                                                    {item.dueDate}
                                                </span>
                                            </div>
                                            <p className="text-text-secondary text-sm">{item.obligation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-text-secondary">
                            AI Legal Intelligence • Powered by Gemini
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => window.print()}
                            className="bg-black/20 hover:bg-black/40 text-text-secondary hover:text-text-primary font-semibold py-2 px-6 rounded-lg transition-all duration-300 border border-border/50 hover:border-border"
                        >
                            🖨️ Print
                        </button>
                        <button 
                            onClick={onClose} 
                            className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-semibold py-2 px-6 rounded-lg hover:shadow-glow transition-all duration-300 shadow-lg"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContractsView: React.FC<ContractsViewProps> = React.memo(({ contracts, onAnalyze, activeContract, setActiveContract, onDelete }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bookmarkedContracts, setBookmarkedContracts] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<FilterType>({
        search: '',
        risk: 'all',
        recommendation: 'all',
        dateRange: 'all',
        sortBy: 'date-desc'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load bookmarks from localStorage
    useEffect(() => {
        const savedBookmarks = smartStorage.getItem<string[]>('ai-broker-contract-bookmarks');
        if (savedBookmarks) {
            setBookmarkedContracts(new Set(savedBookmarks));
        }
    }, []);

    // Toggle bookmark functionality
    const toggleBookmark = useCallback((contractId: string) => {
        const newBookmarks = new Set(bookmarkedContracts);
        if (newBookmarks.has(contractId)) {
            newBookmarks.delete(contractId);
        } else {
            newBookmarks.add(contractId);
        }
        setBookmarkedContracts(newBookmarks);
        smartStorage.setItem('ai-broker-contract-bookmarks', [...newBookmarks], {
            compress: false, // Small data, no compression needed
            validate: true,
            ttl: 180 * 24 * 60 * 60 * 1000 // 6 months for bookmarks
        });
    }, [bookmarkedContracts]);

    // File handling with useCallback optimization
    const handleFileSelection = useCallback((selectedFiles: FileList | null) => {
        if (selectedFiles) {
            setError(null);
            const newFiles = Array.from(selectedFiles);
            const validFiles = newFiles.filter(file => {
                const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
            });
            
            if (validFiles.length !== newFiles.length) {
                setError('Faqat PDF, DOC, DOCX formatdagi fayllar (10MB gacha) qabul qilinadi.');
            }
            
            setFiles(prev => [...prev, ...validFiles]);
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelection(e.dataTransfer.files);
    }, [handleFileSelection]);
    
    const handleDragEvents = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    }, []);
    
    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            setError("Tahlil uchun shartnoma faylini tanlang.");
            return;
        }
        onAnalyze(files);
        setFiles([]);
        setError(null);
    }, [files, onAnalyze]);

    // Advanced filtering and sorting
    const filteredAndSortedContracts = useMemo(() => {
        let filtered = [...contracts];

        // Search filter
        if (filters.search) {
            filtered = filtered.filter(contract => 
                contract.contractTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
                contract.fileName.toLowerCase().includes(filters.search.toLowerCase()) ||
                contract.executiveSummary.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Risk filter
        if (filters.risk !== 'all') {
            filtered = filtered.filter(contract => {
                const hasHighRisk = contract.riskAnalysis.some(r => r.riskCategory === 'High');
                const hasMediumRisk = contract.riskAnalysis.some(r => r.riskCategory === 'Medium');
                const hasLowRisk = contract.riskAnalysis.some(r => r.riskCategory === 'Low');
                
                switch (filters.risk) {
                    case 'high': return hasHighRisk;
                    case 'medium': return hasMediumRisk && !hasHighRisk;
                    case 'low': return hasLowRisk && !hasMediumRisk && !hasHighRisk;
                    default: return true;
                }
            });
        }

        // Recommendation filter
        if (filters.recommendation !== 'all') {
            filtered = filtered.filter(contract => {
                switch (filters.recommendation) {
                    case 'recommended': return contract.overallRecommendation === 'Tavsiya etiladi';
                    case 'negotiate': return contract.overallRecommendation === 'Muzokara talab etiladi';
                    case 'risky': return contract.overallRecommendation === 'Yuqori riskli';
                    default: return true;
                }
            });
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            filtered = filtered.filter(contract => {
                const contractDate = new Date(contract.analysisDate);
                const daysDiff = Math.floor((now.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24));
                
                switch (filters.dateRange) {
                    case 'today': return daysDiff === 0;
                    case 'week': return daysDiff <= 7;
                    case 'month': return daysDiff <= 30;
                    default: return true;
                }
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'date-desc': return new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime();
                case 'date-asc': return new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime();
                case 'title-asc': return a.contractTitle.localeCompare(b.contractTitle);
                case 'title-desc': return b.contractTitle.localeCompare(a.contractTitle);
                case 'risk-desc': {
                    const getRiskScore = (contract: ContractAnalysisResult) => {
                        const high = contract.riskAnalysis.filter(r => r.riskCategory === 'High').length;
                        const medium = contract.riskAnalysis.filter(r => r.riskCategory === 'Medium').length;
                        return high * 3 + medium * 2;
                    };
                    return getRiskScore(b) - getRiskScore(a);
                }
                default: return 0;
            }
        });

        return filtered;
    }, [contracts, filters]);

    const getContractRiskLevel = useCallback((contract: ContractAnalysisResult) => {
        const hasHighRisk = contract.riskAnalysis.some(r => r.riskCategory === 'High');
        const hasMediumRisk = contract.riskAnalysis.some(r => r.riskCategory === 'Medium');
        if (hasHighRisk) return { level: 'High', color: 'text-status-danger', bg: 'bg-status-danger/10' };
        if (hasMediumRisk) return { level: 'Medium', color: 'text-status-warning', bg: 'bg-status-warning/10' };
        return { level: 'Low', color: 'text-status-success', bg: 'bg-status-success/10' };
    }, []);

    return (
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-surface to-black/30 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-brand-primary/20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-accent opacity-10"></div>
            </div>

            {activeContract && <AnalysisDetailModal contract={activeContract} onClose={() => setActiveContract(null)} />}

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 rounded-2xl border border-border/50">
                        <div className="text-center mb-6">
                            <div className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-4">
                                <ContractIcon strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to mb-3">
                                Elite Legal Intelligence
                            </h2>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                AI-powered yuridik tahlil tizimi bilan shartnomalaringizdagi risklarni aniqlang va
                                majburiyatlarni batafsil o'rganing. Har bir tahlil sizning yuridik xavfsizligingizni oshiradi.
                            </p>
                        </div>
                        
                        {/* Upload Statistics */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-black/20 p-3 rounded-xl border border-border/50">
                                <div className="text-2xl font-bold text-brand-primary">{contracts.length}</div>
                                <div className="text-xs text-text-secondary">Tahlil Qilingan</div>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl border border-border/50">
                                <div className="text-2xl font-bold text-accent">{bookmarkedContracts.size}</div>
                                <div className="text-xs text-text-secondary">Saqlangan</div>
                            </div>
                        </div>
                    </div>
                    {/* Enhanced Upload Form */}
                    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 rounded-2xl border border-border/50">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                <UploadIcon className="w-5 h-5 text-brand-primary" />
                                Fayl Yuklash
                            </h3>
                            <p className="text-xs text-text-secondary">PDF, DOC, DOCX (max 10MB)</p>
                        </div>
                        
                        <div 
                            onDragEnter={handleDragEvents} 
                            onDragLeave={handleDragEvents} 
                            onDragOver={handleDragEvents} 
                            onDrop={handleDrop} 
                            className={`relative text-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
                                isDragging 
                                    ? 'border-brand-primary bg-brand-primary/10 scale-105 shadow-lg' 
                                    : 'border-border hover:border-brand-primary/50 hover:bg-black/10'
                            }`}
                        >
                            <input 
                                type="file" 
                                id="contract-upload" 
                                className="hidden" 
                                onChange={(e) => handleFileSelection(e.target.files)} 
                                accept=".pdf,.doc,.docx" 
                                ref={fileInputRef} 
                                multiple 
                            />
                            <label htmlFor="contract-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-4xl text-brand-primary">
                                        <UploadIcon strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-text-primary font-semibold">Fayl tanlang yoki shu yerga olib keling</p>
                                        <p className="text-text-secondary text-sm mt-1">Bir nechta faylni birdan yuklashingiz mumkin</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h4 className="text-sm font-semibold text-text-primary">Tanlangan fayllar ({files.length}):</h4>
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileIcon className="text-brand-primary flex-shrink-0 w-5 h-5" />
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-text-primary">{file.name}</p>
                                                <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)}
                                            className="p-2 rounded-full hover:bg-black/20 text-text-secondary hover:text-status-danger transition-all duration-300"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-lg">
                                <p className="text-status-danger text-sm text-center font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <button 
                                type="submit" 
                                disabled={files.length === 0} 
                                className="w-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-4 rounded-xl hover:shadow-glow disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 disabled:scale-100"
                            >
                                <AnalyzeIcon strokeWidth={2} />
                                <span>Elite Legal Analysis</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Enhanced Contracts List Section */}
                <div className="lg:col-span-2 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 rounded-2xl border border-border/50">
                    {/* Advanced Header with Filters */}
                    <div className="mb-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center gap-3">
                                    <span className="text-3xl">📋</span>
                                    Elite Contract Archive
                                </h3>
                                <p className="text-text-secondary text-sm mt-1">
                                    {filteredAndSortedContracts.length} ta shartnoma {contracts.length !== filteredAndSortedContracts.length ? `(${contracts.length} ta dan filtrlangan)` : ''}
                                </p>
                            </div>
                            
                            {contracts.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-border/50">
                                        <BookmarkIcon className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm text-text-secondary">{bookmarkedContracts.size} saqlangan</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Advanced Search and Filters */}
                        {contracts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {/* Search */}
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="Shartnoma qidirish..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary placeholder-text-secondary transition-all duration-300"
                                    />
                                </div>
                                
                                {/* Risk Filter */}
                                <select
                                    value={filters.risk}
                                    onChange={(e) => setFilters(prev => ({ ...prev, risk: e.target.value }))}
                                    className="w-full p-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary transition-all duration-300"
                                >
                                    <option value="all">Barcha risk darajalari</option>
                                    <option value="high">Yuqori risk</option>
                                    <option value="medium">O'rta risk</option>
                                    <option value="low">Past risk</option>
                                </select>
                                
                                {/* Recommendation Filter */}
                                <select
                                    value={filters.recommendation}
                                    onChange={(e) => setFilters(prev => ({ ...prev, recommendation: e.target.value }))}
                                    className="w-full p-3 bg-black/20 border border-border/50 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-primary transition-all duration-300"
                                >
                                    <option value="all">Barcha tavsiyalar</option>
                                    <option value="recommended">Tavsiya etiladi</option>
                                    <option value="negotiate">Muzokara kerak</option>
                                    <option value="risky">Yuqori riskli</option>
                                </select>
                            </div>
                        )}
                        
                        {/* Sort Options */}
                        {contracts.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <SortIcon className="w-4 h-4" />
                                    <span>Saralash:</span>
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'date-desc', label: 'Yangi' },
                                        { value: 'date-asc', label: 'Eski' },
                                        { value: 'title-asc', label: 'Nom A-Z' },
                                        { value: 'risk-desc', label: 'Risk' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                                            className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                                                filters.sortBy === option.value
                                                    ? 'bg-brand-primary text-white'
                                                    : 'bg-black/20 text-text-secondary hover:text-text-primary hover:bg-black/40'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Contracts List */}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {filteredAndSortedContracts.length > 0 ? filteredAndSortedContracts.map(contract => {
                            const riskInfo = getContractRiskLevel(contract);
                            const isBookmarked = bookmarkedContracts.has(contract.id);
                            const isActive = activeContract?.id === contract.id;
                            
                            return (
                                <div 
                                    key={contract.id} 
                                    className={`group p-5 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                                        isActive 
                                            ? 'ring-2 ring-brand-primary shadow-glow border-brand-primary/50' 
                                            : 'border-border/50 hover:border-brand-primary/30'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-3">
                                                <h4 className="font-bold text-lg text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                                                    {contract.contractTitle}
                                                </h4>
                                                <button
                                                    onClick={() => toggleBookmark(contract.id)}
                                                    className={`flex-shrink-0 p-1 rounded transition-all duration-300 ${
                                                        isBookmarked 
                                                            ? 'text-yellow-400 hover:text-yellow-300 scale-110' 
                                                            : 'text-text-secondary hover:text-yellow-400'
                                                    }`}
                                                    title={isBookmarked ? "Saqlangandan olib tashlash" : "Saqlash"}
                                                >
                                                    <BookmarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    <FileIcon className="w-4 h-4" />
                                                    <span>{contract.fileName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>{new Date(contract.analysisDate).toLocaleDateString('uz-UZ')}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${riskInfo.bg} ${riskInfo.color}`}>
                                                    <div className={`w-2 h-2 rounded-full bg-current`}></div>
                                                    <span>{riskInfo.level} Risk</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                                                {contract.executiveSummary}
                                            </p>
                                            
                                            {/* Recommendation Badge */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                contract.overallRecommendation === 'Tavsiya etiladi' ? 'bg-status-success/20 text-status-success' :
                                                contract.overallRecommendation === 'Muzokara talab etiladi' ? 'bg-status-warning/20 text-status-warning' :
                                                'bg-status-danger/20 text-status-danger'
                                            }`}>
                                                {contract.overallRecommendation === 'Tavsiya etiladi' ? (
                                                    <CheckIcon className="w-3 h-3" />
                                                ) : (
                                                    <AlertIcon className="w-3 h-3" />
                                                )}
                                                <span>{contract.overallRecommendation}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 ml-4">
                                            <button 
                                                onClick={() => setActiveContract(contract)} 
                                                className="p-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-glow transition-all duration-300 transform hover:scale-105" 
                                                title="Batafsil ko'rish"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(confirm("Bu shartnoma tahlilini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")) {
                                                        onDelete(contract.id);
                                                    }
                                                }} 
                                                className="p-3 rounded-xl bg-black/20 text-text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-all duration-300 transform hover:scale-105" 
                                                title="O'chirish"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-16 px-6">
                                {contracts.length === 0 ? (
                                    <div>
                                        <div className="text-6xl mb-4">📄</div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2">Shartnoma Tahlili Yo'q</h3>
                                        <p className="text-text-secondary max-w-md mx-auto">Hali hech qanday shartnoma tahlil qilinmagan. Shartnoma faylini yuklab, AI-powered yuridik xulosa oling.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2">Filter bo'yicha natija yo'q</h3>
                                        <p className="text-text-secondary">Qidiruv mezonlaringizni o'zgartiring yoki filtrlarni tozalang.</p>
                                        <button
                                            onClick={() => setFilters({ search: '', risk: 'all', recommendation: 'all', dateRange: 'all', sortBy: 'date-desc' })}
                                            className="mt-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:shadow-glow transition-all duration-300"
                                        >
                                            Filtrlarni Tozalash
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.contracts.length === nextProps.contracts.length &&
    prevProps.contracts.every((contract, index) => 
      contract.id === nextProps.contracts[index]?.id &&
      contract.overallRecommendation === nextProps.contracts[index]?.overallRecommendation &&
      contract.analysisDate === nextProps.contracts[index]?.analysisDate
    ) &&
    prevProps.activeContract?.id === nextProps.activeContract?.id
  );
});

export default ContractsView;
