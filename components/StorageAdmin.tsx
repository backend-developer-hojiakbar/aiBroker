import React, { useState, useEffect, useCallback } from 'react';
import { smartStorage } from '../utils/smartStorage';
import { 
    Settings, TrashIcon, DownloadIcon, UploadIcon, RefreshIcon, 
    CheckCircleIcon, AlertIcon, XCircleIcon, BarChart3 
} from './Icons';

// Temporary CleanupIcon component
const CleanupIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface StorageAdminProps {
    onClose: () => void;
}

interface HealthReport {
    status: 'healthy' | 'warning' | 'critical';
    usagePercent: number;
    recommendations: string[];
    stats: {
        totalSize: number;
        itemCount: number;
        compressedItems: number;
        expiredItems: number;
        validItems: number;
    };
    lastCleanup: Date;
}

const StorageAdmin: React.FC<StorageAdminProps> = ({ onClose }) => {
    const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const refreshHealthReport = useCallback(() => {
        const report = smartStorage.getHealthReport();
        setHealthReport(report);
    }, []);

    useEffect(() => {
        refreshHealthReport();
        const interval = setInterval(refreshHealthReport, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [refreshHealthReport]);

    const handleCleanup = async () => {
        setIsLoading(true);
        try {
            const stats = smartStorage.cleanup();
            setLastAction(`Cleaned up ${stats.removedItems} expired items, freed ${Math.round(stats.freedSpace / 1024)}KB`);
            refreshHealthReport();
        } catch (error) {
            setLastAction(`Cleanup failed: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptimize = async () => {
        setIsLoading(true);
        try {
            // The optimization is now built into the SmartStorage class
            const initialStats = smartStorage.getStats();
            
            // Trigger manual optimization by getting health report
            refreshHealthReport();
            
            const finalStats = smartStorage.getStats();
            const spaceFreed = initialStats.totalSize - finalStats.totalSize;
            
            setLastAction(`Optimization complete. Space freed: ${Math.round(spaceFreed / 1024)}KB`);
        } catch (error) {
            setLastAction(`Optimization failed: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = () => {
        try {
            const exportData = smartStorage.exportData();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-broker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setLastAction('Data exported successfully');
            setShowExportModal(false);
        } catch (error) {
            setLastAction(`Export failed: ${error}`);
        }
    };

    const handleImportData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target?.result as string);
                const result = smartStorage.importData(backupData, { 
                    overwrite: false, 
                    validate: true 
                });
                setLastAction(`Import complete: ${result.imported} items imported, ${result.skipped} skipped, ${result.errors.length} errors`);
                refreshHealthReport();
                setShowImportModal(false);
            } catch (error) {
                setLastAction(`Import failed: ${error}`);
            }
        };
        reader.readAsText(file);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircleIcon className="text-status-success" />;
            case 'warning': return <AlertIcon className="text-status-warning" />;
            case 'critical': return <XCircleIcon className="text-status-danger" />;
            default: return <AlertIcon className="text-text-secondary" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-status-success bg-status-success/10 border-status-success';
            case 'warning': return 'text-status-warning bg-status-warning/10 border-status-warning';
            case 'critical': return 'text-status-danger bg-status-danger/10 border-status-danger';
            default: return 'text-text-secondary bg-background border-border';
        }
    };

    if (!healthReport) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-surface rounded-lg p-6">
                    <div className="animate-pulse">Loading storage admin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 w-full max-w-4xl shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-brand-primary" />
                        <h2 className="text-2xl font-bold text-text-primary">Storage Administration</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Health Status */}
                <div className={`p-4 rounded-xl border mb-6 ${getStatusColor(healthReport.status)}`}>
                    <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(healthReport.status)}
                        <h3 className="font-bold text-lg">Storage Health: {healthReport.status.toUpperCase()}</h3>
                        <div className="ml-auto text-sm">Usage: {healthReport.usagePercent}%</div>
                    </div>
                    
                    {/* Usage Bar */}
                    <div className="w-full bg-black/20 rounded-full h-3 mb-4">
                        <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                                healthReport.usagePercent > 90 ? 'bg-status-danger' :
                                healthReport.usagePercent > 70 ? 'bg-status-warning' : 'bg-status-success'
                            }`}
                            style={{ width: `${Math.min(healthReport.usagePercent, 100)}%` }}
                        />
                    </div>

                    {/* Recommendations */}
                    {healthReport.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Recommendations:</h4>
                            <ul className="space-y-1">
                                {healthReport.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-brand-primary">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-text-primary">{healthReport.stats.itemCount}</div>
                        <div className="text-sm text-text-secondary">Total Items</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-status-success">{healthReport.stats.validItems}</div>
                        <div className="text-sm text-text-secondary">Valid Items</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-status-warning">{healthReport.stats.expiredItems}</div>
                        <div className="text-sm text-text-secondary">Expired Items</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-brand-primary">{healthReport.stats.compressedItems}</div>
                        <div className="text-sm text-text-secondary">Compressed</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-text-primary">{Math.round(healthReport.stats.totalSize / 1024)}KB</div>
                        <div className="text-sm text-text-secondary">Total Size</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button
                        onClick={handleCleanup}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 p-3 bg-status-warning/20 text-status-warning hover:bg-status-warning/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <CleanupIcon className="w-5 h-5" />
                        Cleanup
                    </button>
                    <button
                        onClick={handleOptimize}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 p-3 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <BarChart3 className="w-5 h-5" />
                        Optimize
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center justify-center gap-2 p-3 bg-status-success/20 text-status-success hover:bg-status-success/30 rounded-lg transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center justify-center gap-2 p-3 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg transition-colors"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Import
                    </button>
                </div>

                {/* Last Action */}
                {lastAction && (
                    <div className="p-3 bg-black/20 rounded-lg border border-border/50">
                        <div className="text-sm text-text-secondary">Last Action:</div>
                        <div className="text-text-primary">{lastAction}</div>
                    </div>
                )}

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
                        <div className="bg-surface p-6 rounded-xl border border-border max-w-md w-full">
                            <h3 className="text-lg font-bold mb-4">Export Storage Data</h3>
                            <p className="text-text-secondary mb-4">
                                This will download all storage data as a JSON file. You can use this for backup or migration.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleExportData}
                                    className="flex-1 bg-brand-primary text-white p-3 rounded-lg hover:bg-brand-primary/80 transition-colors"
                                >
                                    Download Backup
                                </button>
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 bg-black/20 text-text-primary rounded-lg hover:bg-black/30 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
                        <div className="bg-surface p-6 rounded-xl border border-border max-w-md w-full">
                            <h3 className="text-lg font-bold mb-4">Import Storage Data</h3>
                            <p className="text-text-secondary mb-4">
                                Select a backup file to import. Existing data will not be overwritten.
                            </p>
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImportData(file);
                                }}
                                className="w-full p-3 bg-black/20 border border-border rounded-lg mb-4"
                            />
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="w-full bg-black/20 text-text-primary p-3 rounded-lg hover:bg-black/30 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageAdmin;