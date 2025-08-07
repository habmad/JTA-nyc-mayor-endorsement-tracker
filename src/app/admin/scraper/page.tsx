'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Endorser {
  id: string;
  name: string;
  display_name?: string;
  title?: string;
  organization?: string;
}

interface Candidate {
  id: string;
  name: string;
  party?: string;
}

export default function ScraperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'endorser' | 'candidate' | null>(null);
  const [searchedName, setSearchedName] = useState('');
  const [endorsers, setEndorsers] = useState<Endorser[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedEndorser, setSelectedEndorser] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [showEndorserDropdown, setShowEndorserDropdown] = useState(false);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [endorserSearch, setEndorserSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Load endorsers and candidates on component mount
  useEffect(() => {
    loadEndorsers();
    loadCandidates();
  }, []);

  const loadEndorsers = async () => {
    try {
      const response = await fetch('/api/endorsers');
      if (response.ok) {
        const data = await response.json();
        setEndorsers(data.endorsers || []);
      }
    } catch (error) {
      console.error('Error loading endorsers:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const triggerScraping = async (type: 'all' | 'endorser' | 'candidate', id?: string) => {
    setIsLoading(true);
    setMessage('');
    setError('');
    setSearchResults([]);
    setSearchType(null);
    setSearchedName('');

    try {
      const response = await fetch('/api/admin/scrape-endorsements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (data.results) {
          setSearchResults(data.results);
          setSearchType(type as 'endorser' | 'candidate');
          setSearchedName(type === 'endorser' ? data.endorserName : data.candidateName);
        }
      } else {
        setError(data.error || 'Failed to trigger scraping');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEndorsers = endorsers.filter(endorser =>
    endorser.name.toLowerCase().includes(endorserSearch.toLowerCase()) ||
    (endorser.display_name && endorser.display_name.toLowerCase().includes(endorserSearch.toLowerCase()))
  );

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const getSelectedEndorserName = () => {
    const endorser = endorsers.find(e => e.id === selectedEndorser);
    return endorser ? (endorser.display_name || endorser.name) : '';
  };

  const getSelectedCandidateName = () => {
    const candidate = candidates.find(c => c.id === selectedCandidate);
    return candidate ? candidate.name : '';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const endorserContainer = document.getElementById('endorser-dropdown-container');
      const candidateContainer = document.getElementById('candidate-dropdown-container');
      
      if (endorserContainer && !endorserContainer.contains(target)) {
        setShowEndorserDropdown(false);
      }
      
      if (candidateContainer && !candidateContainer.contains(target)) {
        setShowCandidateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Endorsement Scraper
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Discover real-time endorsement data for the 2025 NYC mayoral race using AI-powered web search
          </p>
        </div>

        
        
        <div className="max-w-6xl mx-auto">

            
          {/* Main Scraping Interface */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Scraping Options</h2>
              <p className="text-gray-600 text-lg">Choose your scraping strategy</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Comprehensive Scraping */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Comprehensive Analysis</h3>
                    <p className="text-gray-600 text-sm">Search all endorsers at once</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Discover endorsements between all endorsers and candidates in our database. 
                  This comprehensive approach finds unexpected endorsements and provides complete coverage.
                </p>
                
                <Button
                  onClick={() => triggerScraping('all')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scraping in Progress...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start Comprehensive Scraping
                    </div>
                  )}
                </Button>
              </div>

              {/* Targeted Scraping */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Targeted Search</h3>
                    <p className="text-gray-600 text-sm">Focus on specific endorsers or candidates</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  This tool allows you to manually scrape endorsements from news articles and other sources. 
                  Enter a URL or text content to extract endorsement information.
                </p>
                <p className="text-gray-600 mb-6">
                  The scraper will attempt to identify endorsements, endorsers, and candidates mentioned in the content.
                </p>
                
                <div className="space-y-4">
                  {/* Endorser Dropdown */}
                  <div className="relative" id="endorser-dropdown-container" style={{ zIndex: 9998 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Endorser
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search endorsers..."
                        value={endorserSearch}
                        onChange={(e) => setEndorserSearch(e.target.value)}
                        onFocus={() => setShowEndorserDropdown(true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      />
                      {showEndorserDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[9999]">
                          {filteredEndorsers.map((endorser) => (
                            <div
                              key={endorser.id}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setSelectedEndorser(endorser.id);
                                setEndorserSearch(endorser.display_name || endorser.name);
                                setShowEndorserDropdown(false);
                              }}
                            >
                              <div className="font-medium text-gray-900">
                                {endorser.display_name || endorser.name}
                              </div>
                              {endorser.title && (
                                <div className="text-sm text-gray-600">{endorser.title}</div>
                              )}
                            </div>
                          ))}
                          {filteredEndorsers.length === 0 && (
                            <div className="px-4 py-3 text-gray-500">No endorsers found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Candidate Dropdown */}
                  <div className="relative dropdown-container" id="candidate-dropdown-container" style={{ zIndex: 9998 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Candidate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        onFocus={() => setShowCandidateDropdown(true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      />
                      {showCandidateDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[9999]">
                          {filteredCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setSelectedCandidate(candidate.id);
                                setCandidateSearch(candidate.name);
                                setShowCandidateDropdown(false);
                              }}
                            >
                              <div className="font-medium text-gray-900">
                                {candidate.name}
                              </div>
                              {candidate.party && (
                                <div className="text-sm text-gray-600">{candidate.party}</div>
                              )}
                            </div>
                          ))}
                          {filteredCandidates.length === 0 && (
                            <div className="px-4 py-3 text-gray-500">No candidates found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        if (selectedEndorser) {
                          triggerScraping('endorser', selectedEndorser);
                        } else {
                          setError('Please select an endorser');
                        }
                      }}
                      disabled={isLoading || !selectedEndorser}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? 'Searching...' : `Search ${getSelectedEndorserName()}`}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (selectedCandidate) {
                          triggerScraping('candidate', selectedCandidate);
                        } else {
                          setError('Please select a candidate');
                        }
                      }}
                      disabled={isLoading || !selectedCandidate}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? 'Searching...' : `Search ${getSelectedCandidateName()}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8" style={{ zIndex: 1 }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
              <p className="text-gray-600 text-lg">Understanding the endorsement discovery process</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Web Search</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Uses OpenAI&apos;s web search API to find recent news articles and social media posts about endorsements
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Parsing</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Extracts candidate names, quotes, sources, and endorsement metadata from search results
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Candidate Matching</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Uses fuzzy matching to identify which candidates are being endorsed in our database
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Data Storage</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Automatically saves verified endorsements to the database with full source attribution
                </p>
              </div>
            </div>
          </Card>

          {/* Status Messages */}
          {message && (
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Success</h3>
                  <p className="text-green-700">{message}</p>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 mb-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Search Results for {searchedName}
                </h3>
                <p className="text-gray-600">
                  Found {searchResults.length} potential endorsement{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {result.source_title || 'Untitled Source'}
                        </h4>
                        {result.source_url && (
                          <a 
                            href={result.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all"
                          >
                            {result.source_url}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.confidence} confidence
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.sentiment}
                        </span>
                      </div>
                    </div>
                    
                    {result.quote && (
                      <div className="mb-3">
                        <p className="text-gray-700 italic">&quot;{result.quote}&quot;</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Type: {result.endorsement_type}</span>
                        <span>Strength: {result.strength}</span>
                        {result.endorsed_at && (
                          <span>Date: {new Date(result.endorsed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {result.candidate_name && result.candidate_name !== 'Unknown' && (
                        <span className="font-medium text-gray-900">
                          Candidate: {result.candidate_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {searchResults.length === 0 && searchType && (
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800">No Results Found</h3>
                  <p className="text-yellow-700">
                    No endorsements were found for {searchedName}. This could mean no recent endorsements exist, or the search didn&apos;t find relevant content.
                  </p>
                </div>
              </div>
            </Card>
          )}

            
        </div>
      </div>
    </div>
  );
} 