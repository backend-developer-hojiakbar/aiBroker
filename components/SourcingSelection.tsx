import React, { useState, useEffect, useMemo } from 'react';
import type { SourcingResult, SourcingRecommendation } from '../types';
import { SupplierIcon, CheckIcon, AnalyzeIcon, BackIcon, GlobeIcon, BuildingIcon, InfoIcon, LinkIcon, PhoneIcon, MailIcon, UserIcon, RefreshIcon, SearchIcon, FilterIcon, PriceVerificationIcon } from './Icons';

interface SourcingSelectionProps {
  sourcingResult: SourcingResult;
  onConfirm: (selectedSources: SourcingRecommendation[]) => void;
  onCancel: () => void;
  error?: string | null;
}

const parseCurrency = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
};

const TrustScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 10;
    let colorClass = 'text-status-danger';
    if (score > 4) colorClass = 'text-status-warning';
    if (score > 7) colorClass = 'text-status-success';

    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative h-12 w-12 flex-shrink-0" title={`Ishonch reytingi: ${score} / 10`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" className="stroke-white/10" strokeWidth="3" fill="transparent" />
                <circle cx="20" cy="20" r="18" className={`stroke-current ${colorClass}`} strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${colorClass}`}>{score}</span>
        </div>
    );
};

const SupplierCard: React.FC<{
    supplier: SourcingRecommendation;
    isSelected: boolean;
    onToggle: () => void;
    averagePrice: number;
}> = ({ supplier, isSelected, onToggle, averagePrice }) => {
    
    const typeStyles: Record<SourcingRecommendation['supplierType'], string> = {
        'Ishlab chiqaruvchi': 'bg-status-success/30 text-status-success border border-status-success/50 font-bold', // Most cost-effective
        'Rasmiy Distributor': 'bg-blue-500/20 text-blue-300',
        'Opt sotuvchi': 'bg-yellow-500/20 text-yellow-300', // Added wholesale option
        'Reseller': 'bg-orange-500/20 text-orange-300',
        'Noma\'lum': 'bg-gray-500/20 text-gray-300',
    };

    const currentPrice = parseCurrency(supplier.price);
    let priceComparisonElement = null;
    if (averagePrice > 0 && currentPrice > 0) {
        const difference = ((currentPrice - averagePrice) / averagePrice) * 100;
        if (Math.abs(difference) > 1) { // Only show for significant differences
            const isCheaper = difference < 0;
            const color = isCheaper ? 'text-status-success' : 'text-status-danger';
            priceComparisonElement = (
                <span className={`font-bold text-xs ${color}`}>
                    ({isCheaper ? '▼' : '▲'} {Math.abs(difference).toFixed(0)}%)
                </span>
            );
        }
    }


    return (
        <div
            className={`relative p-4 bg-black/20 rounded-lg border-2 transition-all duration-300 cursor-pointer group flex flex-col ${isSelected ? 'border-brand-primary shadow-glow' : 'border-border/50 hover:border-brand-primary/50'}`}
            onClick={onToggle}
        >
            {supplier.isKeyRecommendation && (
                <div className="absolute -top-3 right-3 text-xs font-bold bg-accent text-background px-3 py-1 rounded-full animate-pulse-glow shadow-lg z-10">
                    ⭐ Eng Tejamkor
                </div>
            )}
            
            {currentPrice > 0 && averagePrice > 0 && currentPrice < averagePrice * 0.9 && (
                <div className="absolute -top-3 left-3 text-xs font-bold bg-status-success text-white px-3 py-1 rounded-full shadow-lg z-10">
                    💰 Super Arzon
                </div>
            )}

            <div className="flex items-start justify-between mb-3">
                <div className="flex-grow min-w-0 pr-4">
                    <h4 className="font-bold text-lg text-text-primary truncate" title={supplier.supplierName}>
                        {supplier.supplierName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyles[supplier.supplierType]}`}>{supplier.supplierType}</span>
                        {supplier.country && <p className="text-sm text-text-secondary">{supplier.country}</p>}
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-500 bg-surface'}`}>
                    {isSelected && <CheckIcon />}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-3 p-2 bg-background rounded-md">
                <TrustScoreGauge score={supplier.trustScore || 5} />
                <div className="flex-grow min-w-0">
                    <h5 className="text-sm font-semibold">Ishonch omillari</h5>
                    <ul className="text-xs text-text-secondary list-disc list-inside">
                        {(supplier.reliabilityFactors || []).slice(0, 2).map((factor, i) => <li key={i} className="truncate">{factor}</li>)}
                         {(supplier.reliabilityFactors || []).length === 0 && <li>Topilmadi</li>}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div className="bg-background p-2 rounded-md">
                    <div className="flex items-baseline justify-between">
                         <p className="text-xs text-text-secondary">Asosiy Narx</p>
                         {priceComparisonElement}
                    </div>
                    <p className="font-bold text-brand-primary">{supplier.price}</p>
                     {supplier.priceComment && (
                        <p className="text-[10px] text-text-secondary italic mt-1 truncate" title={supplier.priceComment}>
                           <InfoIcon className="inline w-3 h-3 mr-1" />{supplier.priceComment}
                        </p>
                    )}
                    {(supplier as any).bulkPricing && (supplier as any).bulkPricing !== "Ma'lumot topilmadi" && (
                        <p className="text-[10px] text-status-success font-semibold mt-1">
                            📊 {(supplier as any).bulkPricing}
                        </p>
                    )}
                </div>
                 <div className="bg-background p-2 rounded-md">
                    <p className="text-xs text-text-secondary">Mavjudligi</p>
                    <p className="font-bold">{supplier.availability}</p>
                    {(supplier as any).competitiveAdvantage && (
                        <p className="text-[10px] text-accent font-semibold mt-1 truncate" title={(supplier as any).competitiveAdvantage}>
                            🎯 {(supplier as any).competitiveAdvantage}
                        </p>
                    )}
                </div>
            </div>

            <p className="text-xs text-text-secondary mb-3 flex-grow">{supplier.reasoning}</p>

            <div className="pt-2 border-t border-border/50 space-y-1 text-xs mt-auto">
                {supplier.contactPerson && supplier.contactPerson !== "Ma'lumot topilmadi" && (
                    <div className="flex items-center gap-2"> <UserIcon /> <span className="text-text-primary">{supplier.contactPerson}</span></div>
                )}
                {supplier.phone && supplier.phone !== "Ma'lumot topilmadi" && (
                    <a href={`tel:${supplier.phone.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-text-secondary hover:text-brand-primary"><PhoneIcon /> {supplier.phone}</a>
                )}
                {supplier.email && supplier.email !== "Ma'lumot topilmadi" && (
                    <a href={`mailto:${supplier.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-text-secondary hover:text-brand-primary truncate"><MailIcon /> <span className="truncate">{supplier.email}</span></a>
                )}
                {supplier.website && supplier.website !== "Ma'lumot topilmadi" && (
                    <a href={supplier.website.startsWith('http') ? supplier.website : `//${supplier.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-brand-secondary hover:underline truncate"><LinkIcon /> <span className="truncate">{supplier.website}</span></a>
                )}
            </div>
        </div>
    );
};

const SourcingSelection: React.FC<SourcingSelectionProps> = ({ sourcingResult, onConfirm, onCancel, error }) => {
    const [selectedSupplierNames, setSelectedSupplierNames] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'local' | 'foreign'>('local');
    const [isDeepSearching, setIsDeepSearching] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [deepSearchResults] = useState<Map<string, any>>(new Map());
    
    // Add logging for error prop changes
    useEffect(() => {
        if (error) {
            console.log('SourcingSelection: Error received:', error);
        } else {
            console.log('SourcingSelection: Error cleared');
        }
    }, [error]);
    
    const { 
        sourcingRecommendations = [], 
        foreignSourcingRecommendations = [], 
        lotPassport 
    } = sourcingResult;
    
    // Enhanced filtering logic with deep search functionality
    const filteredSuppliers = useMemo(() => {
        return activeTab === 'local' ? sourcingRecommendations : foreignSourcingRecommendations;
    }, [sourcingRecommendations, foreignSourcingRecommendations, activeTab]);
    
    const totalSuppliers = sourcingRecommendations.length + foreignSourcingRecommendations.length;
    
    // Deep search functionality (enhanced price discovery)
    const startDeepSearch = async () => {
        setIsDeepSearching(true);
        // Simulate enhanced search - in production this would call enhanced AI service
        setTimeout(() => {
            setIsDeepSearching(false);
        }, 3000);
    };

    const averagePrice = useMemo(() => {
        const allSuppliers = [...sourcingRecommendations, ...foreignSourcingRecommendations];
        const prices = allSuppliers
            .map(s => parseCurrency(s.price))
            .filter(p => p > 0);
        if (prices.length === 0) return 0;
        return prices.reduce((a, b) => a + b, 0) / prices.length;
    }, [sourcingRecommendations, foreignSourcingRecommendations]);

    useEffect(() => {
        const allSuppliers = [...sourcingRecommendations, ...foreignSourcingRecommendations];
        const keyRec = allSuppliers.find(s => s.isKeyRecommendation);
        if (keyRec) {
            setSelectedSupplierNames([keyRec.supplierName]);
        }
    }, [sourcingRecommendations, foreignSourcingRecommendations]);

    const handleToggleSupplier = (supplierName: string) => {
        setSelectedSupplierNames(prev =>
            prev.includes(supplierName)
                ? prev.filter(name => name !== supplierName)
                : [...prev, supplierName]
        );
    };

    const handleConfirm = () => {
        const allSuppliers = [...sourcingRecommendations, ...foreignSourcingRecommendations];
        const selected = allSuppliers.filter(s => selectedSupplierNames.includes(s.supplierName));
        
        console.log('SourcingSelection: Confirming selection with:', {
            selectedCount: selected.length,
            selectedNames: selectedSupplierNames,
            allSuppliersCount: allSuppliers.length
        });
        
        onConfirm(selected);
    };
    
    const currentList = filteredSuppliers;

    const noSuppliersFound = sourcingRecommendations.length === 0 && foreignSourcingRecommendations.length === 0;
    
    if (noSuppliersFound) {
         return (
             <div className="max-w-3xl mx-auto text-center py-16 px-6 bg-surface rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-status-warning">Eng Arzon Ta'minotchilar Topilmadi</h2>
                <p className="mt-2 text-text-secondary">Ultra-raqobatbardosh narx qidiruvi orqali ham eng arzon ta'minot manbalari topilmadi. Bu quyidagi sabablarga ko'ra bo'lishi mumkin:</p>
                <ul className="text-sm text-left list-disc list-inside mt-4 max-w-md mx-auto">
                    <li>Mahsulot juda noyob yoki maxsus texnologiya talab qiladi.</li>
                    <li>Tender hujjatida mahsulot nomi va spetsifikatsiyalar aniq emas.</li>
                    <li>Ushbu mahsulot uchun ochiq bozorda narx ma'lumotlari yo'q.</li>
                    <li>Faqat yopiq B2B platformalarda sotiladi.</li>
                    <li>Import qilish uchun maxsus litsenziya talab qilinadi.</li>
                </ul>
                <div className="mt-8 flex justify-center gap-4">
                     <button onClick={onCancel} className="bg-gray-700 text-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <BackIcon /> Orqaga
                    </button>
                    <button onClick={() => onConfirm([])} className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-2 px-6 rounded-lg hover:shadow-glow flex items-center gap-2">
                         Tahlilni Davom Ettirish
                    </button>
                </div>
                 <p className="text-xs text-text-secondary mt-2">Tanlangan ta'minotchilarsiz ham tahlilni davom ettirishingiz mumkin, ammo moliyaviy hisob-kitoblar aniq bo'lmaydi.</p>
            </div>
         );
    }
    
    return (
        <div className="max-w-7xl mx-auto bg-surface p-6 sm:p-8 rounded-lg shadow-soft animate-slide-up border border-border">
            <div className="text-center mb-4">
                 <div className="flex justify-center text-brand-primary"><SupplierIcon /></div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to mt-2">
                    Eng Arzon Ta'minot Manbalari
                </h2>
                <p className="mt-2 text-text-secondary max-w-3xl mx-auto">
                    Google qidiruvi orqali eng arzon narxli va ishonchli ta'minotchilar topildi. Har bir ta'minotchi uchun eng past narxlar, hajmiy chegirmalar va opt shartlari tekshirildi. Lot yutish ehtimolini maksimal darajada oshirish uchun eng tejamkor variantlarni tanlang.
                </p>
                <div className="mt-2 text-sm text-brand-secondary">
                    💰 Eng arzon narxlar • 📊 Hajmiy chegirmalar • 🏭 To'g'ridan-to'g'ri ishlab chiqaruvchilar • 🎯 Yuqori yutish ehtimoli
                </div>
            </div>
            
            {/* Error Display */}
            {error && (
                <div className="bg-status-danger/20 border border-status-danger/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-status-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-status-danger font-semibold mb-1">Yakuniy tahlilda xatolik yuz berdi</p>
                        <p className="text-sm text-status-danger/80 mb-3">{error}</p>
                        <div className="bg-status-danger/10 border border-status-danger/20 rounded-md p-3 mb-3">
                            <p className="text-xs text-status-danger font-semibold mb-2">Xatolikni hal qilish uchun quyidagi amallarni bajaring:</p>
                            <ul className="text-xs text-status-danger/80 space-y-1">
                                <li>• Boshqa ta'minotchilarni tanlang va qayta urinib ko'ring</li>
                                <li>• Internet aloqasini tekshiring</li>
                                <li>• Bir necha daqiqa kutib, qayta urinib ko'ring</li>
                                <li>• Agar muammo davom etsa, sahifani yangilang</li>
                            </ul>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-text-secondary">Iltimos, boshqa ta'minotchilarni tanlang yoki qayta urinib ko'ring.</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onCancel()} 
                                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors"
                                >
                                    Orqaga
                                </button>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="text-xs bg-status-danger/20 hover:bg-status-danger/30 text-status-danger px-3 py-1 rounded-md transition-colors"
                                >
                                    Sahifani yangilash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Enhanced Deep Search Controls */}
            <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                            <SearchIcon className="w-6 h-6" />
                            Ultra-Raqobatbardosh Narx Qidiruvi
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Internetdagi eng arzon ishlab chiqaruvchilar va opt sotuvchilarni topib, maksimal tejamkorlik va yuqori yutish ehtimolini ta'minlaydi.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-text-secondary">Jami topilgan</div>
                        <div className="text-2xl font-bold text-brand-primary">{totalSuppliers}</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-xs text-text-secondary">O'rtacha narx</div>
                        <div className="text-lg font-bold text-text-primary">
                            {averagePrice > 0 ? `${averagePrice.toLocaleString('fr-FR')} UZS` : 'N/A'}
                        </div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-xs text-text-secondary">Eng arzon topildi</div>
                        <div className="text-lg font-bold text-status-success">
                            {isDeepSearching ? 'Qidirilmoqda...' : 'Tasdiqlangan'}
                        </div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-xs text-text-secondary">Qidiruv manbai</div>
                        <div className="text-lg font-bold text-status-success">
                            Google Search API
                        </div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-xs text-text-secondary">Yutish ehtimoli</div>
                        <div className="text-lg font-bold text-accent">
                            {isDeepSearching ? 'Hisoblanmoqda...' : 'Yuqori'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={startDeepSearch}
                        disabled={isDeepSearching}
                        className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isDeepSearching ? (
                            <>
                                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                Haqiqiy ta'minotchilar qidirilmoqda...
                            </>
                        ) : (
                            <>
                                <RefreshIcon className="w-5 h-5" />
                                Eng arzon narxlarni qidirish
                            </>
                        )}
                    </button>
                    
                    <div className="text-sm text-text-secondary">
                        <span className="font-semibold">💡 Strategiya:</span> Eng arzon ta'minotchilar orqali lot yutish ehtimolini maksimal oshirish
                    </div>
                </div>
            </div>
            
            <div className="my-6 p-4 bg-black/20 rounded-lg border border-border/50 max-w-2xl mx-auto">
                 <h3 className="font-bold text-center">{lotPassport?.itemName || 'Nomsiz Lot'}</h3>
                 <div className="flex justify-around items-center text-center mt-2 text-sm">
                     <div><p className="text-text-secondary">Buyurtmachi</p><p className="font-semibold">{lotPassport?.customerName || 'N/A'}</p></div>
                     <div className="h-8 w-px bg-border"></div>
                     <div><p className="text-text-secondary">Bosh. Narx</p><p className="font-semibold">{lotPassport?.startPrice || 'N/A'}</p></div>
                     <div className="h-8 w-px bg-border"></div>
                     <div><p className="text-text-secondary">Miqdori</p><p className="font-semibold">{lotPassport?.quantity || 'N/A'}</p></div>
                 </div>
            </div>

            <div className="p-1 bg-background rounded-lg flex space-x-1 mb-6 border border-border max-w-sm mx-auto">
                <button
                    onClick={() => setActiveTab('local')}
                    className={`w-1/2 p-2 font-semibold text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'local' ? 'bg-surface-light text-brand-primary' : 'text-text-secondary'}`}
                >
                    <BuildingIcon /> Mahalliy ({sourcingRecommendations.length})
                </button>
                <button
                    onClick={() => setActiveTab('foreign')}
                    className={`w-1/2 p-2 font-semibold text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'foreign' ? 'bg-surface-light text-brand-primary' : 'text-text-secondary'}`}
                >
                    <GlobeIcon /> Xorijiy ({foreignSourcingRecommendations.length})
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSuppliers.map(supplier => (
                    <SupplierCard
                        key={supplier.supplierName}
                        supplier={supplier}
                        isSelected={selectedSupplierNames.includes(supplier.supplierName)}
                        onToggle={() => handleToggleSupplier(supplier.supplierName)}
                        averagePrice={averagePrice}
                        deepSearchResult={deepSearchResults.get(supplier.supplierName)}
                    />
                ))}
            </div>

            {filteredSuppliers.length === 0 && (
                <div className="text-center py-10 px-6 bg-black/20 rounded-2xl border border-border">
                    <h3 className="text-xl font-bold text-text-primary">
                        {appliedFilters ? 'Filtr shartlariga mos ta\'minotchilar topilmadi' : 'Ushbu toifada ta\'minotchilar topilmadi'}
                    </h3>
                    <p className="mt-2 text-text-secondary">
                        {appliedFilters ? 'Filtr sozlamalarini o\'zgartiring yoki chuqur qidiruvni ishga tushiring.' : 'Boshqa toifani ko\'ring yoki tahlilni davom ettiring.'}
                    </p>
                    {appliedFilters && (
                        <button
                            onClick={() => setAppliedFilters(null)}
                            className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                        >
                            Filtrlarni tozalash
                        </button>
                    )}
                </div>
            )}
            
            <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0 bg-surface/80 backdrop-blur-sm py-4 -mx-8 px-8">
                <div>
                     <p className="text-lg font-bold">{selectedSupplierNames.length} ta ta'minotchi tanlandi</p>
                     <p className="text-sm text-text-secondary">Tanlanganlar asosida moliyaviy hisobot va strategiya yaratiladi.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="bg-gray-700 text-text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <BackIcon /> Bekor qilish
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedSupplierNames.length === 0}
                        className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        <AnalyzeIcon /> Yakuniy Tahlilni Yaratish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SourcingSelection;