
import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult, TenderData, Platform, LotPassport, AnalysisContext, TenderStatus, WinnerInfo, CompanyProfile, ContractAnalysisResult, AIInsight, InsightActionView, VisionaryInsight, UIPreferences, DiscoveredTender, SourcingRecommendation, SourcingResult } from './types';
import { generateFinalAnalysis, findSourcingOptions, analyzeContract, generateDashboardInsights, generateVisionaryInsights } from './services/geminiService';
import { smartStorage } from './utils/smartStorage';
import { t, setLanguage, getCurrentLanguage } from './utils/translations';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import AnalysisDashboard from './components/AnalysisDashboard';
import SourcingSelection from './components/SourcingSelection';
import TenderOutcomeForm from './components/FeedbackSection';
import { Sidebar, Header } from './components/Header';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import ChatInterface from './components/ChatInterface';
import ProfileSettings from './components/ProfileSettings';
import CompetitorsView from './components/CompetitorsView';
import ContractsView from './components/ContractsView';
import GoogleSearchTest from './components/GoogleSearchTest';
import { ErrorIcon, LogoIcon, BotIcon } from './components/Icons';

export type AppView = 'dashboard' | 'input' | 'loadingSourcing' | 'sourcingSelection' | 'loadingAnalysis' | 'results' | 'analytics' | 'sharedReport' | 'profile' | 'competitors' | 'contracts' | 'loadingContract';

const defaultPrefs: UIPreferences = {
    theme: 'default',
    iconStyle: 'line',
    language: 'uz-latn' // Added language preference
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [allTenders, setAllTenders] = useState<AnalysisResult[]>([]);
  const [activeTender, setActiveTender] = useState<AnalysisResult | null>(null);
  const [sharedTender, setSharedTender] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourcingResult, setSourcingResult] = useState<SourcingResult | null>(null);
  const [tenderContext, setTenderContext] = useState<{data: TenderData, platform: Platform, text: string} | null>(null);
  const [outcomeToSet, setOutcomeToSet] = useState<TenderStatus | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [analyzedContracts, setAnalyzedContracts] = useState<ContractAnalysisResult[]>([]);
  const [activeContract, setActiveContract] = useState<ContractAnalysisResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [visionaryInsight, setVisionaryInsight] = useState<VisionaryInsight | null>(null);
  const [loadingVisionary, setLoadingVisionary] = useState(true);
  const [uiPrefs, setUiPrefs] = useState<UIPreferences>(defaultPrefs);
  const [autoAnalysisNotifications, setAutoAnalysisNotifications] = useState<AnalysisResult[]>([]);


  useEffect(() => {
    // Load data from SmartStorage with enhanced compression and validation
    try {
      const storedTenders = smartStorage.getItem<AnalysisResult[]>('ai-broker-tenders');
      if (storedTenders) setAllTenders(storedTenders);
      
      const storedProfile = smartStorage.getItem<CompanyProfile>('ai-broker-profile');
      if (storedProfile) {
          setCompanyProfile(storedProfile);
          if (storedProfile.uiPreferences) {
            setUiPrefs(storedProfile.uiPreferences);
            // Set language from profile if available
            if (storedProfile.uiPreferences.language) {
              setLanguage(storedProfile.uiPreferences.language);
            }
          }
      }

      // Initialize language from localStorage if not set in profile
      const savedLanguage = localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | null;
      if (savedLanguage && (!storedProfile || !storedProfile.uiPreferences || !storedProfile.uiPreferences.language)) {
        setLanguage(savedLanguage);
        setUiPrefs(prev => ({ ...prev, language: savedLanguage }));
      }

      const storedContracts = smartStorage.getItem<ContractAnalysisResult[]>('ai-broker-contracts');
      if (storedContracts) setAnalyzedContracts(storedContracts);

      // Perform automatic cleanup on app start
      const cleanupStats = smartStorage.cleanup();
      if (cleanupStats.removedItems > 0) {
        console.log(`SmartStorage: Cleaned up ${cleanupStats.removedItems} expired items, freed ${Math.round(cleanupStats.freedSpace / 1024)}KB`);
      }
      
      // Initialize storage monitoring
      smartStorage.startMonitoring((alert) => {
        console.warn(`SmartStorage Alert [${alert.type}]: ${alert.message}`);
        
        // Show user notification for critical storage issues
        if (alert.type === 'error') {
          setError(`Storage Warning: ${alert.message}. Some data might be lost.`);
        }
      });
      
      // Log storage health on startup
      const healthReport = smartStorage.getHealthReport();
      console.log('SmartStorage Health:', healthReport);

    } catch (e) {
      console.error("Failed to load data from storage:", e);
      smartStorage.clear();
    }

    // Handle shared reports
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#report=')) {
        try {
          const base64Str = window.location.hash.substring(8);
          const dataStr = decodeURIComponent(atob(base64Str));
          const tenderData = JSON.parse(dataStr);
          setSharedTender(tenderData);
          setView('sharedReport');
        } catch (e) {
          console.error("Failed to parse shared report:", e);
          setError("Ulashilgan hisobot havolasi yaroqsiz.");
          window.location.hash = '';
          setView('dashboard');
        }
      } else if (view === 'sharedReport') {
        // If hash is removed, go back to dashboard
        handleResetToDashboard();
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [view]);
  
  // Effect for generating AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      if (allTenders.length < 3) {
        setInsights([]);
        setLoadingInsights(false);
        return;
      }
      setLoadingInsights(true);
      try {
        const result = await generateDashboardInsights(allTenders);
        setInsights(result);
      } catch (e) {
        console.error("Failed to fetch insights:", e);
        setInsights([]);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [allTenders]);

    // Effect for generating AI Visionary insights
    useEffect(() => {
        const fetchVisionaryInsights = async () => {
            if (allTenders.length < 5) {
                setVisionaryInsight(null);
                setLoadingVisionary(false);
                return;
            }
            setLoadingVisionary(true);
            try {
                const result = await generateVisionaryInsights(allTenders);
                setVisionaryInsight(result);
            } catch (e) {
                console.error("Failed to fetch visionary insights:", e);
                setVisionaryInsight(null);
            } finally {
                setLoadingVisionary(false);
            }
        };
        fetchVisionaryInsights();
    }, [allTenders]);


  const persistTenders = (tenders: AnalysisResult[]) => {
    smartStorage.setItem('ai-broker-tenders', tenders, {
        compress: true,
        validate: true,
        ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    setAllTenders(tenders);
  };
  
  const persistContracts = (contracts: ContractAnalysisResult[]) => {
    smartStorage.setItem('ai-broker-contracts', contracts, {
        compress: true,
        validate: true,
        ttl: 90 * 24 * 60 * 60 * 1000 // 90 days for contracts
    });
    setAnalyzedContracts(contracts);
  };

  const persistProfile = (profile: CompanyProfile) => {
    smartStorage.setItem('ai-broker-profile', profile, {
        compress: false, // Profile data is small, no need to compress
        validate: true,
        ttl: 365 * 24 * 60 * 60 * 1000 // 1 year for profile
    });
    setCompanyProfile(profile);
    if (profile.uiPreferences) {
        setUiPrefs(profile.uiPreferences);
    }
    alert("Profil ma'lumotlari saqlandi!");
    setView('dashboard');
  }
  
  const handleStartSourcing = useCallback(async (data: TenderData, platform: Platform) => {
    setError(null);
    setView('loadingSourcing');
    try {
        const result = await findSourcingOptions(data, platform);
        setSourcingResult(result);
        setTenderContext({ data, platform, text: result.tenderText });
        setView('sourcingSelection');
    } catch (err) {
        console.error("Sourcing failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Ta'minot manbalarini qidirishda noma'lum xatolik yuz berdi.";
        setError(errorMessage);
        setView('input');
    }
  }, []);

  const handleGenerateFinalReport = useCallback(async (selectedSources: SourcingRecommendation[]) => {
    if (!tenderContext) {
        setError("Tahlil konteksti yo'qoldi. Iltimos, qaytadan boshlang.");
        setView('input');
        return;
    }
    
    // Clear any previous errors
    setError(null);
    console.log('Starting final analysis with:', {
        selectedSources: selectedSources.length,
        platform: tenderContext.platform,
        hasContext: !!tenderContext.text
    });
    
    setView('loadingAnalysis');
    
    try {
        const result = await generateFinalAnalysis(
            tenderContext.text, 
            tenderContext.platform, 
            companyProfile, 
            allTenders, 
            selectedSources, 
            tenderContext.data
        );
        
        console.log('Final analysis completed successfully:', result);
        
        const newTender: AnalysisResult = {
            ...result,
            id: Date.now().toString(),
            analysisDate: new Date().toISOString(),
            status: 'Analyzed',
            platform: tenderContext.platform,
            isArchived: false,
            isWatched: false,
            analysisType: 'manual',
        };
        
        setActiveTender(newTender);
        persistTenders([...allTenders, newTender]);
        
        // Clear tender context and sourcing result after successful analysis
        setTenderContext(null);
        setSourcingResult(null);
        
        setView('results');
    } catch (err) {
        console.error("Final analysis failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Yakuniy tahlilni yaratishda xatolik yuz berdi.";
        console.error("Setting error message:", errorMessage);
        
        setError(errorMessage);
        
        // Go back to sourcing selection immediately to show error
        setView('sourcingSelection');
    }
  }, [tenderContext, companyProfile, allTenders]);
  
  const handleAnalyzeContractRequest = useCallback(async (files: File[]) => {
    setError(null);
    setView('loadingContract');
    try {
      const result = await analyzeContract(files);
      const newContractAnalysis: ContractAnalysisResult = {
        ...result,
        id: Date.now().toString(),
        fileName: files.map(f => f.name).join(', '),
        analysisDate: new Date().toISOString(),
      };
      persistContracts([...analyzedContracts, newContractAnalysis]);
      setActiveContract(newContractAnalysis);
      setView('contracts');
    } catch (err) {
      console.error("Contract analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Shartnomani tahlil qilishda noma'lum xatolik yuz berdi.";
      setError(errorMessage);
      setView('contracts');
    }
  }, [analyzedContracts]);


  const handleResetToDashboard = () => {
    console.log('Resetting to dashboard');
    setView('dashboard');
    setError(null);
    setSourcingResult(null);
    setTenderContext(null);
    setActiveTender(null);
    if(window.location.hash) window.location.hash = '';
  };
  
  const handleSelectTender = (tender: AnalysisResult) => {
      setActiveTender(tender);
      setView('results');
  }

  const handleSelectContract = (contract: ContractAnalysisResult) => {
      setActiveContract(contract);
      setView('contracts');
  }
  
  const handleDeleteTender = (tenderId: string) => {
      if (!confirm("Ushbu tahlilni o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.")) {
        return;
      }
      const updatedTenders = allTenders.filter(t => t.id !== tenderId);
      persistTenders(updatedTenders);
      if(activeTender?.id === tenderId) handleResetToDashboard();
  }
  
  const handleArchiveTender = (tenderId: string, archive: boolean) => {
    const updatedTenders = allTenders.map(t => t.id === tenderId ? {...t, isArchived: archive} : t);
    persistTenders(updatedTenders);
  };

  const handleToggleWatchlist = (tenderId: string) => {
    const updatedTenders = allTenders.map(t => t.id === tenderId ? {...t, isWatched: !t.isWatched} : t);
    persistTenders(updatedTenders);
  };

  const handleAssignAgent = (tenderId: string, agentId: string) => {
    const updatedTenders = allTenders.map(t =>
      t.id === tenderId ? { ...t, assignedAgentId: agentId } : t
    );
    persistTenders(updatedTenders);
    if (activeTender?.id === tenderId) {
      setActiveTender(prev => (prev ? { ...prev, assignedAgentId: agentId } : null));
    }
  };

  const handleUpdateStatus = (status: TenderStatus, winnerInfo: WinnerInfo) => {
    if (!activeTender) return;
    
    const updatedTenders = allTenders.map(t => t.id === activeTender.id ? {...t, status, winnerInfo} : t);
    persistTenders(updatedTenders);
    setActiveTender(prev => prev ? {...prev, status, winnerInfo} : null);
    setOutcomeToSet(null);
    alert("Ma'lumotlaringiz saqlandi, tahlillarimizni yaxshilashga yordam berganingiz uchun rahmat!");
  }

  const handleBulkAction = (tenderIds: string[], action: 'archive' | 'unarchive' | 'delete') => {
      let updatedTenders = [...allTenders];
      if (action === 'delete') {
          if(!confirm(`${tenderIds.length} ta tanlangan tahlilni o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`)) return;
          updatedTenders = allTenders.filter(t => !tenderIds.includes(t.id));
      } else {
          const toArchive = action === 'archive';
          updatedTenders = allTenders.map(t => tenderIds.includes(t.id) ? { ...t, isArchived: toArchive } : t);
      }
      persistTenders(updatedTenders);
  };
  
  const handleInsightAction = (actionView: InsightActionView) => {
      setView(actionView);
  }

  const handlePrefsChange = (prefs: UIPreferences) => {
      setUiPrefs(prefs);
      // Set language when preferences change
      if (prefs.language) {
        setLanguage(prefs.language);
      }
  }

  const renderContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard 
                  tenders={allTenders} 
                  insights={insights}
                  loadingInsights={loadingInsights}
                  visionaryInsight={visionaryInsight}
                  loadingVisionary={loadingVisionary}
                  companyProfile={companyProfile}
                  onSelect={handleSelectTender} 
                  onDelete={handleDeleteTender} 
                  onArchive={handleArchiveTender} 
                  onNew={() => setView('input')} 
                  onToggleWatchlist={handleToggleWatchlist} 
                  onBulkAction={handleBulkAction}
                  onInsightAction={handleInsightAction}
               />;
      case 'analytics':
        return <Analytics tenders={allTenders} companyProfile={companyProfile} onSelectTender={handleSelectTender} onShowCompetitors={() => setView('competitors')} />;
      case 'competitors':
        return <CompetitorsView tenders={allTenders} onBack={() => setView('analytics')} />;
       case 'profile':
        return <ProfileSettings profileData={companyProfile} onSave={persistProfile} onPrefsChange={handlePrefsChange} />;
       case 'contracts':
        return <ContractsView 
                  contracts={analyzedContracts} 
                  onAnalyze={handleAnalyzeContractRequest}
                  activeContract={activeContract}
                  setActiveContract={setActiveContract}
                  onDelete={(contractId) => {
                      const updated = analyzedContracts.filter(c => c.id !== contractId);
                      persistContracts(updated);
                      if (activeContract?.id === contractId) setActiveContract(null);
                  }}
               />;
      case 'loadingContract':
        return <LoadingIndicator stage={'contract'} />;
      case 'input':
        return <InputForm onStartAnalysis={handleStartSourcing} />;
      case 'loadingSourcing':
        return <LoadingIndicator stage={'sourcing'} />;
      case 'sourcingSelection':
        if (!sourcingResult) {
            console.error('sourcingSelection view without sourcingResult, redirecting to input');
            setView('input');
            return null;
        }
        return <SourcingSelection 
              sourcingResult={sourcingResult}
              onConfirm={handleGenerateFinalReport}
              onCancel={() => setView('input')}
              error={error}
            />;
      case 'loadingAnalysis':
        return <LoadingIndicator stage={'analysis'} />;
      case 'results':
        if (!activeTender) {
            handleResetToDashboard();
            return null;
        }
        const analysisContext: AnalysisContext | null = tenderContext?.text ? {
            originalTenderText: tenderContext.text,
            platform: activeTender.platform,
            analysisResult: activeTender
        } : { // Fallback context if navigating directly from dashboard
            originalTenderText: `Tender: ${activeTender.lotPassport?.itemName || 'N/A'}, Buyurtmachi: ${activeTender.lotPassport?.customerName || 'N/A'}`,
            platform: activeTender.platform,
            analysisResult: activeTender
        };
        return (
            <>
              {outcomeToSet && <TenderOutcomeForm preselectedOutcome={outcomeToSet} onSubmit={(status, details) => handleUpdateStatus(status, details)} onClose={() => setOutcomeToSet(null)} />}
              <AnalysisDashboard 
                result={activeTender} 
                allTenders={allTenders}
                companyProfile={companyProfile}
                onNavigate={(v) => setView(v)} 
                onSetOutcome={setOutcomeToSet}
                onAssignAgent={handleAssignAgent}
              />
              {analysisContext && <ChatInterface context={analysisContext} />}
            </>
          );
      case 'sharedReport':
          return sharedTender ? 
            <AnalysisDashboard result={sharedTender} allTenders={[]} companyProfile={null} onNavigate={handleResetToDashboard} onSetOutcome={() => {}} onAssignAgent={()=>{}} isReadOnly={true} /> : 
            <LoadingIndicator stage="sourcing" />;
      default:
        return <Dashboard tenders={allTenders} insights={insights} loadingInsights={loadingInsights} visionaryInsight={visionaryInsight} loadingVisionary={loadingVisionary} companyProfile={companyProfile} onSelect={handleSelectTender} onDelete={handleDeleteTender} onArchive={handleArchiveTender} onNew={() => setView('input')} onToggleWatchlist={handleToggleWatchlist} onBulkAction={handleBulkAction} onInsightAction={handleInsightAction}/>;
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      <Sidebar 
        onNavigate={(v) => setView(v)} 
        currentView={view} 
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        prefs={uiPrefs}
      />
      <div className="flex-1 flex flex-col transition-all duration-300" style={{ paddingLeft: isSidebarCollapsed ? '4rem' : '16rem' }}>
          <Header currentView={view} onNewAnalysis={() => setView('input')} />
          <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {autoAnalysisNotifications.length > 0 && view === 'dashboard' && (
                  <div className="bg-brand-secondary/20 border-l-4 border-brand-secondary text-purple-100 p-4 rounded-r-lg relative mb-6 animate-fade-in flex items-start shadow-soft" role="alert">
                    <div className="flex-shrink-0 pt-0.5"><BotIcon className="w-6 h-6 text-brand-secondary" /></div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Avtomatik Tahlil</p>
                        <p className="text-sm mt-1">{autoAnalysisNotifications.length} ta yangi tender sizning mezonlaringiz bo'yicha tahlil qilindi.</p>
                      </div>
                      <button onClick={() => setAutoAnalysisNotifications([])} className="mt-3 md:mt-0 md:ml-6 whitespace-nowrap font-semibold text-white/80 hover:text-white" aria-label="Yopish">
                        Yopish
                      </button>
                    </div>
                  </div>
              )}
              {error && (
                <div className="bg-status-danger/20 border-l-4 border-status-danger text-red-100 p-4 rounded-r-lg relative mb-6 animate-fade-in flex items-start shadow-soft" role="alert">
                  <div className="flex-shrink-0 pt-0.5"><ErrorIcon /></div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Xatolik yuz berdi</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="mt-3 md:mt-0 md:ml-6 whitespace-nowrap font-semibold text-white/80 hover:text-white" aria-label="Yopish">
                      Yopish
                    </button>
                  </div>
                </div>
              )}
              {renderContent()}
          </main>
          <footer className="w-full mt-auto py-5 px-8 border-t border-border bg-surface">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
              <div className="flex items-center gap-3">
                  <LogoIcon />
                  <div>
                      <p className="font-bold text-text-primary">AI-Broker | Tender Tahlili</p>
                      <p className="text-xs text-text-secondary">Intellekt va texnologiyaning strategik birlashmasi.</p>
                  </div>
              </div>
              <div className="text-xs text-text-secondary">
                <p>&copy; 2025 AI-Broker. Barcha huquqlar himoyalangan.</p>
                <p>Yaratuvchi: <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">CDCGroup</a> | Qo'llab-quvvatlash: <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="font-semibold text-red-400 hover:underline">CraDev</a></p>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default App;
