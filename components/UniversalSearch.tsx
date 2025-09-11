import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AdvancedSearchEngine, SearchResult, SearchResponse } from '../utils/searchEngine';
import { SearchIcon, XIcon, ClockIcon, TrendingUpIcon, FilterIcon } from './Icons';

interface UniversalSearchProps<T> {
    items: T[];
    searchEngine: AdvancedSearchEngine<T>;
    placeholder?: string;
    onResultSelect?: (item: T) => void;
    onSearchChange?: (query: string, results: SearchResult<T>[]) => void;
    className?: string;
    showSuggestions?: boolean;
    showHistory?: boolean;
    maxVisibleResults?: number;
    debounceMs?: number;
    autoFocus?: boolean;
    renderResult?: (result: SearchResult<T>) => React.ReactNode;
    renderNoResults?: (query: string) => React.ReactNode;
    filters?: {
        label: string;
        key: string;
        options: { value: string; label: string }[];
    }[];
}

const UniversalSearch = <T extends { id: string }>({
    items,
    searchEngine,
    placeholder = "Search...",
    onResultSelect,
    onSearchChange,
    className = "",
    showSuggestions = true,
    showHistory = true,
    maxVisibleResults = 10,
    debounceMs = 200,
    autoFocus = false,
    renderResult,
    renderNoResults,
    filters = []
}: UniversalSearchProps<T>) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult<T>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchStats, setSearchStats] = useState<{ totalCount: number; searchTime: number } | null>(null);
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // Get search history from engine
    useEffect(() => {
        setSearchHistory(searchEngine.getSearchHistory());
    }, [searchEngine]);

    // Filter items based on applied filters
    const filteredItems = useMemo(() => {
        if (Object.keys(appliedFilters).length === 0) return items;
        
        return items.filter(item => {
            return Object.entries(appliedFilters).every(([filterKey, filterValue]) => {
                if (!filterValue) return true;
                
                const itemValue = getNestedValue(item, filterKey);
                return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            });
        });
    }, [items, appliedFilters]);

    // Perform search with debouncing
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setSearchStats(null);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        setShowDropdown(true);

        try {
            const response: SearchResponse<T> = await searchEngine.search(
                searchQuery,
                filteredItems,
                { debounceMs }
            );

            setResults(response.results.slice(0, maxVisibleResults));
            setSearchStats({
                totalCount: response.totalCount,
                searchTime: response.searchTime
            });
            setSelectedIndex(-1);

            if (onSearchChange) {
                onSearchChange(searchQuery, response.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchEngine, filteredItems, debounceMs, maxVisibleResults, onSearchChange]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        performSearch(newQuery);
    };

    // Handle result selection
    const handleResultSelect = (result: SearchResult<T>) => {
        setShowDropdown(false);
        setQuery('');
        if (onResultSelect) {
            onResultSelect(result.item);
        }
    };

    // Handle history item selection
    const handleHistorySelect = (historyItem: string) => {
        setQuery(historyItem);
        performSearch(historyItem);
        inputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < results.length - 1 ? prev + 1 : -1
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev > -1 ? prev - 1 : results.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleResultSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto focus if requested
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Handle filter changes
    const handleFilterChange = (filterKey: string, value: string) => {
        setAppliedFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setAppliedFilters({});
    };

    // Get nested value from object
    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    };

    // Default result renderer
    const defaultRenderResult = (result: SearchResult<T>) => (
        <div className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                    {getNestedValue(result.item, 'itemName') || 
                     getNestedValue(result.item, 'title') || 
                     getNestedValue(result.item, 'name') || 
                     String(result.item.id)}
                </div>
                {result.matchedFields.length > 0 && (
                    <div className="text-xs text-text-secondary mt-1">
                        Matched: {result.matchedFields.join(', ')}
                    </div>
                )}
            </div>
            <div className="ml-3 text-xs text-brand-primary font-semibold">
                {Math.round(result.score * 10) / 10}
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''} text-text-secondary`} />
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
                />
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                    {filters.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 text-text-secondary hover:text-text-primary transition-colors ${
                                Object.keys(appliedFilters).length > 0 ? 'text-brand-primary' : ''
                            }`}
                        >
                            <FilterIcon className="w-5 h-5" />
                        </button>
                    )}
                    
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                setShowDropdown(false);
                                inputRef.current?.focus();
                            }}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            {showFilters && filters.length > 0 && (
                <div className="mt-2 p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-text-primary">Filters</h4>
                        {Object.keys(appliedFilters).length > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-brand-primary hover:text-brand-secondary transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filters.map(filter => (
                            <div key={filter.key}>
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    {filter.label}
                                </label>
                                <select
                                    value={appliedFilters[filter.key] || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    className="w-full p-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="">All</option>
                                    {filter.options.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Results Dropdown */}
            {showDropdown && (query || searchHistory.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
                    
                    {/* Search Stats */}
                    {searchStats && query && (
                        <div className="px-4 py-2 border-b border-border/50 text-xs text-text-secondary">
                            {searchStats.totalCount} results in {searchStats.searchTime.toFixed(1)}ms
                        </div>
                    )}

                    {/* Results */}
                    {query && (
                        <div className="max-h-80 overflow-y-auto">
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <div
                                        key={result.item.id}
                                        className={`${selectedIndex === index ? 'bg-brand-primary/10' : ''}`}
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        {renderResult ? renderResult(result) : defaultRenderResult(result)}
                                    </div>
                                ))
                            ) : !isLoading ? (
                                <div className="p-4 text-center text-text-secondary">
                                    {renderNoResults ? renderNoResults(query) : (
                                        <div>
                                            <div className="text-lg mb-1">🔍</div>
                                            <div>No results found for "{query}"</div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Search History */}
                    {!query && showHistory && searchHistory.length > 0 && (
                        <div className="max-h-40 overflow-y-auto">
                            <div className="px-4 py-2 text-xs font-semibold text-text-secondary border-b border-border/50 flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                Recent Searches
                            </div>
                            {searchHistory.map((historyItem, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleHistorySelect(historyItem)}
                                    className="px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors text-sm text-text-primary"
                                >
                                    {historyItem}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-4 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full mx-auto"></div>
                            <div className="text-sm text-text-secondary mt-2">Searching...</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UniversalSearch;