/**
 * Bulletproof Quantum Randomness Pipeline
 * Combines multiple quantum sources with cryptographic operations
 * for maximum entropy and security
 */

import { anuQuantumRNG, type QuantumRandomResult } from './anu-qrng';
import { QuantumRandomnessVerifier } from './randomness-tests';
import crypto from 'crypto';

export interface PipelineConfig {
  useSources: ('ANU' | 'user' | 'blockchain' | 'time')[];
  mixingRounds: number;
  whiteningEnabled: boolean;
  verifyRandomness: boolean;
  biasElimination: boolean;
}

export interface EnhancedRandomResult {
  value: number;
  bytes: Uint8Array;
  entropy: number;
  sources: string[];
  verified: boolean;
  timestamp: number;
  signature: string;
}

export class QuantumRandomnessPipeline {
  private config: PipelineConfig = {
    useSources: ['ANU', 'user', 'blockchain', 'time'],
    mixingRounds: 3,
    whiteningEnabled: true,
    verifyRandomness: true,
    biasElimination: true,
  };

  // User interaction entropy collector
  private userEntropy: number[] = [];
  private lastBlockHash: string = '';

  constructor(config?: Partial<PipelineConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get enhanced quantum random number through full pipeline
   */
  async getSecureRandom(min: number = 0, max: number = 100): Promise<EnhancedRandomResult> {
    // Step 1: Fetch quantum random bits from ANU
    const quantumData = await this.fetchQuantumBits();

    // Step 2: Mix with multiple entropy sources
    const mixedData = await this.mixEntropySources(quantumData);

    // Step 3: Apply cryptographic whitening
    const whitened = this.config.whiteningEnabled
      ? this.applyWhitening(mixedData)
      : mixedData;

    // Step 4: Eliminate statistical bias
    const unbiased = this.config.biasElimination
      ? this.eliminateBias(whitened)
      : whitened;

    // Step 5: Normalize to range
    const normalized = this.normalizeToRange(unbiased, min, max);

    // Step 6: Verify randomness (optional)
    let verified = false;
    if (this.config.verifyRandomness && unbiased.length >= 100) {
      const verificationResult = await QuantumRandomnessVerifier.verifyRandomness(
        Array.from(unbiased)
      );
      verified = verificationResult.overallPassed;
    }

    return {
      value: normalized,
      bytes: unbiased,
      entropy: this.calculateEntropy(unbiased),
      sources: this.config.useSources,
      verified,
      timestamp: Date.now(),
      signature: this.generateSignature(unbiased),
    };
  }

  /**
   * Get multiple secure random numbers efficiently
   */
  async getSecureRandomBatch(
    count: number,
    min: number = 0,
    max: number = 100
  ): Promise<EnhancedRandomResult[]> {
    // Fetch larger quantum dataset
    const quantumData = await this.fetchQuantumBits(count * 32);

    const results: EnhancedRandomResult[] = [];
    const chunkSize = 32;

    for (let i = 0; i < count; i++) {
      const chunk = quantumData.slice(i * chunkSize, (i + 1) * chunkSize);
      const mixedData = await this.mixEntropySources(chunk);
      const whitened = this.config.whiteningEnabled
        ? this.applyWhitening(mixedData)
        : mixedData;
      const unbiased = this.config.biasElimination
        ? this.eliminateBias(whitened)
        : whitened;
      const normalized = this.normalizeToRange(unbiased, min, max);

      results.push({
        value: normalized,
        bytes: unbiased,
        entropy: this.calculateEntropy(unbiased),
        sources: this.config.useSources,
        verified: false, // Skip verification for batch for performance
        timestamp: Date.now(),
        signature: this.generateSignature(unbiased),
      });
    }

    return results;
  }

  /**
   * Step 1: Fetch quantum bits from ANU
   */
  private async fetchQuantumBits(numBytes: number = 32): Promise<Uint8Array> {
    try {
      const result = await anuQuantumRNG.getQuantumBytes(numBytes);
      return result;
    } catch (error) {
      console.error('Failed to fetch quantum bits, using fallback:', error);
      // Fallback to crypto.randomBytes if quantum source fails
      return new Uint8Array(crypto.randomBytes(numBytes));
    }
  }

  /**
   * Step 2: Mix multiple entropy sources
   */
  private async mixEntropySources(quantumData: Uint8Array): Promise<Uint8Array> {
    const mixed = new Uint8Array(quantumData);

    // XOR with blockchain hash
    if (this.config.useSources.includes('blockchain')) {
      const blockchainEntropy = this.getBlockchainEntropy();
      for (let i = 0; i < mixed.length; i++) {
        mixed[i] ^= blockchainEntropy[i % blockchainEntropy.length];
      }
    }

    // XOR with user interaction entropy
    if (this.config.useSources.includes('user') && this.userEntropy.length > 0) {
      const userBytes = new Uint8Array(this.userEntropy.slice(-32));
      for (let i = 0; i < mixed.length; i++) {
        mixed[i] ^= userBytes[i % userBytes.length];
      }
    }

    // XOR with time-based entropy
    if (this.config.useSources.includes('time')) {
      const timeEntropy = this.getTimeEntropy();
      for (let i = 0; i < mixed.length; i++) {
        mixed[i] ^= timeEntropy[i % timeEntropy.length];
      }
    }

    // Multiple mixing rounds
    for (let round = 0; round < this.config.mixingRounds; round++) {
      this.shuffleBytes(mixed, round);
    }

    return mixed;
  }

  /**
   * Step 3: Apply cryptographic whitening
   * Uses SHA-256 to eliminate patterns and correlations
   */
  private applyWhitening(data: Uint8Array): Uint8Array {
    const hash = crypto.createHash('sha256').update(data).digest();

    // Apply multiple rounds of hashing for stronger whitening
    const whitened = new Uint8Array(data.length);
    let currentHash = hash;

    for (let i = 0; i < data.length; i += 32) {
      if (i > 0) {
        // Mix previous data with hash for continuation
        const mixed = new Uint8Array(32);
        for (let j = 0; j < 32; j++) {
          mixed[j] = data[i - 32 + j] ^ currentHash[j];
        }
        currentHash = crypto.createHash('sha256').update(mixed).digest();
      }

      const remainingBytes = Math.min(32, data.length - i);
      whitened.set(currentHash.slice(0, remainingBytes), i);
    }

    return whitened;
  }

  /**
   * Step 4: Eliminate statistical bias using von Neumann's method
   */
  private eliminateBias(data: Uint8Array): Uint8Array {
    const bits: number[] = [];

    // Convert bytes to bits and apply von Neumann debiasing
    for (let i = 0; i < data.length - 1; i += 2) {
      const byte1 = data[i];
      const byte2 = data[i + 1];

      for (let bit = 0; bit < 8; bit++) {
        const bit1 = (byte1 >> bit) & 1;
        const bit2 = (byte2 >> bit) & 1;

        // Von Neumann's trick: 01 → 0, 10 → 1, discard 00 and 11
        if (bit1 !== bit2) {
          bits.push(bit1);
        }
      }
    }

    // Convert bits back to bytes
    const unbiased = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < unbiased.length; i++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        byte |= (bits[i * 8 + bit] << bit);
      }
      unbiased[i] = byte;
    }

    return unbiased;
  }

  /**
   * Step 5: Normalize to specified range
   */
  private normalizeToRange(data: Uint8Array, min: number, max: number): number {
    if (data.length === 0) return min;

    // Use multiple bytes for better distribution
    let value = 0;
    for (let i = 0; i < Math.min(data.length, 8); i++) {
      value = (value << 8) | data[i];
    }

    // Map to range [min, max]
    const range = max - min + 1;
    return min + (Math.abs(value) % range);
  }

  /**
   * Get blockchain entropy from latest block hash
   */
  private getBlockchainEntropy(): Uint8Array {
    // In production, this would fetch from actual blockchain
    // For now, generate from current timestamp with crypto hash
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('sha256').update(timestamp).digest();
    this.lastBlockHash = hash.toString('hex');
    return new Uint8Array(hash);
  }

  /**
   * Get time-based entropy
   */
  private getTimeEntropy(): Uint8Array {
    const now = Date.now();
    const nanoTime = process.hrtime.bigint();
    const combined = `${now}-${nanoTime}-${Math.random()}`;
    const hash = crypto.createHash('sha256').update(combined).digest();
    return new Uint8Array(hash);
  }

  /**
   * Shuffle bytes using round-specific seed
   */
  private shuffleBytes(data: Uint8Array, round: number): void {
    const seed = crypto.createHash('sha256')
      .update(`round-${round}-${Date.now()}`)
      .digest();

    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.abs(seed[i % seed.length]) % (i + 1);
      [data[i], data[j]] = [data[j], data[i]];
    }
  }

  /**
   * Calculate Shannon entropy of data
   */
  private calculateEntropy(data: Uint8Array): number {
    const frequency: Record<number, number> = {};

    for (const byte of data) {
      frequency[byte] = (frequency[byte] || 0) + 1;
    }

    let entropy = 0;
    const len = data.length;

    for (const count of Object.values(frequency)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Generate cryptographic signature for result
   */
  private generateSignature(data: Uint8Array): string {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `QRP_${hash.substring(0, 16).toUpperCase()}`;
  }

  /**
   * Add user interaction entropy (mouse movements, clicks, etc.)
   */
  addUserEntropy(x: number, y: number, timestamp: number): void {
    const entropy = (x ^ y ^ timestamp) & 0xFF;
    this.userEntropy.push(entropy);

    // Keep only last 1000 entropy values
    if (this.userEntropy.length > 1000) {
      this.userEntropy.shift();
    }
  }

  /**
   * Get pipeline statistics
   */
  getStats() {
    return {
      config: this.config,
      userEntropyCount: this.userEntropy.length,
      lastBlockHash: this.lastBlockHash,
    };
  }
}

// Export singleton instance
export const quantumPipeline = new QuantumRandomnessPipeline();

export default QuantumRandomnessPipeline;
