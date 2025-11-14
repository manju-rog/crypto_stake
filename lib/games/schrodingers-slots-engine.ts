/**
 * Schrödinger's Slots Game Engine
 * Revolutionary slot machine where reels exist in quantum superposition
 */

import { quantumStateManager, type QuantumState } from '../quantum/quantum-state';
import { quantumPipeline } from '../quantum/randomness-pipeline';
import * as math from 'mathjs';

// Symbol definitions
export enum SlotSymbol {
  QUANTUM = 0,     // Highest paying - Quantum particle
  ENTANGLE = 1,    // Entanglement symbol
  WAVE = 2,        // Wave function
  PHOTON = 3,
  ELECTRON = 4,
  PROTON = 5,
  NEUTRON = 6,
  QUARK = 7,
  HIGGS = 8,
  VOID = 9         // Scatter/Free spins
}

// Quantum state types for reels
export enum ReelState {
  SUPERPOSITION = 'superposition',
  ENTANGLED = 'entangled',
  COLLAPSED = 'collapsed',
  TUNNELED = 'tunneled'
}

// Bet types
export enum BetType {
  NORMAL = 0,           // Standard bet
  SUPERPOSITION = 1,    // Bet on superposition duration
  ENTANGLEMENT = 2,     // Bet on entanglement strength
  META = 3              // Bet on quantum effects themselves
}

export interface ReelQuantumState {
  reelIndex: number;
  state: ReelState;
  symbols: SlotSymbol[];      // Superposition contains multiple symbols
  amplitude: number;          // Wave function amplitude (0-1000)
  phase: number;              // Quantum phase
  entangledWith: number[];    // Indices of entangled reels
  probability: number;        // Collapse probability
  decoherenceTime: number;    // Time until forced collapse
}

export interface SpinResult {
  reels: ReelQuantumState[];
  finalSymbols: SlotSymbol[];
  quantumFeatures: {
    superposition: boolean;
    entanglement: boolean;
    tunneling: boolean;
    interference: number;
  };
  payout: number;
  multiplier: number;
  specialFeatures: string[];
  quantumSeed: string;
  timestamp: number;
}

export interface BetConfig {
  amount: number;
  betType: BetType;
  linesActive: number;
  quantumBoost: boolean;
}

/**
 * Schrödinger's Slots Game Engine
 */
export class SchrodingersSlots {
  private readonly NUM_REELS = 5;
  private readonly SYMBOLS_PER_REEL = 3;

  // Quantum probabilities (out of 100)
  private readonly SUPERPOSITION_CHANCE = 20;
  private readonly ENTANGLEMENT_CHANCE = 15;
  private readonly TUNNELING_CHANCE = 5;

  // Payout table (multipliers)
  private readonly PAYOUTS: Map<SlotSymbol, number> = new Map([
    [SlotSymbol.QUANTUM, 100],
    [SlotSymbol.ENTANGLE, 50],
    [SlotSymbol.WAVE, 25],
    [SlotSymbol.PHOTON, 10],
    [SlotSymbol.ELECTRON, 7.5],
    [SlotSymbol.PROTON, 5],
    [SlotSymbol.NEUTRON, 2.5],
    [SlotSymbol.QUARK, 1],
    [SlotSymbol.HIGGS, 0.5],
    [SlotSymbol.VOID, 0]
  ]);

  /**
   * Spin the quantum slot machine
   */
  async spin(config: BetConfig): Promise<SpinResult> {
    // Initialize quantum states for all reels
    const reels = await this.initializeQuantumReels(config);

    // Apply quantum effects
    const enhancedReels = await this.applyQuantumEffects(reels, config);

    // Collapse wave functions to determine final symbols
    const collapsedReels = await this.collapseReels(enhancedReels);

    // Extract final symbols
    const finalSymbols = collapsedReels.map(reel => reel.symbols[0]);

    // Calculate payout
    const payout = this.calculatePayout(collapsedReels, finalSymbols, config);

    // Check for special features
    const specialFeatures = this.checkSpecialFeatures(finalSymbols);

    // Calculate quantum properties
    const quantumFeatures = {
      superposition: collapsedReels.some(r => r.state === ReelState.SUPERPOSITION),
      entanglement: collapsedReels.some(r => r.entangledWith.length > 0),
      tunneling: collapsedReels.some(r => r.state === ReelState.TUNNELED),
      interference: this.calculateInterference(collapsedReels)
    };

    return {
      reels: collapsedReels,
      finalSymbols,
      quantumFeatures,
      payout: payout.total,
      multiplier: payout.multiplier,
      specialFeatures,
      quantumSeed: payout.seed,
      timestamp: Date.now()
    };
  }

  /**
   * Initialize quantum states for all reels
   */
  private async initializeQuantumReels(config: BetConfig): Promise<ReelQuantumState[]> {
    const reels: ReelQuantumState[] = [];

    for (let i = 0; i < this.NUM_REELS; i++) {
      // Get quantum random numbers for this reel
      const quantumNums = await quantumPipeline.getSecureRandomBatch(
        this.SYMBOLS_PER_REEL,
        0,
        9
      );

      // Initialize in superposition with multiple possible symbols
      const symbols = quantumNums.map(r => r.value as SlotSymbol);

      // Create quantum state
      const stateId = `reel_${i}_${Date.now()}`;
      const amplitudes = symbols.map(() =>
        math.complex(1 / Math.sqrt(symbols.length), 0)
      );

      quantumStateManager.createSuperposition(stateId, amplitudes, false);

      const reel: ReelQuantumState = {
        reelIndex: i,
        state: ReelState.SUPERPOSITION,
        symbols: symbols,
        amplitude: Math.random() * 1000,
        phase: Math.random() * 2 * Math.PI,
        entangledWith: [],
        probability: 1 / symbols.length,
        decoherenceTime: Date.now() + 5000 // 5 second decoherence
      };

      reels.push(reel);
    }

    return reels;
  }

  /**
   * Apply quantum effects to reels
   */
  private async applyQuantumEffects(
    reels: ReelQuantumState[],
    config: BetConfig
  ): Promise<ReelQuantumState[]> {
    const rand = await quantumPipeline.getSecureRandom(0, 100);

    // Superposition (reels remain in multiple states longer)
    if (rand.value < this.SUPERPOSITION_CHANCE || config.betType === BetType.SUPERPOSITION) {
      for (const reel of reels) {
        reel.state = ReelState.SUPERPOSITION;
        reel.amplitude = Math.min(1000, reel.amplitude * 1.5);
        reel.decoherenceTime += 3000; // Extend by 3 seconds
      }
    }

    // Entanglement (correlate reel outcomes)
    const entangleRand = await quantumPipeline.getSecureRandom(0, 100);
    if (entangleRand.value < this.ENTANGLEMENT_CHANCE || config.betType === BetType.ENTANGLEMENT) {
      // Entangle reels 0 and 2, 1 and 3
      await this.createReelEntanglement(reels, 0, 2);
      await this.createReelEntanglement(reels, 1, 3);
    }

    // Quantum tunneling (symbols can jump)
    const tunnelRand = await quantumPipeline.getSecureRandom(0, 100);
    if (tunnelRand.value < this.TUNNELING_CHANCE || config.quantumBoost) {
      for (const reel of reels) {
        const shouldTunnel = await quantumPipeline.getSecureRandom(0, 100);
        if (shouldTunnel.value < 20) { // 20% per reel
          reel.state = ReelState.TUNNELED;
          // Replace one symbol with QUANTUM (tunneled through barrier)
          reel.symbols[0] = SlotSymbol.QUANTUM;
        }
      }
    }

    return reels;
  }

  /**
   * Create entanglement between two reels
   */
  private async createReelEntanglement(
    reels: ReelQuantumState[],
    index1: number,
    index2: number
  ): Promise<void> {
    if (index1 >= reels.length || index2 >= reels.length) return;

    const reel1 = reels[index1];
    const reel2 = reels[index2];

    reel1.state = ReelState.ENTANGLED;
    reel2.state = ReelState.ENTANGLED;
    reel1.entangledWith.push(index2);
    reel2.entangledWith.push(index1);

    // Create quantum entanglement in state manager
    quantumStateManager.createEntanglement(
      `reel_${index1}_${Date.now()}`,
      `reel_${index2}_${Date.now()}`,
      'phi+' // Maximally entangled Bell state
    );
  }

  /**
   * Collapse wave functions to determine final symbols
   */
  private async collapseReels(reels: ReelQuantumState[]): Promise<ReelQuantumState[]> {
    const collapsedReels: ReelQuantumState[] = [];

    for (let i = 0; i < reels.length; i++) {
      const reel = { ...reels[i] };

      if (reel.state === ReelState.ENTANGLED && reel.entangledWith.length > 0) {
        // Check if entangled partner already collapsed
        const partnerId = reel.entangledWith[0];
        const partner = collapsedReels[partnerId];

        if (partner && partner.state === ReelState.COLLAPSED) {
          // Correlated collapse - high chance of matching
          const matchRand = await quantumPipeline.getSecureRandom(0, 100);
          if (matchRand.value < 70) { // 70% correlation
            reel.symbols = [partner.symbols[0]];
          } else {
            // Pick random from superposition
            const idx = Math.floor(Math.random() * reel.symbols.length);
            reel.symbols = [reel.symbols[idx]];
          }
        } else {
          // First to collapse - pick random
          const idx = Math.floor(Math.random() * reel.symbols.length);
          reel.symbols = [reel.symbols[idx]];
        }
      } else if (reel.state === ReelState.TUNNELED) {
        // Already has symbol from tunneling
      } else {
        // Normal collapse - pick from superposition based on amplitude
        const collapseRand = await quantumPipeline.getSecureRandom(0, reel.symbols.length - 1);
        reel.symbols = [reel.symbols[collapseRand.value]];
      }

      reel.state = ReelState.COLLAPSED;
      reel.amplitude = 1000; // Max amplitude after collapse
      collapsedReels.push(reel);
    }

    return collapsedReels;
  }

  /**
   * Calculate payout based on symbols and quantum mechanics
   */
  private calculatePayout(
    reels: ReelQuantumState[],
    symbols: SlotSymbol[],
    config: BetConfig
  ): { total: number; multiplier: number; seed: string } {
    let totalPayout = 0;
    let multiplier = 1;

    // Count symbol occurrences
    const symbolCounts = new Map<SlotSymbol, number>();
    for (const symbol of symbols) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    }

    // Calculate base payout
    for (const [symbol, count] of symbolCounts.entries()) {
      if (count >= 3) {
        const basePayout = this.PAYOUTS.get(symbol) || 0;
        let adjustedPayout = basePayout;

        // Scale by count
        if (count === 3) adjustedPayout *= 0.2;
        else if (count === 4) adjustedPayout *= 0.5;
        // count === 5 uses full multiplier

        totalPayout += adjustedPayout * config.amount;
      }
    }

    // Quantum bonuses
    const entanglementBonus = reels.some(r => r.entangledWith.length > 0) ? 1.5 : 1;
    const tunnelingBonus = reels.some(r => r.state === ReelState.TUNNELED) ? 1.25 : 1;
    const superpositionBonus = config.betType === BetType.SUPERPOSITION ? 2 : 1;

    multiplier = entanglementBonus * tunnelingBonus * superpositionBonus;

    // Meta-bet bonus (betting on quantum effects)
    if (config.betType === BetType.META) {
      const hasQuantumEffects = reels.some(r =>
        r.state === ReelState.TUNNELED || r.entangledWith.length > 0
      );
      if (hasQuantumEffects) {
        multiplier *= 5;
      }
    }

    totalPayout *= multiplier;

    return {
      total: totalPayout,
      multiplier,
      seed: `QS_${Date.now()}_${Math.random().toString(36)}`
    };
  }

  /**
   * Check for special features
   */
  private checkSpecialFeatures(symbols: SlotSymbol[]): string[] {
    const features: string[] = [];

    // Count VOID symbols for free spins
    const voidCount = symbols.filter(s => s === SlotSymbol.VOID).length;
    if (voidCount >= 3) {
      features.push(`FREE_SPINS_${voidCount * 5}`);
    }

    // Check for jackpot (5 QUANTUM symbols)
    const quantumCount = symbols.filter(s => s === SlotSymbol.QUANTUM).length;
    if (quantumCount === 5) {
      features.push('PROGRESSIVE_JACKPOT');
    }

    // Schrödinger's Cat bonus (3+ WAVE symbols)
    const waveCount = symbols.filter(s => s === SlotSymbol.WAVE).length;
    if (waveCount >= 3) {
      features.push('SCHRODINGERS_CAT_BONUS');
    }

    // Timeline split (all different symbols)
    const uniqueSymbols = new Set(symbols).size;
    if (uniqueSymbols === 5) {
      features.push('TIMELINE_SPLIT');
    }

    return features;
  }

  /**
   * Calculate quantum interference between reels
   */
  private calculateInterference(reels: ReelQuantumState[]): number {
    let interference = 0;

    for (let i = 0; i < reels.length - 1; i++) {
      for (let j = i + 1; j < reels.length; j++) {
        const amp1 = math.complex(Math.cos(reels[i].phase), Math.sin(reels[i].phase));
        const amp2 = math.complex(Math.cos(reels[j].phase), Math.sin(reels[j].phase));

        // Interference term: 2 * Re(amp1* × amp2)
        const conjugate = math.conj(amp1);
        const product = math.multiply(conjugate, amp2) as math.Complex;
        interference += 2 * product.re;
      }
    }

    return interference;
  }

  /**
   * Get symbol display info
   */
  static getSymbolInfo(symbol: SlotSymbol): {
    name: string;
    emoji: string;
    color: string;
    glow: string;
  } {
    const symbols = {
      [SlotSymbol.QUANTUM]: { name: 'Quantum', emoji: '⚛️', color: '#00FFFF', glow: '#00FFFF' },
      [SlotSymbol.ENTANGLE]: { name: 'Entangle', emoji: '🔗', color: '#FF00FF', glow: '#FF00FF' },
      [SlotSymbol.WAVE]: { name: 'Wave', emoji: '🌊', color: '#0088FF', glow: '#0088FF' },
      [SlotSymbol.PHOTON]: { name: 'Photon', emoji: '💡', color: '#FFFF00', glow: '#FFFF00' },
      [SlotSymbol.ELECTRON]: { name: 'Electron', emoji: '⚡', color: '#FF8800', glow: '#FF8800' },
      [SlotSymbol.PROTON]: { name: 'Proton', emoji: '➕', color: '#FF0000', glow: '#FF0000' },
      [SlotSymbol.NEUTRON]: { name: 'Neutron', emoji: '⭕', color: '#888888', glow: '#888888' },
      [SlotSymbol.QUARK]: { name: 'Quark', emoji: '✨', color: '#8800FF', glow: '#8800FF' },
      [SlotSymbol.HIGGS]: { name: 'Higgs', emoji: '🌟', color: '#00FF00', glow: '#00FF00' },
      [SlotSymbol.VOID]: { name: 'Void', emoji: '🕳️', color: '#000000', glow: '#FFFFFF' },
    };

    return symbols[symbol];
  }
}

// Export singleton
export const schrodingersSlots = new SchrodingersSlots();

export default SchrodingersSlots;
