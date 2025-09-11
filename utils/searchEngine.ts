/**
 * Advanced Search Engine - Debounced search with instant results and fuzzy matching
 * Provides extremely powerful search capabilities without adding new features
 */

interface SearchableItem {
    id: string;
    [key: string]: any;
}

interface SearchConfig {
    debounceMs?: number;
    fuzzyThreshold?: number;
    maxResults?: number;
    caseSensitive?: boolean;
    includeScore?: boolean;
    searchFields?: string[];
    exactMatchBoost?: number;
    partialMatchBoost?: number;
}

interface SearchResult<T> {
    item: T;
    score: number;
    matchedFields: string[];
    highlights: Record<string, string>;
}

interface SearchResponse<T> {
    results: SearchResult<T>[];
    totalCount: number;
    searchTime: number;
    query: string;
    suggestions?: string[];
}

class AdvancedSearchEngine<T extends SearchableItem> {
    private searchFields: string[];
    private fuzzyThreshold: number;
    private maxResults: number;
    private caseSensitive: boolean;
    private exactMatchBoost: number;
    private partialMatchBoost: number;
    private searchHistory: string[] = [];
    private searchCache: Map<string, SearchResponse<T>> = new Map();
    private debounceTimer: NodeJS.Timeout | null = null;

    constructor(config: SearchConfig = {}) {
        this.searchFields = config.searchFields || [];
        this.fuzzyThreshold = config.fuzzyThreshold || 0.6;
        this.maxResults = config.maxResults || 50;
        this.caseSensitive = config.caseSensitive || false;
        this.exactMatchBoost = config.exactMatchBoost || 2.0;
        this.partialMatchBoost = config.partialMatchBoost || 1.5;
    }

    /**
     * Debounced search with caching
     */
    search(
        query: string,
        items: T[],
        config?: SearchConfig,
        callback?: (results: SearchResponse<T>) => void
    ): Promise<SearchResponse<T>> {
        return new Promise((resolve) => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            const debounceMs = config?.debounceMs || 300;

            this.debounceTimer = setTimeout(() => {
                const results = this.performSearch(query, items, config);
                
                // Add to search history
                if (query.trim() && !this.searchHistory.includes(query.trim())) {
                    this.searchHistory.unshift(query.trim());
                    this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10 searches
                }

                if (callback) callback(results);
                resolve(results);
            }, debounceMs);
        });
    }

    /**
     * Instant search (no debouncing) for real-time results
     */
    instantSearch(query: string, items: T[], config?: SearchConfig): SearchResponse<T> {
        return this.performSearch(query, items, config);
    }

    /**
     * Perform the actual search with fuzzy matching and scoring
     */
    private performSearch(query: string, items: T[], config?: SearchConfig): SearchResponse<T> {
        const startTime = performance.now();
        
        if (!query.trim()) {
            return {
                results: items.slice(0, this.maxResults).map(item => ({
                    item,
                    score: 1,
                    matchedFields: [],
                    highlights: {}
                })),
                totalCount: items.length,
                searchTime: performance.now() - startTime,
                query: query
            };
        }

        // Check cache first
        const cacheKey = `${query.toLowerCase()}_${JSON.stringify(config || {})}`;
        if (this.searchCache.has(cacheKey)) {
            const cached = this.searchCache.get(cacheKey)!;
            return {
                ...cached,
                searchTime: performance.now() - startTime
            };
        }

        const searchTerms = this.tokenizeQuery(query);
        const results: SearchResult<T>[] = [];

        for (const item of items) {
            const searchResult = this.scoreItem(item, searchTerms, config);
            if (searchResult.score > 0) {
                results.push(searchResult);
            }
        }

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        const finalResults = results.slice(0, this.maxResults);
        const response: SearchResponse<T> = {
            results: finalResults,
            totalCount: results.length,
            searchTime: performance.now() - startTime,
            query: query,
            suggestions: this.generateSuggestions(query, items)
        };

        // Cache the results
        this.searchCache.set(cacheKey, response);
        
        // Clear cache if it gets too large
        if (this.searchCache.size > 100) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        return response;
    }

    /**
     * Score an individual item against search terms
     */
    private scoreItem(item: T, searchTerms: string[], config?: SearchConfig): SearchResult<T> {
        let totalScore = 0;
        const matchedFields: string[] = [];
        const highlights: Record<string, string> = {};
        
        const fieldsToSearch = this.searchFields.length > 0 
            ? this.searchFields 
            : this.getSearchableFields(item);

        for (const field of fieldsToSearch) {
            const fieldValue = this.getNestedValue(item, field);
            if (fieldValue == null) continue;

            const stringValue = String(fieldValue);
            const fieldScore = this.scoreField(stringValue, searchTerms, field);
            
            if (fieldScore.score > 0) {
                totalScore += fieldScore.score;
                matchedFields.push(field);
                if (fieldScore.highlight) {
                    highlights[field] = fieldScore.highlight;
                }
            }
        }

        return {
            item,
            score: totalScore,
            matchedFields,
            highlights
        };
    }

    /**
     * Score a field against search terms with fuzzy matching
     */
    private scoreField(value: string, searchTerms: string[], fieldName: string): {
        score: number;
        highlight?: string;
    } {
        if (!value) return { score: 0 };

        const normalizedValue = this.caseSensitive ? value : value.toLowerCase();
        let fieldScore = 0;
        let highlight = value;

        for (const term of searchTerms) {
            const normalizedTerm = this.caseSensitive ? term : term.toLowerCase();
            
            // Exact match
            if (normalizedValue === normalizedTerm) {
                fieldScore += this.exactMatchBoost * 10;
                highlight = this.highlightMatch(value, term, 'exact');
                continue;
            }

            // Starts with
            if (normalizedValue.startsWith(normalizedTerm)) {
                fieldScore += this.partialMatchBoost * 8;
                highlight = this.highlightMatch(value, term, 'prefix');
                continue;
            }

            // Contains
            if (normalizedValue.includes(normalizedTerm)) {
                fieldScore += this.partialMatchBoost * 5;
                highlight = this.highlightMatch(value, term, 'contains');
                continue;
            }

            // Fuzzy match
            const fuzzyScore = this.calculateFuzzyScore(normalizedValue, normalizedTerm);
            if (fuzzyScore >= this.fuzzyThreshold) {
                fieldScore += fuzzyScore * 3;
                highlight = this.highlightMatch(value, term, 'fuzzy');
            }
        }

        // Boost score for important fields
        const importantFields = ['itemName', 'title', 'name', 'customerName'];
        if (importantFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()))) {
            fieldScore *= 1.5;
        }

        return { score: fieldScore, highlight: fieldScore > 0 ? highlight : undefined };
    }

    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    private calculateFuzzyScore(str1: string, str2: string): number {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLength);
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Tokenize search query into individual terms
     */
    private tokenizeQuery(query: string): string[] {
        return query
            .trim()
            .split(/\s+/)
            .filter(term => term.length > 0)
            .map(term => this.caseSensitive ? term : term.toLowerCase());
    }

    /**
     * Get searchable fields from an item
     */
    private getSearchableFields(item: T): string[] {
        const fields: string[] = [];
        
        const addFields = (obj: any, prefix = '') => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const fieldPath = prefix ? `${prefix}.${key}` : key;
                    
                    if (typeof value === 'string' || typeof value === 'number') {
                        fields.push(fieldPath);
                    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                        addFields(value, fieldPath);
                    }
                }
            }
        };
        
        addFields(item);
        return fields;
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Highlight matching text
     */
    private highlightMatch(text: string, term: string, matchType: 'exact' | 'prefix' | 'contains' | 'fuzzy'): string {
        if (!term) return text;
        
        const flags = this.caseSensitive ? 'g' : 'gi';
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        try {
            switch (matchType) {
                case 'exact':
                case 'prefix':
                case 'contains':
                    return text.replace(new RegExp(escapedTerm, flags), `<mark>$&</mark>`);
                case 'fuzzy':
                    // For fuzzy matches, just highlight the whole text
                    return `<mark>${text}</mark>`;
                default:
                    return text;
            }
        } catch (error) {
            return text;
        }
    }

    /**
     * Generate search suggestions based on search history and available data
     */
    private generateSuggestions(query: string, items: T[]): string[] {
        const suggestions = new Set<string>();
        
        // Add from search history
        this.searchHistory
            .filter(historyItem => 
                historyItem.toLowerCase().includes(query.toLowerCase()) && 
                historyItem !== query
            )
            .slice(0, 3)
            .forEach(item => suggestions.add(item));

        // Add from common field values
        const commonFields = ['itemName', 'title', 'name', 'customerName', 'platform'];
        for (const field of commonFields) {
            for (const item of items.slice(0, 20)) { // Only check first 20 items for performance
                const value = this.getNestedValue(item, field);
                if (value && typeof value === 'string') {
                    if (value.toLowerCase().includes(query.toLowerCase()) && value !== query) {
                        suggestions.add(value);
                        if (suggestions.size >= 5) break;
                    }
                }
            }
            if (suggestions.size >= 5) break;
        }

        return Array.from(suggestions).slice(0, 5);
    }

    /**
     * Get search history
     */
    getSearchHistory(): string[] {
        return [...this.searchHistory];
    }

    /**
     * Clear search cache
     */
    clearCache(): void {
        this.searchCache.clear();
    }

    /**
     * Clear search history
     */
    clearHistory(): void {
        this.searchHistory = [];
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
        entries: number;
    } {
        return {
            size: this.searchCache.size,
            hitRate: 0, // Would need to track hits/misses for accurate calculation
            entries: this.searchCache.size
        };
    }
}

// Export singleton instances for different data types
export const tenderSearchEngine = new AdvancedSearchEngine({
    searchFields: [
        'lotPassport.itemName',
        'lotPassport.customerName', 
        'lotPassport.deadline',
        'platform',
        'analysisDate'
    ],
    fuzzyThreshold: 0.7,
    maxResults: 50,
    exactMatchBoost: 2.5,
    partialMatchBoost: 1.8
});

export const contractSearchEngine = new AdvancedSearchEngine({
    searchFields: [
        'contractTitle',
        'fileName',
        'overallRecommendation',
        'analysisDate'
    ],
    fuzzyThreshold: 0.6,
    maxResults: 30,
    exactMatchBoost: 2.0,
    partialMatchBoost: 1.5
});

export const competitorSearchEngine = new AdvancedSearchEngine({
    searchFields: [
        'companyName',
        'experience',
        'specialization'
    ],
    fuzzyThreshold: 0.8,
    maxResults: 20,
    exactMatchBoost: 3.0,
    partialMatchBoost: 2.0
});

export { AdvancedSearchEngine };
export type { SearchResult, SearchResponse, SearchConfig };