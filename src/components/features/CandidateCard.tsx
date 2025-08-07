import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Candidate, Endorser } from '../../types/database';

interface CandidateCardProps {
  candidate: Candidate;
  endorsements: Array<{
    id: string;
    endorser: Endorser;
    confidence: 'confirmed' | 'reported' | 'rumored';
    quote?: string;
  }>;
  viewMode: 'compact' | 'detailed';
  onClick?: () => void;
  ranking?: number; // New prop for ranking position
}

export function CandidateCard({ candidate, endorsements, viewMode, onClick, ranking }: CandidateCardProps) {
  const totalEndorsements = endorsements.length;
  const confidenceBreakdown = {
    confirmed: endorsements.filter(e => e.confidence === 'confirmed').length,
    reported: endorsements.filter(e => e.confidence === 'reported').length,
    rumored: endorsements.filter(e => e.confidence === 'rumored').length
  };
  
  const topEndorsers = endorsements
    .sort((a, b) => (b.endorser.influence_score || 0) - (a.endorser.influence_score || 0))
    .slice(0, 3);
  
  const categoryBreakdown = endorsements.reduce((acc, endorsement) => {
    const category = endorsement.endorser.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic': return 'from-blue-500 to-blue-600';
      case 'republican': return 'from-red-500 to-red-600';
      case 'independent': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames = {
      politician: 'Politicians',
      union: 'Unions',
      celebrity: 'Celebrities',
      media: 'Media',
      business: 'Business',
      nonprofit: 'Nonprofits',
      academic: 'Academics',
      religious: 'Religious'
    };
    return displayNames[category as keyof typeof displayNames] || category;
  };

  return (
    <Card 
      variant="candidate" 
      interactive={!!onClick}
      onClick={onClick}
      className="h-full bg-white border border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg group"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl font-bold text-gray-900">
                {candidate.name}
              </CardTitle>
              {ranking && (
                <Badge 
                  variant="default" 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 py-1"
                >
                  #{ranking}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 text-yellow-800 text-xs"
              >
                {candidate.party}
              </Badge>
            </div>
          </div>
          {viewMode === 'detailed' && candidate.photo_url && (
            <div className="relative">
              <img 
                src={candidate.photo_url} 
                alt={candidate.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-yellow-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Endorsement Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                {totalEndorsements}
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Endorsements</p>
                <p className="text-xs text-gray-500">
                  {confidenceBreakdown.confirmed} confirmed, {confidenceBreakdown.reported} reported
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Endorsers - Only show if there are endorsements */}
        {viewMode === 'detailed' && topEndorsers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Top Endorsers
            </h4>
            <div className="space-y-2">
              {topEndorsers.map((endorsement) => (
                <div key={endorsement.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-xs font-bold text-white">
                    {endorsement.endorser.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {endorsement.endorser.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {endorsement.endorser.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="category" category={endorsement.endorser.category} className="text-xs bg-yellow-100 text-yellow-800">
                      {getCategoryDisplayName(endorsement.endorser.category)}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">
                      {endorsement.endorser.influence_score || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Distribution - Only show if there are endorsements */}
        {viewMode === 'detailed' && Object.keys(categoryBreakdown).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Support by Category
            </h4>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {getCategoryDisplayName(category)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(categoryBreakdown))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 min-w-[1rem] text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Campaign Momentum - Only show if there are endorsements */}
        {totalEndorsements > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Campaign Momentum</span>
              <span className="text-xs font-bold text-gray-900">
                {Math.round((totalEndorsements / 10) * 100)}%
              </span>
            </div>
            <ProgressBar
              value={totalEndorsements}
              max={10}
              height="sm"
              color="yellow"
              animated={true}
              className="mb-2"
            />
          </div>
        )}

        {/* Empty State - Show when no endorsements */}
        {totalEndorsements === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No endorsements yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back for updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 