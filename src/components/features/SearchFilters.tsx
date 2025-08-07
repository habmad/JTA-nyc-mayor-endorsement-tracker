import React, { useState, useEffect } from 'react';
import { EndorserCategory, ConfidenceLevel, EndorsementType, SentimentScore } from '../../types/database';

export interface FilterState {
  candidates: string[];
  categories: EndorserCategory[];
  confidence: ConfidenceLevel[];
  dateRange: [Date, Date] | null;
  influenceMin: number;
  searchQuery: string;
  borough: string[];
  endorsementType: EndorsementType[];
  hasRetraction: boolean;
  sentiment: SentimentScore[];
}

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  candidates: Array<{ id: string; name: string }>;
  className?: string;
}

const ENDORSER_CATEGORIES: { value: EndorserCategory; label: string; color: string }[] = [
  { value: 'politician', label: 'Politicians', color: 'bg-blue-500' },
  { value: 'union', label: 'Unions', color: 'bg-red-500' },
  { value: 'celebrity', label: 'Celebrities', color: 'bg-purple-500' },
  { value: 'media', label: 'Media', color: 'bg-yellow-500' },
  { value: 'business', label: 'Business', color: 'bg-green-500' },
  { value: 'nonprofit', label: 'Nonprofits', color: 'bg-pink-500' },
  { value: 'academic', label: 'Academic', color: 'bg-indigo-500' },
  { value: 'religious', label: 'Religious', color: 'bg-gray-500' }
];

const CONFIDENCE_LEVELS: { value: ConfidenceLevel; label: string; color: string }[] = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'reported', label: 'Reported', color: 'bg-yellow-500' },
  { value: 'rumored', label: 'Rumored', color: 'bg-gray-500' }
];

const NYC_BOROUGHS = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  candidates,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.searchQuery) {
        onFiltersChange({
          ...filters,
          searchQuery
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, onFiltersChange]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: any
  ) => {
    const currentArray = filters[key] as any[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray as FilterState[K]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      candidates: [],
      categories: [],
      confidence: [],
      dateRange: null,
      influenceMin: 0,
      searchQuery: '',
      borough: [],
      endorsementType: [],
      hasRetraction: false,
      sentiment: []
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.candidates.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.confidence.length > 0) count++;
    if (filters.dateRange) count++;
    if (filters.influenceMin > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.borough.length > 0) count++;
    if (filters.endorsementType.length > 0) count++;
    if (filters.hasRetraction) count++;
    if (filters.sentiment.length > 0) count++;
    return count;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Search & Filters</h3>
            <p className="text-gray-600 mt-2 text-lg">Find specific endorsements</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {getActiveFilterCount() > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {getActiveFilterCount()} active
              </span>
            )}
            
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear all
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              <span>{isExpanded ? 'Show less' : 'Show more'}</span>
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-8 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search endorsements, endorsers, or quotes..."
            className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-8 border-b border-gray-200">
        <div className="space-y-8">
          {/* Candidates */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Candidates
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {candidates.map(candidate => (
                <label key={candidate.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.candidates.includes(candidate.id)}
                    onChange={() => toggleArrayFilter('candidates', candidate.id)}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-base text-gray-700">{candidate.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Endorser Categories
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {ENDORSER_CATEGORIES.map(category => (
                <label key={category.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.value)}
                    onChange={() => toggleArrayFilter('categories', category.value)}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-base text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Confidence Levels */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Confidence Level
            </label>
            <div className="space-y-3">
              {CONFIDENCE_LEVELS.map(level => (
                <label key={level.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.confidence.includes(level.value)}
                    onChange={() => toggleArrayFilter('confidence', level.value)}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-base text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="p-8 border-b border-gray-200">
          <h4 className="text-xl font-bold text-gray-900 mb-6">Advanced Filters</h4>
          
          <div className="space-y-8">
            {/* Date Range */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.[0]?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const startDate = e.target.value ? new Date(e.target.value) : null;
                      const endDate = filters.dateRange?.[1] || null;
                      updateFilter('dateRange', startDate && endDate ? [startDate, endDate] : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.[1]?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const endDate = e.target.value ? new Date(e.target.value) : null;
                      const startDate = filters.dateRange?.[0] || null;
                      updateFilter('dateRange', startDate && endDate ? [startDate, endDate] : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Influence Score */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Minimum Influence Score: {filters.influenceMin}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.influenceMin}
                onChange={(e) => updateFilter('influenceMin', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Borough */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Borough
              </label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {NYC_BOROUGHS.map(borough => (
                  <label key={borough} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.borough.includes(borough)}
                      onChange={() => toggleArrayFilter('borough', borough)}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-base text-gray-700">{borough}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Endorsement Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Endorsement Type
              </label>
              <div className="space-y-3">
                {[
                  { value: 'endorsement', label: 'Endorsement' },
                  { value: 'un_endorsement', label: 'Un-endorsement' },
                  { value: 'conditional', label: 'Conditional' },
                  { value: 'rumored', label: 'Rumored' }
                ].map(type => (
                  <label key={type.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.endorsementType.includes(type.value as any)}
                      onChange={() => toggleArrayFilter('endorsementType', type.value)}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-base text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sentiment */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Sentiment
              </label>
              <div className="space-y-3">
                {[
                  { value: 'positive', label: 'Positive' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'negative', label: 'Negative' }
                ].map(sentiment => (
                  <label key={sentiment.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sentiment.includes(sentiment.value as any)}
                      onChange={() => toggleArrayFilter('sentiment', sentiment.value)}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-base text-gray-700">{sentiment.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Retractions */}
            <div>
              <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasRetraction}
                  onChange={(e) => updateFilter('hasRetraction', e.target.checked)}
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-base font-semibold text-gray-900">Include Retractions</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Pills */}
      <div className="p-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => updateFilter('confidence', ['confirmed'])}
            className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
          >
            Confirmed Only
          </button>
          <button
            onClick={() => updateFilter('categories', ['politician'])}
            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
          >
            Politicians Only
          </button>
          <button
            onClick={() => updateFilter('categories', ['union'])}
            className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
          >
            Unions Only
          </button>
          <button
            onClick={() => updateFilter('influenceMin', 80)}
            className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
          >
            High Influence
          </button>
        </div>
      </div>
    </div>
  );
}; 