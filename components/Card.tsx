import React from 'react';
import { InfoIcon } from './Icons';

export const Card: React.FC<{ title: React.ReactNode; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-surface backdrop-blur-xl rounded-2xl shadow-soft p-6 animate-slide-up border border-border ${className}`}>
        {title && (
            <div className="flex items-center mb-4 text-brand-primary">
                {icon}
                <h3 className="ml-3 text-xl font-bold">{title}</h3>
            </div>
        )}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; children?: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="flex items-center mb-4 text-brand-primary">
        {icon}
        <h2 className="ml-3 text-2xl font-bold">{title}</h2>
        {children}
    </div>
);


export const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative flex items-center group ml-2">
        <InfoIcon className="text-text-secondary w-4 h-4 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-surface text-text-primary text-sm rounded-lg py-2 px-3 text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl border border-border">
            {text}
        </div>
    </div>
);