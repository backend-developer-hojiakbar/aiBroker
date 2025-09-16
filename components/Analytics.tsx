// C:/Users/Windows 11/Desktop/ai-broker/ai-broker/ai-broker-016/components/Analytics.tsx

import React, { useMemo } from 'react';
import type { AnalysisResult, CompanyProfile } from '../types';
import { Card } from './Card';
import { FinancialsIcon, StrategyIcon, TelescopeIcon, PassportIcon, TargetIcon, TrendingUpIcon, UsersIcon, DocumentIcon, GavelIcon, BalanceIcon } from './Icons';
import { t } from '../utils/translations';
import { InfoTooltip } from './InfoTooltip';

// =============================================================================
// YORDAMCHI KOMPONENTLAR (O'CHIB KETGAN QISMNI QAYTA TIKLASH)
// =============================================================================

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'brand-primary' 
}: { 
  title: string; 
  value: React.ReactNode; 
  icon: React.ReactNode; 
  color?: string 
}) => {
  const colorMap: Record<string, string> = {
    'brand-primary': 'from-blue-500 to-indigo-600',
    'status-success': 'from-emerald-500 to-teal-600',
    'status-warning': 'from-amber-400 to-orange-500',
    'status-danger': 'from-rose-500 to-pink-600',
  };

  const gradient = colorMap[color] || 'from-blue-500 to-indigo-600';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white flex-shrink-0 ml-4 shadow-md`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode 
}) => (
  <div className="mb-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  </div>
);


interface AnalyticsProps {
    tenders: AnalysisResult[];
    companyProfile: CompanyProfile | null;
    onShowCompetitors: () => void;
    onSelectTender: (tender: AnalysisResult) => void;
}

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <p className="text-center text-gray-500 dark:text-gray-400 p-8">{t('no-data')}</p>;

    let cumulativePercentage = 0;
    const chartData = data.map(item => {
        const percentage = (item.value / total) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        return {
            ...item,
            percentage,
            start,
            end: cumulativePercentage,
        };
    });

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 p-4">
            <div className="relative w-48 h-48 group">
                <div 
                    className="relative w-full h-full rounded-full transition-all duration-700 ease-in-out transform group-hover:scale-105"
                    style={{
                        background: 'conic-gradient(' + 
                            chartData.map(item => 
                                `${item.color} ${item.start}% ${item.end}%`
                            ).join(', ') + ')'
                    }}
                >
                    <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 shadow-inner" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{total}</div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('total-label')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4 w-full max-w-xs">
                {chartData.map((item) => {
                    const percentage = item.percentage.toFixed(1);
                    return (
                        <div key={item.label} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-125"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                                    {percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 8px ${item.color}80`
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number; }[], color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);
    if (data.every(d => d.value === 0)) return <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('no-data')}</p>;
    
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    return (
        <div className="space-y-4">
            {sortedData.map((item) => {
                const percentage = (item.value / maxValue) * 100;
                const barWidth = `${Math.max(5, percentage)}%`;
                
                return (
                    <div key={item.label} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span 
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" 
                                title={item.label}
                            >
                                {item.label}
                            </span>
                            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {item.value}
                            </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: barWidth,
                                    backgroundColor: color,
                                    backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color}BB 100%)`,
                                    boxShadow: `0 0 10px ${color}80`,
                                    minWidth: '1.5rem'
                                }}
                            >
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const parseCurrency = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
}

const Analytics: React.FC<AnalyticsProps> = ({ tenders, companyProfile, onShowCompetitors, onSelectTender }) => {
    const [selectedPlatform, setSelectedPlatform] = React.useState<string>('all');
    
    const filteredTenders = useMemo(() => {
        if (selectedPlatform === 'all') return tenders;
        return tenders.filter(tender => tender.platform === selectedPlatform);
    }, [tenders, selectedPlatform]);
    
    const totalTenders = filteredTenders.length;
    const wonCount = filteredTenders.filter(t => t.status === 'Won').length;
    const lostCount = filteredTenders.filter(t => t.status === 'Lost').length;
    const participatedCount = wonCount + lostCount;
    const winRate = participatedCount > 0 ? ((wonCount / participatedCount) * 100).toFixed(1) : '0.0';
    const othersCount = totalTenders - participatedCount;
    
    const winLossData = [
        { label: t('won'), value: wonCount, color: '#10B981' },
        { label: t('losses'), value: lostCount, color: '#EF4444' },
        { label: t('other-status'), value: othersCount, color: '#6B7280' },
    ];
    
    const platforms = Array.from(new Set(tenders.map(t => t.platform)));
    
    const riskCategoryData = [
        { label: `${t('high-risk')} (8-10)`, value: filteredTenders.filter(t => (t.riskScore || 0) >= 8).length },
        { label: `${t('medium-risk')} (5-7)`, value: filteredTenders.filter(t => (t.riskScore || 0) >= 5 && (t.riskScore || 0) < 8).length },
        { label: `${t('low-risk')} (1-4)`, value: filteredTenders.filter(t => (t.riskScore || 0) > 0 && (t.riskScore || 0) < 5).length },
    ];
      
    const opportunityData = [
        { label: `${t('high-opportunity')} (8-10)`, value: filteredTenders.filter(t => (t.opportunityScore || 0) >= 8).length },
        { label: `${t('medium-opportunity')} (5-7)`, value: filteredTenders.filter(t => (t.opportunityScore || 0) >= 5 && (t.opportunityScore || 0) < 8).length },
        { label: `${t('low-opportunity')} (1-4)`, value: filteredTenders.filter(t => (t.opportunityScore || 0) > 0 && (t.opportunityScore || 0) < 5).length },
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
            const winRateValue = assignedTenders.length > 0 ? (won / assignedTenders.length) * 100 : 0;
            return { name: agent.name, assigned: assignedTenders.length, won, winRate: winRateValue.toFixed(1) + '%' };
        }).sort((a,b) => b.assigned - a.assigned);

        return { 
            customerData, 
            financialData,
            agentStats,
        };
    }, [filteredTenders, companyProfile, tenders]);
    
    const sortedCustomers = Object.entries(customerData).sort(([,a], [,b]) => b.total - a.total).slice(0, 10);
    const isTotalProfitPositive = financialData.totalProfit >= 0;

    return (
        <div className="space-y-8 animate-fade-in p-4 md:p-6">
            <SectionHeader
                title={t('analytics-title')}
                description={t('welcome-description')}
                action={
                    <button 
                        onClick={onShowCompetitors}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <TelescopeIcon className="w-5 h-5"/> {t('competitor-analysis-button')}
                    </button>
                }
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <label htmlFor="platform-filter" className="sr-only">{t('platform-filter')}</label>
                <select
                    id="platform-filter"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">{t('all-platforms')}</option>
                    {platforms.map(platform => (
                        <option key={platform} value={platform}>
                            {platform}
                        </option>
                    ))}
                </select>
                {selectedPlatform !== 'all' && (
                    <div className="mt-3 text-center">
                        <button 
                            onClick={() => setSelectedPlatform('all')}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {t('remove-filter')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('total-analyses')} value={totalTenders} icon={<DocumentIcon />} color="brand-primary" />
                <StatCard title={t('wins')} value={wonCount} icon={<GavelIcon />} color="status-success" />
                <StatCard title={t('losses')} value={lostCount} icon={<BalanceIcon />} color="status-danger" />
                <StatCard title={t('win-rate')} value={`${winRate}%`} icon={<TrendingUpIcon />} color="status-warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('results-ratio')}</h3>
                    <DonutChart data={winLossData} />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('financial-indicators')}</h3>
                    {wonCount > 0 ? (
                        <div className="space-y-6 flex flex-col justify-center h-full">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{isTotalProfitPositive ? t('total-profit') : t('total-loss')}</p>
                                <p className={`text-3xl font-bold ${isTotalProfitPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{financialData.totalProfit.toLocaleString('fr-FR')} UZS</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('avg-profit-margin')}</p>
                                <p className="text-3xl font-bold text-amber-500">{financialData.avgProfitMargin.toFixed(1)}%</p>
                            </div>
                        </div>
                    ) : <p className="text-center text-gray-500 dark:text-gray-400 text-sm h-full flex items-center justify-center">{t('financial-analysis-note')}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">{t('strategic-risk')} <InfoTooltip text={t('risk-index')} /></h3>
                    <BarChart data={riskCategoryData} color="#EF4444" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">{t('opportunities-matrix')} <InfoTooltip text={t('opportunity-index')} /></h3>
                    <BarChart data={opportunityData} color="#10B981" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('agent-performance')}</h3>
                {agentStats.length > 0 ? (
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('agent-label')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('assigned')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('won')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('win-rate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentStats.map(agent => (
                                    <tr key={agent.name} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{agent.name}</th>
                                        <td className="px-6 py-4 text-center">{agent.assigned}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-emerald-500">{agent.won}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-indigo-500">{agent.winRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                       </table>
                    </div>
                ) : <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">{t('agent-analysis-note')}</p>}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('customer-analysis')}</h3>
                {sortedCustomers.length > 0 ? (
                    <div className="space-y-4">
                        {sortedCustomers.map(([name, data]) => (
                            <div key={name}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={name}>{name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{data.won} / {data.total}</p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{width: `${(data.won / data.total) * 100}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">{t('no-data')}</p>
                )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>{t('risk-vs-opportunity')} <InfoTooltip text={t('risk-opportunity-map-tooltip')} /></h3>
                <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="absolute inset-4 grid grid-cols-10 grid-rows-10">
                        {[...Array(100)].map((_, i) => <div key={i} className="border-r border-b border-gray-200/50 dark:border-gray-700/50"></div>)}
                    </div>
                    {filteredTenders.filter(t => !t.isArchived && t.riskScore && t.opportunityScore).map(t => (
                        <button
                            key={t.id}
                            onClick={() => onSelectTender(t)}
                            className="absolute w-3 h-3 rounded-full transition-all duration-300 hover:scale-[1.75] hover:z-20 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900/50 focus:ring-indigo-500"
                            style={{ 
                                left: `calc(${(t.opportunityScore || 0) * 10}% - 6px)`, 
                                bottom: `calc(${(t.riskScore || 0) * 10}% - 6px)`, 
                                backgroundColor: t.status === 'Won' ? '#10B981' : t.status === 'Lost' ? '#EF4444' : '#6B7280',
                            }}
                            aria-label={`Tender: ${t.lotPassport.itemName}`}
                        >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg border border-gray-200 dark:border-gray-700">
                                {t.lotPassport.itemName}
                                <br/>
                                <span className="text-gray-500 dark:text-gray-400">({t('avg-risk')}: {t.riskScore}, {t('opportunity')}: {t.opportunityScore})</span>
                            </div>
                        </button>
                    ))}
                    <span className="absolute -bottom-2 right-4 text-xs text-gray-500 dark:text-gray-400 translate-y-full">{t('opportunity-axis')}</span>
                    <span className="absolute top-1/2 -left-2 text-xs text-gray-500 dark:text-gray-400 -translate-x-full -translate-y-1/2 transform -rotate-90">{t('risk-axis')}</span>
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> {t('won')}</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> {t('losses')}</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div> {t('other-status')}</span>
                </div>
            </div>

        </div>
    );
};

export default Analytics;