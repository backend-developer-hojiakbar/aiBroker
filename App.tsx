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
      const savedLanguage = localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
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

  const handleSetTenderOutcome = (tenderId: string, status: TenderStatus, winner?: WinnerInfo) => {
    const updatedTenders = allTenders.map(t => 
      t.id === tenderId ? { ...t, status, winner, completionDate: new Date().toISOString() } : t
    );
    persistTenders(updatedTenders);
    if (activeTender?.id === tenderId) {
      setActiveTender(prev => (prev ? { ...prev, status, winner, completionDate: new Date().toISOString() } : null));
    }
    setOutcomeToSet(null);
  };

  const handleViewSharedReport = (tender: AnalysisResult) => {
    setSharedTender(tender);
    setView('sharedReport');
  };

  const handleExportToExcel = (tenders: AnalysisResult[]) => {
    // This would be implemented with a proper Excel export library
    alert("Excelga eksport qilish funksiyasi hozircha mavjud emas.");
  };

  const handlePrefsChange = (newPrefs: UIPreferences) => {
    setUiPrefs(newPrefs);
    if (companyProfile) {
      const updatedProfile = { ...companyProfile, uiPreferences: newPrefs };
      persistProfile(updatedProfile);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        onNavigate={setView} 
        currentView={view} 
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        prefs={uiPrefs}
        onPrefsChange={handlePrefsChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        <Header currentView={view} onNewAnalysis={() => setView('input')} />
        <main className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex items-center">
                <ErrorIcon className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {view === 'dashboard' && (
            <Dashboard 
              tenders={allTenders} 
              onSelectTender={handleSelectTender}
              onArchiveTender={handleArchiveTender}
              onDeleteTender={handleDeleteTender}
              onToggleWatchlist={handleToggleWatchlist}
              onViewSharedReport={handleViewSharedReport}
              onExportToExcel={handleExportToExcel}
              insights={insights}
              loadingInsights={loadingInsights}
              visionaryInsight={visionaryInsight}
              loadingVisionary={loadingVisionary}
              prefs={uiPrefs}
            />
          )}
          
          {view === 'input' && (
            <InputForm 
              onSubmit={handleStartSourcing}
              companyProfile={companyProfile}
            />
          )}
          
          {view === 'loadingSourcing' && (
            <LoadingIndicator 
              title={t('loading-sourcing-title')}
              description="AI dunyoning eng yaxshi yetkazib beruvchilarini qidirmoqda..."
            />
          )}
          
          {view === 'sourcingSelection' && sourcingResult && (
            <SourcingSelection 
              sourcingResult={sourcingResult}
              onGenerateFinalReport={handleGenerateFinalReport}
              onCancel={() => setView('input')}
            />
          )}
          
          {view === 'loadingAnalysis' && (
            <LoadingIndicator 
              title={t('loading-analysis-title')}
              description="AI yakuniy tahlil yaratmoqda..."
            />
          )}
          
          {view === 'results' && activeTender && (
            <AnalysisDashboard 
              tender={activeTender}
              onResetToDashboard={handleResetToDashboard}
              onSetOutcome={(status) => setOutcomeToSet({id: activeTender.id, status})}
              companyProfile={companyProfile}
            />
          )}
          
          {view === 'analytics' && (
            <Analytics 
              tenders={allTenders}
              onSelectTender={handleSelectTender}
              prefs={uiPrefs}
            />
          )}
          
          {view === 'sharedReport' && sharedTender && (
            <AnalysisDashboard 
              tender={sharedTender}
              onResetToDashboard={handleResetToDashboard}
              isSharedView={true}
            />
          )}
          
          {view === 'profile' && (
            <ProfileSettings 
              profile={companyProfile}
              onSave={persistProfile}
              prefs={uiPrefs}
              onPrefsChange={handlePrefsChange}
            />
          )}
          
          {view === 'competitors' && (
            <CompetitorsView 
              tenders={allTenders}
              prefs={uiPrefs}
            />
          )}
          
          {view === 'contracts' && (
            <ContractsView 
              contracts={analyzedContracts}
              activeContract={activeContract}
              onSelectContract={handleSelectContract}
              onDeleteContract={(id) => {
                const updatedContracts = analyzedContracts.filter(c => c.id !== id);
                persistContracts(updatedContracts);
                if (activeContract?.id === id) setActiveContract(null);
              }}
              onAnalyzeContract={handleAnalyzeContractRequest}
              prefs={uiPrefs}
            />
          )}
          
          {view === 'loadingContract' && (
            <LoadingIndicator 
              title={t('loading-contract-title')}
              description="AI shartnoma tahlil qilmoqda..."
            />
          )}
          
          {outcomeToSet && (
            <TenderOutcomeForm 
              tenderId={outcomeToSet.id}
              currentStatus={outcomeToSet.status}
              onSubmit={handleSetTenderOutcome}
              onCancel={() => setOutcomeToSet(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;