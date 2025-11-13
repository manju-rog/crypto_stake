/**
 * Bell Inequality Verification System
 * Verifies quantum entanglement through CHSH inequality tests
 */

import * as math from 'mathjs';

export interface BellTestResult {
  chshValue: number;
  violated: boolean;
  confidence: number;
  measurements: number;
  correlation: {
    aa: number;
    ab: number;
    ba: number;
    bb: number;
  };
  timestamp: number;
}

export interface MeasurementBasis {
  angle: number;
  axis: [number, number, number];
}

/**
 * Bell Inequality Tester
 * Implements CHSH (Clauser-Horne-Shimony-Holt) inequality test
 */
export class BellInequalityTester {
  /**
   * Perform CHSH inequality test
   * Classical limit: |S| ≤ 2
   * Quantum mechanics: |S| can reach 2√2 ≈ 2.828
   */
  static performCHSHTest(
    measurementsAA: [number, number][],
    measurementsAB: [number, number][],
    measurementsBA: [number, number][],
    measurementsBB: [number, number][]
  ): BellTestResult {
    // Calculate correlation coefficients
    const corrAA = this.calculateCorrelation(measurementsAA);
    const corrAB = this.calculateCorrelation(measurementsAB);
    const corrBA = this.calculateCorrelation(measurementsBA);
    const corrBB = this.calculateCorrelation(measurementsBB);

    // Calculate CHSH value: S = E(a,b) - E(a,b') + E(a',b) + E(a',b')
    const chshValue = Math.abs(corrAA - corrAB + corrBA + corrBB);

    // Check violation (quantum if > 2)
    const violated = chshValue > 2.0;

    // Calculate statistical confidence
    const totalMeasurements = measurementsAA.length + measurementsAB.length +
                              measurementsBA.length + measurementsBB.length;

    const confidence = this.calculateConfidence(chshValue, totalMeasurements);

    return {
      chshValue,
      violated,
      confidence,
      measurements: totalMeasurements,
      correlation: {
        aa: corrAA,
        ab: corrAB,
        ba: corrBA,
        bb: corrBB,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate correlation coefficient E(a,b) = (N++ + N-- - N+- - N-+) / N
   */
  private static calculateCorrelation(measurements: [number, number][]): number {
    if (measurements.length === 0) return 0;

    let sameSigns = 0;
    let diffSigns = 0;

    for (const [a, b] of measurements) {
      if ((a > 0 && b > 0) || (a < 0 && b < 0)) {
        sameSigns++;
      } else {
        diffSigns++;
      }
    }

    return (sameSigns - diffSigns) / measurements.length;
  }

  /**
   * Calculate statistical confidence level
   */
  private static calculateConfidence(chshValue: number, numMeasurements: number): number {
    // Standard error for CHSH
    const standardError = 2 / Math.sqrt(numMeasurements);

    // Z-score
    const zScore = (chshValue - 2.0) / standardError;

    // Convert to confidence level (simplified)
    const confidence = Math.min(99.9, Math.max(0, (1 - Math.exp(-zScore * zScore / 2)) * 100));

    return confidence;
  }

  /**
   * Generate optimal measurement bases for maximum violation
   * Alice: 0°, 45°
   * Bob: 22.5°, 67.5°
   */
  static getOptimalBases(): {
    alice: [MeasurementBasis, MeasurementBasis];
    bob: [MeasurementBasis, MeasurementBasis];
  } {
    return {
      alice: [
        { angle: 0, axis: [1, 0, 0] },
        { angle: Math.PI / 4, axis: [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0] },
      ],
      bob: [
        { angle: Math.PI / 8, axis: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8), 0] },
        { angle: 3 * Math.PI / 8, axis: [Math.cos(3 * Math.PI / 8), Math.sin(3 * Math.PI / 8), 0] },
      ],
    };
  }

  /**
   * Simulate quantum measurement on entangled pair
   * Returns ±1 for each particle
   */
  static simulateMeasurement(
    basisAlice: MeasurementBasis,
    basisBob: MeasurementBasis,
    entangledState: 'singlet' | 'triplet' = 'singlet'
  ): [number, number] {
    // Angle between measurement bases
    const angleDiff = basisBob.angle - basisAlice.angle;

    // Quantum correlation: -cos(angle_diff) for singlet state
    const correlation = entangledState === 'singlet'
      ? -Math.cos(angleDiff)
      : Math.cos(angleDiff);

    // Alice's measurement (random ±1)
    const aliceResult = Math.random() < 0.5 ? 1 : -1;

    // Bob's measurement (correlated with Alice)
    const bobProb = (1 + correlation) / 2; // Probability of same result
    const bobResult = Math.random() < bobProb ? aliceResult : -aliceResult;

    return [aliceResult, bobResult];
  }

  /**
   * Run full CHSH test with simulated measurements
   */
  static runFullTest(numMeasurements: number = 1000): BellTestResult {
    const bases = this.getOptimalBases();

    const measurementsAA: [number, number][] = [];
    const measurementsAB: [number, number][] = [];
    const measurementsBA: [number, number][] = [];
    const measurementsBB: [number, number][] = [];

    const measurementsPerPair = Math.floor(numMeasurements / 4);

    // E(a, b)
    for (let i = 0; i < measurementsPerPair; i++) {
      measurementsAA.push(this.simulateMeasurement(bases.alice[0], bases.bob[0]));
    }

    // E(a, b')
    for (let i = 0; i < measurementsPerPair; i++) {
      measurementsAB.push(this.simulateMeasurement(bases.alice[0], bases.bob[1]));
    }

    // E(a', b)
    for (let i = 0; i < measurementsPerPair; i++) {
      measurementsBA.push(this.simulateMeasurement(bases.alice[1], bases.bob[0]));
    }

    // E(a', b')
    for (let i = 0; i < measurementsPerPair; i++) {
      measurementsBB.push(this.simulateMeasurement(bases.alice[1], bases.bob[1]));
    }

    return this.performCHSHTest(measurementsAA, measurementsAB, measurementsBA, measurementsBB);
  }

  /**
   * Verify if quantum entanglement is genuine
   */
  static verifyEntanglement(result: BellTestResult): {
    genuine: boolean;
    strength: number;
    description: string;
  } {
    const { chshValue, confidence, violated } = result;

    let strength = 0;
    let description = '';

    if (!violated) {
      strength = 0;
      description = 'No Bell inequality violation detected. Results consistent with classical physics.';
    } else if (chshValue < 2.2) {
      strength = 0.3;
      description = 'Weak violation. Possible quantum entanglement but inconclusive.';
    } else if (chshValue < 2.5) {
      strength = 0.6;
      description = 'Moderate violation. Likely quantum entanglement.';
    } else if (chshValue < 2.7) {
      strength = 0.85;
      description = 'Strong violation. Clear quantum entanglement.';
    } else {
      strength = 1.0;
      description = 'Maximum violation (near Tsirelson bound). Definitive quantum entanglement.';
    }

    // Adjust for confidence
    strength *= (confidence / 100);

    return {
      genuine: violated && confidence > 95,
      strength,
      description,
    };
  }
}

export default BellInequalityTester;
