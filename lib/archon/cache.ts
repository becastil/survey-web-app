/**
 * @module CacheManager
 * @description In-memory cache with LRU eviction and TTL support
 */

import { CacheConfig, CachedResponse } from './types';

export class CacheManager {
  private cache: Map<string, CachedResponse> = new Map();
  private config: CacheConfig;
  private maxSize: number;
  private accessOrder: string[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      ttl: config.ttl ?? 300, // 5 minutes default
      maxSize: config.maxSize ?? 50, // 50MB default
      strategy: config.strategy ?? 'lru',
    };
    this.maxSize = this.config.maxSize! * 1024 * 1024; // Convert to bytes
  }

  /**
   * Get item from cache
   */
  async get<T>(key: string): Promise<CachedResponse<T> | null> {
    if (!this.config.enabled) {
      return null;
    }

    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    const expiresAt = cached.timestamp + (cached.ttl * 1000);
    
    if (now > expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access order for LRU
    if (this.config.strategy === 'lru') {
      this.updateAccessOrder(key);
    }

    return cached as CachedResponse<T>;
  }

  /**
   * Set item in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const itemTTL = ttl ?? this.config.ttl;
    
    // Check size limit
    const dataSize = this.estimateSize(data);
    if (dataSize > this.maxSize) {
      console.warn(`Cache item too large: ${key} (${dataSize} bytes)`);
      return;
    }

    // Evict items if needed
    while (this.getCurrentSize() + dataSize > this.maxSize) {
      this.evictOldest();
    }

    const cached: CachedResponse<T> = {
      data,
      timestamp: Date.now(),
      ttl: itemTTL,
      key,
    };

    this.cache.set(key, cached);
    this.updateAccessOrder(key);
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const items = this.cache.size;
    const sizeBytes = this.getCurrentSize();
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    
    return {
      items,
      sizeBytes,
      sizeMB: `${sizeMB}MB`,
      maxSizeMB: `${this.config.maxSize}MB`,
      strategy: this.config.strategy,
      ttl: this.config.ttl,
    };
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: any): number {
    const str = JSON.stringify(data);
    // Rough estimate: 1 char = 2 bytes in memory
    return str.length * 2;
  }

  /**
   * Get current cache size in bytes
   */
  private getCurrentSize(): number {
    let totalSize = 0;
    this.cache.forEach(item => {
      totalSize += this.estimateSize(item.data);
    });
    return totalSize;
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string) {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove from access order
   */
  private removeFromAccessOrder(key: string) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict oldest item based on strategy
   */
  private evictOldest() {
    if (this.config.strategy === 'lru' && this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift()!;
      this.cache.delete(oldest);
    } else if (this.config.strategy === 'fifo') {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.removeFromAccessOrder(firstKey);
      }
    }
  }

  /**
   * Clean up expired items periodically
   */
  startCleanup(intervalMs: number = 60000) {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      this.cache.forEach((item, key) => {
        const expiresAt = item.timestamp + (item.ttl * 1000);
        if (now > expiresAt) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
      });
    }, intervalMs);
  }
}

// Global cache instance for the application
let globalCache: CacheManager | null = null;

export function getGlobalCache(): CacheManager {
  if (!globalCache) {
    globalCache = new CacheManager({
      enabled: process.env.NODE_ENV === 'production',
      ttl: 300,
      maxSize: 100, // 100MB
      strategy: 'lru',
    });
    
    // Start cleanup in production
    if (process.env.NODE_ENV === 'production') {
      globalCache.startCleanup();
    }
  }
  return globalCache;
}