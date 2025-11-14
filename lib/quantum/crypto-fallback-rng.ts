/**
 * Cryptographically Secure Fallback RNG
 * Used when quantum RNG sources are unavailable
 * Uses Web Crypto API for secure random number generation
 */

import ErrorLogger from '../utils/error-logger';

export class CryptoFallbackRNG {
  private static isAvailable = typeof window !== 'undefined' && 'crypto' in window;

  /**
   * Generate cryptographically secure random bytes
   */
  static getRandomBytes(numBytes: number): Uint8Array {
    try {
      if (this.isAvailable && window.crypto) {
        return window.crypto.getRandomValues(new Uint8Array(numBytes));
      } else if (typeof require !== 'undefined') {
        // Node.js environment
        const crypto = require('crypto');
        return new Uint8Array(crypto.randomBytes(numBytes));
      } else {
        ErrorLogger.warn(
          'Crypto API not available, using Math.random() fallback',
          'CryptoFallbackRNG'
        );
        return this.mathRandomFallback(numBytes);
      }
    } catch (error) {
      ErrorLogger.error(
        'Failed to generate crypto random bytes',
        error instanceof Error ? error : new Error(String(error)),
        'CryptoFallbackRNG'
      );
      return this.mathRandomFallback(numBytes);
    }
  }

  /**
   * Math.random() fallback (not cryptographically secure, use only as last resort)
   */
  private static mathRandomFallback(numBytes: number): Uint8Array {
    ErrorLogger.warn(
      'Using insecure Math.random() for RNG - this should only happen in tests',
      'CryptoFallbackRNG'
    );

    const bytes = new Uint8Array(numBytes);
    for (let i = 0; i < numBytes; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  /**
   * Generate random number in range [min, max]
   */
  static getRandomNumber(min: number, max: number): number {
    try {
      if (min > max) {
        throw new Error(`Invalid range: min (${min}) > max (${max})`);
      }

      if (min === max) {
        return min;
      }

      const range = max - min + 1;
      const bytesNeeded = Math.ceil(Math.log2(range) / 8);
      const randomBytes = this.getRandomBytes(bytesNeeded);

      // Convert bytes to number
      let randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) | randomBytes[i];
      }

      // Reduce bias by rejection sampling
      const maxValidValue = Math.floor((256 ** bytesNeeded) / range) * range;
      if (randomValue >= maxValidValue) {
        // Retry if we got a biased value
        return this.getRandomNumber(min, max);
      }

      return min + (randomValue % range);
    } catch (error) {
      ErrorLogger.error(
        'Failed to generate random number',
        error instanceof Error ? error : new Error(String(error)),
        'CryptoFallbackRNG',
        { min, max }
      );
      // Ultimate fallback
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  /**
   * Generate array of random numbers
   */
  static getRandomNumbers(count: number, min: number, max: number): number[] {
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(this.getRandomNumber(min, max));
    }
    return numbers;
  }

  /**
   * Generate random float between 0 and 1
   */
  static getRandomFloat(): number {
    try {
      const bytes = this.getRandomBytes(4);
      const maxValue = 0xFFFFFFFF;
      const value = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
      return value / maxValue;
    } catch (error) {
      ErrorLogger.error(
        'Failed to generate random float',
        error instanceof Error ? error : new Error(String(error)),
        'CryptoFallbackRNG'
      );
      return Math.random();
    }
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.getRandomNumber(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    try {
      if (this.isAvailable && window.crypto && 'randomUUID' in window.crypto) {
        return window.crypto.randomUUID();
      }

      const bytes = this.getRandomBytes(16);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant

      const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } catch (error) {
      ErrorLogger.error(
        'Failed to generate UUID',
        error instanceof Error ? error : new Error(String(error)),
        'CryptoFallbackRNG'
      );
      // Fallback UUID generation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * Check if crypto API is available
   */
  static isCryptoAvailable(): boolean {
    return this.isAvailable;
  }
}

export default CryptoFallbackRNG;
