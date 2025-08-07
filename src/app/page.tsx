'use client';

import { useEffect, useState } from 'react';
import { CandidateCard } from '../components/features/CandidateCard';
import { StatsCard } from '../components/ui/StatsCard';
import { BarChart } from '../components/ui/BarChart';
import { CircularProgress } from '../components/ui/CircularProgress';
import { EndorsementTimeline } from '../components/charts/EndorsementTimeline';
import { SearchFilters, FilterState } from '../components/features/SearchFilters';
import { Header } from '../components/ui/Header';
import { Candidate, Endorser, Endorsement } from '../types/database';

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [endorsers, setEndorsers] = useState<Endorser[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedCount, setFeedCount] = useState<number>(0);
  const [filters, setFilters] = useState<FilterState>({
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
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'search'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data from database APIs
        const [sourcesResponse, candidatesResponse, endorsersResponse, endorsementsResponse] = await Promise.all([
          fetch('/api/sources'),
          fetch('/api/candidates'),
          fetch('/api/endorsers'),
          fetch('/api/endorsements')
        ]);

        if (sourcesResponse.ok) {
          const sourcesData = await sourcesResponse.json();
          setFeedCount(sourcesData.totalFeeds);
        }

        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          setCandidates(candidatesData.candidates);
        }

        if (endorsersResponse.ok) {
          const endorsersData = await endorsersResponse.json();
          setEndorsers(endorsersData.endorsers);
        }

        if (endorsementsResponse.ok) {
          const endorsementsData = await endorsementsResponse.json();
          setEndorsements(endorsementsData.endorsements);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

        loadData();
  }, []);

  const getCandidateEndorsements = (candidateId: string) => {
    return endorsements
      .filter(e => e.candidate_id === candidateId)
      .map(endorsement => {
        const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
        return {
          id: endorsement.id,
          endorser: endorser!,
          confidence: endorsement.confidence,
          quote: endorsement.quote || undefined
        };
      });
  };

  // Sort candidates by endorsement count (highest first)
  const sortedCandidates = candidates.sort((a, b) => {
    const aEndorsements = getCandidateEndorsements(a.id).length;
    const bEndorsements = getCandidateEndorsements(b.id).length;
    return bEndorsements - aEndorsements; // Descending order
  });

  const getCategoryBreakdown = () => {
    const breakdown = endorsers.reduce((acc, endorser) => {
      const category = endorser.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(breakdown).map(([category, count]) => ({
      label: category,
      value: count,
      color: category === 'politician' ? 'bg-gradient-to-t from-yellow-500 to-yellow-600' :
             category === 'union' ? 'bg-gradient-to-t from-yellow-600 to-yellow-700' :
             'bg-gradient-to-t from-yellow-400 to-yellow-500'
    }));
  };

  // Filter endorsements based on current filters
  const getFilteredEndorsements = () => {
    return endorsements.filter(endorsement => {
      const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
      const candidate = candidates.find(c => c.id === endorsement.candidate_id);
      
      if (!endorser || !candidate) return false;

      // Filter by candidates
      if (filters.candidates.length > 0 && !filters.candidates.includes(candidate.id)) {
        return false;
      }

      // Filter by endorser categories
      if (filters.categories.length > 0 && !filters.categories.includes(endorser.category)) {
        return false;
      }

      // Filter by confidence level
      if (filters.confidence.length > 0 && !filters.confidence.includes(endorsement.confidence)) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const searchText = `${endorser.name} ${candidate.name} ${endorsement.source_title} ${endorsement.quote || ''}`.toLowerCase();
        if (!searchText.includes(searchLower)) {
          return false;
        }
      }

      // Filter by influence score
      if (filters.influenceMin > 0 && (endorser.influence_score || 0) < filters.influenceMin) {
        return false;
      }

      // Filter by borough
      if (filters.borough.length > 0 && endorser.borough && !filters.borough.includes(endorser.borough)) {
        return false;
      }

      // Filter by endorsement type
      if (filters.endorsementType.length > 0 && !filters.endorsementType.includes(endorsement.endorsement_type)) {
        return false;
      }

      // Filter by sentiment
      if (filters.sentiment.length > 0 && !filters.sentiment.includes(endorsement.sentiment)) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange && endorsement.endorsed_at) {
        const endorsementDate = new Date(endorsement.endorsed_at);
        const startDate = filters.dateRange[0];
        const endDate = filters.dateRange[1];
        if (endorsementDate < startDate || endorsementDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredEndorsements = getFilteredEndorsements();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="mt-6 text-gray-800 text-lg font-medium">Loading NYC Endorsement Tracker...</p>
          <p className="mt-2 text-gray-600 text-sm">Analyzing coalition data</p>
        </div>
      </div>
    );
  }

  const getMomentumTarget = () => {
    // Calculate a meaningful target based on the current data
    const totalEndorsers = endorsers.length;
    const totalCandidates = candidates.length;
    
    if (totalEndorsers === 0 || totalCandidates === 0) {
      return 50; // Default target if no data
    }
    
    // Base target: 25% of total endorsers, minimum 20, maximum 200
    const baseTarget = Math.max(20, Math.min(200, Math.round(totalEndorsers * 0.25)));
    
    // Adjust based on number of candidates (more candidates = higher target)
    const candidateMultiplier = Math.max(1, totalCandidates * 0.8);
    
    return Math.round(baseTarget * candidateMultiplier);
  };

  const getMomentumStatus = () => {
    const target = getMomentumTarget();
    const current = endorsements.length;
    const percentage = Math.round((current / target) * 100);
    
    if (current >= target) {
      return `🎉 Exceeded target by ${current - target} endorsements!`;
    } else if (percentage >= 75) {
      return `🔥 Strong momentum - ${target - current} more needed`;
    } else if (percentage >= 50) {
      return `📈 Good progress - ${target - current} more needed`;
    } else if (percentage >= 25) {
      return `📊 Building momentum - ${target - current} more needed`;
    } else {
      return `🚀 Early stage - ${target - current} more needed`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Coalition Overview
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover which communities, organizations, and leaders are supporting each candidate in the 2025 NYC mayoral race.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <StatsCard
            title="Total Endorsements"
            value={endorsements.length}
            subtitle="Across all candidates"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Unique Endorsers"
            value={endorsers.length}
            subtitle="Influential voices"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Candidates"
            value={candidates.length}
            subtitle="In the race"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatsCard
            title="Data Sources"
            value={feedCount > 0 ? `${feedCount}+` : "120+"}
            subtitle="RSS feeds monitored"
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'timeline'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Search & Filter
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Data Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Category Breakdown Chart */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Endorsement Categories</h3>
                <BarChart 
                  data={getCategoryBreakdown()}
                  height={200}
                  animated={true}
                />
              </div>

              {/* Overall Progress */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Campaign Momentum</h3>
                  <div className="relative group">
                    <button className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 transition-colors">
                      i
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="text-xs">
                        <p className="font-semibold mb-1">What is Campaign Momentum?</p>
                        <p className="text-gray-300">
                          Tracks the pace of endorsements over time. 
                          A higher momentum indicates growing support 
                          and campaign viability.
                        </p>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center h-48">
                  <CircularProgress
                    value={endorsements.length}
                    max={getMomentumTarget()}
                    size="lg"
                    color="yellow"
                    animated={true}
                  />
                </div>
                <p className="text-center text-gray-600 mt-4">
                  {endorsements.length} of {getMomentumTarget()} momentum target
                </p>
                <p className="text-center text-xs text-gray-500 mt-2">
                  {getMomentumStatus()}
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="mb-16">
            <EndorsementTimeline
              endorsements={endorsements}
              endorsers={endorsers}
              candidates={candidates}
              granularity="daily"
              showTrendLines={true}
              highlightEvents={[
                { date: new Date('2024-01-15'), label: 'First Major Endorsement', type: 'endorsement' },
                { date: new Date('2024-02-01'), label: 'Union Endorsements', type: 'endorsement' }
              ]}
              annotations={[
                { date: new Date('2024-01-15'), label: 'AOC Endorsement', endorser: 'Alexandria Ocasio-Cortez', candidate: 'Zohran Mamdani' },
                { date: new Date('2024-01-20'), label: 'Bernie Sanders', endorser: 'Bernie Sanders', candidate: 'Zohran Mamdani' },
                { date: new Date('2024-02-01'), label: 'UFT Endorsement', endorser: 'United Federation of Teachers', candidate: 'Zohran Mamdani' }
              ]}
              onDateRangeSelect={(startDate, endDate) => {
                console.log('Date range selected:', startDate, endDate);
              }}
              onEndorsementClick={(endorsement) => {
                console.log('Endorsement clicked:', endorsement);
              }}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
            {/* Filters Sidebar */}
            <div className="lg:col-span-2">
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                candidates={candidates}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Search Results</h3>
                  <span className="text-sm text-gray-500">
                    {filteredEndorsements.length} result{filteredEndorsements.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {filteredEndorsements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No endorsements found</p>
                    <p className="text-gray-400">
                      Try adjusting your filters or search terms to find more results.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEndorsements.map((endorsement) => {
                      const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
                      const candidate = candidates.find(c => c.id === endorsement.candidate_id);
                      if (!endorser || !candidate) return null;

                      return (
                        <div key={endorsement.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{endorser.name}</h4>
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                  {endorser.category}
                                </span>
                                {endorser.influence_score && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    Influence: {endorser.influence_score}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">
                                <span className="font-medium">Endorsing:</span> {candidate.name}
                              </p>
                              {endorsement.quote && (
                                <blockquote className="text-gray-700 italic border-l-4 border-yellow-400 pl-4 my-3">
                                  &quot;{endorsement.quote}&quot;
                                </blockquote>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                endorsement.confidence === 'confirmed' ? 'bg-green-100 text-green-800' :
                                endorsement.confidence === 'reported' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {endorsement.confidence}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>
                                <span className="font-medium">Source:</span> {endorsement.source_title || 'Unknown'}
                              </span>
                              {endorsement.endorsed_at && (
                                <span>
                                  <span className="font-medium">Date:</span> {new Date(endorsement.endorsed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <a 
                              href={endorsement.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-yellow-600 hover:text-yellow-700 font-medium"
                            >
                              View Source →
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Candidate Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Candidate Coalitions</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See which communities, organizations, and leaders are supporting each candidate in the 2025 NYC mayoral race.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {sortedCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                endorsements={getCandidateEndorsements(candidate.id)}
                viewMode="detailed"
                ranking={index + 1}
                onClick={() => {
                  // TODO: Navigate to candidate detail page
                  console.log('Selected candidate:', candidate.name);
                }}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 backdrop-blur-md rounded-2xl p-12 border border-yellow-200 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Get real-time updates on endorsements, track coalition building, and understand the political landscape of NYC&apos;s mayoral race.
            </p>
            <button className="px-8 py-4 text-lg font-medium text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              Explore Detailed Analysis
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 