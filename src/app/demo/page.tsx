'use client';

import { useState, useEffect } from 'react';
import { endorsementClassifier } from '../../lib/data-collection';
import { RSSFeedItem } from '../../lib/rss-parser';
import { Header } from '../../components/ui/Header';

interface ClassificationResult {
  item: RSSFeedItem;
  classification: {
    confidence: number;
    candidateMentions: string[];
    endorsementType: string;
    sentiment: string;
    requiresHumanReview: boolean;
    aiReasoning: string;
  };
  timestamp: Date;
}

export default function DemoPage() {
  const [rssItems, setRssItems] = useState<RSSFeedItem[]>([]);
  const [classifications, setClassifications] = useState<ClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalFeeds: 0,
    activeFeeds: 0,
    lastCheck: null as Date | null
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // First, ensure the comprehensive feed system is initialized
        await fetch('/api/sources');
        
        // Then get the RSS stats
        const response = await fetch('/api/rss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'getStats' }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, []);

  const handleCheckFeeds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'checkAllFeeds' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check RSS feeds');
      }
      
      const data = await response.json();
      setRssItems(data.results);
      setStats(data.stats);
      
      // Classify each item
      const results: ClassificationResult[] = [];
      for (const item of data.results.slice(0, 5)) { // Limit to 5 for demo
        const text = `${item.title} ${item.description}`;
        const classification = await endorsementClassifier.classifyEndorsement({
          text,
          sourceUrl: item.link,
          sourceType: 'website',
          author: item.author,
          organization: item.source
        });
        
        results.push({
          item,
          classification,
          timestamp: new Date()
        });
      }
      
      setClassifications(results);
    } catch (error) {
      console.error('Error checking feeds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feeds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeeds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Feeds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeFeeds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Check</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastCheck 
                    ? new Date(stats.lastCheck).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">RSS Feed Checker</h2>
              <p className="text-gray-600 mt-1">Check all configured RSS feeds for new articles</p>
            </div>
            
            <button
              onClick={handleCheckFeeds}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Checking...' : 'Check Feeds'}
            </button>
          </div>
        </div>

        {/* Results */}
        {rssItems.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              RSS Items Found ({rssItems.length})
            </h2>
            
            <div className="space-y-4">
              {rssItems.slice(0, 10).map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1">{item.title}</h3>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Read Article
                    </a>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Source: {item.source}</span>
                    <span>Author: {item.author || 'Unknown'}</span>
                    <span>Date: {new Date(item.pubDate).toLocaleString()}</span>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {new URL(item.link).hostname}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Classifications */}
        {classifications.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              AI Classification Results
            </h2>
            
            <div className="space-y-6">
              {classifications.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">
                        {result.item.title.substring(0, 80)}...
                      </h3>
                      <a 
                        href={result.item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs underline"
                      >
                        Read full article →
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getConfidenceColor(result.classification.confidence)
                      }`}>
                        {getConfidenceLabel(result.classification.confidence)} Confidence
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.classification.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Candidate Mentions:</p>
                      <p className="text-gray-600">
                        {result.classification.candidateMentions.length > 0 
                          ? result.classification.candidateMentions.join(', ')
                          : 'None'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Sentiment:</p>
                      <p className="text-gray-600 capitalize">{result.classification.sentiment}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Endorsement Type:</p>
                      <p className="text-gray-600 capitalize">{result.classification.endorsementType.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Requires Review:</p>
                      <p className={`${result.classification.requiresHumanReview ? 'text-red-600' : 'text-green-600'}`}>
                        {result.classification.requiresHumanReview ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="font-medium text-gray-700 text-sm">AI Reasoning:</p>
                    <p className="text-gray-600 text-sm">{result.classification.aiReasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 