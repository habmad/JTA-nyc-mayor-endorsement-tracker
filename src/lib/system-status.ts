// System status interface that can be safely used in browser
export interface SystemStatus {
  rss: {
    totalFeeds: number;
    activeFeeds: number;
    lastCheck: Date | null;
  };
  endorsers: {
    totalEndorsers: number;
    highInfluenceEndorsers: number;
    totalFeeds: number;
    feedsByCategory: Record<string, number>;
  };
  queues: {
    rss: {
      active: number;
      completed: number;
      delayed: number;
      failed: number;
      waiting: number;
    };
    classification: {
      active: number;
      completed: number;
      delayed: number;
      failed: number;
      waiting: number;
    };
    notifications: {
      active: number;
      completed: number;
      delayed: number;
      failed: number;
      waiting: number;
    };
  };
  timestamp: Date;
}

// Mock system status for development
export function getMockSystemStatus(): SystemStatus {
  return {
    rss: {
      totalFeeds: 34,
      activeFeeds: 34,
      lastCheck: new Date()
    },
    endorsers: {
      totalEndorsers: 8,
      highInfluenceEndorsers: 8,
      totalFeeds: 34,
      feedsByCategory: {
        politician: 2,
        union: 1,
        business: 1,
        celebrity: 1,
        religious: 1,
        nonprofit: 1,
        media: 1
      }
    },
    queues: {
      rss: {
        active: 0,
        completed: 0,
        delayed: 2,
        failed: 0,
        waiting: 0
      },
      classification: {
        active: 0,
        completed: 0,
        delayed: 0,
        failed: 0,
        waiting: 0
      },
      notifications: {
        active: 0,
        completed: 0,
        delayed: 0,
        failed: 0,
        waiting: 0
      }
    },
    timestamp: new Date()
  };
}

// Function to get real system status (would call API in production)
export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    // Call the API route to get system status
    const response = await fetch('/api/system-status');
    if (!response.ok) {
      throw new Error('Failed to fetch system status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching system status:', error);
    // Fallback to mock data
    return getMockSystemStatus();
  }
} 