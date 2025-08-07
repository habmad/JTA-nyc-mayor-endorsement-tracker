'use client';

import { useState, useEffect } from 'react';
import { DatabaseEndorser } from '../../lib/database-service';

interface EndorsersManagementProps {
  onAddEndorser: () => void;
}

export default function EndorsersManagement({ onAddEndorser }: EndorsersManagementProps) {
  const [endorsers, setEndorsers] = useState<DatabaseEndorser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadEndorsers();
  }, []);

  const loadEndorsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/endorsers');
      if (response.ok) {
        const data = await response.json();
        setEndorsers(data.endorsers || []);
      } else {
        setError('Failed to load endorsers');
      }
    } catch (err) {
      setError('Error loading endorsers');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      politician: 'bg-blue-100 text-blue-800',
      union: 'bg-red-100 text-red-800',
      celebrity: 'bg-purple-100 text-purple-800',
      media: 'bg-green-100 text-green-800',
      business: 'bg-yellow-100 text-yellow-800',
      nonprofit: 'bg-indigo-100 text-indigo-800',
      academic: 'bg-gray-100 text-gray-800',
      religious: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getInfluenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEndorsers = endorsers.filter(endorser => {
    const matchesSearch = endorser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (endorser.display_name && endorser.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || endorser.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'politician', label: 'Politicians' },
    { value: 'union', label: 'Unions' },
    { value: 'celebrity', label: 'Celebrities' },
    { value: 'media', label: 'Media' },
    { value: 'business', label: 'Business' },
    { value: 'nonprofit', label: 'Nonprofits' },
    { value: 'academic', label: 'Academic' },
    { value: 'religious', label: 'Religious' }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Endorsers Management</h2>
          <p className="text-gray-600 mt-1">Manage endorsers and their influence scores</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Endorsers Management</h2>
            <p className="text-gray-600 mt-1">Manage endorsers and their influence scores</p>
          </div>
          <button
            onClick={onAddEndorser}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Add Endorser
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search endorsers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{endorsers.length}</div>
            <div className="text-sm text-blue-800">Total Endorsers</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {endorsers.filter(e => e.influence_score >= 80).length}
            </div>
            <div className="text-sm text-green-800">High Influence</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {endorsers.filter(e => e.influence_score >= 60 && e.influence_score < 80).length}
            </div>
            <div className="text-sm text-yellow-800">Medium Influence</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {endorsers.filter(e => e.influence_score < 60).length}
            </div>
            <div className="text-sm text-red-800">Low Influence</div>
          </div>
        </div>

        {/* Endorsers List */}
        <div className="space-y-4">
          {filteredEndorsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'No endorsers match your filters' 
                  : 'No endorsers found. Add your first endorser!'
                }
              </p>
            </div>
          ) : (
            filteredEndorsers.map((endorser) => (
              <div key={endorser.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {endorser.display_name || endorser.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(endorser.category)}`}>
                        {endorser.category}
                      </span>
                      <span className={`text-sm font-medium ${getInfluenceColor(endorser.influence_score)}`}>
                        {endorser.influence_score}/100
                      </span>
                    </div>
                    
                    {endorser.name !== endorser.display_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        Full name: {endorser.name}
                      </p>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {endorser.title && (
                        <p><span className="font-medium">Title:</span> {endorser.title}</p>
                      )}
                      {endorser.organization && (
                        <p><span className="font-medium">Organization:</span> {endorser.organization}</p>
                      )}
                      {endorser.borough && (
                        <p><span className="font-medium">Borough:</span> {endorser.borough}</p>
                      )}
                      {endorser.subcategory && (
                        <p><span className="font-medium">Subcategory:</span> {endorser.subcategory}</p>
                      )}
                    </div>

                    {/* Social Media */}
                    {(endorser.twitter_handle || endorser.instagram_handle) && (
                      <div className="flex items-center space-x-4 mt-3">
                        {endorser.twitter_handle && (
                          <span className="text-sm text-blue-600">
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            {endorser.twitter_handle}
                          </span>
                        )}
                        {endorser.instagram_handle && (
                          <span className="text-sm text-pink-600">
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            {endorser.instagram_handle}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredEndorsers.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredEndorsers.length} of {endorsers.length} endorsers
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 