// C:/Users/Windows 11/Desktop/ai-broker/ai-broker/ai-broker-016/components/ContractsView.tsx

import React, { useState, DragEvent, useMemo, memo, useCallback, ChangeEvent } from 'react';
import type { ContractAnalysisResult, ContractClauseAnalysis } from '../types';
import { ContractIcon, UploadIcon, FileIcon, XIcon, TrashIcon, CalendarIcon, AlertIcon, CheckIcon } from './Icons';
import { t } from '../utils/translations';

// =============================================================================
// YANGILANGAN ANALYSIS DETAIL MODAL KOMPONENTI
// =============================================================================
const AnalysisDetailModal: React.FC<{ contract: ContractAnalysisResult; onClose: () => void }> = memo(({ contract, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const recommendationMap = {
        'Tavsiya etiladi': {
            style: 'bg-green-500/10 border-green-500/50 text-green-400',
            icon: <CheckIcon className="w-5 h-5" />
        },
        'Muzokara talab etiladi': {
            style: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
            icon: <AlertIcon className="w-5 h-5" />
        },
        'Yuqori riskli': {
            style: 'bg-red-500/10 border-red-500/50 text-red-400',
            icon: <AlertIcon className="w-5 h-5" />
        },
    };
    const currentRecommendation = recommendationMap[contract.overallRecommendation] || recommendationMap['Muzokara talab etiladi'];

    const tabs = [
        { id: 'overview', label: t('overview'), icon: '📊' },
        { id: 'risks', label: t('risk-analysis'), icon: '⚠️' },
        { id: 'obligations', label: t('obligations'), icon: '📋' },
        { id: 'clauses', label: t('special-clauses'), icon: '📄' },
    ];

    const riskStats = useMemo(() => {
        if (!contract.riskAnalysis) return { high: 0, medium: 0, low: 0, total: 0 };
        const high = contract.riskAnalysis.filter(r => r.riskCategory === 'High').length;
        const medium = contract.riskAnalysis.filter(r => r.riskCategory === 'Medium').length;
        const low = contract.riskAnalysis.filter(r => r.riskCategory === 'Low').length;
        return { high, medium, low, total: high + medium + low };
    }, [contract.riskAnalysis]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-[#161B22] border border-gray-800 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col h-[95vh] animate-slide-up overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <header className="flex-shrink-0 p-6 border-b border-gray-800">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2 leading-tight">
                                {contract.contractTitle}
                            </h2>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                    <span>{t('analysis-date-label')}: {new Date(contract.analysisDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-4 h-4 text-gray-500" />
                                    <span className="truncate max-w-xs">{contract.fileName}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold border ${currentRecommendation.style}`}>
                        {currentRecommendation.icon}
                        <span>{contract.overallRecommendation}</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-3xl font-bold text-white">{riskStats.total}</p>
                            <p className="text-sm text-gray-400">{t('total-clauses')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-gray-900/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-3xl font-bold text-red-400">{riskStats.high}</p>
                            <p className="text-sm text-red-400/80">{t('high-risk')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-gray-900/10 border border-yellow-500/30 rounded-lg p-4">
                            <p className="text-3xl font-bold text-yellow-400">{riskStats.medium}</p>
                            <p className="text-sm text-yellow-400/80">{t('medium-risk')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-gray-900/10 border border-green-500/30 rounded-lg p-4">
                            <p className="text-3xl font-bold text-green-400">{riskStats.low}</p>
                            <p className="text-sm text-green-400/80">{t('low-risk')}</p>
                        </div>
                    </div>

                    <div className="mt-6 border-b border-gray-800">
                        <div className="flex items-center space-x-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 px-2 transition-all duration-300 flex items-center gap-2 font-semibold border-b-2 ${
                                        activeTab === tab.id
                                            ? 'text-white border-cyan-400'
                                            : 'text-gray-400 border-transparent hover:text-white'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>
                
                <main className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    {/* ... Modal Content ... */}
                </main>
            </div>
        </div>
    );
});


// =============================================================================
// ASOSIY ContractsView KOMPONENTI (O'zgarishsiz qoldi)
// =============================================================================
const ContractsView: React.FC<ContractsViewProps> = ({
    contracts = [],
    onAnalyze,
    activeContract,
    setActiveContract,
    onDelete
}) => {
    
    const handleFiles = useCallback((files: FileList | null) => {
        if (files && files.length > 0) {
            if (typeof onAnalyze === 'function') {
                onAnalyze(Array.from(files));
            } else {
                console.error("onAnalyze prop is not a function. Please pass a valid function.");
            }
        }
    }, [onAnalyze]);
    
    const handleDragEvents = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };

    const analyzedCount = useMemo(() => contracts.filter(c => c.status === 'analyzed').length, [contracts]);
    const pendingCount = useMemo(() => contracts.filter(c => c.status === 'pending').length, [contracts]);

    return (
        <div className="bg-[#0D1117] text-gray-300 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                        {t('elite-legal-intelligence')}
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {t('contract-upload-description')}
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-400">
                            <ContractIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t('total-contracts')}</p>
                            <p className="text-white text-2xl font-bold">{contracts.length}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 text-green-400">
                            <FileIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t('analyzed')}</p>
                            <p className="text-white text-2xl font-bold">{analyzedCount}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-yellow-500/10 text-yellow-400">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t('pending')}</p>
                            <p className="text-white text-2xl font-bold">{pendingCount}</p>
                        </div>
                    </div>
                </section>

                <section className="mb-12 animate-fade-in-up">
                    <div 
                        onDragEnter={handleDragEvents}
                        onDragOver={handleDragEvents}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-700 rounded-xl min-h-[250px] flex items-center justify-center p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/30 transition-all duration-300 group"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadIcon className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                {t('drag-drop-text')}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                                {t('multiple-files')}
                            </p>
                            <button
                                type="button"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
                                onClick={() => document.getElementById('file-upload-input')?.click()}
                            >
                                {t('file-upload-button')}
                            </button>
                            <input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                multiple
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </section>

                <section className="animate-fade-in-up">
                    {contracts.length > 0 ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">
                                {t('contract-history-title')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contracts.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                                        onClick={() => setActiveContract(contract)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setActiveContract(contract)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-white text-md pr-4 line-clamp-2">
                                                {contract.contractTitle}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    onDelete(contract.id);
                                                }}
                                                className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full flex-shrink-0"
                                                aria-label={t('delete-contract-aria').replace('{title}', contract.contractTitle)}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-1">
                                            {contract.fileName}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                contract.status === 'analyzed' 
                                                    ? 'bg-green-500/10 text-green-400' 
                                                    : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {contract.status === 'analyzed' ? t('analyzed') : t('pending')}
                                            </span>
                                            <span className="text-gray-400">
                                                {new Date(contract.analysisDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                            <div className="text-6xl mb-4 text-gray-600"><ContractIcon strokeWidth={1} /></div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('no-contracts-title')}</h3>
                            <p className="text-gray-400 max-w-md mx-auto">{t('no-contracts-description')}</p>
                        </div>
                    )}
                </section>

                {activeContract && (
                    <AnalysisDetailModal
                        contract={activeContract}
                        onClose={() => setActiveContract(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(ContractsView);