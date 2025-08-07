'use client';

import { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';

interface FeedCategory {
  name: string;
  description: string;
  count: number;
  lastUpdated: Date | null;
  examples: string[];
  allSources: string[];
  color: string;
}

interface SourcesData {
  totalFeeds: number;
  activeFeeds: number;
  lastCheck: Date | null;
  categories: FeedCategory[];
}

export default function SourcesPage() {
  const [sourcesData, setSourcesData] = useState<SourcesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSourcesData = async () => {
      try {
        const response = await fetch('/api/sources');
        if (response.ok) {
          const data = await response.json();
          setSourcesData(data);
        }
      } catch (error) {
        console.error('Error loading sources data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSourcesData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data sources...</p>
        </div>
      </div>
    );
  }

  if (!sourcesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load data sources</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="Data Sources" subtitle="Transparency about where our endorsement data comes from" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monitoring Overview</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setExpandedCategories(new Set(sourcesData.categories.map(cat => cat.name)))}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedCategories(new Set())}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Collapse All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{sourcesData.totalFeeds}</div>
              <div className="text-sm text-gray-600">Total RSS Feeds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{sourcesData.activeFeeds}</div>
              <div className="text-sm text-gray-600">Active Sources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{sourcesData.categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
          {sourcesData.lastCheck && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Last updated: {new Date(sourcesData.lastCheck).toLocaleString()}
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sourcesData.categories.map((category) => (
            <div key={category.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <Badge variant="category" category={category.name.toLowerCase() as any}>
                  {category.count}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {expandedCategories.has(category.name) ? 'All Sources:' : 'Examples:'}
                </p>
                {(expandedCategories.has(category.name) ? category.allSources : category.examples.slice(0, 3)).map((source, index) => (
                  <div key={index} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    {source}
                  </div>
                ))}
                {!expandedCategories.has(category.name) && category.examples.length > 3 && (
                  <button
                    onClick={() => setExpandedCategories(prev => new Set([...prev, category.name]))}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Show all {category.allSources.length} sources →
                  </button>
                )}
                {expandedCategories.has(category.name) && (
                  <button
                    onClick={() => setExpandedCategories(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(category.name);
                      return newSet;
                    })}
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Show less ←
                  </button>
                )}
              </div>
              
              {category.lastUpdated && (
                <div className="mt-4 text-xs text-gray-500">
                  Updated: {new Date(category.lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Transparency Note */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Our Commitment to Transparency</h3>
          <p className="text-blue-800 text-sm">
            We believe in complete transparency about our data sources. All RSS feeds are publicly available 
            and we monitor a diverse range of news outlets, social media, and official statements to provide 
            comprehensive coverage of NYC political endorsements. Our AI system analyzes content from these 
            sources to identify and classify endorsement-related content.
          </p>
        </div>
      </div>
    </div>
  );
} 