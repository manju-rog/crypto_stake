/**
 * Wave Function Lottery Engine
 * Many-Worlds Lottery with Timeline Splitting
 * - Tickets exist in superposition across parallel universes
 * - Many-worlds interpretation: you win in SOME universe
 * - Quantum interference affects probabilities
 * - Timeline splitting on measurement
 * - Jackpots accumulate across universes
 */

import { quantumStateManager } from '../quantum/quantum-state';
import { quantumPipeline } from '../quantum/randomness-pipeline';
import * as math from 'mathjs';

export const LOTTERY_NUMBER_RANGE = 50; // 1-50
export const NUMBERS_PER_TICKET = 6;
export const BONUS_NUMBER_RANGE = 10; // 1-10

export interface LotteryTicket {
  id: string;
  numbers: number[];
  bonusNumber: number;
  cost: number;
  isQuantum: boolean; // Quantum tickets exist in superposition
  universes: Array<{
    id: string;
    numbers: number[];
    bonusNumber: number;
    probability: number;
  }>;
}

export interface DrawResult {
  mainNumbers: number[];
  bonusNumber: number;
  timestamp: number;
  quantumSignature: string;
}

export interface WinningTicket {
  ticket: LotteryTicket;
  matchedNumbers: number[];
  matchedBonus: boolean;
  prize: number;
  universe: string | null; // Which universe won (for quantum tickets)
}

export interface LotteryGameState {
  tickets: LotteryTicket[];
  jackpot: number;
  drawResult: DrawResult | null;
  winners: WinningTicket[];
  phase: 'buying' | 'drawing' | 'collapsing' | 'results';
  totalUniverses: number; // Number of parallel universes
  interferencePattern: number[]; // Quantum interference affects probabilities
}

/**
 * Wave Function Lottery Engine
 */
export class WaveFunctionLotteryEngine {
  private gameState: LotteryGameState | null = null;
  private baseJackpot = 10000;

  /**
   * Initialize new lottery game
   */
  initGame(startingJackpot?: number): LotteryGameState {
    this.gameState = {
      tickets: [],
      jackpot: startingJackpot || this.baseJackpot,
      drawResult: null,
      winners: [],
      phase: 'buying',
      totalUniverses: 1,
      interferencePattern: Array(LOTTERY_NUMBER_RANGE + 1).fill(1.0), // Uniform initially
    };

    return this.gameState;
  }

  /**
   * Buy classical ticket
   */
  buyClassicalTicket(numbers: number[], bonusNumber: number, cost: number): LotteryTicket {
    if (!this.gameState) throw new Error('Game not initialized');

    const ticket: LotteryTicket = {
      id: `ticket-${Date.now()}-${Math.random()}`,
      numbers: numbers.sort((a, b) => a - b),
      bonusNumber,
      cost,
      isQuantum: false,
      universes: [],
    };

    this.gameState.tickets.push(ticket);
    this.gameState.jackpot += cost * 0.7; // 70% to jackpot

    return ticket;
  }

  /**
   * Buy quantum ticket (exists in superposition across universes)
   */
  async buyQuantumTicket(baseNumbers: number[], cost: number): Promise<LotteryTicket> {
    if (!this.gameState) throw new Error('Game not initialized');

    const numUniverses = 5; // Ticket exists in 5 parallel universes
    const universes: LotteryTicket['universes'] = [];

    // Create superposition across universes
    for (let i = 0; i < numUniverses; i++) {
      // Generate quantum random numbers for this universe
      const numbers: number[] = [];
      for (let j = 0; j < NUMBERS_PER_TICKET; j++) {
        const num = (await quantumPipeline.getSecureRandom(1, LOTTERY_NUMBER_RANGE)).value;
        if (!numbers.includes(num)) {
          numbers.push(num);
        } else {
          j--; // Retry if duplicate
        }
      }

      const bonusNumber = (await quantumPipeline.getSecureRandom(1, BONUS_NUMBER_RANGE)).value;

      universes.push({
        id: `universe-${i}`,
        numbers: numbers.sort((a, b) => a - b),
        bonusNumber,
        probability: 1 / numUniverses,
      });
    }

    const ticket: LotteryTicket = {
      id: `qticket-${Date.now()}-${Math.random()}`,
      numbers: baseNumbers,
      bonusNumber: 0,
      cost,
      isQuantum: true,
      universes,
    };

    // Register quantum superposition
    const ticketId = `ticket-state-${ticket.id}`;
    const amplitudes = universes.map(u => math.complex(Math.sqrt(u.probability), 0));
    quantumStateManager.createSuperposition(ticketId, amplitudes, false);

    this.gameState.tickets.push(ticket);
    this.gameState.jackpot += cost * 0.7;
    this.gameState.totalUniverses = Math.max(this.gameState.totalUniverses, numUniverses);

    return ticket;
  }

  /**
   * Generate random ticket numbers
   */
  async generateRandomNumbers(): Promise<{ numbers: number[]; bonusNumber: number }> {
    const numbers: number[] = [];

    for (let i = 0; i < NUMBERS_PER_TICKET; i++) {
      let num: number;
      do {
        num = (await quantumPipeline.getSecureRandom(1, LOTTERY_NUMBER_RANGE)).value;
      } while (numbers.includes(num));
      numbers.push(num);
    }

    const bonusNumber = (await quantumPipeline.getSecureRandom(1, BONUS_NUMBER_RANGE)).value;

    return {
      numbers: numbers.sort((a, b) => a - b),
      bonusNumber,
    };
  }

  /**
   * Calculate quantum interference pattern
   */
  private calculateInterferencePattern(): void {
    if (!this.gameState) return;

    // Quantum interference: some numbers more likely due to constructive interference
    for (let i = 1; i <= LOTTERY_NUMBER_RANGE; i++) {
      // Wave interference formula: sum of cos waves
      const phase1 = Math.cos((i * Math.PI) / 7);
      const phase2 = Math.cos((i * Math.PI) / 13);
      const phase3 = Math.cos((i * Math.PI) / 19);

      const interference = (phase1 + phase2 + phase3) / 3;
      this.gameState.interferencePattern[i] = 1 + interference * 0.3; // ±30% variation
    }

    // Normalize
    const sum = this.gameState.interferencePattern.reduce((a, b) => a + b, 0);
    this.gameState.interferencePattern = this.gameState.interferencePattern.map(v => v / sum * LOTTERY_NUMBER_RANGE);
  }

  /**
   * Draw winning numbers
   */
  async draw(): Promise<DrawResult> {
    if (!this.gameState) throw new Error('Game not initialized');

    this.gameState.phase = 'drawing';

    // Calculate quantum interference
    this.calculateInterferencePattern();

    // Draw main numbers with quantum interference
    const mainNumbers: number[] = [];
    for (let i = 0; i < NUMBERS_PER_TICKET; i++) {
      let num: number;
      do {
        // Use interference pattern to bias selection
        const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;
        let cumulativeProb = 0;

        for (let n = 1; n <= LOTTERY_NUMBER_RANGE; n++) {
          cumulativeProb += this.gameState.interferencePattern[n];
          if (rand < cumulativeProb / LOTTERY_NUMBER_RANGE) {
            num = n;
            break;
          }
        }

        if (!num!) {
          num = (await quantumPipeline.getSecureRandom(1, LOTTERY_NUMBER_RANGE)).value;
        }
      } while (mainNumbers.includes(num!));

      mainNumbers.push(num!);
    }

    // Draw bonus number
    const bonusNumber = (await quantumPipeline.getSecureRandom(1, BONUS_NUMBER_RANGE)).value;

    const result: DrawResult = {
      mainNumbers: mainNumbers.sort((a, b) => a - b),
      bonusNumber,
      timestamp: Date.now(),
      quantumSignature: this.generateQuantumSignature(),
    };

    this.gameState.drawResult = result;
    this.gameState.phase = 'collapsing';

    return result;
  }

  /**
   * Collapse wave functions and determine winners
   */
  async collapseAndCheckWinners(): Promise<WinningTicket[]> {
    if (!this.gameState || !this.gameState.drawResult) return [];

    this.gameState.phase = 'collapsing';
    const winners: WinningTicket[] = [];

    for (const ticket of this.gameState.tickets) {
      if (ticket.isQuantum) {
        // Check each universe
        for (const universe of ticket.universes) {
          const { matchedNumbers, matchedBonus, prize } = this.checkTicket(
            universe.numbers,
            universe.bonusNumber
          );

          if (prize > 0) {
            // Collapse to this universe
            const ticketId = `ticket-state-${ticket.id}`;
            quantumStateManager.measure(ticketId);

            winners.push({
              ticket,
              matchedNumbers,
              matchedBonus,
              prize: Math.floor(prize * universe.probability), // Prize scaled by universe probability
              universe: universe.id,
            });
          }
        }
      } else {
        // Classical ticket
        const { matchedNumbers, matchedBonus, prize } = this.checkTicket(
          ticket.numbers,
          ticket.bonusNumber
        );

        if (prize > 0) {
          winners.push({
            ticket,
            matchedNumbers,
            matchedBonus,
            prize,
            universe: null,
          });
        }
      }
    }

    this.gameState.winners = winners;
    this.gameState.phase = 'results';

    return winners;
  }

  /**
   * Check if ticket wins
   */
  private checkTicket(
    numbers: number[],
    bonusNumber: number
  ): { matchedNumbers: number[]; matchedBonus: boolean; prize: number } {
    if (!this.gameState?.drawResult) {
      return { matchedNumbers: [], matchedBonus: false, prize: 0 };
    }

    const { mainNumbers, bonusNumber: drawnBonus } = this.gameState.drawResult;

    const matchedNumbers = numbers.filter(n => mainNumbers.includes(n));
    const matchedBonus = bonusNumber === drawnBonus;
    const matchCount = matchedNumbers.length;

    // Prize structure
    let prize = 0;
    if (matchCount === 6 && matchedBonus) {
      prize = this.gameState.jackpot; // Grand prize
    } else if (matchCount === 6) {
      prize = Math.floor(this.gameState.jackpot * 0.5);
    } else if (matchCount === 5 && matchedBonus) {
      prize = Math.floor(this.gameState.jackpot * 0.1);
    } else if (matchCount === 5) {
      prize = 1000;
    } else if (matchCount === 4) {
      prize = 100;
    } else if (matchCount === 3) {
      prize = 10;
    }

    return { matchedNumbers, matchedBonus, prize };
  }

  /**
   * Generate quantum signature for draw
   */
  private generateQuantumSignature(): string {
    const timestamp = Date.now();
    const random = Math.random();
    return `QLS-${timestamp.toString(36)}-${random.toString(36).substr(2, 9)}`;
  }

  /**
   * Get game state
   */
  getGameState(): LotteryGameState | null {
    return this.gameState;
  }

  /**
   * Get interference pattern (for visualization)
   */
  getInterferencePattern(): number[] {
    return this.gameState?.interferencePattern || [];
  }

  /**
   * Reset game
   */
  reset(keepJackpot: boolean = false): void {
    const jackpot = keepJackpot && this.gameState ? this.gameState.jackpot : this.baseJackpot;
    quantumStateManager.reset();
    this.gameState = null;
    this.initGame(jackpot);
  }

  /**
   * Quick pick (random numbers)
   */
  async quickPick(): Promise<{ numbers: number[]; bonusNumber: number }> {
    return this.generateRandomNumbers();
  }
}

// Export singleton
export const waveFunctionLottery = new WaveFunctionLotteryEngine();
export default WaveFunctionLotteryEngine;
