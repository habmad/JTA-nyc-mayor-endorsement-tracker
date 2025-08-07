import { create } from 'zustand';
import { Candidate, Endorser, Endorsement, EndorserCategory, ConfidenceLevel } from '../types/database';

interface FilterState {
  candidates: string[];
  categories: EndorserCategory[];
  confidence: ConfidenceLevel[];
  dateRange: [Date | null, Date | null];
  influenceMin: number;
  searchQuery: string;
  borough: string[];
  endorsementType: string[];
  hasRetraction: boolean;
}

interface EndorsementState {
  // Data
  candidates: Candidate[];
  endorsers: Endorser[];
  endorsements: Endorsement[];
  
  // UI State
  selectedCandidate: string | null;
  selectedEndorser: string | null;
  viewMode: 'compact' | 'detailed';
  layout: {
    mobile: 'vertical-stack';
    tablet: '2x2-grid';
    desktop: '1x4-row';
  };
  showFilters: {
    mobile: 'drawer';
    tablet: 'sidebar';
    desktop: 'inline';
  };
  
  // Filters
  filters: FilterState;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface EndorsementActions {
  // Data actions
  setCandidates: (candidates: Candidate[]) => void;
  setEndorsers: (endorsers: Endorser[]) => void;
  setEndorsements: (endorsements: Endorsement[]) => void;
  
  // UI actions
  setSelectedCandidate: (candidateId: string | null) => void;
  setSelectedEndorser: (endorserId: string | null) => void;
  setViewMode: (mode: 'compact' | 'detailed') => void;
  
  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed getters
  getFilteredEndorsements: () => Endorsement[];
  getCandidateEndorsements: (candidateId: string) => Endorsement[];
  getEndorserEndorsements: (endorserId: string) => Endorsement[];
  getEndorsementSummary: (candidateId: string) => {
    totalCount: number;
    confidenceBreakdown: { confirmed: number; reported: number; rumored: number };
    categoryBreakdown: Array<{ category: EndorserCategory; count: number; influenceScore: number }>;
    influenceScore: number;
    momentum: { recentEndorsements: number; trendDirection: 'up' | 'down' | 'stable' };
  };
}

const initialState: EndorsementState = {
  candidates: [],
  endorsers: [],
  endorsements: [],
  selectedCandidate: null,
  selectedEndorser: null,
  viewMode: 'compact',
  layout: {
    mobile: 'vertical-stack',
    tablet: '2x2-grid',
    desktop: '1x4-row'
  },
  showFilters: {
    mobile: 'drawer',
    tablet: 'sidebar',
    desktop: 'inline'
  },
  filters: {
    candidates: [],
    categories: [],
    confidence: [],
    dateRange: [null, null],
    influenceMin: 0,
    searchQuery: '',
    borough: [],
    endorsementType: [],
    hasRetraction: false
  },
  isLoading: false,
  error: null
};

export const useEndorsementStore = create<EndorsementState & EndorsementActions>((set, get) => ({
  ...initialState,
  
  // Data actions
  setCandidates: (candidates) => set({ candidates }),
  setEndorsers: (endorsers) => set({ endorsers }),
  setEndorsements: (endorsements) => set({ endorsements }),
  
  // UI actions
  setSelectedCandidate: (candidateId) => set({ selectedCandidate: candidateId }),
  setSelectedEndorser: (endorserId) => set({ selectedEndorser: endorserId }),
  setViewMode: (viewMode) => set({ viewMode }),
  
  // Filter actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  resetFilters: () => set((state) => ({
    filters: initialState.filters
  })),
  
  // Loading actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Computed getters
  getFilteredEndorsements: () => {
    const { endorsements, filters } = get();
    
    return endorsements.filter(endorsement => {
      // Candidate filter
      if (filters.candidates.length > 0 && !filters.candidates.includes(endorsement.candidate_id)) {
        return false;
      }
      
      // Category filter (via endorser)
      if (filters.categories.length > 0) {
        const endorser = get().endorsers.find(e => e.id === endorsement.endorser_id);
        if (!endorser || !filters.categories.includes(endorser.category)) {
          return false;
        }
      }
      
      // Confidence filter
      if (filters.confidence.length > 0 && !filters.confidence.includes(endorsement.confidence)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange[0] && endorsement.endorsed_at && endorsement.endorsed_at < filters.dateRange[0]) {
        return false;
      }
      if (filters.dateRange[1] && endorsement.endorsed_at && endorsement.endorsed_at > filters.dateRange[1]) {
        return false;
      }
      
      // Influence filter (via endorser)
      if (filters.influenceMin > 0) {
        const endorser = get().endorsers.find(e => e.id === endorsement.endorser_id);
        if (!endorser || (endorser.influence_score || 0) < filters.influenceMin) {
          return false;
        }
      }
      
      // Search query
      if (filters.searchQuery) {
        const endorser = get().endorsers.find(e => e.id === endorsement.endorser_id);
        const candidate = get().candidates.find(c => c.id === endorsement.candidate_id);
        const searchText = `${endorser?.name || ''} ${candidate?.name || ''} ${endorsement.quote || ''}`.toLowerCase();
        if (!searchText.includes(filters.searchQuery.toLowerCase())) {
          return false;
        }
      }
      
      // Borough filter (via endorser)
      if (filters.borough.length > 0) {
        const endorser = get().endorsers.find(e => e.id === endorsement.endorser_id);
        if (!endorser || !filters.borough.includes(endorser.borough || '')) {
          return false;
        }
      }
      
      // Endorsement type filter
      if (filters.endorsementType.length > 0 && !filters.endorsementType.includes(endorsement.endorsement_type)) {
        return false;
      }
      
      // Retraction filter
      if (filters.hasRetraction && !endorsement.is_retracted) {
        return false;
      }
      
      return true;
    });
  },
  
  getCandidateEndorsements: (candidateId) => {
    return get().endorsements.filter(e => e.candidate_id === candidateId);
  },
  
  getEndorserEndorsements: (endorserId) => {
    return get().endorsements.filter(e => e.endorser_id === endorserId);
  },
  
  getEndorsementSummary: (candidateId) => {
    const endorsements = get().getCandidateEndorsements(candidateId);
    const endorsers = get().endorsers;
    
    const confidenceBreakdown = {
      confirmed: endorsements.filter(e => e.confidence === 'confirmed').length,
      reported: endorsements.filter(e => e.confidence === 'reported').length,
      rumored: endorsements.filter(e => e.confidence === 'rumored').length
    };
    
    const categoryBreakdown = endorsements.reduce((acc, endorsement) => {
      const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
      if (endorser) {
        const existing = acc.find(item => item.category === endorser.category);
        if (existing) {
          existing.count++;
          existing.influenceScore += endorser.influence_score || 0;
        } else {
          acc.push({
            category: endorser.category,
            count: 1,
            influenceScore: endorser.influence_score || 0
          });
        }
      }
      return acc;
    }, [] as Array<{ category: EndorserCategory; count: number; influenceScore: number }>);
    
    const totalInfluence = endorsements.reduce((sum, endorsement) => {
      const endorser = endorsers.find(e => e.id === endorsement.endorser_id);
      return sum + (endorser?.influence_score || 0);
    }, 0);
    
    const recentEndorsements = endorsements.filter(e => {
      const daysAgo = (Date.now() - new Date(e.endorsed_at || e.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;
    
    return {
      totalCount: endorsements.length,
      confidenceBreakdown,
      categoryBreakdown,
      influenceScore: totalInfluence,
      momentum: {
        recentEndorsements,
        trendDirection: recentEndorsements > 3 ? 'up' : recentEndorsements === 0 ? 'down' : 'stable'
      }
    };
  }
})); 