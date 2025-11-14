/**
 * Quantum State Management System
 * Manages superposition, entanglement, wave functions, and measurement collapse
 */

import * as math from 'mathjs';

export type QuantumStateType = 'superposition' | 'entangled' | 'collapsed' | 'tunneled';

export interface QuantumState {
  id: string;
  type: QuantumStateType;
  amplitude: math.Complex;
  phase: number;
  probability: number;
  entangledWith: string[];
  observable: boolean;
  decoherenceTime: number;
  lastMeasurement: number;
}

export interface WaveFunction {
  states: QuantumState[];
  normalized: boolean;
  totalProbability: number;
  interference: number;
}

export interface EntanglementPair {
  state1: string;
  state2: string;
  correlation: number;
  bellState: 'phi+' | 'phi-' | 'psi+' | 'psi-' | null;
  createdAt: number;
}

export interface MeasurementResult {
  state: QuantumState;
  collapsed: boolean;
  outcome: number;
  probability: number;
  affectedStates: string[];
  timestamp: number;
}

/**
 * Quantum State Manager
 * Handles all quantum mechanical operations
 */
export class QuantumStateManager {
  private states: Map<string, QuantumState> = new Map();
  private entanglements: EntanglementPair[] = [];
  private waveFunction: WaveFunction | null = null;

  // Decoherence parameters
  private readonly DECOHERENCE_RATE = 0.1; // 10% per second
  private readonly MIN_DECOHERENCE_TIME = 5000; // 5 seconds minimum

  /**
   * Create a quantum state in superposition
   */
  createSuperposition(
    id: string,
    amplitudes: math.Complex[],
    observable: boolean = false
  ): QuantumState {
    // Normalize amplitudes
    const totalProb = amplitudes.reduce((sum, amp) => {
      return sum + (amp.re * amp.re + amp.im * amp.im);
    }, 0);

    const normFactor = Math.sqrt(totalProb);
    const normalizedAmp = math.divide(amplitudes[0], normFactor) as math.Complex;

    const state: QuantumState = {
      id,
      type: 'superposition',
      amplitude: normalizedAmp,
      phase: Math.atan2(normalizedAmp.im, normalizedAmp.re),
      probability: normalizedAmp.re * normalizedAmp.re + normalizedAmp.im * normalizedAmp.im,
      entangledWith: [],
      observable,
      decoherenceTime: Date.now() + this.MIN_DECOHERENCE_TIME,
      lastMeasurement: 0,
    };

    this.states.set(id, state);
    return state;
  }

  /**
   * Create entanglement between two states
   */
  createEntanglement(
    stateId1: string,
    stateId2: string,
    bellState: 'phi+' | 'phi-' | 'psi+' | 'psi-' = 'phi+'
  ): EntanglementPair {
    const state1 = this.states.get(stateId1);
    const state2 = this.states.get(stateId2);

    if (!state1 || !state2) {
      throw new Error('States not found');
    }

    // Update state types
    state1.type = 'entangled';
    state2.type = 'entangled';

    // Add to entangled lists
    state1.entangledWith.push(stateId2);
    state2.entangledWith.push(stateId1);

    // Calculate correlation based on Bell state
    const correlation = this.calculateBellCorrelation(bellState);

    const entanglement: EntanglementPair = {
      state1: stateId1,
      state2: stateId2,
      correlation,
      bellState,
      createdAt: Date.now(),
    };

    this.entanglements.push(entanglement);

    return entanglement;
  }

  /**
   * Calculate correlation coefficient for Bell state
   */
  private calculateBellCorrelation(bellState: string): number {
    switch (bellState) {
      case 'phi+': // |00⟩ + |11⟩ (maximally entangled)
        return 1.0;
      case 'phi-': // |00⟩ - |11⟩
        return -1.0;
      case 'psi+': // |01⟩ + |10⟩
        return 0.5;
      case 'psi-': // |01⟩ - |10⟩
        return -0.5;
      default:
        return 0;
    }
  }

  /**
   * Measure/observe a quantum state (collapse wave function)
   */
  measure(stateId: string): MeasurementResult {
    const state = this.states.get(stateId);
    if (!state) {
      throw new Error('State not found');
    }

    // Get probability
    const probability = state.probability;

    // Determine outcome based on probability
    const random = Math.random();
    const outcome = random < probability ? 1 : 0;

    // Collapse the state
    state.type = 'collapsed';
    state.amplitude = math.complex(outcome, 0);
    state.probability = outcome;
    state.lastMeasurement = Date.now();

    // Collapse entangled states
    const affectedStates: string[] = [];
    if (state.entangledWith.length > 0) {
      for (const entangledId of state.entangledWith) {
        const entangled = this.states.get(entangledId);
        if (entangled) {
          // Find correlation
          const pair = this.entanglements.find(
            e => (e.state1 === stateId && e.state2 === entangledId) ||
                 (e.state1 === entangledId && e.state2 === stateId)
          );

          if (pair) {
            // Correlated collapse
            const correlatedOutcome = this.correlatedCollapse(outcome, pair.correlation);
            entangled.type = 'collapsed';
            entangled.amplitude = math.complex(correlatedOutcome, 0);
            entangled.probability = correlatedOutcome;
            affectedStates.push(entangledId);
          }
        }
      }
    }

    return {
      state,
      collapsed: true,
      outcome,
      probability,
      affectedStates,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate correlated collapse outcome
   */
  private correlatedCollapse(originalOutcome: number, correlation: number): number {
    // Perfect correlation: same outcome
    if (correlation === 1) return originalOutcome;

    // Perfect anti-correlation: opposite outcome
    if (correlation === -1) return 1 - originalOutcome;

    // Partial correlation: probabilistic
    const prob = (1 + correlation) / 2;
    return Math.random() < prob ? originalOutcome : 1 - originalOutcome;
  }

  /**
   * Build wave function from states
   */
  buildWaveFunction(): WaveFunction {
    const states = Array.from(this.states.values());

    // Calculate total probability
    const totalProbability = states.reduce((sum, s) => sum + s.probability, 0);

    // Calculate interference pattern
    const interference = this.calculateInterference(states);

    this.waveFunction = {
      states,
      normalized: Math.abs(totalProbability - 1.0) < 0.001,
      totalProbability,
      interference,
    };

    return this.waveFunction;
  }

  /**
   * Calculate quantum interference between states
   */
  private calculateInterference(states: QuantumState[]): number {
    let interference = 0;

    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const amp1 = states[i].amplitude;
        const amp2 = states[j].amplitude;

        // Interference term: 2 * Re(amp1* × amp2)
        const conjugate = math.conj(amp1);
        const product = math.multiply(conjugate, amp2) as math.Complex;
        interference += 2 * product.re;
      }
    }

    return interference;
  }

  /**
   * Apply decoherence (gradual collapse over time)
   */
  applyDecoherence(stateId: string, deltaTime: number): QuantumState {
    const state = this.states.get(stateId);
    if (!state || state.type === 'collapsed') {
      return state!;
    }

    // Check if decoherence time expired
    if (Date.now() >= state.decoherenceTime) {
      // Force collapse
      this.measure(stateId);
      return state;
    }

    // Gradual decoherence
    const decoherenceFactor = 1 - (this.DECOHERENCE_RATE * deltaTime / 1000);
    state.amplitude = math.multiply(state.amplitude, decoherenceFactor) as math.Complex;

    // Recalculate probability
    state.probability = state.amplitude.re * state.amplitude.re +
                        state.amplitude.im * state.amplitude.im;

    return state;
  }

  /**
   * Simulate quantum tunneling
   */
  tunnel(stateId: string, barrier: number): boolean {
    const state = this.states.get(stateId);
    if (!state) return false;

    // Tunneling probability: e^(-2 * barrier * amplitude)
    const tunnelingProb = Math.exp(-2 * barrier * math.abs(state.amplitude));

    const tunneled = Math.random() < tunnelingProb;

    if (tunneled) {
      state.type = 'tunneled';
    }

    return tunneled;
  }

  /**
   * Calculate Born rule probability (|ψ|²)
   */
  calculateBornProbability(amplitude: math.Complex): number {
    return amplitude.re * amplitude.re + amplitude.im * amplitude.im;
  }

  /**
   * Get all states
   */
  getAllStates(): QuantumState[] {
    return Array.from(this.states.values());
  }

  /**
   * Get state by ID
   */
  getState(id: string): QuantumState | undefined {
    return this.states.get(id);
  }

  /**
   * Get all entanglements
   */
  getEntanglements(): EntanglementPair[] {
    return this.entanglements;
  }

  /**
   * Get current wave function
   */
  getWaveFunction(): WaveFunction | null {
    return this.waveFunction;
  }

  /**
   * Clear all states (reset)
   */
  reset(): void {
    this.states.clear();
    this.entanglements = [];
    this.waveFunction = null;
  }

  /**
   * Get state statistics
   */
  getStatistics() {
    const states = this.getAllStates();

    const byType = {
      superposition: states.filter(s => s.type === 'superposition').length,
      entangled: states.filter(s => s.type === 'entangled').length,
      collapsed: states.filter(s => s.type === 'collapsed').length,
      tunneled: states.filter(s => s.type === 'tunneled').length,
    };

    const avgProbability = states.reduce((sum, s) => sum + s.probability, 0) / states.length || 0;
    const totalEntanglements = this.entanglements.length;

    return {
      totalStates: states.length,
      byType,
      avgProbability,
      totalEntanglements,
      waveFunction: this.waveFunction,
    };
  }
}

// Export singleton
export const quantumStateManager = new QuantumStateManager();

export default QuantumStateManager;
