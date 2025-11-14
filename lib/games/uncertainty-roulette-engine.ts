/**
 * Uncertainty Roulette Game Engine
 * Quantum Roulette with Heisenberg Uncertainty Principle
 * - Ball exists in superposition across all numbers
 * - Quantum tunneling between pockets
 * - Wave function collapse determines outcome
 * - Uncertainty principle: knowing position reduces momentum certainty
 */

import { quantumStateManager } from '../quantum/quantum-state';
import { quantumPipeline } from '../quantum/randomness-pipeline';
import * as math from 'mathjs';

// Roulette numbers (European style: 0-36)
export const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

// Color mapping
export const NUMBER_COLORS: Record<number, 'red' | 'black' | 'green'> = {
  0: 'green',
  1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
  7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
  13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
  19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
  25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
  31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red',
};

export type BetType =
  | 'straight'      // Single number (35:1)
  | 'split'         // Two numbers (17:1)
  | 'street'        // Three numbers (11:1)
  | 'corner'        // Four numbers (8:1)
  | 'line'          // Six numbers (5:1)
  | 'dozen'         // 12 numbers (2:1)
  | 'column'        // 12 numbers (2:1)
  | 'red'           // Red (1:1)
  | 'black'         // Black (1:1)
  | 'even'          // Even (1:1)
  | 'odd'           // Odd (1:1)
  | 'low'           // 1-18 (1:1)
  | 'high';         // 19-36 (1:1)

// Special quantum bet types
export type QuantumBetType =
  | 'superposition'     // Bet on multiple numbers in superposition (custom payout)
  | 'entangled-pair'    // Bet on two entangled numbers (15:1)
  | 'tunnel-bet'        // Bet including tunneling probability (20:1)
  | 'uncertainty'       // Higher uncertainty = higher payout (varies)
  | 'wave-collapse';    // Bet on collapse pattern (10:1)

export interface RouletteBet {
  id: string;
  type: BetType | QuantumBetType;
  numbers: number[];
  amount: number;
  quantumProperties?: {
    superpositionStrength: number;
    entanglementPairs?: [number, number][];
    tunnelingProbability?: number;
    uncertaintyLevel?: number;
  };
}

export interface QuantumBall {
  id: string;
  position: number | null; // null = superposition
  isObserved: boolean;
  superpositionStates: Array<{ number: number; probability: number }>;
  momentum: number; // Heisenberg uncertainty: high position certainty = low momentum certainty
  tunneledFromNumber: number | null;
}

export interface RouletteGameState {
  ball: QuantumBall;
  bets: RouletteBet[];
  totalBet: number;
  spinning: boolean;
  result: number | null;
  winAmount: number;
  phase: 'betting' | 'spinning' | 'collapsing' | 'result';
}

/**
 * Uncertainty Roulette Engine
 */
export class UncertaintyRouletteEngine {
  private gameState: RouletteGameState | null = null;
  private ballId: string = '';

  /**
   * Initialize new game
   */
  initGame(): RouletteGameState {
    this.ballId = `ball-${Date.now()}`;

    // Create ball in superposition across all numbers
    const superpositionStates = ROULETTE_NUMBERS.map(num => ({
      number: num,
      probability: 1 / ROULETTE_NUMBERS.length,
    }));

    // Register quantum state
    const amplitudes = superpositionStates.map(s =>
      math.complex(Math.sqrt(s.probability), 0)
    );
    quantumStateManager.createSuperposition(this.ballId, amplitudes, false);

    this.gameState = {
      ball: {
        id: this.ballId,
        position: null,
        isObserved: false,
        superpositionStates,
        momentum: 100, // High initial momentum
        tunneledFromNumber: null,
      },
      bets: [],
      totalBet: 0,
      spinning: false,
      result: null,
      winAmount: 0,
      phase: 'betting',
    };

    return this.gameState;
  }

  /**
   * Place a bet
   */
  placeBet(bet: Omit<RouletteBet, 'id'>): void {
    if (!this.gameState || this.gameState.phase !== 'betting') return;

    const betWithId: RouletteBet = {
      ...bet,
      id: `bet-${Date.now()}-${Math.random()}`,
    };

    this.gameState.bets.push(betWithId);
    this.gameState.totalBet += bet.amount;
  }

  /**
   * Spin the wheel (start quantum evolution)
   */
  async spin(): Promise<void> {
    if (!this.gameState || this.gameState.bets.length === 0) return;

    this.gameState.spinning = true;
    this.gameState.phase = 'spinning';

    // Apply quantum evolution during spin
    await this.applyQuantumEvolution();

    // Apply quantum tunneling
    await this.applyQuantumTunneling();

    // Enter collapse phase
    this.gameState.phase = 'collapsing';
  }

  /**
   * Apply quantum evolution (wave function spreads and interferes)
   */
  private async applyQuantumEvolution(): Promise<void> {
    if (!this.gameState) return;

    const ball = this.gameState.ball;

    // Apply decoherence (interaction with environment)
    const decoherenceTime = 2000; // ms
    quantumStateManager.applyDecoherence(ball.id, decoherenceTime);

    // Heisenberg uncertainty: as we know position better, momentum becomes uncertain
    // Higher momentum = more spread in position
    const momentumFactor = ball.momentum / 100;

    // Redistribute probabilities based on quantum interference
    for (let i = 0; i < ball.superpositionStates.length; i++) {
      const state = ball.superpositionStates[i];

      // Quantum interference pattern (some numbers more likely)
      const interferenceBoost = Math.cos(state.number * Math.PI / 18) * 0.1 * momentumFactor;
      state.probability += interferenceBoost;
    }

    // Renormalize probabilities
    const totalProb = ball.superpositionStates.reduce((sum, s) => sum + s.probability, 0);
    ball.superpositionStates.forEach(s => s.probability /= totalProb);
  }

  /**
   * Apply quantum tunneling (ball can tunnel through barriers)
   */
  private async applyQuantumTunneling(): Promise<void> {
    if (!this.gameState) return;

    const ball = this.gameState.ball;

    // 15% chance of tunneling event
    const tunnelingRand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;

    if (tunnelingRand < 0.15) {
      // Select source and target for tunneling
      const sourceIdx = Math.floor(Math.random() * ball.superpositionStates.length);
      const targetIdx = Math.floor(Math.random() * ball.superpositionStates.length);

      const source = ball.superpositionStates[sourceIdx];
      const target = ball.superpositionStates[targetIdx];

      // Transfer probability (tunneling)
      const tunnelingAmount = source.probability * 0.3;
      source.probability -= tunnelingAmount;
      target.probability += tunnelingAmount;

      ball.tunneledFromNumber = source.number;

      // Renormalize
      const totalProb = ball.superpositionStates.reduce((sum, s) => sum + s.probability, 0);
      ball.superpositionStates.forEach(s => s.probability /= totalProb);
    }
  }

  /**
   * Collapse wave function (measure final position)
   */
  async collapse(): Promise<number> {
    if (!this.gameState) return 0;

    const ball = this.gameState.ball;

    // Use quantum RNG for measurement
    const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;

    // Collapse based on probability distribution
    let cumulativeProb = 0;
    let resultNumber = 0;

    for (const state of ball.superpositionStates) {
      cumulativeProb += state.probability;
      if (rand < cumulativeProb) {
        resultNumber = state.number;
        break;
      }
    }

    // Measure quantum state
    quantumStateManager.measure(ball.id);

    // Update ball state
    ball.position = resultNumber;
    ball.isObserved = true;
    ball.momentum = 0; // Heisenberg: position known → momentum uncertain

    // Update game state
    this.gameState.result = resultNumber;
    this.gameState.spinning = false;
    this.gameState.phase = 'result';

    // Calculate winnings
    this.calculateWinnings();

    return resultNumber;
  }

  /**
   * Calculate winnings for all bets
   */
  private calculateWinnings(): void {
    if (!this.gameState || this.gameState.result === null) return;

    const result = this.gameState.result;
    let totalWin = 0;

    for (const bet of this.gameState.bets) {
      const won = this.checkBetWin(bet, result);
      if (won) {
        const payout = this.calculatePayout(bet, result);
        totalWin += payout;
      }
    }

    this.gameState.winAmount = totalWin;
  }

  /**
   * Check if bet wins
   */
  private checkBetWin(bet: RouletteBet, result: number): boolean {
    switch (bet.type) {
      case 'straight':
      case 'superposition':
      case 'entangled-pair':
      case 'tunnel-bet':
      case 'wave-collapse':
        return bet.numbers.includes(result);

      case 'red':
        return NUMBER_COLORS[result] === 'red';

      case 'black':
        return NUMBER_COLORS[result] === 'black';

      case 'even':
        return result !== 0 && result % 2 === 0;

      case 'odd':
        return result !== 0 && result % 2 === 1;

      case 'low':
        return result >= 1 && result <= 18;

      case 'high':
        return result >= 19 && result <= 36;

      case 'dozen':
        if (bet.numbers.length === 12) {
          return bet.numbers.includes(result);
        }
        return false;

      case 'column':
        if (bet.numbers.length === 12) {
          return bet.numbers.includes(result);
        }
        return false;

      default:
        return bet.numbers.includes(result);
    }
  }

  /**
   * Calculate payout for winning bet
   */
  private calculatePayout(bet: RouletteBet, result: number): number {
    const basePayouts: Record<BetType, number> = {
      'straight': 35,
      'split': 17,
      'street': 11,
      'corner': 8,
      'line': 5,
      'dozen': 2,
      'column': 2,
      'red': 1,
      'black': 1,
      'even': 1,
      'odd': 1,
      'low': 1,
      'high': 1,
    };

    const quantumPayouts: Record<QuantumBetType, number> = {
      'superposition': 10, // Base, modified by superposition strength
      'entangled-pair': 15,
      'tunnel-bet': 20,
      'uncertainty': 12,
      'wave-collapse': 10,
    };

    let multiplier = 1;

    if (bet.type in basePayouts) {
      multiplier = basePayouts[bet.type as BetType];
    } else if (bet.type in quantumPayouts) {
      multiplier = quantumPayouts[bet.type as QuantumBetType];

      // Quantum bonuses
      if (bet.type === 'superposition' && bet.quantumProperties?.superpositionStrength) {
        multiplier *= (1 + bet.quantumProperties.superpositionStrength);
      }

      if (bet.type === 'tunnel-bet' && this.gameState?.ball.tunneledFromNumber !== null) {
        multiplier *= 1.5; // Bonus if tunneling occurred
      }

      if (bet.type === 'uncertainty' && bet.quantumProperties?.uncertaintyLevel) {
        multiplier *= (1 + bet.quantumProperties.uncertaintyLevel * 2);
      }
    }

    return bet.amount * multiplier + bet.amount; // Payout includes original bet
  }

  /**
   * Get probability distribution (for visualization)
   */
  getProbabilityDistribution(): Array<{ number: number; probability: number }> {
    if (!this.gameState) return [];
    return [...this.gameState.ball.superpositionStates];
  }

  /**
   * Get game state
   */
  getGameState(): RouletteGameState | null {
    return this.gameState;
  }

  /**
   * Reset game
   */
  reset(): void {
    if (this.ballId) {
      quantumStateManager.reset();
    }
    this.gameState = null;
    this.ballId = '';
  }

  /**
   * Helper: Get numbers for bet type
   */
  static getNumbersForBetType(type: BetType, value?: number | number[]): number[] {
    switch (type) {
      case 'straight':
        return typeof value === 'number' ? [value] : [];

      case 'red':
        return ROULETTE_NUMBERS.filter(n => NUMBER_COLORS[n] === 'red');

      case 'black':
        return ROULETTE_NUMBERS.filter(n => NUMBER_COLORS[n] === 'black');

      case 'even':
        return ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 === 0);

      case 'odd':
        return ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 === 1);

      case 'low':
        return Array.from({ length: 18 }, (_, i) => i + 1);

      case 'high':
        return Array.from({ length: 18 }, (_, i) => i + 19);

      case 'dozen':
        if (typeof value === 'number') {
          const start = (value - 1) * 12 + 1;
          return Array.from({ length: 12 }, (_, i) => start + i);
        }
        return [];

      case 'column':
        if (typeof value === 'number') {
          return Array.from({ length: 12 }, (_, i) => value + i * 3);
        }
        return [];

      default:
        return Array.isArray(value) ? value : [];
    }
  }
}

// Export singleton
export const uncertaintyRoulette = new UncertaintyRouletteEngine();
export default UncertaintyRouletteEngine;
