
import React, { useMemo } from 'react';
import type { AnalysisResult, CompanyProfile } from '../types';
import { Card, InfoTooltip } from './Card';
import { FinancialsIcon, StrategyIcon, LinkIcon, PassportIcon, TargetIcon, TelescopeIcon, TrendingUpIcon, UsersIcon } from './Icons';

interface AnalyticsProps {
    tenders: AnalysisResult[];
    companyProfile: CompanyProfile | null;
    onShowCompetitors: () => void;
    onSelectTender: (tender: AnalysisResult) => void;
}

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <p className="text-center text-text-secondary">Ma'lumot yo'q</p>;

    let cumulativePercentage = 0;
    const gradients = data.map(item => {
        const percentage = (item.value / total) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        return `${item.color} ${start}% ${cumulativePercentage}%`;
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-40 h-40 group">
                <div className="w-40 h-40 rounded-full transition-transform transform group-hover:scale-105" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-surface rounded-full flex flex-col items-center justify-center text-center shadow-inner">
                        <span className="text-2xl font-bold text-brand-primary">{total}</span>
                        <span className="text-xs">Jami</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold">{item.label}:</span>
                        <span className="text-text-secondary">{item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number; }[], color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);
     if (data.every(d => d.value === 0)) return <p className="text-center text-text-secondary">Ma'lumot yo'q</p>;
    
    return (
        <div className="space-y-3">
            {data.map(item => (
                <div key={item.label} className="flex items-center gap-2 group">
                    <span className="text-sm font-semibold w-28 text-right truncate" title={item.label}>{item.label}</span>
                    <div className="flex-grow bg-gray-800/70 rounded-full h-6">
                         <div className="h-6 rounded-full text-white text-xs flex items-center px-2 font-bold transition-all duration-300" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}>
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const parseCurrency = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
}

const Analytics: React.FC<AnalyticsProps> = ({ tenders, companyProfile, onShowCompetitors, onSelectTender }) => {
    const [selectedPlatform, setSelectedPlatform] = React.useState<string>('all');
    
    // Filter tenders by selected platform
    const filteredTenders = useMemo(() => {
        if (selectedPlatform === 'all') return tenders;
        return tenders.filter(tender => tender.platform === selectedPlatform);
    }, [tenders, selectedPlatform]);
    
    // Update all calculations to use filteredTenders instead of tenders
    const totalTenders = filteredTenders.length;
    const wonCount = filteredTenders.filter(t => t.status === 'Won').length;
    const lostCount = filteredTenders.filter(t => t.status === 'Lost').length;
    const participatedCount = wonCount + lostCount;
    const winRate = participatedCount > 0 ? ((wonCount / participatedCount) * 100).toFixed(1) : '0.0';
    const othersCount = totalTenders - participatedCount;
    
    // Enhanced Analytics Calculations
    const avgRiskScore = filteredTenders.length > 0 ? (filteredTenders.reduce((sum, t) => sum + (t.riskScore || 0), 0) / filteredTenders.length).toFixed(1) : '0.0';
    const avgOpportunityScore = filteredTenders.length > 0 ? (filteredTenders.reduce((sum, t) => sum + (t.opportunityScore || 0), 0) / filteredTenders.length).toFixed(1) : '0.0';
    const highValueTenders = filteredTenders.filter(t => parseCurrency(t.lotPassport?.startPrice) > 100000000).length;
    const recentTrendDirection = filteredTenders.length >= 6 ? 
        (filteredTenders.slice(-3).filter(t => t.status === 'Won').length > filteredTenders.slice(-6, -3).filter(t => t.status === 'Won').length ? '↗️' : '↘️') : '➡️';

    const winLossData = [
        { label: 'Yutgan', value: wonCount, color: '#2ECC71' },
        { label: 'Yutqazgan', value: lostCount, color: '#E74C3C' },
        { label: 'Boshqa', value: othersCount, color: '#95A5A6' },
    ];
    
    const platformData = [
        {label: 'xarid.uzex.uz', value: filteredTenders.filter(t => t.platform === 'xarid.uzex.uz').length },
        {label: 'xt-xarid.uz', value: filteredTenders.filter(t => t.platform === 'xt-xarid.uz').length },
    ];
    
    // Get unique platforms for filter
    const platforms = Array.from(new Set(filteredTenders.map(t => t.platform)));
    
    // Enhanced Risk Analysis
    const riskCategoryData = [
        {label: 'Yuqori Risk (8-10)', value: filteredTenders.filter(t => (t.riskScore || 0) >= 8).length },
        {label: 'O\'rtacha Risk (5-7)', value: filteredTenders.filter(t => (t.riskScore || 0) >= 5 && (t.riskScore || 0) < 8).length },
        {label: 'Past Risk (1-4)', value: filteredTenders.filter(t => (t.riskScore || 0) < 5).length },
    ];
    
    // Enhanced Opportunity Analysis  
    const opportunityData = [
        {label: 'Yuqori Imkoniyat (8-10)', value: filteredTenders.filter(t => (t.opportunityScore || 0) >= 8).length },
        {label: 'O\'rtacha Imkoniyat (5-7)', value: filteredTenders.filter(t => (t.opportunityScore || 0) >= 5 && (t.opportunityScore || 0) < 8).length },
        {label: 'Past Imkoniyat (1-4)', value: filteredTenders.filter(t => (t.opportunityScore || 0) < 5).length },
    ];
    
    const { 
        customerData, 
        financialData,
        agentStats,
    } = useMemo(() => {
        const customerData: Record<string, {won: number, lost: number, total: number}> = {};
        filteredTenders.forEach(t => {
            const customerName = t.lotPassport.customerName;
            if (!customerData[customerName]) customerData[customerName] = { won: 0, lost: 0, total: 0 };
            if (t.status === 'Won') customerData[customerName].won++;
            if (t.status === 'Lost') customerData[customerName].lost++;
            customerData[customerName].total++;
        });
        
        const wonTenders = filteredTenders.filter(t => t.status === 'Won' && t.winnerInfo);
        let totalProfit = 0;
        let totalRevenue = 0;
        wonTenders.forEach(t => {
            const revenue = parseCurrency(t.winnerInfo!.winnerPrice);
            const cost = parseCurrency(t.winnerInfo!.actualCost);
            if (revenue > 0 && cost > 0) {
                totalProfit += (revenue - cost);
                totalRevenue += revenue;
            }
        });
        const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const financialData = { totalProfit, avgProfitMargin };

        const agentStats = (companyProfile?.salesAgents || []).map(agent => {
            const assignedTenders = tenders.filter(t => t.assignedAgentId === agent.id);
            const won = assignedTenders.filter(t => t.status === 'Won').length;
            const lost = assignedTenders.filter(t => t.status === 'Lost').length;
            const participated = won + lost;
            const winRate = participated > 0 ? (won / participated) * 100 : 0;
            return { name: agent.name, assigned: assignedTenders.length, won, winRate: winRate.toFixed(1) + '%' };
        }).sort((a,b) => b.assigned - a.assigned);

        return { 
            customerData, 
            financialData,
            agentStats,
        };
    }, [tenders, companyProfile]);
    
    const sortedCustomers = Object.entries(customerData).sort(([,a], [,b]) => (b as {total: number}).total - (a as {total: number}).total).slice(0, 10);
    const isTotalProfitPositive = financialData.totalProfit >= 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor="platform-filter" className="block text-sm font-medium text-text-secondary mb-1">Platforma bo'yicha filtrlash</label>
                    <select
                        id="platform-filter"
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full sm:w-64 bg-surface border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                        <option value="all">Barcha platformalar</option>
                        {platforms.map(platform => (
                            <option key={platform} value={platform}>
                                {platform}
                            </option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={onShowCompetitors}
                    className="bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <TelescopeIcon /> Raqobatchilar Tahlili
                </button>
            </div>
            
            {selectedPlatform !== 'all' && (
                <div className="bg-brand-primary/10 border-l-4 border-brand-primary text-brand-primary p-4 rounded-r">
                    <p className="font-medium">Filtr qo'llanilmoqda: <span className="font-bold">{selectedPlatform}</span></p>
                    <button 
                        onClick={() => setSelectedPlatform('all')}
                        className="mt-2 text-sm text-brand-primary hover:underline"
                    >
                        Filterni olib tashlash &times;
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Elite Samaradorlik Ko'rsatkichlari" className="lg:col-span-3" icon={<FinancialsIcon />}>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4 rounded-xl border border-brand-primary/30">
                            <p className="text-3xl font-bold text-brand-primary">{totalTenders}</p>
                            <p className="text-sm text-text-secondary">Jami Tahlillar</p>
                            <p className="text-xs text-accent mt-1">{recentTrendDirection} Trend</p>
                        </div>
                        <div className="bg-gradient-to-br from-status-success/20 to-status-success/10 p-4 rounded-xl border border-status-success/30">
                            <p className="text-3xl font-bold text-status-success">{wonCount}</p>
                            <p className="text-sm text-text-secondary">G'alabalar</p>
                            <p className="text-xs text-status-success mt-1">+{((wonCount/totalTenders)*100).toFixed(0)}% Portfolio</p>
                        </div>
                        <div className="bg-gradient-to-br from-status-danger/20 to-status-danger/10 p-4 rounded-xl border border-status-danger/30">
                            <p className="text-3xl font-bold text-status-danger">{lostCount}</p>
                            <p className="text-sm text-text-secondary">Mag'lubiyatlar</p>
                            <p className="text-xs text-status-danger mt-1">-{((lostCount/totalTenders)*100).toFixed(0)}% Portfolio</p>
                        </div>
                        <div className="bg-gradient-to-br from-brand-secondary/20 to-accent/20 p-4 rounded-xl border border-brand-secondary/30">
                            <p className="text-3xl font-bold text-brand-secondary">{winRate}%</p>
                            <p className="text-sm text-text-secondary">G'alaba Foizi</p>
                            <p className="text-xs text-brand-secondary mt-1">{participatedCount > 0 ? 'Faol Ishtirok' : 'Kutilmoqda'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-accent/20 to-status-warning/20 p-4 rounded-xl border border-accent/30">
                            <p className="text-3xl font-bold text-accent">{avgRiskScore}</p>
                            <p className="text-sm text-text-secondary">O'rtacha Risk</p>
                            <p className="text-xs text-accent mt-1">{parseFloat(avgRiskScore) < 5 ? 'Past' : parseFloat(avgRiskScore) < 8 ? 'O\'rtacha' : 'Yuqori'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-status-success/20 to-brand-primary/20 p-4 rounded-xl border border-status-success/30">
                            <p className="text-3xl font-bold text-status-success">{avgOpportunityScore}</p>
                            <p className="text-sm text-text-secondary">Imkoniyat Darajasi</p>
                            <p className="text-xs text-status-success mt-1">{parseFloat(avgOpportunityScore) > 7 ? 'Yuqori' : parseFloat(avgOpportunityScore) > 4 ? 'O\'rtacha' : 'Past'}</p>
                        </div>
                    </div>
                    
                    {/* Advanced Performance Indicators */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-border/50">
                            <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-2">
                                <TrendingUpIcon className="w-4 h-4" /> Yuqori Qiymatli Tenderlar
                            </h4>
                            <div className="text-2xl font-bold text-text-primary">{highValueTenders}</div>
                            <div className="text-sm text-text-secondary">100M+ UZS tenderlar</div>
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-lg border border-border/50">
                            <h4 className="font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <TargetIcon className="w-4 h-4" /> Maqsadli Mijozlar
                            </h4>
                            <div className="text-2xl font-bold text-text-primary">{Object.keys(customerData).length}</div>
                            <div className="text-sm text-text-secondary">Faol mijoz bazasi</div>
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-lg border border-border/50">
                            <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                                <TelescopeIcon className="w-4 h-4" /> Raqobat Darajasi
                            </h4>
                            <div className="text-2xl font-bold text-text-primary">{tenders.reduce((sum, t) => sum + (t.expectedCompetitors || 0), 0)}</div>
                            <div className="text-sm text-text-secondary">Jami raqobatchilar</div>
                        </div>
                    </div>
                </Card>

                <Card title="Moliyaviy Ko'rsatkichlar (Yutgan lotlar bo'yicha)" icon={<TrendingUpIcon />}>
                    {wonCount > 0 ? (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className={`text-2xl font-bold ${isTotalProfitPositive ? 'text-status-success' : 'text-status-danger'}`}>{financialData.totalProfit.toLocaleString('fr-FR')} UZS</p>
                                <p className="text-xs text-text-secondary">{isTotalProfitPositive ? 'Jami Sof Foyda' : 'Jami Sof Zarar'}</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-brand-secondary">{financialData.avgProfitMargin.toFixed(1)}%</p>
                                <p className="text-xs text-text-secondary">O'rtacha Foyda Marjasi</p>
                            </div>
                        </div>
                    ) : <p className="text-center text-text-secondary text-sm">Moliyaviy tahlil uchun kamida bitta tenderda g'olib bo'lish va 'Tender Natijasi' bo'limida tegishli ma'lumotlarni kiritish kerak.</p>}
                </Card>

                <Card title="Natijalar Nisbati" icon={<StrategyIcon />}>
                    <DonutChart data={winLossData} />
                </Card>
                
                <Card title="Strategik Risk Tahlili" icon={<PassportIcon />}>
                    <BarChart data={riskCategoryData.map(item => ({ label: item.label, value: item.value }))} color="#E74C3C" />
                    <div className="mt-4 text-center">
                        <div className="text-lg font-bold text-text-primary">Risk Indeksi: {avgRiskScore}/10</div>
                        <div className="text-sm text-text-secondary">O'rtacha portfolio riski</div>
                    </div>
                </Card>
                
                <Card title="Imkoniyatlar Matritsasi" icon={<TargetIcon />}>
                    <BarChart data={opportunityData.map(item => ({ label: item.label, value: item.value }))} color="#2ECC71" />
                    <div className="mt-4 text-center">
                        <div className="text-lg font-bold text-text-primary">Imkoniyat Indeksi: {avgOpportunityScore}/10</div>
                        <div className="text-sm text-text-secondary">O'rtacha portfolio potentsiali</div>
                    </div>
                </Card>
                
                 <Card title="Agentlar Samaradorligi" className="lg:col-span-3" icon={<UsersIcon />}>
                    {agentStats.length > 0 ? (
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-primary uppercase bg-black/20">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-l-lg">Agent</th>
                                        <th scope="col" className="px-6 py-3 text-center">Biriktirilgan</th>
                                        <th scope="col" className="px-6 py-3 text-center">Yutgan</th>
                                        <th scope="col" className="px-6 py-3 text-center rounded-r-lg">G'alaba Foizi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agentStats.map(agent => (
                                        <tr key={agent.name} className="bg-surface-solid border-b border-border last:border-0">
                                            <th scope="row" className="px-6 py-4 font-bold text-text-primary whitespace-nowrap">{agent.name}</th>
                                            <td className="px-6 py-4 text-center font-semibold">{agent.assigned}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-status-success">{agent.won}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-brand-secondary">{agent.winRate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    ) : <p className="text-center text-text-secondary text-sm">Agentlar statistikasini ko'rish uchun avval "Profil" bo'limida agentlarni qo'shing va ularga tenderlarni biriktiring.</p>}
                </Card>

                <Card title="Mijozlar Bo'yicha Tahlil (Top 10)" className="lg:col-span-3" icon={<PassportIcon />}>
                        {sortedCustomers.length > 0 ? (
                        <div className="space-y-3">
                            {sortedCustomers.map(([name, data]) => (
                                    <div key={name} className="flex items-center gap-2">
                                    <span className="text-sm font-semibold w-32 text-right truncate" title={name}>{name}</span>
                                    <div className="flex-grow flex bg-gray-800/70 rounded-full h-6 overflow-hidden">
                                            <div className="h-6 text-white text-xs flex items-center justify-center font-bold" style={{ width: `${((data as {won: number, total: number}).won / (data as {won: number, total: number}).total) * 100}%`, backgroundColor: '#2ECC71' }} title={`Yutgan: ${(data as {won: number}).won}`}>{(data as {won: number}).won > 0 ? (data as {won: number}).won : ''}</div>
                                            <div className="h-6 text-white text-xs flex items-center justify-center font-bold" style={{ width: `${((data as {lost: number, total: number}).lost / (data as {lost: number, total: number}).total) * 100}%`, backgroundColor: '#E74C3C' }} title={`Yutqazgan: ${(data as {lost: number}).lost}`}>{(data as {lost: number}).lost > 0 ? (data as {lost: number}).lost : ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary">Ma'lumot yo'q</p>
                    )}
                </Card>
                
                <Card title={<div className='flex items-center'>Risk vs Imkoniyat Xaritasi <InfoTooltip text="Bu xarita sizning barcha tahlillaringizni risk va imkoniyat darajasiga ko'ra vizual joylashtiradi. Ideal tahlillar yuqori chap burchakda (yuqori imkoniyat, past risk) joylashgan bo'ladi. Nuqtaga bosib, tegishli tahlilga o'tishingiz mumkin." /></div>} className="lg:col-span-3" icon={<TargetIcon />}>
                        <div className="relative w-full h-80 bg-black/20 rounded-lg p-4 border border-border">
                        {/* Background Grid and Labels */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                            {[...Array(15)].map((_, i) => <div key={i} className="border-r border-b border-white/5"></div>)}
                        </div>
                        {filteredTenders.filter(t => !t.isArchived).map(t => (
                            <button
                                key={t.id}
                                onClick={() => onSelectTender(t)}
                                className="absolute w-3 h-3 rounded-full transition-transform hover:scale-150 group z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-brand-primary"
                                style={{ 
                                    left: `${t.opportunityScore}%`, 
                                    bottom: `${t.riskScore}%`, 
                                    backgroundColor: t.status === 'Won' ? '#2ECC71' : t.status === 'Lost' ? '#E74C3C' : '#95A5A6',
                                    transform: 'translate(-50%, 50%)'
                                }}
                                aria-label={`Tender: ${t.lotPassport.itemName}`}
                            >
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-surface text-text-primary text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-border">
                                    {t.lotPassport.itemName}
                                    <br/>
                                    <span className="text-gray-300">(Risk: {t.riskScore}, Imk: {t.opportunityScore})</span>
                                </div>
                            </button>
                        ))}
                        <span className="absolute -bottom-1 right-0 text-xs text-text-secondary translate-y-full">Imkoniyat →</span>
                            <span className="absolute top-0 -left-1 text-xs text-text-secondary -translate-x-full" style={{writingMode: 'vertical-lr', transform: 'rotate(180deg) translateX(50%)'}}>Risk →</span>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-status-success"></div> Yutgan</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-status-danger"></div> Yutqazgan</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div> Boshqa</span>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Analytics;