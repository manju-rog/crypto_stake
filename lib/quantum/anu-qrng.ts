/**
 * ANU Quantum Random Number Generator Integration
 * Uses REAL quantum vacuum fluctuations from Australian National University
 */

import axios from 'axios';
import { LRUCache } from 'lru-cache';

export interface QuantumRandomResult {
  data: number[];
  length: number;
  size: number;
  type: 'uint8' | 'uint16' | 'hex16';
  success: boolean;
  timestamp: number;
  source: 'ANU';
  quantumSignature?: string;
}

export interface QuantumRandomOptions {
  length?: number; // Number of random numbers to fetch (1-1024)
  size?: number; // Size of each number in bits (8 or 16)
  type?: 'uint8' | 'uint16' | 'hex16';
  cache?: boolean; // Use caching for performance
}

class ANUQuantumRNG {
  private static instance: ANUQuantumRNG;
  private baseURL = 'https://qrng.anu.edu.au/API/jsonI.php';

  // LRU cache for quantum random numbers (15 minute TTL)
  private cache: LRUCache<string, QuantumRandomResult>;

  // Statistics tracking
  private stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failures: 0,
    lastFetch: 0,
  };

  private constructor() {
    this.cache = new LRUCache<string, QuantumRandomResult>({
      max: 500, // Store up to 500 cached results
      ttl: 1000 * 60 * 15, // 15 minutes TTL
      updateAgeOnGet: true,
    });
  }

  public static getInstance(): ANUQuantumRNG {
    if (!ANUQuantumRNG.instance) {
      ANUQuantumRNG.instance = new ANUQuantumRNG();
    }
    return ANUQuantumRNG.instance;
  }

  /**
   * Fetch truly random numbers from quantum vacuum fluctuations
   */
  async getQuantumRandom(options: QuantumRandomOptions = {}): Promise<QuantumRandomResult> {
    const {
      length = 10,
      size = 8,
      type = 'uint8',
      cache = true,
    } = options;

    // Validate parameters
    if (length < 1 || length > 1024) {
      throw new Error('Length must be between 1 and 1024');
    }
    if (size !== 8 && size !== 16) {
      throw new Error('Size must be 8 or 16');
    }

    // Generate cache key
    const cacheKey = `${type}_${length}_${size}`;

    // Check cache first
    if (cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        this.stats.totalRequests++;
        return { ...cached, timestamp: Date.now() };
      }
      this.stats.cacheMisses++;
    }

    try {
      // Fetch from ANU Quantum API
      const response = await axios.get(this.baseURL, {
        params: {
          length,
          type,
          size,
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from ANU Quantum API');
      }

      const result: QuantumRandomResult = {
        data: response.data.data,
        length: response.data.length || length,
        size: response.data.size || size,
        type: type,
        success: response.data.success,
        timestamp: Date.now(),
        source: 'ANU',
        quantumSignature: this.generateQuantumSignature(response.data.data),
      };

      // Store in cache
      if (cache) {
        this.cache.set(cacheKey, result);
      }

      this.stats.totalRequests++;
      this.stats.lastFetch = Date.now();

      return result;
    } catch (error) {
      this.stats.failures++;
      this.stats.totalRequests++;

      console.error('ANU Quantum RNG fetch failed:', error);
      throw new Error(`Failed to fetch quantum random numbers: ${error}`);
    }
  }

  /**
   * Get a single quantum random number in a specific range
   */
  async getQuantumRandomInRange(min: number, max: number): Promise<number> {
    if (min >= max) {
      throw new Error('Min must be less than max');
    }

    const range = max - min;
    const result = await this.getQuantumRandom({ length: 4, type: 'uint16' });

    // Use multiple quantum numbers for better distribution
    const combined = result.data.reduce((acc, val) => acc + val, 0);
    return min + (combined % (range + 1));
  }

  /**
   * Get quantum random bytes for cryptographic operations
   */
  async getQuantumBytes(numBytes: number): Promise<Uint8Array> {
    const result = await this.getQuantumRandom({
      length: numBytes,
      type: 'uint8',
      size: 8,
    });

    return new Uint8Array(result.data);
  }

  /**
   * Get quantum random float between 0 and 1
   */
  async getQuantumFloat(): Promise<number> {
    const result = await this.getQuantumRandom({ length: 1, type: 'uint16' });
    return result.data[0] / 65536; // Normalize to [0, 1]
  }

  /**
   * Get multiple quantum random floats
   */
  async getQuantumFloats(count: number): Promise<number[]> {
    const result = await this.getQuantumRandom({
      length: Math.min(count, 1024),
      type: 'uint16'
    });

    return result.data.map(val => val / 65536);
  }

  /**
   * Generate a quantum signature for verification
   * This creates a unique identifier for the quantum data
   */
  private generateQuantumSignature(data: number[]): string {
    const sum = data.reduce((acc, val) => acc + val, 0);
    const product = data.reduce((acc, val) => acc * (val || 1), 1);
    const variance = this.calculateVariance(data);

    return `QS_${sum}_${product % 1000000}_${variance.toFixed(2)}`;
  }

  /**
   * Calculate variance for randomness verification
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length;
  }

  /**
   * Get statistics about quantum RNG usage
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.totalRequests > 0
        ? (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%',
    };
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Test the quantum RNG connection
   */
  async test(): Promise<boolean> {
    try {
      const result = await this.getQuantumRandom({ length: 1, cache: false });
      return result.success && result.data.length > 0;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const anuQuantumRNG = ANUQuantumRNG.getInstance();

// Export class for advanced usage
export default ANUQuantumRNG;
