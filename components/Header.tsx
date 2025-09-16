import React, { useState, useEffect } from 'react';
import { AppView } from '../App';
import { LogoIcon, PlusIcon, LayoutDashboard, TelescopeIcon, BarChart3, FileText, Lightbulb, Settings, ChevronsLeftRight, BotIcon, CalendarIcon } from './Icons';
import { UIPreferences } from '../types';
import { t, getCurrentLanguage, setLanguage } from '../utils/translations';

interface SidebarProps {
    onNavigate: (view: AppView) => void;
    currentView: string;
    isCollapsed: boolean;
    setCollapsed: (isCollapsed: boolean) => void;
    prefs: UIPreferences;
    onPrefsChange: (prefs: UIPreferences) => void;
}

const themeClasses = {
    default: {
        bg: 'bg-surface',
        active: 'bg-brand-primary/10 text-brand-primary',
        hover: 'hover:bg-surface-light'
    },
    corporate: {
        bg: 'bg-corporate-bg',
        active: 'bg-corporate-primary/20 text-corporate-primary',
        hover: 'hover:bg-corporate-hover'
    },
    cosmos: {
        bg: 'bg-cosmos-bg',
        active: 'bg-cosmos-primary/20 text-cosmos-primary',
        hover: 'hover:bg-cosmos-hover'
    },
    energy: {
        bg: 'bg-energy-bg',
        active: 'bg-energy-primary/20 text-energy-primary',
        hover: 'hover:bg-energy-hover'
    },
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, isCollapsed, setCollapsed, prefs, onPrefsChange }) => {
    const currentTheme = themeClasses[prefs.theme] || themeClasses.default;
    const iconStrokeWidth = prefs.iconStyle === 'bold' ? 2.5 : 2;
    
    const [currentLanguage, setCurrentLanguage] = useState<'uz-latn' | 'uz-cyrl' | 'ru' | 'en'>(getCurrentLanguage());

    useEffect(() => {
        const handleLanguageChange = () => {
            setCurrentLanguage(getCurrentLanguage());
        };
        
        window.addEventListener('languageChanged', handleLanguageChange);
        return () => window.removeEventListener('languageChanged', handleLanguageChange);
    }, []);

    const navItems = [
        { view: 'dashboard', label: t('nav-dashboard'), icon: <LayoutDashboard strokeWidth={iconStrokeWidth} /> },
        { view: 'analytics', label: t('nav-analytics'), icon: <BarChart3 strokeWidth={iconStrokeWidth} /> },
        // Hidden competitor analysis section
        // { view: 'competitors', label: t('competitor-analysis'), icon: <TelescopeIcon strokeWidth={iconStrokeWidth} /> },
        { view: 'contracts', label: t('nav-contracts'), icon: <FileText strokeWidth={iconStrokeWidth} /> },
    ];

    const handleLanguageChange = (lang: 'uz-latn' | 'uz-cyrl' | 'ru' | 'en') => {
        setLanguage(lang);
        onPrefsChange({ ...prefs, language: lang });
    };

    return (
        <aside 
            className={`fixed top-0 left-0 h-full text-text-primary flex flex-col border-r border-border transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-64'} ${currentTheme.bg}`}
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
        >
            <div className="flex items-center justify-center h-20 border-b border-border flex-shrink-0 cursor-pointer" onClick={() => onNavigate('dashboard')}>
                <LogoIcon />
                <span className={`text-xl font-bold ml-2 overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>AI-Broker</span>
            </div>
            <nav className="flex-grow mt-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.view} className="px-3">
                            <button 
                                onClick={() => onNavigate(item.view as AppView)}
                                className={`flex items-center w-full h-12 px-3 my-1 rounded-md transition-colors duration-200 ${currentView === item.view ? currentTheme.active : `${currentTheme.hover} text-text-secondary hover:text-text-primary`}`}
                                title={item.label}
                            >
                                <div className="flex-shrink-0">{item.icon}</div>
                                <span className={`ml-4 font-semibold overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex-shrink-0 border-t border-border p-3">
                <div className="mb-3">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">{t('language-selector')}</label>
                    <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value as 'uz-latn' | 'uz-cyrl' | 'ru' | 'en')}
                        className="w-full p-1 text-xs border border-border rounded bg-background text-text-primary"
                    >
                        <option value="uz-latn">{t('uzbek-latin')}</option>
                        <option value="uz-cyrl">{t('uzbek-cyrillic')}</option>
                        <option value="ru">{t('russian')}</option>
                        <option value="en">{t('english')}</option>
                    </select>
                </div>
                <ul>
                    <li className="px-3">
                        <button 
                            onClick={() => onNavigate('profile')}
                            className={`flex items-center w-full h-12 px-3 my-1 rounded-md transition-colors duration-200 ${currentView === 'profile' ? currentTheme.active : `${currentTheme.hover} text-text-secondary hover:text-text-primary`}`}
                            title={t('nav-profile')}
                        >
                           <div className="flex-shrink-0"><Settings strokeWidth={iconStrokeWidth} /></div>
                           <span className={`ml-4 font-semibold overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('nav-profile')}</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};


interface HeaderProps {
    currentView: AppView;
    onNewAnalysis: () => void;
}

const viewTitles: Record<AppView, string> = {
    dashboard: 'dashboard-title',
    analytics: 'analytics-title',
    competitors: 'competitors-title',
    contracts: 'contracts-title',
    profile: 'profile-title',
    input: 'input-title',
    loadingSourcing: 'loading-sourcing-title',
    sourcingSelection: 'sourcing-selection-title',
    loadingAnalysis: 'loading-analysis-title',
    results: 'results-title',
    sharedReport: 'shared-report-title',
    loadingContract: 'loading-contract-title',
};

export const Header: React.FC<HeaderProps> = ({ currentView, onNewAnalysis }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'uz-latn' | 'uz-cyrl' | 'ru' | 'en'>(getCurrentLanguage());

    useEffect(() => {
        const handleLanguageChange = () => {
            setCurrentLanguage(getCurrentLanguage());
        };
        
        window.addEventListener('languageChanged', handleLanguageChange);
        return () => window.removeEventListener('languageChanged', handleLanguageChange);
    }, []);

    return (
        <header className="flex-shrink-0 h-20 flex items-center justify-between px-8 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
            <h1 className="text-xl font-bold text-text-primary">{t(viewTitles[currentView] || 'dashboard-title')}</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={onNewAnalysis}
                    className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-2.5 px-5 rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm"
                    aria-label={t('new-analysis')}
                >
                    <PlusIcon />
                    <span>{t('new-analysis')}</span>
                </button>
            </div>
        </header>
    );
};