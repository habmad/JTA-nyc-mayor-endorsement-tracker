// API client for communicating with both local and Railway endpoints
class APIClient {
  private railwayWorkerUrl: string;

  constructor() {
    this.railwayWorkerUrl = process.env.RAILWAY_WORKER_URL || '';
  }

  // Get the Railway worker URL
  getRailwayWorkerUrl(): string {
    return this.railwayWorkerUrl;
  }

  // Check if Railway worker is available
  async checkRailwayWorkerHealth(): Promise<boolean> {
    if (!this.railwayWorkerUrl) {
      console.warn('Railway worker URL not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.railwayWorkerUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Railway worker health check failed:', error);
      return false;
    }
  }

  // Get system status from Railway worker
  async getRailwayWorkerStatus(): Promise<any> {
    if (!this.railwayWorkerUrl) {
      throw new Error('Railway worker URL not configured');
    }

    try {
      const response = await fetch(`${this.railwayWorkerUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Railway worker responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get Railway worker status:', error);
      throw error;
    }
  }

  // Trigger background job on Railway worker
  async triggerRailwayJob(jobType: string, data?: any): Promise<any> {
    if (!this.railwayWorkerUrl) {
      throw new Error('Railway worker URL not configured');
    }

    try {
      const response = await fetch(`${this.railwayWorkerUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: jobType,
          data
        }),
      });

      if (!response.ok) {
        throw new Error(`Railway worker job trigger failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to trigger Railway job:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();
