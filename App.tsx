import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult, CompanyProfile, ContractAnalysisResult, UIPreferences, InsightActionView, TenderData, Platform, SourcingResult, SourcingRecommendation } from './types';
import { analyzeContract, findSourcingOptions, generateFinalAnalysis } from './services/geminiService';
import { smartStorage } from './utils/smartStorage';
import { setLanguage } from './utils/translations';
import InputForm from './components/InputForm';
import LoadingIndicator from './components/LoadingIndicator';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import ProfileSettings from './components/ProfileSettings';
import CompetitorsView from './components/CompetitorsView';
import ContractsView from './components/ContractsView';
import { Sidebar, Header } from './components/Header';
import { ErrorIcon } from './components/Icons';
import { v4 as uuidv4 } from 'uuid';
import SourcingSelection from './components/SourcingSelection';
import AnalysisDashboard from './components/AnalysisDashboard';

export type AppView = 'dashboard' | 'input' | 'loadingSourcing' | 'sourcingSelection' | 'loadingAnalysis' | 'results' | 'analytics' | 'sharedReport' | 'profile' | 'competitors' | 'contracts' | 'loadingContract';

const defaultPrefs: UIPreferences = {
    theme: 'default',
    iconStyle: 'line',
    language: 'uz-latn'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [allTenders, setAllTenders] = useState<AnalysisResult[]>([]);
  const [activeTender, setActiveTender] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [analyzedContracts, setAnalyzedContracts] = useState<ContractAnalysisResult[]>([]);
  const [activeContract, setActiveContract] = useState<ContractAnalysisResult | null>(null);
  const [uiPrefs, setUiPrefs] = useState<UIPreferences>(defaultPrefs);
  const [sourcingResult, setSourcingResult] = useState<SourcingResult | null>(null);
  const [tenderContext, setTenderContext] = useState<{data: TenderData, platform: Platform, text: string} | null>(null);

  useEffect(() => {
    try {
      const storedTenders = smartStorage.getItem<AnalysisResult[]>('ai-broker-tenders');
      if (storedTenders) setAllTenders(storedTenders);
      
      const storedProfile = smartStorage.getItem<CompanyProfile>('ai-broker-profile');
      if (storedProfile) {
          setCompanyProfile(storedProfile);
          if (storedProfile.uiPreferences) {
            setUiPrefs(storedProfile.uiPreferences);
            if (storedProfile.uiPreferences.language) {
              setLanguage(storedProfile.uiPreferences.language);
            }
          }
      }

      const savedLanguage = localStorage.getItem('ai-broker-language') as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en' | null;
      if (savedLanguage && (!storedProfile || !storedProfile.uiPreferences || !storedProfile.uiPreferences.language)) {
        setLanguage(savedLanguage);
        setUiPrefs(prev => ({ ...prev, language: savedLanguage }));
      }

      const storedContracts = smartStorage.getItem<ContractAnalysisResult[]>('ai-broker-contracts');
      if (storedContracts) setAnalyzedContracts(storedContracts);

    } catch (e) {
      console.error("Failed to load data from storage:", e);
      smartStorage.clear();
    }
  }, []);
  
  const persistTenders = (tenders: AnalysisResult[]) => {
    smartStorage.setItem('ai-broker-tenders', tenders);
    setAllTenders(tenders);
  };
  
  const persistContracts = (contracts: ContractAnalysisResult[]) => {
    smartStorage.setItem('ai-broker-contracts', contracts);
    setAnalyzedContracts(contracts);
  };

  const persistProfile = (profile: CompanyProfile) => {
    smartStorage.setItem('ai-broker-profile', profile);
    setCompanyProfile(profile);
    if (profile.uiPreferences) setUiPrefs(profile.uiPreferences);
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
    setError(null);
    setView('loadingAnalysis');
    try {
        const result = await generateFinalAnalysis(tenderContext.text, tenderContext.platform, companyProfile, allTenders, selectedSources, tenderContext.data);
        const newTender: AnalysisResult = {
            ...result, id: uuidv4(), analysisDate: new Date().toISOString(), status: 'Analyzed', platform: tenderContext.platform, isArchived: false, isWatched: false, analysisType: 'manual',
        };
        setActiveTender(newTender);
        persistTenders([...allTenders, newTender]);
        setTenderContext(null);
        setSourcingResult(null);
        setView('results');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Yakuniy tahlilni yaratishda xatolik yuz berdi.";
        setError(errorMessage);
        setView('sourcingSelection');
    }
  }, [tenderContext, companyProfile, allTenders]);


  const handleAnalyzeContractRequest = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Fayl tanlanmadi. Iltimos, tahlil qilish uchun fayl tanlang.");
      return;
    }
    
    setError(null);
    setView('loadingContract');
    
    const newPendingContracts: ContractAnalysisResult[] = files.map(file => ({
      id: uuidv4(),
      contractTitle: file.name,
      fileName: file.name,
      analysisDate: new Date().toISOString(),
      status: 'pending',
      overallRecommendation: 'Muzokara talab etiladi',
      executiveSummary: 'Tahlil jarayonida...',
      riskAnalysis: [],
      keyObligations: [],
      penaltyClauses: [],
      forceMajeureClauses: [],
    }));

    setAnalyzedContracts(prev => [...newPendingContracts, ...prev.filter(c => c.status !== 'error')]);

    const analysisPromises = newPendingContracts.map(async (pendingContract) => {
        try {
            const file = files.find(f => f.name === pendingContract.fileName);
            if (!file) throw new Error("Asl fayl topilmadi.");
            
            const result = await analyzeContract([file]);
            return {
                ...pendingContract,
                ...result,
                status: 'analyzed' as const,
            };
        } catch (err) {
            console.error(`Failed to analyze file ${pendingContract.fileName}:`, err);
            return {
                ...pendingContract,
                status: 'error' as const,
                executiveSummary: `Tahlil qilishda xatolik: ${err instanceof Error ? err.message : 'Noma\'lum xatolik'}`,
            };
        }
    });

    const results = await Promise.all(analysisPromises);

    setAnalyzedContracts(prev => {
        const otherContracts = prev.filter(c => !newPendingContracts.some(p => p.id === c.id));
        const updatedContracts = [...results, ...otherContracts];
        persistContracts(updatedContracts);
        return updatedContracts;
    });

    setView('contracts');
  }, []);

  const handleDeleteContract = useCallback((contractId: string) => {
    if (window.confirm("Ushbu tahlilni o'chirishni tasdiqlaysizmi?")) {
        const updatedContracts = analyzedContracts.filter(c => c.id !== contractId);
        persistContracts(updatedContracts);
        if (activeContract?.id === contractId) setActiveContract(null);
    }
  }, [analyzedContracts, activeContract]);

  const handlePrefsChange = (newPrefs: UIPreferences) => {
    setUiPrefs(newPrefs);
    if (companyProfile) {
      const updatedProfile = { ...companyProfile, uiPreferences: newPrefs };
      persistProfile(updatedProfile);
    }
  };

  const handleDeleteTender = (tenderId: string) => {
    const updated = allTenders.filter(t => t.id !== tenderId);
    persistTenders(updated);
  };
  
  const handleArchiveTender = (tenderId: string, archive: boolean) => {
    const updated = allTenders.map(t => t.id === tenderId ? {...t, isArchived: archive} : t);
    persistTenders(updated);
  };

  const handleToggleWatchlist = (tenderId: string) => {
    const updated = allTenders.map(t => t.id === tenderId ? {...t, isWatched: !t.isWatched} : t);
    persistTenders(updated);
  };
  
  const handleBulkAction = (tenderIds: string[], action: 'archive' | 'unarchive' | 'delete') => {
    let updatedTenders = [...allTenders];
    if (action === 'delete') {
      updatedTenders = allTenders.filter(t => !tenderIds.includes(t.id));
    } else {
      updatedTenders = allTenders.map(t => 
        tenderIds.includes(t.id) 
          ? { ...t, isArchived: action === 'archive' } 
          : t
      );
    }
    persistTenders(updatedTenders);
  };
  
  const handleInsightAction = (actionView: InsightActionView) => {
      if (actionView.type === 'navigate') {
          setView(actionView.target);
      }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onNavigate={setView} currentView={view} isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} prefs={uiPrefs} onPrefsChange={handlePrefsChange} />
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        <Header currentView={view} onNewAnalysis={() => setView('input')} />
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex items-center"><ErrorIcon className="w-5 h-5 mr-2" /><span>{error}</span></div>
            </div>
          )}
          
          {view === 'dashboard' && <Dashboard tenders={allTenders} onSelect={(t) => { setActiveTender(t); setView('results'); }} onDelete={handleDeleteTender} onArchive={handleArchiveTender} onToggleWatchlist={handleToggleWatchlist} onNew={() => setView('input')} onBulkAction={handleBulkAction} onInsightAction={handleInsightAction} insights={[]} loadingInsights={false} visionaryInsight={null} loadingVisionary={false} companyProfile={companyProfile} />}
          {view === 'input' && <InputForm onSubmit={handleStartSourcing} companyProfile={companyProfile} />}
          {view === 'loadingSourcing' && <LoadingIndicator title={"Ta'minot Manbalari Qidirilmoqda"} description="AI dunyoning eng yaxshi yetkazib beruvchilarini qidirmoqda..." />}
          {view === 'sourcingSelection' && sourcingResult && <SourcingSelection sourcingResult={sourcingResult} onGenerateFinalReport={handleGenerateFinalReport} onCancel={() => setView('input')} />}
          {view === 'loadingAnalysis' && <LoadingIndicator title={"Tahlil Qilinmoqda"} description="AI yakuniy tahlil yaratmoqda..." />}
          {view === 'results' && activeTender && <AnalysisDashboard tender={activeTender} onResetToDashboard={() => setView('dashboard')} companyProfile={companyProfile} />}
          {view === 'analytics' && <Analytics tenders={allTenders} companyProfile={companyProfile} onShowCompetitors={() => setView('competitors')} onSelectTender={(t) => { setActiveTender(t); setView('results'); }} />}
          {view === 'profile' && <ProfileSettings profile={companyProfile} onSave={persistProfile} prefs={uiPrefs} onPrefsChange={handlePrefsChange} />}
          {view === 'competitors' && <CompetitorsView tenders={allTenders} />}
          
          {view === 'contracts' && (
            <ContractsView 
              contracts={analyzedContracts}
              onAnalyze={handleAnalyzeContractRequest}
              activeContract={activeContract}
              setActiveContract={setActiveContract}
              onDelete={handleDeleteContract}
            />
          )}
          
          {view === 'loadingContract' && <LoadingIndicator title={"Shartnoma Tahlil Qilinmoqda"} description="AI shartnomangizdagi yuridik risklarni va majburiyatlarni aniqlamoqda..." />}
        </main>
      </div>
    </div>
  );
};

export default App;