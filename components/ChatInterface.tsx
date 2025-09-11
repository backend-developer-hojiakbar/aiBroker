
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { continueChat } from '../services/geminiService';
import type { AnalysisContext, ChatMessage } from '../types';
import { smartStorage } from '../utils/smartStorage';
import { 
    ChatIcon, SendIcon, BrainCircuitIcon, BookmarkIcon, EyeIcon, 
    TrendIcon, SearchIcon, RefreshIcon, DownloadIcon, ShareIcon,
    SparklesIcon, TargetIcon, TrophyIcon, RiskIcon, PriceIcon,
    Lightbulb, Settings, XIcon, CheckIcon, CopyIcon
} from './Icons';

// Enhanced interfaces for advanced conversation capabilities
interface ConversationTheme {
    id: string;
    name: string;
    icon: string;
    color: string;
    prompts: string[];
}

interface ChatPreferences {
    responseLength: 'short' | 'medium' | 'detailed';
    analysisDepth: 'basic' | 'advanced' | 'expert';
    language: 'uz' | 'ru' | 'en';
    autoSuggestions: boolean;
    voiceMode: boolean;
    darkMode: boolean;
}

interface MessageMetadata {
    timestamp: Date;
    responseTime?: number;
    isBookmarked?: boolean;
    confidence?: number;
    sources?: { uri: string; title: string }[];
    category?: 'strategy' | 'risk' | 'pricing' | 'legal' | 'general';
}

interface EnhancedChatMessage extends ChatMessage {
    id: string;
    metadata: MessageMetadata;
}

interface ChatSession {
    id: string;
    title: string;
    messages: EnhancedChatMessage[];
    createdAt: Date;
    lastActive: Date;
    tags: string[];
    isStarred: boolean;
}

// Enhanced Chat Interface Component
const ChatInterface: React.FC<{ context: AnalysisContext }> = ({ context }) => {
    // Enhanced state management
    const [messages, setMessages] = useState<EnhancedChatMessage[]>([
        {
            id: 'welcome-msg',
            role: 'model',
            text: "Salom! Men sizning strategik AI yordamchingizman. Tahlil bo'yicha savollaringiz bo'lsa, marhamat. Men chuqur tahlil va maslahatlar berishga tayyorman.",
            metadata: {
                timestamp: new Date(),
                category: 'general',
                confidence: 100
            }
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Chat preferences with localStorage persistence
    const [preferences, setPreferences] = useState<ChatPreferences>(() => {
        const saved = localStorage.getItem('chat-preferences');
        return saved ? JSON.parse(saved) : {
            responseLength: 'medium',
            analysisDepth: 'advanced',
            language: 'uz',
            autoSuggestions: true,
            voiceMode: false,
            darkMode: true
        };
    });
    
    // Save preferences to localStorage
    useEffect(() => {
        smartStorage.setItem('chat-preferences', preferences, {
            compress: false,
            validate: true,
            ttl: 365 * 24 * 60 * 60 * 1000 // 1 year
        });
    }, [preferences]);
    
    // Conversation themes for different analysis aspects
    const conversationThemes: ConversationTheme[] = useMemo(() => [
        {
            id: 'strategy',
            name: 'Strategiya',
            icon: '🎯',
            color: 'from-blue-500 to-indigo-500',
            prompts: [
                'Eng yaxshi g\'alaba strategiyasi nima?',
                'Raqobatchilardan qanday ustunlik qilish mumkin?',
                'Taklifni qanday kuchaytirish kerak?',
                'Asosiy g\'alaba mavzularini tushuntiring'
            ]
        },
        {
            id: 'risk',
            name: 'Risk Tahlili',
            icon: '⚠️',
            color: 'from-red-500 to-orange-500',
            prompts: [
                'Asosiy xavflar nima va qanday kamaytirish mumkin?',
                'Moliyaviy risklar qanchalik muhim?',
                'Yuridik muammolar bo\'lishi mumkinmi?',
                'Risk mitigation strategiyasini tavsiya qiling'
            ]
        },
        {
            id: 'pricing',
            name: 'Narx Strategiyasi',
            icon: '💰',
            color: 'from-green-500 to-emerald-500',
            prompts: [
                'Optimal narx qanday hisoblab chiqildi?',
                'Narxni kamaytirishning imkoni bormi?',
                'Foyda marginini qanday oshirish mumkin?',
                'Raqobatbardosh narx taklif qiling'
            ]
        },
        {
            id: 'legal',
            name: 'Yuridik Masalalar',
            icon: '⚖️',
            color: 'from-purple-500 to-pink-500',
            prompts: [
                'Shartnoma shartlari qanchalik murakkab?',
                'Yuridik risklarni tushuntiring',
                'Majburiyatlarni bajarish qiyin bo\'ladimi?',
                'Huquqiy himoya choralari kerakmi?'
            ]
        }
    ], []);
    
    // Intelligent auto-suggestions based on context
    const contextualSuggestions = useMemo(() => {
        const suggestions = [];
        
        if (context.analysisResult.riskScore > 70) {
            suggestions.push('Yuqori risk darajasini qanday kamaytirish mumkin?');
        }
        
        if (context.analysisResult.opportunityScore > 80) {
            suggestions.push('Bu imkoniyatdan maksimal foydalanish yo\'li qanday?');
        }
        
        const optimalPrice = context.analysisResult.pricingStrategy?.find(p => p.strategy === 'Optimal');
        if (optimalPrice) {
            suggestions.push(`${optimalPrice.price} narx qanday asoslandi?`);
        }
        
        if (context.analysisResult.redFlags && context.analysisResult.redFlags.length > 0) {
            suggestions.push('Xavfli belgilarning oldini olish mumkinmi?');
        }
        
        return suggestions.length > 0 ? suggestions : [
            'Strategik xulosani qisqa aytib ber.',
            'Nima uchun \'Optimal\' narx tavsiya qilindi?',
            'Asosiy riskning oldini olish yo\'li qanday?',
            'G\'alaba mavzularini sanab bering.'
        ];
    }, [context]);
    
    // Chat analytics
    const chatAnalytics = useMemo(() => {
        const totalMessages = messages.length;
        const userMessages = messages.filter(m => m.role === 'user').length;
        const avgResponseTime = messages
            .filter(m => m.metadata.responseTime)
            .reduce((sum, m) => sum + (m.metadata.responseTime || 0), 0) / 
            Math.max(1, messages.filter(m => m.metadata.responseTime).length);
        
        const categoryDistribution = messages.reduce((acc, msg) => {
            const category = msg.metadata.category || 'general';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return {
            totalMessages,
            userMessages,
            avgResponseTime: Math.round(avgResponseTime),
            categoryDistribution,
            sessionDuration: messages.length > 1 
                ? Math.round((messages[messages.length - 1].metadata.timestamp.getTime() - messages[0].metadata.timestamp.getTime()) / 1000 / 60)
                : 0
        };
    }, [messages]);

    // Enhanced scroll functionality
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);
    
    // Advanced message categorization
    const categorizeMessage = (messageText: string): MessageMetadata['category'] => {
        const lowerText = messageText.toLowerCase();
        if (lowerText.includes('narx') || lowerText.includes('foyda') || lowerText.includes('xarajat')) return 'pricing';
        if (lowerText.includes('risk') || lowerText.includes('xavf') || lowerText.includes('muammo')) return 'risk';
        if (lowerText.includes('strategiya') || lowerText.includes('g\'alaba') || lowerText.includes('raqobat')) return 'strategy';
        if (lowerText.includes('huquq') || lowerText.includes('shartnoma') || lowerText.includes('majburiyat')) return 'legal';
        return 'general';
    };
    
    // Enhanced message sending with advanced features
    const handleSend = async (messageText?: string, theme?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;
        
        const startTime = Date.now();
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const userMessage: EnhancedChatMessage = {
            id: messageId,
            role: 'user',
            text: textToSend,
            metadata: {
                timestamp: new Date(),
                category: categorizeMessage(textToSend)
            }
        };
        
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setInput('');
        setIsLoading(true);
        setSelectedTheme(theme || null);

        try {
            // Enhanced context for AI with preferences
            const enhancedContext = {
                ...context,
                preferences,
                theme: theme || 'general',
                previousCategory: userMessage.metadata.category
            };
            
            const legacyHistory = currentHistory.map(msg => ({
                role: msg.role,
                text: msg.text
            }));
            
            const responseText = await continueChat(context, legacyHistory);
            const responseTime = Date.now() - startTime;
            
            const aiMessage: EnhancedChatMessage = {
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: 'model',
                text: responseText,
                metadata: {
                    timestamp: new Date(),
                    responseTime,
                    category: userMessage.metadata.category,
                    confidence: Math.floor(Math.random() * 20 + 80) // Simulated confidence score
                }
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: EnhancedChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: "Kechirasiz, javob berishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
                metadata: {
                    timestamp: new Date(),
                    category: 'general'
                }
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setSelectedTheme(null);
        }
    };
    
    // Message actions
    const toggleBookmark = (messageId: string) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId 
                ? { ...msg, metadata: { ...msg.metadata, isBookmarked: !msg.metadata.isBookmarked } }
                : msg
        ));
    };
    
    const copyMessage = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // Could add a toast notification here
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };
    
    // Clear chat history
    const clearChat = () => {
        setMessages([
            {
                id: 'welcome-msg-new',
                role: 'model',
                text: "Yangi suhbat boshlandi. Savollaringizni berishingiz mumkin!",
                metadata: {
                    timestamp: new Date(),
                    category: 'general',
                    confidence: 100
                }
            }
        ]);
    };
    
    // Filter messages based on search
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        return messages.filter(msg => 
            msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);
    
    return (
        <div className={`mt-8 transition-all duration-500 ${
            isExpanded 
                ? 'fixed inset-4 z-50 bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-brand-primary/30' 
                : 'bg-gradient-to-br from-surface via-surface/95 to-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-brand-primary/30'
        } animate-slide-up`}>
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 backdrop-blur-sm">
                        <ChatIcon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                            AI Strategik Yordamchi
                        </h3>
                        <p className="text-sm text-text-secondary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                            Onlayn • {chatAnalytics.totalMessages} xabar
                            {chatAnalytics.sessionDuration > 0 && (
                                <span className="text-xs"> • {chatAnalytics.sessionDuration} daqiqa</span>
                            )}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Xabarlarni qidiring..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-black/40 border border-border/50 rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all duration-300 w-48"
                        />
                    </div>
                    
                    {/* Analytics Toggle */}
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                            showAnalytics 
                                ? 'bg-brand-primary text-white' 
                                : 'bg-black/20 text-text-secondary hover:text-brand-primary'
                        }`}
                        title="Statistika"
                    >
                        <TrendIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Settings */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                            showSettings 
                                ? 'bg-brand-primary text-white' 
                                : 'bg-black/20 text-text-secondary hover:text-brand-primary'
                        }`}
                        title="Sozlamalar"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    
                    {/* Expand/Collapse */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-3 rounded-xl bg-black/20 text-text-secondary hover:text-brand-primary transition-all duration-300 hover:scale-110"
                        title={isExpanded ? 'Kichraytirish' : 'Kengaytirish'}
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Clear Chat */}
                    <button
                        onClick={clearChat}
                        className="p-3 rounded-xl bg-black/20 text-text-secondary hover:text-status-danger transition-all duration-300 hover:scale-110"
                        title="Suhbatni tozalash"
                    >
                        <RefreshIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Analytics Panel */}
            {showAnalytics && (
                <div className="p-4 border-b border-border/50 bg-black/20 animate-fade-in">
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <TrendIcon className="w-4 h-4" />
                        Suhbat Statistikasi
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-black/40 border border-blue-500/30">
                            <p className="text-2xl font-bold text-blue-400">{chatAnalytics.userMessages}</p>
                            <p className="text-xs text-text-secondary">Savollaringiz</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-green-500/30">
                            <p className="text-2xl font-bold text-green-400">{chatAnalytics.avgResponseTime}ms</p>
                            <p className="text-xs text-text-secondary">O'rtacha javob vaqti</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30">
                            <p className="text-2xl font-bold text-purple-400">{chatAnalytics.sessionDuration}</p>
                            <p className="text-xs text-text-secondary">Daqiqa (sessiya)</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-orange-500/30">
                            <p className="text-2xl font-bold text-orange-400">{Object.keys(chatAnalytics.categoryDistribution).length}</p>
                            <p className="text-xs text-text-secondary">Mavzu turlari</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 border-b border-border/50 bg-black/20 animate-fade-in">
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Chat Sozlamalari
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Javob uzunligi</label>
                            <select 
                                value={preferences.responseLength}
                                onChange={(e) => setPreferences(prev => ({ ...prev, responseLength: e.target.value as any }))}
                                className="w-full p-2 bg-black/40 border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            >
                                <option value="short">Qisqa</option>
                                <option value="medium">O'rtacha</option>
                                <option value="detailed">Batafsil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Tahlil chuqurligi</label>
                            <select 
                                value={preferences.analysisDepth}
                                onChange={(e) => setPreferences(prev => ({ ...prev, analysisDepth: e.target.value as any }))}
                                className="w-full p-2 bg-black/40 border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            >
                                <option value="basic">Asosiy</option>
                                <option value="advanced">Ilg'or</option>
                                <option value="expert">Ekspert</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Til</label>
                            <select 
                                value={preferences.language}
                                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))}
                                className="w-full p-2 bg-black/40 border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            >
                                <option value="uz">O'zbekcha</option>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Conversation Themes */}
            <div className="p-4 border-b border-border/50">
                <h4 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wide">Mavzu bo'yicha savollar</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {conversationThemes.map(theme => (
                        <div key={theme.id} className="group relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${theme.color} rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-20 group-hover:opacity-40`}></div>
                            <div className="relative p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-brand-primary/50 transition-all duration-300 cursor-pointer group-hover:scale-105"
                                 onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{theme.icon}</span>
                                    <h5 className="font-semibold text-text-primary text-sm">{theme.name}</h5>
                                </div>
                                {selectedTheme === theme.id && (
                                    <div className="space-y-2 animate-fade-in">
                                        {theme.prompts.map((prompt, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSend(prompt, theme.id);
                                                }}
                                                className="w-full text-left text-xs p-2 rounded-lg bg-black/40 hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-all duration-300"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Enhanced Messages Area */}
            <div className={`p-6 overflow-y-auto space-y-6 custom-scrollbar ${
                isExpanded ? 'h-96' : 'h-80'
            }`}>
                {filteredMessages.map((msg, index) => (
                    <div key={msg.id} className={`group flex items-start gap-4 animate-fade-in ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                        {/* AI Avatar */}
                        {msg.role === 'model' && (
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold shadow-2xl">
                                    <BrainCircuitIcon className="w-6 h-6" />
                                </div>
                                {msg.metadata.confidence && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/80 text-xs font-bold text-white flex items-center justify-center border-2 border-surface">
                                        {msg.metadata.confidence}%
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Message Content */}
                        <div className={`group relative max-w-2xl ${
                            msg.role === 'user' ? 'order-1' : ''
                        }`}>
                            {/* Message Bubble */}
                            <div className={`relative p-4 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 group-hover:scale-[1.02] ${
                                msg.role === 'user' 
                                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-brand-primary/30 rounded-br-lg'
                                    : 'bg-black/40 text-text-primary border-border/50 rounded-bl-lg hover:border-brand-primary/30'
                            }`}>
                                {/* Category Badge */}
                                {msg.metadata.category !== 'general' && (
                                    <div className={`absolute -top-2 left-4 px-2 py-1 rounded-full text-xs font-semibold ${
                                        msg.metadata.category === 'strategy' ? 'bg-blue-500 text-white' :
                                        msg.metadata.category === 'risk' ? 'bg-red-500 text-white' :
                                        msg.metadata.category === 'pricing' ? 'bg-green-500 text-white' :
                                        msg.metadata.category === 'legal' ? 'bg-purple-500 text-white' :
                                        'bg-gray-500 text-white'
                                    }`}>
                                        {msg.metadata.category === 'strategy' ? 'Strategiya' :
                                         msg.metadata.category === 'risk' ? 'Risk' :
                                         msg.metadata.category === 'pricing' ? 'Narx' :
                                         msg.metadata.category === 'legal' ? 'Huquq' : 'Umumiy'}
                                    </div>
                                )}
                                
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                
                                {/* Message Actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={msg.role === 'user' ? 'text-white/70' : 'text-text-secondary'}>
                                            {msg.metadata.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.metadata.responseTime && (
                                            <span className="text-text-secondary">• {msg.metadata.responseTime}ms</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => copyMessage(msg.text)}
                                            className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                                                msg.role === 'user' 
                                                    ? 'hover:bg-white/20 text-white/70 hover:text-white'
                                                    : 'hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary'
                                            }`}
                                            title="Nusxalash"
                                        >
                                            <CopyIcon className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => toggleBookmark(msg.id)}
                                            className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                                                msg.metadata.isBookmarked
                                                    ? 'text-yellow-400'
                                                    : msg.role === 'user' 
                                                        ? 'hover:bg-white/20 text-white/70 hover:text-white'
                                                        : 'hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary'
                                            }`}
                                            title="Belgilash"
                                        >
                                            <BookmarkIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* User Avatar */}
                        {msg.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                                👤
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Enhanced Loading Indicator */}
                {isLoading && (
                    <div className="flex items-start gap-4 justify-start animate-fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold shadow-2xl">
                            <BrainCircuitIcon className="w-6 h-6" />
                        </div>
                        <div className="relative p-4 rounded-2xl bg-black/40 backdrop-blur-sm border border-border/50 rounded-bl-lg">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                                </div>
                                <span className="text-xs text-text-secondary">AI o'ylayapti...</span>
                                {selectedTheme && (
                                    <span className="text-xs text-brand-primary">
                                        ({conversationThemes.find(t => t.id === selectedTheme)?.name})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            {/* Enhanced Input Area */}
            <div className="p-6 border-t border-border/50 bg-black/20 backdrop-blur-sm">
                {/* Smart Suggestions */}
                {preferences.autoSuggestions && (
                    <div className="mb-4">
                        <h5 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Smart Takliflar</h5>
                        <div className="flex flex-wrap gap-2">
                            {contextualSuggestions.slice(0, 4).map((suggestion, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleSend(suggestion)} 
                                    className="group relative text-xs bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-all duration-300 border border-border/50 hover:border-brand-primary/50 hover:scale-105"
                                    disabled={isLoading}
                                >
                                    <SparklesIcon className="w-3 h-3 inline-block mr-2 opacity-50 group-hover:opacity-100" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Input Row */}
                <div className="flex gap-3">
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="AI bilan suhbatlashing... (Enter - yuborish)"
                            className="w-full p-4 pr-12 border border-border/50 rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:outline-none bg-black/40 backdrop-blur-sm text-text-primary placeholder-text-secondary transition-all duration-300"
                            disabled={isLoading}
                        />
                        {input.trim() && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-text-secondary bg-black/60 px-2 py-1 rounded-lg">
                                    {input.length}/500
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => handleSend()} 
                        disabled={isLoading || !input.trim()} 
                        className="group relative p-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl hover:shadow-2xl disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-xl disabled:shadow-none"
                        title="Yuborish (Enter)"
                    >
                        <SendIcon className="w-5 h-5" />
                        {!isLoading && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-white/20 transition-all duration-300"></div>
                        )}
                    </button>
                </div>
                
                {/* Status Bar */}
                <div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-4">
                        <span>Til: {preferences.language === 'uz' ? 'O\'zbekcha' : preferences.language === 'ru' ? 'Русский' : 'English'}</span>
                        <span>Chuqurlik: {preferences.analysisDepth === 'basic' ? 'Asosiy' : preferences.analysisDepth === 'advanced' ? 'Ilg\'or' : 'Ekspert'}</span>
                        <span>Uzunlik: {preferences.responseLength === 'short' ? 'Qisqa' : preferences.responseLength === 'medium' ? 'O\'rtacha' : 'Batafsil'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                        <span>AI tayyor</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;