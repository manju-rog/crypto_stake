/**
 * Input Validation Utilities
 * Comprehensive validation for all user inputs across the casino
 */

import ErrorLogger from './error-logger';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InputValidator {
  /**
   * Validate number is within range
   */
  static validateNumber(
    value: number,
    min: number,
    max: number,
    fieldName: string = 'value'
  ): number {
    if (typeof value !== 'number' || isNaN(value)) {
      const error = new ValidationError(`${fieldName} must be a valid number`, fieldName);
      ErrorLogger.warn(`Invalid number: ${value}`, 'InputValidator', { value, fieldName });
      throw error;
    }

    if (value < min || value > max) {
      const error = new ValidationError(
        `${fieldName} must be between ${min} and ${max}`,
        fieldName
      );
      ErrorLogger.warn(`Number out of range: ${value}`, 'InputValidator', {
        value,
        min,
        max,
        fieldName,
      });
      throw error;
    }

    return value;
  }

  /**
   * Validate integer
   */
  static validateInteger(value: number, fieldName: string = 'value'): number {
    if (!Number.isInteger(value)) {
      const error = new ValidationError(`${fieldName} must be an integer`, fieldName);
      ErrorLogger.warn(`Not an integer: ${value}`, 'InputValidator', { value, fieldName });
      throw error;
    }

    return value;
  }

  /**
   * Validate positive number
   */
  static validatePositive(value: number, fieldName: string = 'value'): number {
    if (value <= 0) {
      const error = new ValidationError(`${fieldName} must be positive`, fieldName);
      ErrorLogger.warn(`Not positive: ${value}`, 'InputValidator', { value, fieldName });
      throw error;
    }

    return value;
  }

  /**
   * Validate array length
   */
  static validateArrayLength<T>(
    array: T[],
    minLength: number,
    maxLength: number,
    fieldName: string = 'array'
  ): T[] {
    if (!Array.isArray(array)) {
      const error = new ValidationError(`${fieldName} must be an array`, fieldName);
      ErrorLogger.warn('Not an array', 'InputValidator', { array, fieldName });
      throw error;
    }

    if (array.length < minLength || array.length > maxLength) {
      const error = new ValidationError(
        `${fieldName} length must be between ${minLength} and ${maxLength}`,
        fieldName
      );
      ErrorLogger.warn(`Array length out of range: ${array.length}`, 'InputValidator', {
        length: array.length,
        minLength,
        maxLength,
        fieldName,
      });
      throw error;
    }

    return array;
  }

  /**
   * Validate unique array elements
   */
  static validateUnique<T>(array: T[], fieldName: string = 'array'): T[] {
    const unique = new Set(array);
    if (unique.size !== array.length) {
      const error = new ValidationError(`${fieldName} must contain unique elements`, fieldName);
      ErrorLogger.warn('Array contains duplicates', 'InputValidator', { array, fieldName });
      throw error;
    }

    return array;
  }

  /**
   * Validate string is not empty
   */
  static validateNonEmptyString(value: string, fieldName: string = 'value'): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      const error = new ValidationError(`${fieldName} must be a non-empty string`, fieldName);
      ErrorLogger.warn('Empty or invalid string', 'InputValidator', { value, fieldName });
      throw error;
    }

    return value.trim();
  }

  /**
   * Validate bet amount
   */
  static validateBetAmount(amount: number, balance: number, minBet: number = 1): number {
    this.validateNumber(amount, minBet, Number.MAX_SAFE_INTEGER, 'bet amount');
    this.validateInteger(amount, 'bet amount');
    this.validatePositive(amount, 'bet amount');

    if (amount > balance) {
      const error = new ValidationError('Insufficient balance for bet', 'bet amount');
      ErrorLogger.warn('Bet exceeds balance', 'InputValidator', { amount, balance });
      throw error;
    }

    return amount;
  }

  /**
   * Validate lottery numbers
   */
  static validateLotteryNumbers(
    numbers: number[],
    minNumber: number,
    maxNumber: number,
    requiredCount: number
  ): number[] {
    this.validateArrayLength(numbers, requiredCount, requiredCount, 'lottery numbers');
    this.validateUnique(numbers, 'lottery numbers');

    for (const num of numbers) {
      this.validateNumber(num, minNumber, maxNumber, 'lottery number');
      this.validateInteger(num, 'lottery number');
    }

    return numbers;
  }

  /**
   * Validate poker cards
   */
  static validateCardCount(count: number, expected: number): number {
    if (count !== expected) {
      const error = new ValidationError(`Expected ${expected} cards, got ${count}`, 'card count');
      ErrorLogger.warn('Invalid card count', 'InputValidator', { count, expected });
      throw error;
    }

    return count;
  }

  /**
   * Validate roulette number
   */
  static validateRouletteNumber(number: number): number {
    return this.validateNumber(number, 0, 36, 'roulette number');
  }

  /**
   * Sanitize user input (prevent XSS)
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      ErrorLogger.warn('Attempted to sanitize non-string', 'InputValidator', { input });
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate wallet address (basic check)
   */
  static validateWalletAddress(address: string): string {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

    if (!ethAddressRegex.test(address)) {
      const error = new ValidationError('Invalid Ethereum address format', 'wallet address');
      ErrorLogger.warn('Invalid wallet address', 'InputValidator', { address });
      throw error;
    }

    return address.toLowerCase();
  }

  /**
   * Safe number parse
   */
  static parseNumber(value: any, fallback: number = 0): number {
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);

    if (isNaN(parsed) || !isFinite(parsed)) {
      ErrorLogger.debug('Failed to parse number, using fallback', 'InputValidator', {
        value,
        fallback,
      });
      return fallback;
    }

    return parsed;
  }

  /**
   * Safe integer parse
   */
  static parseInt(value: any, fallback: number = 0): number {
    const parsed = typeof value === 'string' ? parseInt(value, 10) : Math.floor(Number(value));

    if (isNaN(parsed) || !isFinite(parsed)) {
      ErrorLogger.debug('Failed to parse integer, using fallback', 'InputValidator', {
        value,
        fallback,
      });
      return fallback;
    }

    return parsed;
  }

  /**
   * Validate game phase transition
   */
  static validatePhaseTransition(
    currentPhase: string,
    allowedNextPhases: string[],
    requestedPhase: string
  ): void {
    if (!allowedNextPhases.includes(requestedPhase)) {
      const error = new ValidationError(
        `Invalid phase transition from ${currentPhase} to ${requestedPhase}`,
        'game phase'
      );
      ErrorLogger.warn('Invalid phase transition', 'InputValidator', {
        currentPhase,
        requestedPhase,
        allowedNextPhases,
      });
      throw error;
    }
  }

  /**
   * Validate required fields are present
   */
  static validateRequired<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
  ): void {
    const missing: (keyof T)[] = [];

    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      const error = new ValidationError(
        `Missing required fields: ${missing.join(', ')}`,
        missing[0] as string
      );
      ErrorLogger.warn('Missing required fields', 'InputValidator', { missing, obj });
      throw error;
    }
  }
}

export default InputValidator;
