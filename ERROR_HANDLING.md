# Error Handling & Fallback Systems

## Overview

The Quantum Entropy Casino has comprehensive error handling, logging, and fallback mechanisms to ensure reliability and robustness across all quantum operations and game mechanics.

## Table of Contents

- [Error Logging System](#error-logging-system)
- [Quantum RNG Fallbacks](#quantum-rng-fallbacks)
- [React Error Boundaries](#react-error-boundaries)
- [Input Validation](#input-validation)
- [Retry Logic](#retry-logic)
- [Edge Case Handling](#edge-case-handling)

---

## Error Logging System

### ErrorLogger Utility

**Location:** `lib/utils/error-logger.ts`

**Features:**
- Centralized error logging across the application
- 5 log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- In-memory log storage (last 1000 entries)
- Persistent error storage in localStorage (last 100 errors)
- Development vs. production behavior
- Context-aware logging with metadata

**Usage:**

```typescript
import ErrorLogger from '@/lib/utils/error-logger';

// Log an error
ErrorLogger.error('Operation failed', error, 'ComponentName', { userId: 123 });

// Log a critical error (always sent to monitoring)
ErrorLogger.critical('System failure', error, 'CriticalSystem', { impact: 'high' });

// Log a warning
ErrorLogger.warn('Unusual condition detected', 'ComponentName', { value: 'unexpected' });

// Log info (dev only)
ErrorLogger.info('Operation completed', 'ComponentName', { duration: 150 });

// Log debug (dev only)
ErrorLogger.debug('Debug info', 'ComponentName', { state: gameState });
```

**Retrieve Logs:**

```typescript
// Get all logs
const allLogs = ErrorLogger.getLogs();

// Get logs by level
const errors = ErrorLogger.getLogs(LogLevel.ERROR);

// Get error summary
const summary = ErrorLogger.getErrorSummary();
// Returns: { total, byLevel, recent }

// Clear logs
ErrorLogger.clearLogs();
```

**Error Wrapping:**

```typescript
import { withErrorHandling, withErrorHandlingSync } from '@/lib/utils/error-logger';

// Async operations
const result = await withErrorHandling(
  async () => await fetchData(),
  'DataFetch',
  fallbackValue // optional
);

// Sync operations
const value = withErrorHandlingSync(
  () => processData(),
  'DataProcess',
  fallbackValue // optional
);
```

---

## Quantum RNG Fallbacks

### Multi-Layer Fallback System

The quantum RNG system has multiple fallback layers to ensure random number generation never fails:

**Layer 1: ANU Quantum API** (Primary)
- True quantum randomness from vacuum fluctuations
- 3 automatic retries with exponential backoff
- Retry delays: 1s, 2s, 4s

**Layer 2: Crypto Fallback** (Secondary)
- Web Crypto API (`window.crypto.getRandomValues`)
- Cryptographically secure pseudo-random numbers
- Automatically activated when quantum source fails

**Layer 3: Math.random() Fallback** (Last Resort)
- Only used when both crypto and quantum fail
- Warning logged when this fallback is used
- Should only occur in test environments

### CryptoFallbackRNG

**Location:** `lib/quantum/crypto-fallback-rng.ts`

**Features:**
- Cryptographically secure RNG using Web Crypto API
- Bias-free random number generation
- Support for Node.js and browser environments
- Rejection sampling to eliminate modulo bias

**Usage:**

```typescript
import CryptoFallbackRNG from '@/lib/quantum/crypto-fallback-rng';

// Generate random bytes
const bytes = CryptoFallbackRNG.getRandomBytes(32);

// Generate random number in range
const num = CryptoFallbackRNG.getRandomNumber(1, 100);

// Generate multiple random numbers
const numbers = CryptoFallbackRNG.getRandomNumbers(10, 1, 50);

// Generate random float (0-1)
const float = CryptoFallbackRNG.getRandomFloat();

// Shuffle array
const shuffled = CryptoFallbackRNG.shuffle([1, 2, 3, 4, 5]);

// Generate UUID
const uuid = CryptoFallbackRNG.generateUUID();

// Check availability
const isAvailable = CryptoFallbackRNG.isCryptoAvailable();
```

### ANU Quantum RNG with Fallbacks

**Location:** `lib/quantum/anu-qrng.ts`

**Enhanced Features:**
- Automatic retry with exponential backoff (3 attempts)
- Seamless fallback to crypto RNG on failure
- Detailed error logging with context
- Cache hit/miss tracking
- Quantum signature verification

**Error Flow:**

```
1. Try ANU Quantum API
   ↓ (failure)
2. Retry (attempt 1) - wait 1s
   ↓ (failure)
3. Retry (attempt 2) - wait 2s
   ↓ (failure)
4. Retry (attempt 3) - wait 4s
   ↓ (failure)
5. Log error + Use Crypto Fallback
   ↓ (failure - very rare)
6. Use Math.random() fallback
```

---

## Retry Logic

### retryWithBackoff

**Location:** `lib/utils/error-logger.ts`

**Features:**
- Configurable retry attempts
- Exponential backoff delays
- Maximum delay cap
- Detailed retry logging

**Usage:**

```typescript
import { retryWithBackoff } from '@/lib/utils/error-logger';

const result = await retryWithBackoff(
  async () => await unreliableOperation(),
  {
    maxRetries: 3,        // default: 3
    initialDelay: 1000,   // default: 1000ms
    maxDelay: 10000,      // default: 10000ms
    context: 'MyOperation' // for logging
  }
);
```

**Delay Calculation:**
- Attempt 1: `initialDelay * 2^0 = 1000ms`
- Attempt 2: `initialDelay * 2^1 = 2000ms`
- Attempt 3: `initialDelay * 2^2 = 4000ms`
- Capped at `maxDelay`

---

## React Error Boundaries

### ErrorBoundary Component

**Location:** `components/ErrorBoundary.tsx`

**Features:**
- Catches React rendering errors
- Displays user-friendly error UI
- Logs errors to ErrorLogger
- Provides "Try Again" and "Reload Page" options
- Context-aware error messages
- Development mode shows stack traces

**Usage:**

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap a component
<ErrorBoundary context="SlotGame">
  <SlotGameComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  context="PokerGame"
  fallback={<CustomErrorUI />}
>
  <PokerGameComponent />
</ErrorBoundary>

// Using HOC
import { withErrorBoundary } from '@/components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent, 'MyComponent');
```

**Error UI Features:**
- Quantum-themed error message
- Error details (dev mode only)
- Component stack trace (dev mode only)
- Return to home link
- Try again functionality
- Page reload option

---

## Input Validation

### InputValidator Utility

**Location:** `lib/utils/input-validation.ts`

**Features:**
- Comprehensive input validation
- Custom ValidationError class
- Automatic error logging
- XSS prevention
- Type-safe validation

**Validators:**

**Number Validation:**
```typescript
import InputValidator from '@/lib/utils/input-validation';

// Validate range
const num = InputValidator.validateNumber(value, 1, 100, 'bet amount');

// Validate integer
const int = InputValidator.validateInteger(value, 'player count');

// Validate positive
const pos = InputValidator.validatePositive(value, 'stake');
```

**Array Validation:**
```typescript
// Validate length
const arr = InputValidator.validateArrayLength(array, 5, 10, 'numbers');

// Validate uniqueness
const unique = InputValidator.validateUnique(array, 'lottery numbers');
```

**Game-Specific Validation:**
```typescript
// Validate bet amount
const bet = InputValidator.validateBetAmount(amount, balance, minBet);

// Validate lottery numbers
const lotteryNums = InputValidator.validateLotteryNumbers(
  numbers, 1, 50, 6
);

// Validate roulette number
const rouletteNum = InputValidator.validateRouletteNumber(number);

// Validate card count
InputValidator.validateCardCount(hand.length, 2);
```

**String Validation:**
```typescript
// Validate non-empty
const name = InputValidator.validateNonEmptyString(input, 'username');

// Sanitize (prevent XSS)
const safe = InputValidator.sanitizeString(userInput);

// Validate wallet address
const address = InputValidator.validateWalletAddress(walletAddr);
```

**Safe Parsing:**
```typescript
// Parse number with fallback
const num = InputValidator.parseNumber(input, 0);

// Parse integer with fallback
const int = InputValidator.parseInt(input, 0);
```

**Game Phase Validation:**
```typescript
// Validate phase transition
InputValidator.validatePhaseTransition(
  'betting',
  ['spinning', 'cancelled'],
  requestedPhase
);

// Validate required fields
InputValidator.validateRequired(gameState, ['phase', 'bets', 'result']);
```

**Error Handling:**
```typescript
try {
  InputValidator.validateNumber(value, 1, 100, 'bet');
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  }
}
```

---

## Edge Case Handling

### Common Edge Cases Covered

**1. Empty/Null Values**
- All validators check for null/undefined
- Safe parsing functions provide fallbacks
- Required field validation

**2. Out of Range Values**
- Number range validation
- Array length validation
- Balance checking for bets

**3. Invalid States**
- Game phase transition validation
- Card count verification
- Player state validation

**4. Network Failures**
- Automatic retry with backoff
- Fallback RNG systems
- Error logging and recovery

**5. Type Mismatches**
- Type checking before operations
- Safe type conversions
- Clear error messages

**6. Duplicate Values**
- Unique array validation
- Prevents duplicate lottery numbers
- Prevents duplicate cards

**7. Race Conditions**
- State transition guards
- Phase validation
- Prevents double-submit

**8. Division by Zero**
- Checked in probability calculations
- Fallback values for edge cases
- Safe normalization

**9. Overflow/Underflow**
- Number.MAX_SAFE_INTEGER checks
- Balance underflow prevention
- Probability sum normalization

**10. Missing Data**
- Required field validation
- Default values where appropriate
- Graceful degradation

---

## Best Practices

### When to Use Each System

**ErrorLogger:**
- All caught exceptions
- Important state transitions
- Network operations
- Unexpected conditions

**CryptoFallbackRNG:**
- Automatically used by quantum pipeline
- Can be used directly for non-quantum needs
- Useful in tests

**ErrorBoundary:**
- Wrap all game components
- Wrap complex UI sections
- Use different boundaries for different contexts

**InputValidator:**
- All user inputs
- Before state updates
- Before network requests
- Before database operations

**Retry Logic:**
- Network requests
- External API calls
- Non-idempotent operations requiring confirmation
- Operations that may temporarily fail

### Testing Error Scenarios

```typescript
// Test quantum RNG fallback
const mockANUFailure = async () => {
  // ANU API will fail, should fallback to crypto
  const result = await quantumPipeline.getSecureRandom(0, 100);
  console.log('Fallback worked:', result);
};

// Test error boundary
const ThrowError = () => {
  throw new Error('Test error');
};

// Wrap in error boundary to test
<ErrorBoundary context="Test">
  <ThrowError />
</ErrorBoundary>

// Test input validation
try {
  InputValidator.validateNumber(-1, 0, 100, 'test');
} catch (error) {
  console.log('Validation error caught:', error.message);
}

// View error logs
console.log(ErrorLogger.getErrorSummary());
```

---

## Production Monitoring

### Error Log Storage

**Development:**
- Errors logged to console
- Full stack traces shown
- Debug logging enabled

**Production:**
- Errors stored in localStorage (last 100)
- Critical errors flagged for monitoring
- Stack traces hidden from users
- Debug logging disabled

### Future Enhancements

- Integration with Sentry/DataDog
- Real-time error alerting
- Error rate monitoring
- Performance tracking
- User session replay for errors

---

## Summary

The Quantum Entropy Casino has **5 layers of protection**:

1. **Error Logging** - All errors tracked and logged
2. **Fallback Systems** - Crypto RNG when quantum fails
3. **Retry Logic** - 3 automatic retries for network ops
4. **Error Boundaries** - React error catching
5. **Input Validation** - Prevent invalid states

**Result:** Robust, reliable, production-ready quantum casino! 🎰⚛️
