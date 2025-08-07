import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Endorsement, Endorser } from '../../types/database';

interface EndorsementTimelineProps {
  endorsements: Endorsement[];
  endorsers: Endorser[];
  candidates: Array<{ id: string; name: string; campaign_color: string | null }>;
  granularity?: 'daily' | 'weekly' | 'monthly';
  showTrendLines?: boolean;
  highlightEvents?: Array<{ date: Date; label: string; type: 'debate' | 'primary' | 'endorsement' }>;
  annotations?: Array<{ date: Date; label: string; endorser: string; candidate: string }>;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  onEndorsementClick?: (endorsement: Endorsement) => void;
  className?: string;
}

interface TimelineDataPoint {
  date: string;
  total: number;
  confirmed: number;
  reported: number;
  rumored: number;
  [key: string]: any; // For candidate-specific data
}

export const EndorsementTimeline: React.FC<EndorsementTimelineProps> = ({
  endorsements,
  endorsers,
  candidates,
  granularity = 'daily',
  showTrendLines = true,
  highlightEvents = [],
  annotations = [],
  onDateRangeSelect,
  onEndorsementClick,
  className = ''
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date] | null>(null);

  // Process endorsements into timeline data
  const timelineData = useMemo(() => {
    const dataMap = new Map<string, TimelineDataPoint>();
    
    endorsements.forEach(endorsement => {
      const date = new Date(endorsement.endorsed_at || endorsement.discovered_at);
      const dateKey = formatDateKey(date, granularity);
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          total: 0,
          confirmed: 0,
          reported: 0,
          rumored: 0,
          ...candidates.reduce((acc, candidate) => {
            acc[candidate.id] = 0;
            return acc;
          }, {} as Record<string, number>)
        });
      }
      
      const dataPoint = dataMap.get(dateKey)!;
      dataPoint.total++;
      dataPoint[endorsement.confidence]++;
      dataPoint[endorsement.candidate_id]++;
    });
    
    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [endorsements, candidates, granularity]);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (!showTrendLines) return null;
    
    return timelineData.map((point, index) => {
      const previousPoints = timelineData.slice(0, index + 1);
      const cumulative = previousPoints.reduce((sum, p) => sum + p.total, 0);
      
      return {
        ...point,
        cumulative,
        trend: index > 0 ? point.total - timelineData[index - 1].total : 0
      };
    });
  }, [timelineData, showTrendLines]);

  // Format date key based on granularity
  function formatDateKey(date: Date, granularity: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (granularity) {
      case 'monthly':
        return `${year}-${month}`;
      case 'weekly':
        const week = Math.ceil(date.getDate() / 7);
        return `${year}-W${week}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const endorsementsOnDate = endorsements.filter(e => {
        const endorsementDate = new Date(e.endorsed_at || e.discovered_at);
        return formatDateKey(endorsementDate, granularity) === label;
      });

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">Total: {data.total}</p>
            <p className="text-sm text-green-600">Confirmed: {data.confirmed}</p>
            <p className="text-sm text-yellow-600">Reported: {data.reported}</p>
            <p className="text-sm text-gray-600">Rumored: {data.rumored}</p>
          </div>
          {endorsementsOnDate.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Recent endorsements:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {endorsementsOnDate.slice(0, 3).map((endorsement, index) => {
                  const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
                  const candidate = candidates.find(c => c.id === endorsement.candidate_id);
                  return (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">{endorser?.name || 'Unknown'}</span>
                      {' → '}
                      <span className="font-medium">{candidate?.name || 'Unknown'}</span>
                    </div>
                  );
                })}
                {endorsementsOnDate.length > 3 && (
                  <p className="text-xs text-gray-500">+{endorsementsOnDate.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle chart click for date range selection
  const handleChartClick = (data: any) => {
    if (data && data.activeLabel && onDateRangeSelect) {
      const clickedDate = new Date(data.activeLabel);
      const startDate = new Date(clickedDate);
      const endDate = new Date(clickedDate);
      
      // Adjust based on granularity
      switch (granularity) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        default:
          endDate.setDate(endDate.getDate() + 1);
      }
      
      setSelectedDateRange([startDate, endDate]);
      onDateRangeSelect(startDate, endDate);
    }
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Endorsement Timeline</h3>
          <p className="text-gray-600 mt-1">
            Track endorsement activity over time
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Granularity selector */}
          <select
            value={granularity}
            onChange={(e) => {
              // TODO: Implement granularity change
              console.log('Granularity changed to:', e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          
          {/* Candidate filter */}
          <select
            value={selectedCandidate || ''}
            onChange={(e) => setSelectedCandidate(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">All Candidates</option>
            {candidates.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={selectedCandidate ? timelineData.map(point => ({
              ...point,
              total: point[selectedCandidate] || 0
            })) : timelineData}
            onClick={handleChartClick}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                switch (granularity) {
                  case 'monthly':
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  case 'weekly':
                    return `Week ${Math.ceil(date.getDate() / 7)}`;
                  default:
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
              }}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Main trend line */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
            />
            
            {/* Confidence breakdown lines */}
            <Line
              type="monotone"
              dataKey="confirmed"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="reported"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="rumored"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-700">Total Endorsements</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-700">Reported</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-700">Rumored</span>
        </div>
      </div>

      {/* Event annotations */}
      {highlightEvents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h4>
          <div className="flex flex-wrap gap-2">
            {highlightEvents.map((event, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {event.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {annotations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Highlights</h4>
          <div className="space-y-2">
            {annotations.slice(0, 5).map((annotation, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">
                  <span className="font-medium">{annotation.endorser}</span>
                  {' endorsed '}
                  <span className="font-medium">{annotation.candidate}</span>
                </span>
                <span className="text-gray-400">
                  {new Date(annotation.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 