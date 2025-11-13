/**
 * Quantum Entropy System - Main Export
 * The universe's fundamental uncertainty as a service
 */

export { anuQuantumRNG, default as ANUQuantumRNG } from './anu-qrng';
export type { QuantumRandomResult, QuantumRandomOptions } from './anu-qrng';

export { QuantumRandomnessVerifier } from './randomness-tests';
export type { RandomnessTestResult, RandomnessVerificationReport } from './randomness-tests';

export { quantumPipeline, QuantumRandomnessPipeline } from './randomness-pipeline';
export type { PipelineConfig, EnhancedRandomResult } from './randomness-pipeline';

export { multiSourceQRNG, MultiSourceQuantumRNG } from './multi-source-qrng';
export type { QuantumSource, SourceResult, MultiSourceResult } from './multi-source-qrng';

/**
 * Quick-start helper: Get a quantum random number
 */
export async function getQuantumNumber(min: number = 0, max: number = 100): Promise<number> {
  const { quantumPipeline } = await import('./randomness-pipeline');
  const result = await quantumPipeline.getSecureRandom(min, max);
  return result.value;
}

/**
 * Quick-start helper: Get multiple quantum random numbers
 */
export async function getQuantumNumbers(count: number, min: number = 0, max: number = 100): Promise<number[]> {
  const { quantumPipeline } = await import('./randomness-pipeline');
  const results = await quantumPipeline.getSecureRandomBatch(count, min, max);
  return results.map(r => r.value);
}

/**
 * Quick-start helper: Verify if data is truly random
 */
export async function verifyQuantumRandomness(data: number[]): Promise<boolean> {
  const { QuantumRandomnessVerifier } = await import('./randomness-tests');
  const report = await QuantumRandomnessVerifier.verifyRandomness(data);
  return report.overallPassed;
}

/**
 * Quick-start helper: Get quantum random with multi-source verification
 */
export async function getVerifiedQuantumNumber(min: number = 0, max: number = 100): Promise<{
  value: number;
  verified: boolean;
  sources: string[];
}> {
  const { multiSourceQRNG } = await import('./multi-source-qrng');
  const { quantumPipeline } = await import('./randomness-pipeline');

  // Get data from multiple sources
  const multiResult = await multiSourceQRNG.getMultiSourceRandom(32, ['ANU', 'NIST']);

  // Process through pipeline
  const result = await quantumPipeline.getSecureRandom(min, max);

  return {
    value: result.value,
    verified: result.verified && multiResult.consensusReached,
    sources: multiResult.sources.filter(s => s.success).map(s => s.source),
  };
}
