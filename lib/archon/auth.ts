/**
 * @module ArchonAuth
 * @description Authentication handler for Archon KB
 */

export class ArchonAuth {
  private static token: string | null = null;
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static refreshInterval = 3600000; // 1 hour

  /**
   * Initialize authentication
   */
  static async initialize() {
    // Use service account in production, API key in dev
    if (process.env.NODE_ENV === 'production' && process.env.ARCHON_SERVICE_ACCOUNT) {
      this.token = await this.getServiceToken();
      this.scheduleRefresh();
    } else {
      this.token = process.env.NEXT_PUBLIC_ARCHON_API_KEY || process.env.ARCHON_API_KEY || '';
    }
  }

  /**
   * Get service account token for production
   */
  private static async getServiceToken(): Promise<string> {
    try {
      const response = await fetch(`${process.env.ARCHON_API_URL}/auth/service-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceAccount: process.env.ARCHON_SERVICE_ACCOUNT,
          secret: process.env.ARCHON_SERVICE_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get service token');
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error('Service token error:', error);
      // Fallback to API key
      return process.env.ARCHON_API_KEY || '';
    }
  }

  /**
   * Schedule token refresh
   */
  private static scheduleRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(async () => {
      try {
        this.token = await this.getServiceToken();
        this.scheduleRefresh();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Retry in 5 minutes
        setTimeout(() => this.scheduleRefresh(), 300000);
      }
    }, this.refreshInterval);
  }

  /**
   * Get headers with authentication
   */
  static async getHeaders(): Promise<HeadersInit> {
    if (!this.token) {
      await this.initialize();
    }

    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId(),
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      'X-Environment': process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up on app shutdown
   */
  static cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.token = null;
  }
}