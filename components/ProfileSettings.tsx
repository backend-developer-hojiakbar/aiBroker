
import React, { useState, useEffect, useMemo } from 'react';
import type { CompanyProfile, UIPreferences, AutomationSettings, SalesAgent } from '../types';
import { InfoTooltip } from './Card';
import { BotIcon, UsersIcon, XIcon, PlusIcon, PencilIcon, TrashIcon, TrendIcon, AlertIcon, CheckIcon, EyeIcon, SparklesIcon, TargetIcon, BarChart3, ShieldCheckIcon, BookmarkIcon, SearchIcon } from './Icons';

interface ProfileAnalytics {
    completionScore: number;
    recommendedActions: string[];
    marketPositioning: 'competitive' | 'conservative' | 'aggressive';
    riskProfile: 'low' | 'medium' | 'high';
    optimizationSuggestions: {
        category: string;
        suggestion: string;
        impact: 'high' | 'medium' | 'low';
        priority: number;
    }[];
    benchmarkData: {
        overheadPercentage: { industry: number; percentile: number };
        vatOptimization: { potential: number; recommendations: string[] };
        automationEfficiency: number;
    };
}

interface ConfigurationTab {
    id: 'company' | 'agents' | 'automation' | 'ui' | 'analytics' | 'optimization';
    label: string;
    icon: string;
    badge?: string;
}

interface ProfileSettingsProps {
    profileData: CompanyProfile | null;
    onSave: (profile: CompanyProfile) => void;
    onPrefsChange: (prefs: UIPreferences) => void;
}

const defaultAutomationSettings: AutomationSettings = {
    isEnabled: false,
    keywords: '',
    region: '',
    industry: '',
    scanIntervalMinutes: 60,
};

const defaultProfile: CompanyProfile = {
    companyName: '',
    overheadPercentage: 0,
    vatRate: 12,
    bankGuaranteeFee: 1,
    preferredSuppliers: '',
    salesAgents: [],
    uiPreferences: {
        theme: 'default',
        iconStyle: 'line',
    },
    automationSettings: defaultAutomationSettings,
};

const themes: { id: UIPreferences['theme']; name: string; colors: string[] }[] = [
    { id: 'default', name: 'AI-Broker (Standart)', colors: ['bg-surface', 'bg-brand-primary', 'bg-brand-secondary'] },
    { id: 'corporate', name: 'Korporativ', colors: ['bg-corporate-bg', 'bg-corporate-primary', 'bg-corporate-hover'] },
    { id: 'cosmos', name: 'Koinot', colors: ['bg-cosmos-bg', 'bg-cosmos-primary', 'bg-cosmos-hover'] },
    { id: 'energy', name: 'Energiya', colors: ['bg-energy-bg', 'bg-energy-primary', 'bg-energy-hover'] },
];

const iconStyles: { id: UIPreferences['iconStyle']; name: string; }[] = [
    { id: 'line', name: 'Chiziqli' },
    { id: 'bold', name: 'Qalin' }
];

const scanIntervals: { value: number; label: string }[] = [
    { value: 30, label: 'Har 30 daqiqa' },
    { value: 60, label: 'Har 1 soat' },
    { value: 240, label: 'Har 4 soat' },
    { value: 1440, label: 'Har 24 soat' },
];

const regions: string[] = [
    "Toshkent shahri", "Toshkent viloyati", "Andijon viloyati", "Buxoro viloyati",
    "Farg'ona viloyati", "Jizzax viloyati", "Xorazm viloyati", "Namangan viloyati",
    "Navoiy viloyati", "Qashqadaryo viloyati", "Samarqand viloyati", "Sirdaryo viloyati",
    "Surxondaryo viloyati", "Qoraqalpog'iston Respublikasi"
];

const industries: string[] = [
    "Qurilish va ta'mirlash", "IT va telekommunikatsiya", "Tibbiyot va farmatsevtika",
    "Ta'lim", "Transport va logistika", "Ishlab chiqarish", "Qishloq xo'jaligi",
    "Energetika", "Konsalting xizmatlari", "Boshqalar"
];

const AgentFormModal: React.FC<{
    agent: SalesAgent | null;
    onSave: (agent: SalesAgent) => void;
    onClose: () => void;
}> = ({ agent, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<SalesAgent, 'id'>>({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (agent) {
            setFormData({ name: agent.name, email: agent.email, phone: agent.phone });
        } else {
            setFormData({ name: '', email: '', phone: '' });
        }
        setValidationErrors({});
    }, [agent]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.name.trim()) errors.name = 'Ism majburiy';
        if (!formData.email.trim()) errors.email = 'Email majburiy';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Noto\'g\'ri email formati';
        if (!formData.phone.trim()) errors.phone = 'Telefon majburiy';
        else if (!/^[+]?[0-9\s\-()]{10,}$/.test(formData.phone)) errors.phone = 'Noto\'g\'ri telefon formati';
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            onSave({
                id: agent?.id || Date.now().toString(),
                ...formData
            });
            onClose();
        } catch (error) {
            console.error('Error saving agent:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl border border-brand-primary/30 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center gap-3">
                        <UsersIcon />
                        {agent ? "Agentni Tahrirlash" : "Yangi Agent Qo'shish"}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-text-secondary hover:text-text-primary transition-all duration-300 hover:scale-110"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="agentName" className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                Ism
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    id="agentName" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className={`w-full p-3 border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all duration-300 ${
                                        validationErrors.name ? 'border-status-danger' : 'border-border hover:border-brand-primary/50'
                                    }`}
                                    placeholder="Agent ismi"
                                />
                                {validationErrors.name && (
                                    <div className="absolute -bottom-6 left-0 text-status-danger text-xs flex items-center gap-1">
                                        <AlertIcon className="w-3 h-3" />
                                        {validationErrors.name}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="agentEmail" className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                Email
                            </label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    id="agentEmail" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className={`w-full p-3 border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all duration-300 ${
                                        validationErrors.email ? 'border-status-danger' : 'border-border hover:border-brand-primary/50'
                                    }`}
                                    placeholder="agent@company.com"
                                />
                                {validationErrors.email && (
                                    <div className="absolute -bottom-6 left-0 text-status-danger text-xs flex items-center gap-1">
                                        <AlertIcon className="w-3 h-3" />
                                        {validationErrors.email}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="agentPhone" className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                Telefon
                            </label>
                            <div className="relative">
                                <input 
                                    type="tel" 
                                    id="agentPhone" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    className={`w-full p-3 border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all duration-300 ${
                                        validationErrors.phone ? 'border-status-danger' : 'border-border hover:border-brand-primary/50'
                                    }`}
                                    placeholder="+998 XX XXX XX XX"
                                />
                                {validationErrors.phone && (
                                    <div className="absolute -bottom-6 left-0 text-status-danger text-xs flex items-center gap-1">
                                        <AlertIcon className="w-3 h-3" />
                                        {validationErrors.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-black/40 text-text-secondary font-semibold rounded-xl hover:bg-black/60 hover:text-text-primary transition-all duration-300"
                        >
                            Bekor qilish
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saqlanmoqda...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-4 h-4" />
                                    Saqlash
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profileData, onSave, onPrefsChange }) => {
    const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
    const [activeTab, setActiveTab] = useState<ConfigurationTab['id']>('company');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [bookmarkedSettings, setBookmarkedSettings] = useState<Set<string>>(new Set());

    // Load bookmarks from localStorage
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('profile-bookmarks');
        if (savedBookmarks) {
            setBookmarkedSettings(new Set(JSON.parse(savedBookmarks)));
        }
    }, []);

    // Toggle bookmark functionality
    const toggleBookmark = (settingId: string) => {
        const newBookmarks = new Set(bookmarkedSettings);
        if (newBookmarks.has(settingId)) {
            newBookmarks.delete(settingId);
        } else {
            newBookmarks.add(settingId);
        }
        setBookmarkedSettings(newBookmarks);
        smartStorage.setItem('profile-bookmarks', [...newBookmarks], {
            compress: false,
            validate: true,
            ttl: 365 * 24 * 60 * 60 * 1000 // 1 year
        });
    };

    // Enhanced analytics calculation
    const profileAnalytics = useMemo((): ProfileAnalytics => {
        const completionItems = [
            { key: 'companyName', weight: 20, completed: !!profile.companyName },
            { key: 'overheadPercentage', weight: 15, completed: profile.overheadPercentage > 0 },
            { key: 'vatRate', weight: 10, completed: profile.vatRate > 0 },
            { key: 'bankGuaranteeFee', weight: 10, completed: profile.bankGuaranteeFee > 0 },
            { key: 'salesAgents', weight: 15, completed: (profile.salesAgents || []).length > 0 },
            { key: 'automationEnabled', weight: 15, completed: profile.automationSettings?.isEnabled || false },
            { key: 'preferences', weight: 15, completed: !!profile.uiPreferences?.theme }
        ];
        
        const completionScore = Math.round(
            completionItems.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0)
        );

        const recommendedActions = [];
        if (!profile.companyName) recommendedActions.push('Kompaniya nomini kiriting');
        if (profile.overheadPercentage === 0) recommendedActions.push('Umumiy xarajatlar foizini belgilang');
        if ((profile.salesAgents || []).length === 0) recommendedActions.push('Savdo agentlarini qo\'shing');
        if (!profile.automationSettings?.isEnabled) recommendedActions.push('Avtomatlashtirish sozlamalarini yoqing');
        if (!profile.preferredSuppliers) recommendedActions.push('Ta\'minotchilar ro\'yxatini yarating');

        const marketPositioning: ProfileAnalytics['marketPositioning'] = 
            profile.overheadPercentage > 25 ? 'conservative' :
            profile.overheadPercentage > 15 ? 'competitive' : 'aggressive';

        const riskProfile: ProfileAnalytics['riskProfile'] = 
            profile.bankGuaranteeFee > 2 ? 'high' :
            profile.bankGuaranteeFee > 1 ? 'medium' : 'low';

        const optimizationSuggestions = [
            {
                category: 'Moliyaviy',
                suggestion: 'QQS stavkasini optimallashtirishni ko\'rib chiqing',
                impact: 'high' as const,
                priority: 1
            },
            {
                category: 'Jarayon',
                suggestion: 'Avtomatlashtirish parametrlarini sozlang',
                impact: 'medium' as const,
                priority: 2
            },
            {
                category: 'Jamoa',
                suggestion: 'Agentlar uchun rol va mas\'uliyatlarni aniqlang',
                impact: 'medium' as const,
                priority: 3
            }
        ];

        return {
            completionScore,
            recommendedActions,
            marketPositioning,
            riskProfile,
            optimizationSuggestions,
            benchmarkData: {
                overheadPercentage: {
                    industry: 18.5,
                    percentile: profile.overheadPercentage > 18.5 ? 75 : 25
                },
                vatOptimization: {
                    potential: profile.vatRate > 12 ? 5.2 : 0,
                    recommendations: ['Eksport operatsiyalarini ko\'rib chiqing', 'QQS imtiyozlarini o\'rganing']
                },
                automationEfficiency: profile.automationSettings?.isEnabled ? 85 : 0
            }
        };
    }, [profile]);

    // Configuration tabs with enhanced badges
    const configurationTabs: ConfigurationTab[] = [
        { 
            id: 'company', 
            label: 'Kompaniya', 
            icon: '🏢',
            badge: !profile.companyName ? 'Talab' : undefined
        },
        { 
            id: 'agents', 
            label: 'Agentlar', 
            icon: '👥',
            badge: (profile.salesAgents || []).length.toString()
        },
        { 
            id: 'automation', 
            label: 'Avtomatizatsiya', 
            icon: '🤖',
            badge: profile.automationSettings?.isEnabled ? 'Faol' : 'O\'chiq'
        },
        { 
            id: 'ui', 
            label: 'Interfeys', 
            icon: '🎨' 
        },
        { 
            id: 'analytics', 
            label: 'Tahlil', 
            icon: '📊',
            badge: `${profileAnalytics.completionScore}%`
        },
        { 
            id: 'optimization', 
            label: 'Optimallashtirish', 
            icon: '⚡',
            badge: profileAnalytics.optimizationSuggestions.length.toString()
        }
    ];

    useEffect(() => {
        if (profileData) {
            setProfile({
                ...defaultProfile,
                ...profileData,
                uiPreferences: { ...defaultProfile.uiPreferences!, ...profileData.uiPreferences },
                automationSettings: { ...defaultProfile.automationSettings!, ...profileData.automationSettings },
            });
        }
    }, [profileData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name !== 'companyName' && name !== 'preferredSuppliers' ? parseFloat(value) || 0 : value,
        }));
    };
    
    const handlePrefsChange = <K extends keyof UIPreferences>(key: K, value: UIPreferences[K]) => {
        const newPrefs: UIPreferences = {
            ...(profile.uiPreferences || defaultProfile.uiPreferences!),
            [key]: value
        };
        setProfile(prev => ({ ...prev, uiPreferences: newPrefs }));
        onPrefsChange(newPrefs);
    };
    
    const handleAutomationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';

        setProfile(prev => ({
            ...prev,
            automationSettings: {
                ...(prev.automationSettings || defaultAutomationSettings),
                [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (name === 'scanIntervalMinutes' ? parseInt(value, 10) : value),
            }
        }));
    };
    
    const handleSaveAgent = (agent: SalesAgent) => {
        setProfile(prev => {
            const agents = prev.salesAgents || [];
            const existingIndex = agents.findIndex(a => a.id === agent.id);
            if (existingIndex > -1) {
                const updatedAgents = [...agents];
                updatedAgents[existingIndex] = agent;
                return { ...prev, salesAgents: updatedAgents };
            } else {
                return { ...prev, salesAgents: [...agents, agent] };
            }
        });
    };

    const handleDeleteAgent = (agentId: string) => {
        if (confirm("Ushbu agentni o'chirmoqchimisiz?")) {
            setProfile(prev => ({
                ...prev,
                salesAgents: (prev.salesAgents || []).filter(a => a.id !== agentId)
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile);
    };
    
    const currentPrefs = profile.uiPreferences || defaultProfile.uiPreferences!;
    const currentAutomationPrefs = profile.automationSettings || defaultAutomationSettings;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {isAgentModalOpen && (
                <AgentFormModal 
                    agent={editingAgent} 
                    onClose={() => {
                        setIsAgentModalOpen(false);
                        setEditingAgent(null);
                    }} 
                    onSave={handleSaveAgent} 
                />
            )}
            
            {/* Elite Header Section */}
            <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl border border-brand-primary/30 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-3 flex items-center gap-4">
                            <span className="text-5xl">🏢</span>
                            Kompaniya Profili
                        </h1>
                        <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                            AI-powered tender analysis uchun kompaniyangizni sozlang. Bu sozlamalar tahlillarning aniqligi va moliyaviy hisob-kitoblarning to'g'riligini ta'minlaydi.
                        </p>
                    </div>
                    
                    {/* Completion Score Display */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="text-center lg:text-right">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                                {profileAnalytics.completionScore}%
                            </div>
                            <div className="text-sm text-text-secondary">To'liqlik darajasi</div>
                        </div>
                        
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-border"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-brand-primary"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                    strokeDasharray={`${profileAnalytics.completionScore}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CheckIcon className="w-6 h-6 text-brand-primary" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Bar */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <button 
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/40 rounded-xl border border-border/50 hover:border-brand-primary/50 transition-all duration-300 text-text-secondary hover:text-text-primary"
                    >
                        <BarChart3 strokeWidth={2} />
                        <span className="text-sm font-medium">Analitika</span>
                    </button>
                    
                    <button 
                        onClick={() => toggleBookmark('profile-settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                            bookmarkedSettings.has('profile-settings')
                                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                                : 'bg-black/20 hover:bg-black/40 border-border/50 hover:border-brand-primary/50 text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <BookmarkIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Bookmark</span>
                    </button>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl border border-border/50">
                        <SearchIcon className="w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Sozlamalar qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none w-40"
                        />
                    </div>
                </div>
            </div>
            
            {/* Analytics Dashboard - Collapsible */}
            {showAnalytics && (
                <div className="bg-gradient-to-r from-black/30 to-black/10 p-6 rounded-3xl border border-border/50 animate-slide-down">
                    <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        Kompaniya Analitikasi
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-status-success/20 to-status-success/5 p-4 rounded-xl border border-status-success/30">
                            <div className="text-2xl font-bold text-status-success">{profileAnalytics.completionScore}%</div>
                            <div className="text-sm text-status-success/80">Profil To'liqligi</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 p-4 rounded-xl border border-brand-primary/30">
                            <div className="text-2xl font-bold text-brand-primary capitalize">{profileAnalytics.marketPositioning}</div>
                            <div className="text-sm text-brand-primary/80">Bozor Pozitsiyasi</div>
                        </div>
                        
                        <div className={`p-4 rounded-xl border ${
                            profileAnalytics.riskProfile === 'low' ? 'bg-gradient-to-br from-status-success/20 to-status-success/5 border-status-success/30' :
                            profileAnalytics.riskProfile === 'medium' ? 'bg-gradient-to-br from-status-warning/20 to-status-warning/5 border-status-warning/30' :
                            'bg-gradient-to-br from-status-danger/20 to-status-danger/5 border-status-danger/30'
                        }`}>
                            <div className={`text-2xl font-bold capitalize ${
                                profileAnalytics.riskProfile === 'low' ? 'text-status-success' :
                                profileAnalytics.riskProfile === 'medium' ? 'text-status-warning' :
                                'text-status-danger'
                            }`}>
                                {profileAnalytics.riskProfile}
                            </div>
                            <div className={`text-sm ${
                                profileAnalytics.riskProfile === 'low' ? 'text-status-success/80' :
                                profileAnalytics.riskProfile === 'medium' ? 'text-status-warning/80' :
                                'text-status-danger/80'
                            }`}>
                                Risk Profili
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/5 p-4 rounded-xl border border-brand-secondary/30">
                            <div className="text-2xl font-bold text-brand-secondary">{profileAnalytics.benchmarkData.automationEfficiency}%</div>
                            <div className="text-sm text-brand-secondary/80">Avtomatizatsiya</div>
                        </div>
                    </div>
                    
                    {/* Recommendations Section */}
                    {profileAnalytics.recommendedActions.length > 0 && (
                        <div className="bg-black/20 p-6 rounded-xl border border-border/50">
                            <h4 className="font-bold text-text-primary mb-4 flex items-center gap-3">
                                <SparklesIcon />
                                Tavsiyalar
                            </h4>
                            <div className="space-y-2">
                                {profileAnalytics.recommendedActions.map((action, index) => (
                                    <div key={index} className="flex items-center gap-3 text-text-secondary">
                                        <TargetIcon />
                                        <span>{action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Enhanced Tabbed Interface */}
            <div className="bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl border border-brand-primary/30 rounded-3xl shadow-2xl overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-border/50 bg-black/20">
                    <div className="flex overflow-x-auto">
                        {configurationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-6 py-4 border-b-2 transition-all duration-300 flex items-center gap-3 font-semibold ${
                                    activeTab === tab.id
                                        ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                                        : 'border-transparent text-text-secondary hover:text-text-primary hover:border-brand-primary/50 hover:bg-white/5'
                                }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        activeTab === tab.id
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-black/40 text-text-secondary'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Tab Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {activeTab === 'company' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🏢</span>
                                    Kompaniya Ma'lumotlari
                                </h3>
                <div>
                    <label htmlFor="companyName" className="block text-sm font-bold text-text-primary mb-1">Kompaniya Nomi</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleChange}
                        className="w-full p-3 border border-border rounded-lg bg-black/20 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        placeholder="Masalan, 'Tadbirkor MChJ'"
                    />
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="overheadPercentage" className="flex items-center text-sm font-bold text-text-primary mb-1">
                            Umumiy Xarajatlar Foizi (%)
                            <InfoTooltip text="Bu foiz sizning operatsion xarajatlaringizni (ofis ijarasi, ish haqi va h.k.) qoplash uchun har bir tender tannarxiga qo'shiladi. To'g'ri kiritilishi foyda hisob-kitobining aniqligi uchun muhim." />
                        </label>
                        <input
                            type="number"
                            id="overheadPercentage"
                            name="overheadPercentage"
                            value={profile.overheadPercentage}
                            onChange={handleChange}
                            className="w-full p-3 border border-border rounded-lg bg-black/20 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        />
                        <p className="text-xs text-text-secondary mt-1">Loyiha tannarxiga qo'shiladigan operatsion xarajatlar (ofis, ish haqi va hk).</p>
                    </div>
                    <div>
                        <label htmlFor="vatRate" className="flex items-center text-sm font-bold text-text-primary mb-1">
                            QQS Foizi (%)
                            <InfoTooltip text="O'zbekiston Respublikasi Soliq Kodeksiga muvofiq sizning kompaniyangiz uchun amaldagi Qo'shilgan qiymat solig'i (QQS) stavkasi." />
                        </label>
                        <input
                            type="number"
                            id="vatRate"
                            name="vatRate"
                            value={profile.vatRate}
                            onChange={handleChange}
                            className="w-full p-3 border border-border rounded-lg bg-black/20 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        />
                        <p className="text-xs text-text-secondary mt-1">Sizning kompaniyangiz uchun amaldagi QQS stavkasi.</p>
                    </div>
                    <div>
                        <label htmlFor="bankGuaranteeFee" className="flex items-center text-sm font-bold text-text-primary mb-1">
                            Bank Kafolati Foizi (%)
                            <InfoTooltip text="Tenderda ishtirok etish uchun bank kafolatini olishga sarflanadigan, tenderning boshlang'ich narxiga nisbatan o'rtacha foiz." />
                        </label>
                        <input
                            type="number"
                            id="bankGuaranteeFee"
                            name="bankGuaranteeFee"
                            value={profile.bankGuaranteeFee}
                            onChange={handleChange}
                            className="w-full p-3 border border-border rounded-lg bg-black/20 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        />
                         <p className="text-xs text-text-secondary mt-1">Bank kafolatini olish uchun o'rtacha to'lov foizi.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="preferredSuppliers" className="flex items-center text-sm font-bold text-text-primary mb-1">
                        Afzal Ta'minotchilar
                         <InfoTooltip text="AI ushbu ro'yxatdan manba qidirishda kontekst sifatida foydalanadi, ammo har doim eng yaxshi narxni topish uchun boshqa variantlarni ham ko'rib chiqadi." />
                    </label>
                    <textarea
                        id="preferredSuppliers"
                        name="preferredSuppliers"
                        value={profile.preferredSuppliers}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 border border-border rounded-lg bg-black/20 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        placeholder="Doimiy ishlaydigan ta'minotchilaringiz ro'yxati (AI uchun qo'shimcha kontekst)"
                    />
                </div>

                            </div>
                        )}

                        {activeTab === 'agents' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                                    <span className="text-3xl">👥</span>
                                    Savdo Agentlari
                                </h3>
                                <div className="grid gap-4">
                                    {(profile.salesAgents || []).length > 0 ? (
                                        profile.salesAgents?.map(agent => (
                                            <div key={agent.id} className="p-6 bg-gradient-to-r from-black/30 to-black/10 rounded-xl border border-border/50 hover:border-brand-primary/50 transition-all duration-300">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-text-primary text-lg">{agent.name}</h4>
                                                        <p className="text-sm text-text-secondary">{agent.email} • {agent.phone}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => { setEditingAgent(agent); setIsAgentModalOpen(true); }} className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-text-secondary hover:text-brand-primary transition-all duration-300"><PencilIcon /></button>
                                                        <button type="button" onClick={() => handleDeleteAgent(agent.id)} className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-text-secondary hover:text-status-danger transition-all duration-300"><TrashIcon /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">👤</div>
                                            <h4 className="text-xl font-bold text-text-primary mb-2">Agentlar Yo'q</h4>
                                            <p className="text-text-secondary">Agentlar qo'shish tahlillarni mas'ul shaxslarga biriktirish imkonini beradi.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'automation' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                                    <span className="text-3xl">🤖</span>
                                    Avtomatlashtirish
                                </h3>
                                {currentAutomationPrefs.isEnabled && (
                                    <div className="space-y-6 p-6 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl border border-brand-primary/30 animate-fade-in">
                                        <div>
                                            <label htmlFor="keywords" className="block text-sm font-bold text-text-primary mb-3">Kalit So'zlar</label>
                                            <input type="text" id="keywords" name="keywords" value={currentAutomationPrefs.keywords} onChange={handleAutomationChange} className="w-full p-4 border border-border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Masalan: transformator, qurilish, kompyuter" />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="region" className="block text-sm font-bold text-text-primary mb-3">Hudud</label>
                                                <select id="region" name="region" value={currentAutomationPrefs.region} onChange={handleAutomationChange} className="w-full p-4 border border-border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                                    <option value="">Barchasi</option>
                                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="industry" className="block text-sm font-bold text-text-primary mb-3">Soha</label>
                                                <select id="industry" name="industry" value={currentAutomationPrefs.industry} onChange={handleAutomationChange} className="w-full p-4 border border-border rounded-xl bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                                    <option value="">Barchasi</option>
                                                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ui' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🎨</span>
                                    Interfeys Sozlamalari
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-4">Mavzu</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {themes.map(theme => (
                                                <button type="button" key={theme.id} onClick={() => handlePrefsChange('theme', theme.id)} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${currentPrefs.theme === theme.id ? 'border-brand-primary bg-brand-primary/10 shadow-lg' : 'border-border hover:border-brand-primary/50 bg-black/20'}`}>
                                                    <div className="flex gap-2 mb-3">
                                                        {theme.colors.map((color, i) => (<div key={i} className={`w-full h-8 rounded ${color}`}></div>))}
                                                    </div>
                                                    <p className="text-sm font-semibold text-text-primary">{theme.name}</p>
                                                    {currentPrefs.theme === theme.id && (<div className="mt-2 flex justify-center"><CheckIcon className="w-5 h-5 text-brand-primary" /></div>)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-4">Ikonka Stili</h4>
                                        <div className="flex gap-4">
                                            {iconStyles.map(style => (
                                                <button type="button" key={style.id} onClick={() => handlePrefsChange('iconStyle', style.id)} className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${currentPrefs.iconStyle === style.id ? 'bg-gradient-to-r from-brand-primary to-brand-secondary border-brand-primary text-white shadow-lg' : 'bg-black/20 border-border text-text-secondary hover:border-brand-primary/50 hover:text-text-primary'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold">{style.name}</span>
                                                        {currentPrefs.iconStyle === style.id && (<CheckIcon className="w-4 h-4" />)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                    <span className="text-3xl">📊</span>
                                    Detallashtirilgan Analitika
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-status-success/20 to-status-success/5 p-6 rounded-xl border border-status-success/30">
                                        <h4 className="font-bold text-status-success mb-4 flex items-center gap-3"><CheckIcon className="w-6 h-6" />Profil To'liqligi</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-3xl font-bold text-status-success">{profileAnalytics.completionScore}%</span>
                                                <div className="text-sm text-status-success/80">{profileAnalytics.completionScore >= 80 ? 'Mukammal' : profileAnalytics.completionScore >= 60 ? 'Yaxshi' : profileAnalytics.completionScore >= 40 ? 'O\'rta' : 'Boshlang\'ich'}</div>
                                            </div>
                                            <div className="w-full bg-black/20 rounded-full h-3"><div className="bg-gradient-to-r from-status-success to-status-success/80 h-3 rounded-full transition-all duration-1000" style={{ width: `${profileAnalytics.completionScore}%` }}></div></div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 p-6 rounded-xl border border-brand-primary/30">
                                        <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-3"><TargetIcon />Bozor Pozitsiyasi</h4>
                                        <div className="space-y-4">
                                            <div className="text-2xl font-bold text-brand-primary capitalize">{profileAnalytics.marketPositioning}</div>
                                            <div className="text-sm text-brand-primary/80">{profileAnalytics.marketPositioning === 'aggressive' && 'Agressiv narx strategiyasi'}{profileAnalytics.marketPositioning === 'competitive' && 'Raqobatbardosh pozitsiya'}{profileAnalytics.marketPositioning === 'conservative' && 'Konservativ yondashuv'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'optimization' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                    <span className="text-3xl">⚡</span>
                                    Optimallashtirish Takliflari
                                </h3>
                                {profileAnalytics.optimizationSuggestions.length > 0 ? (
                                    <div className="space-y-4">
                                        {profileAnalytics.optimizationSuggestions.map((suggestion, index) => (
                                            <div key={index} className={`p-6 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg ${suggestion.impact === 'high' ? 'bg-gradient-to-r from-status-danger/20 to-status-danger/5 border-status-danger' : suggestion.impact === 'medium' ? 'bg-gradient-to-r from-status-warning/20 to-status-warning/5 border-status-warning' : 'bg-gradient-to-r from-status-success/20 to-status-success/5 border-status-success'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="font-bold text-text-primary text-lg">{suggestion.category}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${suggestion.impact === 'high' ? 'bg-status-danger text-white' : suggestion.impact === 'medium' ? 'bg-status-warning text-white' : 'bg-status-success text-white'}`}>{suggestion.impact === 'high' ? 'Yuqori' : suggestion.impact === 'medium' ? 'O\'rta' : 'Past'} Ta'sir</span>
                                                </div>
                                                <p className="text-text-secondary mb-4">{suggestion.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">✨</div>
                                        <h4 className="text-xl font-bold text-text-primary mb-2">Barcha Sozlamalar Optimal</h4>
                                        <p className="text-text-secondary max-w-md mx-auto">Sizning profilingiz to'liq va optimal tarzda sozlangan.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-border/50 text-center">
                            <button type="submit" className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 px-12 text-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/50 flex items-center gap-3 mx-auto">
                                <CheckIcon className="w-6 h-6" />
                                Sozlamalarni Saqlash
                                <SparklesIcon />
                            </button>
                            <p className="text-sm text-text-secondary mt-3">Barcha o'zgarishlar darhol AI tahlillariga ta'sir qiladi</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// FIX: Add default export for the ProfileSettings component.
export default ProfileSettings;
