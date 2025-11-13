/**
 * Multi-Source Quantum Random Number Generator
 * Aggregates multiple quantum sources for redundancy and verification
 */

import { anuQuantumRNG } from './anu-qrng';
import axios from 'axios';

export type QuantumSource = 'ANU' | 'ID_QUANTIQUE' | 'NIST' | 'CAMBRIDGE' | 'IBM' | 'PSEUDO_FALLBACK';

export interface SourceResult {
  source: QuantumSource;
  data: number[];
  success: boolean;
  latency: number;
  error?: string;
}

export interface MultiSourceResult {
  data: number[];
  sources: SourceResult[];
  consensusReached: boolean;
  timestamp: number;
  aggregationMethod: 'XOR' | 'MAJORITY' | 'WEIGHTED';
}

export class MultiSourceQuantumRNG {
  private static instance: MultiSourceQuantumRNG;

  // Source configuration and health tracking
  private sourceHealth: Map<QuantumSource, {
    successCount: number;
    failCount: number;
    avgLatency: number;
    lastSuccess: number;
  }> = new Map();

  // API endpoints (some are mock for demonstration)
  private endpoints = {
    ANU: 'https://qrng.anu.edu.au/API/jsonI.php',
    ID_QUANTIQUE: 'https://api.idquantique.com/v1/qrng', // Mock
    NIST: 'https://beacon.nist.gov/beacon/2.0/pulse/last', // Real NIST Beacon
    CAMBRIDGE: 'https://qrng.quantum.cam.ac.uk/api/v1', // Mock
    IBM: 'https://quantum-computing.ibm.com/api/qrng', // Mock
  };

  private constructor() {
    this.initializeHealthTracking();
  }

  public static getInstance(): MultiSourceQuantumRNG {
    if (!MultiSourceQuantumRNG.instance) {
      MultiSourceQuantumRNG.instance = new MultiSourceQuantumRNG();
    }
    return MultiSourceQuantumRNG.instance;
  }

  /**
   * Get quantum random numbers from multiple sources
   * Uses consensus mechanism for verification
   */
  async getMultiSourceRandom(
    length: number = 10,
    sources: QuantumSource[] = ['ANU', 'NIST'],
    requireConsensus: boolean = false
  ): Promise<MultiSourceResult> {
    const startTime = Date.now();
    const results: SourceResult[] = [];

    // Fetch from all sources in parallel
    const promises = sources.map(source => this.fetchFromSource(source, length));
    const sourceResults = await Promise.allSettled(promises);

    // Process results
    sourceResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        this.updateHealthSuccess(sources[index], result.value.latency);
      } else {
        results.push({
          source: sources[index],
          data: [],
          success: false,
          latency: Date.now() - startTime,
          error: result.reason?.message,
        });
        this.updateHealthFailure(sources[index]);
      }
    });

    // Check if we have at least one successful source
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) {
      // All sources failed, use fallback
      const fallback = await this.getFallbackRandom(length);
      results.push(fallback);
      successfulResults.push(fallback);
    }

    // Aggregate results
    const aggregated = this.aggregateResults(successfulResults);

    // Check consensus
    const consensusReached = requireConsensus
      ? this.verifyConsensus(successfulResults)
      : successfulResults.length >= 1;

    return {
      data: aggregated,
      sources: results,
      consensusReached,
      timestamp: Date.now(),
      aggregationMethod: 'XOR',
    };
  }

  /**
   * Fetch from ANU Quantum RNG
   */
  private async fetchFromANU(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    try {
      const result = await anuQuantumRNG.getQuantumRandom({ length, cache: false });
      return {
        source: 'ANU',
        data: result.data,
        success: true,
        latency: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        source: 'ANU',
        data: [],
        success: false,
        latency: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Fetch from NIST Randomness Beacon
   */
  private async fetchFromNIST(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    try {
      const response = await axios.get(this.endpoints.NIST, { timeout: 10000 });

      if (!response.data?.pulse?.outputValue) {
        throw new Error('Invalid NIST response');
      }

      // Convert hex string to numbers
      const hexString = response.data.pulse.outputValue;
      const numbers: number[] = [];

      for (let i = 0; i < length && i * 2 < hexString.length; i++) {
        const hex = hexString.substr(i * 2, 2);
        numbers.push(parseInt(hex, 16));
      }

      // Pad if needed
      while (numbers.length < length) {
        numbers.push(parseInt(hexString.substr((numbers.length * 2) % hexString.length, 2), 16));
      }

      return {
        source: 'NIST',
        data: numbers.slice(0, length),
        success: true,
        latency: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        source: 'NIST',
        data: [],
        success: false,
        latency: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Fetch from ID Quantique (Mock implementation)
   */
  private async fetchFromIDQuantique(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    // Mock implementation - in production, use actual ID Quantique API
    return {
      source: 'ID_QUANTIQUE',
      data: [],
      success: false,
      latency: Date.now() - startTime,
      error: 'API not configured (requires API key)',
    };
  }

  /**
   * Fetch from Cambridge Quantum (Mock implementation)
   */
  private async fetchFromCambridge(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    // Mock implementation
    return {
      source: 'CAMBRIDGE',
      data: [],
      success: false,
      latency: Date.now() - startTime,
      error: 'API not configured',
    };
  }

  /**
   * Fetch from IBM Quantum (Mock implementation)
   */
  private async fetchFromIBM(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    // Mock implementation
    return {
      source: 'IBM',
      data: [],
      success: false,
      latency: Date.now() - startTime,
      error: 'API not configured (requires IBM Quantum account)',
    };
  }

  /**
   * Fallback to cryptographically secure pseudo-random
   */
  private async getFallbackRandom(length: number): Promise<SourceResult> {
    const startTime = Date.now();
    const crypto = await import('crypto');
    const bytes = crypto.randomBytes(length);
    const data = Array.from(bytes);

    return {
      source: 'PSEUDO_FALLBACK',
      data,
      success: true,
      latency: Date.now() - startTime,
    };
  }

  /**
   * Route fetch request to appropriate source
   */
  private async fetchFromSource(source: QuantumSource, length: number): Promise<SourceResult> {
    switch (source) {
      case 'ANU':
        return this.fetchFromANU(length);
      case 'NIST':
        return this.fetchFromNIST(length);
      case 'ID_QUANTIQUE':
        return this.fetchFromIDQuantique(length);
      case 'CAMBRIDGE':
        return this.fetchFromCambridge(length);
      case 'IBM':
        return this.fetchFromIBM(length);
      case 'PSEUDO_FALLBACK':
        return this.getFallbackRandom(length);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  /**
   * Aggregate results from multiple sources using XOR
   */
  private aggregateResults(results: SourceResult[]): number[] {
    if (results.length === 0) return [];
    if (results.length === 1) return results[0].data;

    const length = Math.max(...results.map(r => r.data.length));
    const aggregated: number[] = new Array(length).fill(0);

    // XOR all sources together
    for (const result of results) {
      for (let i = 0; i < result.data.length && i < length; i++) {
        aggregated[i] ^= result.data[i];
      }
    }

    return aggregated;
  }

  /**
   * Verify consensus between sources (statistical correlation)
   */
  private verifyConsensus(results: SourceResult[]): boolean {
    if (results.length < 2) return true;

    // Calculate correlation between sources
    let totalCorrelation = 0;
    let comparisons = 0;

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const correlation = this.calculateCorrelation(results[i].data, results[j].data);
        totalCorrelation += correlation;
        comparisons++;
      }
    }

    const avgCorrelation = totalCorrelation / comparisons;

    // Quantum sources should have LOW correlation (< 0.1)
    // High correlation would indicate non-random behavior
    return avgCorrelation < 0.1;
  }

  /**
   * Calculate correlation between two data sets
   */
  private calculateCorrelation(data1: number[], data2: number[]): number {
    const len = Math.min(data1.length, data2.length);
    if (len === 0) return 0;

    const mean1 = data1.slice(0, len).reduce((a, b) => a + b, 0) / len;
    const mean2 = data2.slice(0, len).reduce((a, b) => a + b, 0) / len;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < len; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : Math.abs(numerator / denominator);
  }

  /**
   * Initialize health tracking for all sources
   */
  private initializeHealthTracking(): void {
    const sources: QuantumSource[] = ['ANU', 'ID_QUANTIQUE', 'NIST', 'CAMBRIDGE', 'IBM', 'PSEUDO_FALLBACK'];

    for (const source of sources) {
      this.sourceHealth.set(source, {
        successCount: 0,
        failCount: 0,
        avgLatency: 0,
        lastSuccess: 0,
      });
    }
  }

  /**
   * Update health tracking on success
   */
  private updateHealthSuccess(source: QuantumSource, latency: number): void {
    const health = this.sourceHealth.get(source);
    if (!health) return;

    health.successCount++;
    health.avgLatency = (health.avgLatency * (health.successCount - 1) + latency) / health.successCount;
    health.lastSuccess = Date.now();
  }

  /**
   * Update health tracking on failure
   */
  private updateHealthFailure(source: QuantumSource): void {
    const health = this.sourceHealth.get(source);
    if (!health) return;

    health.failCount++;
  }

  /**
   * Get health status of all sources
   */
  getSourceHealth(): Map<QuantumSource, any> {
    const healthReport = new Map();

    for (const [source, health] of this.sourceHealth.entries()) {
      const total = health.successCount + health.failCount;
      healthReport.set(source, {
        ...health,
        successRate: total > 0 ? (health.successCount / total * 100).toFixed(2) + '%' : 'N/A',
        status: health.successCount > 0 && Date.now() - health.lastSuccess < 3600000 ? 'HEALTHY' : 'UNKNOWN',
      });
    }

    return healthReport;
  }

  /**
   * Get recommended sources based on health
   */
  getRecommendedSources(): QuantumSource[] {
    const healthy: QuantumSource[] = [];

    for (const [source, health] of this.sourceHealth.entries()) {
      const total = health.successCount + health.failCount;
      const successRate = total > 0 ? health.successCount / total : 0;

      if (successRate > 0.8 || health.successCount === 0) {
        healthy.push(source);
      }
    }

    // Always include ANU and NIST as primary sources
    const recommended = ['ANU', 'NIST', ...healthy.filter(s => s !== 'ANU' && s !== 'NIST' && s !== 'PSEUDO_FALLBACK')];

    return recommended.slice(0, 3) as QuantumSource[];
  }
}

// Export singleton
export const multiSourceQRNG = MultiSourceQuantumRNG.getInstance();

export default MultiSourceQuantumRNG;
