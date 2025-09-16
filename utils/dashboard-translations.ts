import { t } from './translations';

// Dashboard Statistics
export const getDashboardTranslations = () => ({
    totalContracts: {
        title: t('dashboard-total-contracts'),
        description: 'Jami shartnomalar soni',
    },
    activeContracts: {
        title: t('dashboard-active-contracts'),
        description: 'Faol shartnomalar soni',
    },
    completedContracts: {
        title: t('dashboard-completed-contracts'),
        description: 'Yakunlangan shartnomalar',
    },
    cancelledContracts: {
        title: t('dashboard-cancelled-contracts'),
        description: 'Bekor qilingan shartnomalar',
    },
});

// Contract Statuses
export const getContractStatusTranslations = () => ({
    draft: t('status-draft'),
    active: t('status-active'),
    pending: t('status-pending'),
    completed: t('status-completed'),
    terminated: t('status-terminated'),
});

// Contract Actions
export const getContractActionTranslations = () => ({
    view: t('view-contract'),
    download: t('download-pdf'),
    share: t('share-contract'),
});

// Contract Details
export const getContractDetailTranslations = () => ({
    number: t('contract-number'),
    date: t('contract-date'),
    value: t('contract-value'),
    counterparty: t('counterparty'),
});

// Contract Filters
export const getFilterTranslations = () => ({
    byStatus: t('filter-by-status'),
    byDate: t('filter-by-date'),
    all: t('filter-all'),
});

// Contract Alerts
export const getAlertTranslations = () => ({
    upcomingPayment: t('upcoming-payment'),
    contractExpiring: t('contract-expiring'),
});

// Contract Analysis
export const getAnalysisTranslations = () => ({
    riskLevel: t('risk-level'),
    keyClauses: t('key-clauses'),
    recommendations: t('recommendations'),
});
