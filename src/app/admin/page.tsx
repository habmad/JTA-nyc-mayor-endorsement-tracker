'use client';

import { useState, useEffect } from 'react';
import { Endorsement, Endorser, Candidate } from '../../types/database';
import { endorsementCollector, endorsementClassifier } from '../../lib/data-collection';
import { getSystemStatus, SystemStatus } from '../../lib/system-status';
import AddEndorserModal from '../../components/features/AddEndorserModal';
import EndorsersManagement from '../../components/features/EndorsersManagement';
import { Header } from '../../components/ui/Header';

interface AdminQueue {
  unverified: Array<Endorsement & { ai_confidence: number; ai_reasoning: string }>;
  flagged: Array<Endorsement & { flag_reason: string }>;
  retractions: Array<Endorsement & { retraction_evidence: string }>;
  duplicates: Array<{ group_id: string; endorsements: Endorsement[] }>;
}

export default function AdminDashboard() {
  const [queue, setQueue] = useState<AdminQueue>({
    unverified: [],
    flagged: [],
    retractions: [],
    duplicates: []
  });
  const [collectionStats, setCollectionStats] = useState({
    activeSources: 0,
    totalSources: 0,
    lastCheck: null as Date | null
  });
  const [rssStats, setRssStats] = useState({
    totalFeeds: 0,
    activeFeeds: 0,
    lastCheck: null as Date | null
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedEndorsement, setSelectedEndorsement] = useState<Endorsement | null>(null);
  const [isCollectionRunning, setIsCollectionRunning] = useState(false);
  const [isAddEndorserModalOpen, setIsAddEndorserModalOpen] = useState(false);

  useEffect(() => {
    // Load admin queue data
    loadAdminQueue();
    
    // Load collection statistics
    setCollectionStats(endorsementCollector.getStats());
    
    // Load RSS stats from API (includes all feeds)
    const loadRssStats = async () => {
      try {
        const response = await fetch('/api/rss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'getStats' }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRssStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading RSS stats:', error);
      }
    };
    
    loadRssStats();
    
    // Set up periodic refresh
    const interval = setInterval(async () => {
      setCollectionStats(endorsementCollector.getStats());
      
      // Refresh RSS stats from API
      try {
        const response = await fetch('/api/rss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'getStats' }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRssStats(data.stats);
        }
      } catch (error) {
        console.error('Error refreshing RSS stats:', error);
      }
      
      try {
        const status = await getSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('Error getting system status:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadAdminQueue = async () => {
    try {
      // Load unverified endorsements from database
      const response = await fetch('/api/admin/queue');
      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue);
      }
    } catch (error) {
      console.error('Error loading admin queue:', error);
    }
  };

  const handleVerifyEndorsement = async (endorsementId: string, confidence: 'confirmed' | 'reported' | 'rumored') => {
    // TODO: Implement verification logic
    console.log('Verifying endorsement:', endorsementId, 'as', confidence);
    
    // Remove from unverified queue
    setQueue(prev => ({
      ...prev,
      unverified: prev.unverified.filter(e => e.id !== endorsementId)
    }));
  };

  const handleRejectEndorsement = async (endorsementId: string, reason: string) => {
    // TODO: Implement rejection logic
    console.log('Rejecting endorsement:', endorsementId, 'reason:', reason);
    
    setQueue(prev => ({
      ...prev,
      unverified: prev.unverified.filter(e => e.id !== endorsementId)
    }));
  };

  const handleStartCollection = async () => {
    await endorsementCollector.startCollection();
    setIsCollectionRunning(true);
  };

  const handleStopCollection = () => {
    endorsementCollector.stopCollection();
    setIsCollectionRunning(false);
  };

  const handleAddEndorserSuccess = () => {
    // Refresh system status to show updated endorser count
    getSystemStatus().then(setSystemStatus);
  };

  const handlePopulateFromArticle = async () => {
    try {
      const response = await fetch('/api/admin/populate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Population successful:', data.message);
        // Refresh the endorsers management component
        window.location.reload();
      } else {
        console.error('Failed to populate database');
      }
    } catch (error) {
      console.error('Error populating database:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="Admin Dashboard" subtitle="Manage endorsements and data collection" />
      
      {/* Collection Control */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end">
            <button
              onClick={isCollectionRunning ? handleStopCollection : handleStartCollection}
              className={`px-4 py-2 rounded-lg font-medium ${
                isCollectionRunning
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isCollectionRunning ? 'Stop Collection' : 'Start Collection'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{queue.unverified.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{queue.flagged.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sources</p>
                <p className="text-2xl font-bold text-gray-900">{collectionStats.activeSources}</p>
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
                <p className="text-sm font-medium text-gray-600">Last Check</p>
                <p className="text-sm font-bold text-gray-900">
                  {collectionStats.lastCheck 
                    ? new Date(collectionStats.lastCheck).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RSS Feeds</p>
                <p className="text-2xl font-bold text-gray-900">{rssStats.activeFeeds}/{rssStats.totalFeeds}</p>
              </div>
            </div>
          </div>

          {systemStatus && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Endorsers Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStatus.endorsers?.highInfluenceEndorsers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {systemStatus && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Feed Categories</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(systemStatus.endorsers?.feedsByCategory || {}).map(([category, count]) => (
                      <span key={category} className="inline-block mr-2">
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endorsers Management */}
          <div className="lg:col-span-2 mb-8">
            <EndorsersManagement onAddEndorser={() => setIsAddEndorserModalOpen(true)} />
          </div>

          {/* Feed Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Feed Management</h2>
                <p className="text-gray-600 mt-1">Monitor and manage RSS feed health</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">Healthy</p>
                        <p className="text-2xl font-bold text-blue-600">{rssStats.activeFeeds}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-900">Warning</p>
                        <p className="text-2xl font-bold text-yellow-600">0</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-900">Error</p>
                        <p className="text-2xl font-bold text-red-600">0</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">NYT Politics</h3>
                      <p className="text-sm text-gray-500">https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Last: 2m ago
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">AMNY Politics</h3>
                      <p className="text-sm text-gray-500">https://www.amny.com/politics/feed/</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Last: 5m ago
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">AOC Mentions</h3>
                      <p className="text-sm text-gray-500">Endorser-specific monitoring</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Last: 1m ago
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    View All Feeds
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Verification Queue</h2>
                <p className="text-gray-600 mt-1">Review and verify pending endorsements</p>
              </div>

              <div className="p-6">
                {queue.unverified.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No endorsements pending review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queue.unverified.map((endorsement) => (
                      <div key={endorsement.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                AI Confidence: {Math.round(endorsement.ai_confidence * 100)}%
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                endorsement.ai_confidence >= 0.8 ? 'bg-green-500' :
                                endorsement.ai_confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                            
                            <p className="text-gray-700 mb-2">{endorsement.quote}</p>
                            
                            <div className="text-sm text-gray-500 mb-3">
                              <p>Source: {endorsement.source_url}</p>
                              <p>AI Reasoning: {endorsement.ai_reasoning}</p>
                            </div>

                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleVerifyEndorsement(endorsement.id, 'confirmed')}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              >
                                ✓ Confirm
                              </button>
                              <button
                                onClick={() => handleVerifyEndorsement(endorsement.id, 'reported')}
                                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                              >
                                ⚠ Mark Reported
                              </button>
                              <button
                                onClick={() => handleRejectEndorsement(endorsement.id, 'Not an endorsement')}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              >
                                ✗ Reject
                              </button>
                              <button
                                onClick={() => setSelectedEndorsement(endorsement)}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                              >
                                🏁 Flag for Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Collection Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Collection</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isCollectionRunning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCollectionRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Sources</span>
                  <span className="text-sm font-medium">{collectionStats.activeSources}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sources</span>
                  <span className="text-sm font-medium">{collectionStats.totalSources}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Check</span>
                  <span className="text-sm font-medium">
                    {collectionStats.lastCheck 
                      ? new Date(collectionStats.lastCheck).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <a href="/admin/scraper" className="block w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium text-center">
                  Endorsement Scraper
                </a>
                <button 
                  onClick={() => setIsAddEndorserModalOpen(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  Add New Endorser
                </button>
                <button 
                  onClick={handlePopulateFromArticle}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  Populate from Article
                </button>
                <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium">
                  Export Data
                </button>
                <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium">
                  View Analytics
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Endorsement confirmed</span>
                  <span className="text-gray-400">2m ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">New source added</span>
                  <span className="text-gray-400">5m ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Endorsement rejected</span>
                  <span className="text-gray-400">10m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Endorser Modal */}
      <AddEndorserModal
        isOpen={isAddEndorserModalOpen}
        onClose={() => setIsAddEndorserModalOpen(false)}
        onSuccess={handleAddEndorserSuccess}
      />
    </div>
  );
} 