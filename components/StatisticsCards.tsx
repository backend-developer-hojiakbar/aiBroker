import React from 'react';
import { t } from '../utils/translations';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, className = '' }) => {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">
          {title}
        </CardTitle>
        {icon && <div className="text-brand-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {t('from-last-period')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

type StatisticsCardsProps = {
  stats: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t('dashboard-total-contracts')}
        value={stats.total}
        change={12.5}
        className="border-l-4 border-brand-primary"
      />
      <StatCard
        title={t('dashboard-active-contracts')}
        value={stats.active}
        change={5.2}
        className="border-l-4 border-status-success"
      />
      <StatCard
        title={t('dashboard-completed-contracts')}
        value={stats.completed}
        change={-2.3}
        className="border-l-4 border-status-info"
      />
      <StatCard
        title={t('dashboard-cancelled-contracts')}
        value={stats.cancelled}
        change={1.8}
        className="border-l-4 border-status-warning"
      />
    </div>
  );
};

export default StatisticsCards;
