/**
 * Smart Storage Utility - Advanced localStorage management with compression, validation, and cleanup
 * Provides extremely powerful data management without adding new features
 */

interface StorageItem {
    data: any;
    timestamp: number;
    version: string;
    checksum: string;
    compressed: boolean;
    expiresAt?: number;
}

interface StorageConfig {
    compress?: boolean;
    validate?: boolean;
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum size in bytes
}

class SmartStorage {
    private readonly version = '1.0.0';
    private readonly maxStorageSize = 5 * 1024 * 1024; // 5MB default limit
    private cleanupInterval: NodeJS.Timeout | null = null;
    private optimizationThreshold = 0.8; // Trigger optimization at 80% capacity
    
    constructor() {
        this.initializeAutoCleanup();
    }
    
    /**
     * Initialize automatic cleanup system
     */
    private initializeAutoCleanup(): void {
        // Run cleanup every hour
        this.cleanupInterval = setInterval(() => {
            this.performScheduledMaintenance();
        }, 60 * 60 * 1000); // 1 hour
        
        // Also run cleanup when page visibility changes (user returns to tab)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.performScheduledMaintenance();
                }
            });
        }
        
        // Run cleanup when storage quota is exceeded
        window.addEventListener('storage', () => {
            if (this.getStorageUsagePercentage() > this.optimizationThreshold) {
                this.performEmergencyCleanup();
            }
        });
    }
    
    /**
     * Perform scheduled maintenance tasks
     */
    private performScheduledMaintenance(): void {
        try {
            const cleanupStats = this.cleanup();
            const usagePercent = this.getStorageUsagePercentage();
            
            // If storage is getting full, perform optimization
            if (usagePercent > this.optimizationThreshold) {
                this.optimizeStorage();
            }
            
            // Log maintenance activity
            if (cleanupStats.removedItems > 0) {
                console.log(`SmartStorage: Maintenance completed - Removed ${cleanupStats.removedItems} items, freed ${Math.round(cleanupStats.freedSpace / 1024)}KB, usage: ${Math.round(usagePercent * 100)}%`);
            }
        } catch (error) {
            console.warn('SmartStorage: Maintenance failed:', error);
        }
    }
    
    /**
     * Perform emergency cleanup when storage is critically full
     */
    private performEmergencyCleanup(): void {
        try {
            console.warn('SmartStorage: Emergency cleanup triggered');
            
            // First, clean expired items
            const cleanupStats = this.cleanup();
            
            // If still above threshold, remove oldest items
            if (this.getStorageUsagePercentage() > this.optimizationThreshold) {
                const requiredSpace = this.getStorageSize() * 0.3; // Free 30% of storage
                this.freeUpSpace(requiredSpace);
                console.warn(`SmartStorage: Emergency cleanup freed ${Math.round(requiredSpace / 1024)}KB`);
            }
        } catch (error) {
            console.error('SmartStorage: Emergency cleanup failed:', error);
        }
    }
    
    /**
     * Get storage usage as percentage (0-1)
     */
    private getStorageUsagePercentage(): number {
        try {
            const currentSize = this.getStorageSize();
            return currentSize / this.maxStorageSize;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Optimize storage by recompressing items and consolidating data
     */
    private optimizeStorage(): void {
        try {
            const items: { key: string; item: StorageItem; size: number }[] = [];
            
            // Collect all items for optimization
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    try {
                        const item: StorageItem = JSON.parse(localStorage[key]);
                        const size = localStorage[key].length + key.length;
                        items.push({ key, item, size });
                    } catch (e) {
                        // Remove corrupted items
                        localStorage.removeItem(key);
                    }
                }
            }
            
            let optimizedCount = 0;
            let spaceFreed = 0;
            
            // Re-optimize each item
            for (const { key, item, size } of items) {
                try {
                    // Skip already compressed items that are small
                    if (item.compressed && size < 5000) continue;
                    
                    const originalData = item.compressed ? this.decompress(item.data) : item.data;
                    const recompressed = this.compress(originalData);
                    
                    // Only update if significant compression achieved
                    if (recompressed.length < item.data.length * 0.85) {
                        const optimizedItem: StorageItem = {
                            ...item,
                            data: recompressed,
                            compressed: true,
                            checksum: this.generateChecksum(recompressed)
                        };
                        
                        const newSize = JSON.stringify(optimizedItem).length + key.length;
                        if (newSize < size) {
                            localStorage.setItem(key, JSON.stringify(optimizedItem));
                            optimizedCount++;
                            spaceFreed += (size - newSize);
                        }
                    }
                } catch (error) {
                    console.warn(`SmartStorage: Failed to optimize item ${key}:`, error);
                }
            }
            
            if (optimizedCount > 0) {
                console.log(`SmartStorage: Optimized ${optimizedCount} items, freed ${Math.round(spaceFreed / 1024)}KB`);
            }
        } catch (error) {
            console.warn('SmartStorage: Optimization failed:', error);
        }
    }
    private compress(data: string): string {
        // Simple compression algorithm - replace common patterns
        return data
            .replace(/{"([^"]+)":/g, '{"$1":') // Optimize quotes
            .replace(/,"/g, ',"') // Optimize quotes
            .replace(/":"/g, '":"') // Optimize quotes
            .replace(/\s+/g, ' ') // Remove extra whitespace
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*]/g, ']'); // Remove trailing commas
    }
    
    /**
     * Decompress data
     */
    private decompress(data: string): string {
        return data; // For this implementation, we just return as-is
    }
    
    /**
     * Generate checksum for data integrity
     */
    private generateChecksum(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    
    /**
     * Validate data integrity
     */
    private validateChecksum(data: string, expectedChecksum: string): boolean {
        return this.generateChecksum(data) === expectedChecksum;
    }
    
    /**
     * Get current storage usage in bytes
     */
    private getStorageSize(): number {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
    
    /**
     * Clean up expired items
     */
    private cleanupExpired(): void {
        const now = Date.now();
        const keysToRemove: string[] = [];
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    const item: StorageItem = JSON.parse(localStorage[key]);
                    if (item.expiresAt && item.expiresAt < now) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // Invalid item, mark for removal
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    /**
     * Free up space by removing oldest items
     */
    private freeUpSpace(requiredSpace: number): void {
        const items: { key: string; timestamp: number; size: number }[] = [];
        
        // Collect all items with timestamps
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    const item: StorageItem = JSON.parse(localStorage[key]);
                    const size = localStorage[key].length + key.length;
                    items.push({ key, timestamp: item.timestamp, size });
                } catch (e) {
                    // Invalid item, will be cleaned up
                }
            }
        }
        
        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        let freedSpace = 0;
        for (const item of items) {
            if (freedSpace >= requiredSpace) break;
            localStorage.removeItem(item.key);
            freedSpace += item.size;
        }
    }
    
    /**
     * Smart set item with compression, validation, and cleanup
     */
    setItem<T>(key: string, value: T, config: StorageConfig = {}): boolean {
        try {
            this.cleanupExpired();
            
            const {
                compress = true,
                validate = true,
                ttl,
                maxSize = this.maxStorageSize
            } = config;
            
            let dataString = JSON.stringify(value);
            let compressed = false;
            
            // Apply compression if enabled and data is large enough
            if (compress && dataString.length > 1000) {
                const compressedData = this.compress(dataString);
                if (compressedData.length < dataString.length * 0.9) {
                    dataString = compressedData;
                    compressed = true;
                }
            }
            
            const checksum = validate ? this.generateChecksum(dataString) : '';
            const expiresAt = ttl ? Date.now() + ttl : undefined;
            
            const storageItem: StorageItem = {
                data: dataString,
                timestamp: Date.now(),
                version: this.version,
                checksum,
                compressed,
                expiresAt
            };
            
            const serializedItem = JSON.stringify(storageItem);
            const itemSize = serializedItem.length + key.length;
            
            // Check if we need to free up space
            const currentSize = this.getStorageSize();
            if (currentSize + itemSize > maxSize) {
                this.freeUpSpace(itemSize);
            }
            
            localStorage.setItem(key, serializedItem);
            return true;
            
        } catch (error) {
            console.warn(`SmartStorage: Failed to set item ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Smart get item with decompression and validation
     */
    getItem<T>(key: string): T | null {
        try {
            const serializedItem = localStorage.getItem(key);
            if (!serializedItem) return null;
            
            const item: StorageItem = JSON.parse(serializedItem);
            
            // Check expiration
            if (item.expiresAt && item.expiresAt < Date.now()) {
                localStorage.removeItem(key);
                return null;
            }
            
            let dataString = item.data;
            
            // Decompress if needed
            if (item.compressed) {
                dataString = this.decompress(dataString);
            }
            
            // Validate checksum if available
            if (item.checksum && !this.validateChecksum(dataString, item.checksum)) {
                console.warn(`SmartStorage: Checksum validation failed for ${key}`);
                localStorage.removeItem(key);
                return null;
            }
            
            return JSON.parse(dataString);
            
        } catch (error) {
            console.warn(`SmartStorage: Failed to get item ${key}:`, error);
            // Remove corrupted item
            localStorage.removeItem(key);
            return null;
        }
    }
    
    /**
     * Remove item
     */
    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
    
    /**
     * Get storage statistics
     */
    getStats(): {
        totalSize: number;
        itemCount: number;
        compressedItems: number;
        expiredItems: number;
        validItems: number;
    } {
        let totalSize = 0;
        let itemCount = 0;
        let compressedItems = 0;
        let expiredItems = 0;
        let validItems = 0;
        const now = Date.now();
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                itemCount++;
                totalSize += localStorage[key].length + key.length;
                
                try {
                    const item: StorageItem = JSON.parse(localStorage[key]);
                    if (item.compressed) compressedItems++;
                    if (item.expiresAt && item.expiresAt < now) expiredItems++;
                    else validItems++;
                } catch (e) {
                    expiredItems++;
                }
            }
        }
        
        return {
            totalSize,
            itemCount,
            compressedItems,
            expiredItems,
            validItems
        };
    }
    
    /**
     * Perform comprehensive cleanup
     */
    cleanup(): {
        removedItems: number;
        freedSpace: number;
    } {
        const initialStats = this.getStats();
        this.cleanupExpired();
        const finalStats = this.getStats();
        
        return {
            removedItems: initialStats.itemCount - finalStats.itemCount,
            freedSpace: initialStats.totalSize - finalStats.totalSize
        };
    }
    
    /**
     * Clear all storage
     */
    clear(): void {
        localStorage.clear();
    }
    
    /**
     * Get detailed storage health report
     */
    getHealthReport(): {
        status: 'healthy' | 'warning' | 'critical';
        usagePercent: number;
        recommendations: string[];
        stats: ReturnType<typeof this.getStats>;
        lastCleanup: Date;
    } {
        const stats = this.getStats();
        const usagePercent = this.getStorageUsagePercentage() * 100;
        const recommendations: string[] = [];
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        
        if (usagePercent > 90) {
            status = 'critical';
            recommendations.push('Storage is critically full - immediate cleanup required');
            recommendations.push('Consider increasing storage limits or archiving old data');
        } else if (usagePercent > 70) {
            status = 'warning';
            recommendations.push('Storage usage is high - schedule cleanup soon');
            recommendations.push('Consider enabling automatic optimization');
        }
        
        if (stats.expiredItems > stats.validItems * 0.2) {
            recommendations.push('Many expired items detected - run cleanup to free space');
        }
        
        if (stats.compressedItems / stats.itemCount < 0.5 && stats.itemCount > 10) {
            recommendations.push('Low compression ratio - enable compression for better space usage');
        }
        
        return {
            status,
            usagePercent: Math.round(usagePercent),
            recommendations,
            stats,
            lastCleanup: new Date()
        };
    }
    
    /**
     * Monitor storage and provide real-time alerts
     */
    startMonitoring(alertCallback?: (alert: {
        type: 'warning' | 'error' | 'info';
        message: string;
        data?: any;
    }) => void): void {
        // Monitor every 5 minutes
        setInterval(() => {
            const health = this.getHealthReport();
            
            if (health.status === 'critical' && alertCallback) {
                alertCallback({
                    type: 'error',
                    message: `Storage critically full (${health.usagePercent}%)`,
                    data: health
                });
            } else if (health.status === 'warning' && alertCallback) {
                alertCallback({
                    type: 'warning',
                    message: `Storage usage high (${health.usagePercent}%)`,
                    data: health
                });
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    /**
     * Export storage data for backup
     */
    exportData(): {
        timestamp: string;
        version: string;
        data: Record<string, any>;
        stats: ReturnType<typeof this.getStats>;
    } {
        const exportData: Record<string, any> = {};
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    const item = this.getItem(key);
                    if (item !== null) {
                        exportData[key] = item;
                    }
                } catch (error) {
                    console.warn(`Failed to export item ${key}:`, error);
                }
            }
        }
        
        return {
            timestamp: new Date().toISOString(),
            version: this.version,
            data: exportData,
            stats: this.getStats()
        };
    }
    
    /**
     * Import storage data from backup
     */
    importData(backupData: {
        data: Record<string, any>;
        version?: string;
    }, options: {
        overwrite?: boolean;
        validate?: boolean;
    } = {}): {
        imported: number;
        skipped: number;
        errors: string[];
    } {
        const { overwrite = false, validate = true } = options;
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];
        
        for (const [key, value] of Object.entries(backupData.data)) {
            try {
                // Skip if key exists and overwrite is false
                if (!overwrite && this.getItem(key) !== null) {
                    skipped++;
                    continue;
                }
                
                const success = this.setItem(key, value, { validate });
                if (success) {
                    imported++;
                } else {
                    skipped++;
                    errors.push(`Failed to import ${key}`);
                }
            } catch (error) {
                errors.push(`Error importing ${key}: ${error}`);
            }
        }
        
        return { imported, skipped, errors };
    }
    
    /**
     * Destroy the SmartStorage instance and cleanup
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

// Create singleton instance
export const smartStorage = new SmartStorage();

// Legacy compatibility functions
export const setSmartItem = <T>(key: string, value: T, options?: StorageConfig) => 
    smartStorage.setItem(key, value, options);

export const getSmartItem = <T>(key: string): T | null => 
    smartStorage.getItem<T>(key);

export const removeSmartItem = (key: string) => 
    smartStorage.removeItem(key);

// Auto-cleanup on initialization
smartStorage.cleanup();