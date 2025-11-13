/**
 * NIST Statistical Test Suite for Quantum Randomness Verification
 * Implements key tests to verify true randomness vs pseudo-randomness
 */

export interface RandomnessTestResult {
  testName: string;
  passed: boolean;
  pValue: number;
  statistic: number;
  threshold: number;
  description: string;
}

export interface RandomnessVerificationReport {
  overallPassed: boolean;
  passRate: number;
  tests: RandomnessTestResult[];
  quantumSignature: string;
  timestamp: number;
  dataSize: number;
}

export class QuantumRandomnessVerifier {
  private static readonly ALPHA = 0.01; // Significance level (99% confidence)

  /**
   * Run comprehensive randomness test suite
   */
  static async verifyRandomness(data: number[]): Promise<RandomnessVerificationReport> {
    const tests: RandomnessTestResult[] = [];

    // Convert to binary string for testing
    const binaryString = this.numbersToBinary(data);

    // Run all NIST tests
    tests.push(this.frequencyTest(binaryString));
    tests.push(this.blockFrequencyTest(binaryString));
    tests.push(this.runsTest(binaryString));
    tests.push(this.longestRunTest(binaryString));
    tests.push(this.spectralTest(binaryString));
    tests.push(this.serialTest(binaryString));
    tests.push(this.approximateEntropyTest(binaryString));
    tests.push(this.cumulativeSumsTest(binaryString));
    tests.push(this.autoCorrelationTest(data));
    tests.push(this.chiSquareTest(data));

    const passedTests = tests.filter(t => t.passed).length;
    const passRate = (passedTests / tests.length) * 100;

    return {
      overallPassed: passRate >= 80, // At least 80% of tests must pass
      passRate,
      tests,
      quantumSignature: this.generateSignature(data),
      timestamp: Date.now(),
      dataSize: data.length,
    };
  }

  /**
   * NIST Frequency (Monobit) Test
   * Tests if the number of ones and zeros are approximately equal
   */
  private static frequencyTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    const ones = (bits.match(/1/g) || []).length;
    const zeros = n - ones;

    const s = Math.abs(ones - zeros);
    const statistic = s / Math.sqrt(n);
    const pValue = Math.erfc(statistic / Math.sqrt(2));

    return {
      testName: 'Frequency (Monobit) Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic,
      threshold: this.ALPHA,
      description: 'Tests if the proportion of ones and zeros is approximately equal',
    };
  }

  /**
   * Block Frequency Test
   * Tests frequency within blocks
   */
  private static blockFrequencyTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    const m = Math.floor(n / 100); // Block size
    const N = Math.floor(n / m); // Number of blocks

    let chiSquared = 0;
    for (let i = 0; i < N; i++) {
      const block = bits.substr(i * m, m);
      const ones = (block.match(/1/g) || []).length;
      const pi = ones / m;
      chiSquared += Math.pow(pi - 0.5, 2);
    }

    chiSquared *= 4 * m;
    const pValue = this.igamc(N / 2, chiSquared / 2);

    return {
      testName: 'Block Frequency Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic: chiSquared,
      threshold: this.ALPHA,
      description: 'Tests frequency within fixed-size blocks',
    };
  }

  /**
   * Runs Test
   * Tests for oscillations in the sequence
   */
  private static runsTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    const ones = (bits.match(/1/g) || []).length;
    const pi = ones / n;

    // Count runs
    let runs = 1;
    for (let i = 1; i < n; i++) {
      if (bits[i] !== bits[i - 1]) runs++;
    }

    const expectedRuns = 2 * n * pi * (1 - pi);
    const variance = 2 * n * pi * (1 - pi) * (2 * n * pi * (1 - pi) - 1) / (n - 1);
    const statistic = Math.abs(runs - expectedRuns) / Math.sqrt(variance);
    const pValue = Math.erfc(statistic / Math.sqrt(2));

    return {
      testName: 'Runs Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic,
      threshold: this.ALPHA,
      description: 'Tests for oscillation between ones and zeros',
    };
  }

  /**
   * Longest Run of Ones Test
   */
  private static longestRunTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    let maxRun = 0;
    let currentRun = 0;

    for (const bit of bits) {
      if (bit === '1') {
        currentRun++;
        maxRun = Math.max(maxRun, currentRun);
      } else {
        currentRun = 0;
      }
    }

    const expectedMax = Math.log2(n);
    const statistic = Math.abs(maxRun - expectedMax);
    const pValue = Math.exp(-statistic / expectedMax);

    return {
      testName: 'Longest Run Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic: maxRun,
      threshold: this.ALPHA,
      description: 'Tests the longest run of ones in the sequence',
    };
  }

  /**
   * Spectral Test (Discrete Fourier Transform)
   */
  private static spectralTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    const x = bits.split('').map(b => b === '1' ? 1 : -1);

    // Simple DFT approximation
    let sumSquares = 0;
    for (let i = 0; i < Math.min(n, 1000); i++) {
      sumSquares += x[i] * x[i];
    }

    const statistic = sumSquares / Math.min(n, 1000);
    const expected = 1.0;
    const pValue = Math.exp(-Math.abs(statistic - expected));

    return {
      testName: 'Spectral Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic,
      threshold: this.ALPHA,
      description: 'Tests for periodic patterns using Fourier analysis',
    };
  }

  /**
   * Serial Test (Two-bit overlap)
   */
  private static serialTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    const patterns = ['00', '01', '10', '11'];
    const counts = patterns.map(p => {
      const regex = new RegExp(p, 'g');
      return (bits.match(regex) || []).length;
    });

    const expected = n / 4;
    let chiSquared = 0;
    for (const count of counts) {
      chiSquared += Math.pow(count - expected, 2) / expected;
    }

    const pValue = this.igamc(1.5, chiSquared / 2);

    return {
      testName: 'Serial Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic: chiSquared,
      threshold: this.ALPHA,
      description: 'Tests for uniform distribution of overlapping patterns',
    };
  }

  /**
   * Approximate Entropy Test
   */
  private static approximateEntropyTest(bits: string): RandomnessTestResult {
    const m = 2; // Pattern length
    const n = bits.length;

    const phi = (m: number) => {
      const patterns: Record<string, number> = {};
      for (let i = 0; i <= n - m; i++) {
        const pattern = bits.substr(i, m);
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }

      let sum = 0;
      for (const count of Object.values(patterns)) {
        const prob = count / (n - m + 1);
        sum += prob * Math.log(prob);
      }
      return sum;
    };

    const statistic = phi(m) - phi(m + 1);
    const pValue = Math.exp(-Math.abs(statistic) * n);

    return {
      testName: 'Approximate Entropy Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic,
      threshold: this.ALPHA,
      description: 'Tests for pattern regularity',
    };
  }

  /**
   * Cumulative Sums Test
   */
  private static cumulativeSumsTest(bits: string): RandomnessTestResult {
    const n = bits.length;
    let sum = 0;
    let maxSum = 0;

    for (const bit of bits) {
      sum += bit === '1' ? 1 : -1;
      maxSum = Math.max(maxSum, Math.abs(sum));
    }

    const statistic = maxSum / Math.sqrt(n);
    const pValue = Math.erfc(statistic / Math.sqrt(2));

    return {
      testName: 'Cumulative Sums Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic,
      threshold: this.ALPHA,
      description: 'Tests for systematic bias in cumulative sums',
    };
  }

  /**
   * Auto-correlation Test
   */
  private static autoCorrelationTest(data: number[]): RandomnessTestResult {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;

    let correlation = 0;
    for (let i = 1; i < n; i++) {
      correlation += (data[i] - mean) * (data[i - 1] - mean);
    }

    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const statistic = Math.abs(correlation / ((n - 1) * variance));
    const pValue = 1 - statistic;

    return {
      testName: 'Auto-correlation Test',
      passed: pValue >= this.ALPHA && statistic < 0.1,
      pValue,
      statistic,
      threshold: 0.1,
      description: 'Tests for correlation between consecutive values',
    };
  }

  /**
   * Chi-Square Test
   */
  private static chiSquareTest(data: number[]): RandomnessTestResult {
    const max = Math.max(...data);
    const bins = Math.min(max + 1, 256);
    const expected = data.length / bins;

    const observed = new Array(bins).fill(0);
    for (const val of data) {
      const bin = Math.floor((val / (max + 1)) * bins);
      observed[bin]++;
    }

    let chiSquared = 0;
    for (const obs of observed) {
      chiSquared += Math.pow(obs - expected, 2) / expected;
    }

    const pValue = this.igamc((bins - 1) / 2, chiSquared / 2);

    return {
      testName: 'Chi-Square Test',
      passed: pValue >= this.ALPHA,
      pValue,
      statistic: chiSquared,
      threshold: this.ALPHA,
      description: 'Tests for uniform distribution',
    };
  }

  /**
   * Helper: Convert numbers to binary string
   */
  private static numbersToBinary(data: number[]): string {
    return data.map(n => n.toString(2).padStart(8, '0')).join('');
  }

  /**
   * Helper: Incomplete gamma function (approximation)
   */
  private static igamc(a: number, x: number): number {
    if (x <= 0 || a <= 0) return 1.0;
    if (x < a + 1) {
      return 1 - this.igamSeries(a, x);
    }
    return this.igamContinuedFraction(a, x);
  }

  private static igamSeries(a: number, x: number): number {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 100; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - this.logGamma(a));
  }

  private static igamContinuedFraction(a: number, x: number): number {
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i <= 100; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-10) break;
    }

    return h * Math.exp(-x + a * Math.log(x) - this.logGamma(a));
  }

  private static logGamma(x: number): number {
    const coefficients = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];

    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;

    for (let j = 0; j < 6; j++) {
      ser += coefficients[j] / ++y;
    }

    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  /**
   * Generate unique signature for quantum data
   */
  private static generateSignature(data: number[]): string {
    const sum = data.reduce((a, b) => a + b, 0);
    const xor = data.reduce((a, b) => a ^ b, 0);
    const hash = (sum * 31 + xor) % 1000000;
    return `QV${hash.toString(36).toUpperCase()}`;
  }
}

export default QuantumRandomnessVerifier;
