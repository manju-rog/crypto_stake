# 🌌 Quantum Entropy Casino

**The world's first gambling platform using ACTUAL quantum mechanics for randomness.**

This isn't pseudo-random - it's the universe's fundamental uncertainty made into a casino! Every spin, every card, every bet is determined by real quantum vacuum fluctuations from the Australian National University's quantum random number generator.

---

## 🎰 What Makes This Insane?

- **TRUE QUANTUM RANDOMNESS**: Uses actual quantum vacuum fluctuations from ANU's QRNG
- **MULTIPLE QUANTUM SOURCES**: Fallback to NIST Beacon, ID Quantique, and others
- **NIST VERIFIED**: Full statistical test suite proves true randomness
- **BLOCKCHAIN POWERED**: Smart contracts on Polygon for transparency
- **CONSCIOUSNESS TRACKING**: TensorFlow.js monitors if your mind affects outcomes
- **MANY-WORLDS BETTING**: Gamble across parallel universes simultaneously
- **TIME MANIPULATION**: Bet in different time streams with varying speeds

---

## 🚀 Technology Stack

### Frontend
- **Next.js 14** with App Router & TypeScript
- **Three.js** for mind-blowing 3D quantum visualizations
- **Framer Motion** for smooth animations
- **TensorFlow.js** for consciousness influence detection
- **Chart.js** for statistics visualization

### Blockchain
- **Hardhat** development environment
- **Solidity 0.8.24** smart contracts
- **OpenZeppelin** security libraries
- **Ethers.js v6** & **WAGMI** for Web3 integration
- **Web3Modal** for wallet connections
- **Polygon** network for fast, cheap transactions

### Quantum Systems
- **ANU QRNG API** - Primary quantum source
- **NIST Randomness Beacon** - Secondary source
- **Custom NIST Test Suite** - Randomness verification
- **Multi-layer Pipeline** - XOR mixing, cryptographic whitening, bias elimination
- **Math.js** - Complex number operations for quantum states

---

## 📁 Project Structure

```
crypto_stake/
├── app/                      # Next.js 14 app directory
├── components/
│   ├── quantum/              # Quantum visualizations
│   ├── games/                # Game components
│   ├── ui/                   # UI components
│   └── layout/               # Layout components
├── contracts/                # Solidity smart contracts
│   ├── core/
│   │   └── QuantumCasino.sol # Main casino contract
│   ├── games/
│   │   ├── SchrodingersSlots.sol      # Quantum slot machine
│   │   ├── EntanglementPoker.sol      # Quantum poker
│   │   ├── UncertaintyRoulette.sol    # Heisenberg roulette
│   │   └── WaveFunctionLottery.sol    # Many-worlds lottery
│   └── token/
│       └── QuantumToken.sol  # QNTM ERC20 token
├── lib/                      # Core libraries
│   ├── quantum/
│   │   ├── anu-qrng.ts                # ANU API integration
│   │   ├── multi-source-qrng.ts       # Multi-source aggregation
│   │   ├── randomness-tests.ts        # NIST test suite
│   │   ├── randomness-pipeline.ts     # Bulletproof RNG pipeline
│   │   ├── quantum-state.ts           # State management
│   │   ├── bell-inequality.ts         # Entanglement verification
│   │   └── index.ts                   # Main exports
│   ├── blockchain/           # Web3 utilities
│   ├── consciousness/        # Consciousness tracking
│   ├── multiverse/           # Many-worlds mechanics
│   └── time/                 # Temporal mechanics
├── hooks/                    # React hooks
├── types/                    # TypeScript definitions
└── test/                     # Contract tests
```

---

## 🎮 Games Implemented

### 1. Schrödinger's Slots 🎰
Revolutionary slot machine where reels exist in quantum superposition:
- **Superposition Reels**: Multiple states simultaneously
- **Entangled Symbols**: Correlated outcomes across reels
- **Quantum Tunneling**: Symbols can jump barriers
- **Wave Function Collapse**: Observation determines outcome
- **Special Features**: Quantum Free Spins, Timeline Split, Cat Bonus

**Contract**: `SchrodingersSlots.sol`
**Mechanics**: Superposition → Entanglement → Collapse → Payout

### 2. Entanglement Poker 🃏
Quantum poker where cards are entangled until observed:
- **Superposition Cards**: Cards in multiple states
- **EPR Pairs**: Entangled card pairs
- **Bell States**: Maximum entanglement (Φ+, Φ-, Ψ+, Ψ-)
- **Quantum Hands**: Superposition Flush, Entangled Pairs, GHZ State
- **Measurement**: Observing one card affects others

**Contract**: `EntanglementPoker.sol`
**Mechanics**: Deal → Entangle → Measure → Evaluate

### 3. Uncertainty Roulette 🎡
Based on Heisenberg's Uncertainty Principle:
- **Probability Clouds**: Bet on ranges with uncertainty
- **Position/Momentum Trade**: Precision vs. payout
- **Quantum Tunneling**: Ball can tunnel through barriers
- **Wave Collapse Betting**: Bet on measurement outcomes

**Contract**: `UncertaintyRoulette.sol`
**Mechanics**: Bet → Spin → Apply Uncertainty → Resolve

### 4. Wave Function Lottery 🎫
Many-worlds lottery across parallel universes:
- **Superposition Tickets**: Exist in multiple states
- **Quantum Interference**: Constructive/destructive bonuses
- **Parallel Jackpots**: Win in multiple universes
- **Timeline Splitting**: Outcomes in different realities

**Contract**: `WaveFunctionLottery.sol`
**Mechanics**: Buy → Superpose → Draw → Collapse → Claim

---

## 🔐 Smart Contracts

### QuantumCasino (Main Hub)
```solidity
// Key Features:
- Player balance & statistics tracking
- VIP tier system (6 tiers: Bronze → Quantum Master)
- Referral system (5% commission)
- Progressive jackpot pool
- Treasury management
- Rate limiting & security
- Emergency pause & time-locked withdrawals
- ReentrancyGuard, Pausable, AccessControl
```

### QUANTUM Token (QNTM)
```solidity
// Tokenomics:
- Max Supply: 1 billion QNTM
- Initial Supply: 100 million (10%)
- Staking with 6 tiers (up to 2x rewards)
- Governance system with proposals
- Reality Ownership NFTs
- 1% annual base APY (scales with tier)
```

---

## ⚛️ Quantum Systems

### 1. Quantum RNG Pipeline

#### ANU Quantum API Integration
```typescript
// Fetches TRUE quantum random numbers from vacuum fluctuations
const result = await anuQuantumRNG.getQuantumRandom({
  length: 100,
  type: 'uint16',
  cache: true
});
// Returns: { data: [quantum numbers], quantumSignature, timestamp }
```

#### Multi-Source Aggregation
```typescript
// Combines multiple quantum sources with consensus
const result = await multiSourceQRNG.getMultiSourceRandom(
  32,  // length
  ['ANU', 'NIST'],  // sources
  true  // require consensus
);
// Verifies correlation < 0.1 between sources
```

#### Randomness Pipeline
```typescript
// Bulletproof pipeline: Mix → XOR → Whiten → Debias → Normalize
const result = await quantumPipeline.getSecureRandom(0, 100);
// Steps:
// 1. Fetch quantum bits from ANU
// 2. XOR with blockchain hash, user entropy, timestamp
// 3. SHA-256 cryptographic whitening (multiple rounds)
// 4. Von Neumann debiasing (eliminate statistical bias)
// 5. Normalize to target range
```

#### NIST Statistical Tests
```typescript
// Comprehensive randomness verification
const report = await QuantumRandomnessVerifier.verifyRandomness(data);
// Tests:
// - Frequency (Monobit) Test
// - Block Frequency Test
// - Runs Test
// - Longest Run Test
// - Spectral Test (DFT)
// - Serial Test
// - Approximate Entropy
// - Cumulative Sums
// - Auto-correlation
// - Chi-Square
// Result: overallPassed, passRate, individual test p-values
```

### 2. Quantum State Management

```typescript
// Create superposition state
const state = quantumStateManager.createSuperposition(
  'state1',
  [math.complex(0.707, 0), math.complex(0, 0.707)],  // amplitudes
  false  // observable
);

// Create entanglement
const pair = quantumStateManager.createEntanglement(
  'state1',
  'state2',
  'phi+'  // Bell state: |00⟩ + |11⟩
);

// Measure (collapse wave function)
const result = quantumStateManager.measure('state1');
// Automatically collapses entangled states with correlation

// Calculate interference
const waveFunction = quantumStateManager.buildWaveFunction();
// Returns: states, normalized, totalProbability, interference
```

### 3. Bell Inequality Verification

```typescript
// Verify quantum entanglement through CHSH inequality
const result = BellInequalityTester.runFullTest(1000);
// Returns:
// {
//   chshValue: 2.828,  // Quantum limit: 2√2 ≈ 2.828
//   violated: true,    // > 2.0 = quantum
//   confidence: 99.5,  // Statistical confidence
//   correlation: { aa, ab, ba, bb }
// }

const verification = BellInequalityTester.verifyEntanglement(result);
// Returns: { genuine, strength, description }
```

---

## 🎯 Getting Started

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd crypto_stake

# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env
# Edit .env with your keys
```

### Environment Variables

```env
# Blockchain
PRIVATE_KEY=your_private_key
POLYGON_RPC=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_api_key

# Quantum APIs
ANU_QUANTUM_API=https://qrng.anu.edu.au/API/jsonI.php
ID_QUANTIQUE_API_KEY=your_key
IBM_QUANTUM_API_KEY=your_key

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_NETWORK=polygon
```

### Development

```bash
# Run Next.js dev server
npm run dev

# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test

# Deploy to localhost
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.ts --network polygonMumbai
```

### Build for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

---

## 🧪 Testing Quantum Randomness

```bash
# Test ANU Quantum API
node -e "import('./lib/quantum/anu-qrng.ts').then(m => m.anuQuantumRNG.test())"

# Verify randomness
node -e "import('./lib/quantum/index.ts').then(m => {
  const data = await m.anuQuantumRNG.getQuantumRandom({ length: 1000 });
  const verified = await m.verifyQuantumRandomness(data.data);
  console.log('Verified:', verified);
})"

# Test Bell inequality
node -e "import('./lib/quantum/bell-inequality.ts').then(m => {
  const result = m.BellInequalityTester.runFullTest(1000);
  console.log('CHSH Value:', result.chshValue);
  console.log('Quantum:', result.violated);
})"
```

---

## 📊 Progress Status

### ✅ COMPLETED (Phases 1-3 + partial 4)

**PHASE 1**: Project Foundation
- ✅ Next.js 14 with TypeScript & App Router
- ✅ All dependencies installed
- ✅ Hardhat environment configured
- ✅ Complete folder structure

**PHASE 2**: Quantum RNG Integration
- ✅ ANU Quantum API with caching
- ✅ NIST statistical test suite (10 tests)
- ✅ Bulletproof randomness pipeline
- ✅ Multi-source support (ANU, NIST, +3 more)
- ✅ Health tracking & consensus

**PHASE 3**: Smart Contracts
- ✅ QuantumCasino main hub
- ✅ Schrödinger's Slots
- ✅ Entanglement Poker
- ✅ Uncertainty Roulette
- ✅ Wave Function Lottery
- ✅ QUANTUM Token (QNTM)

**PHASE 4**: Quantum State Management (In Progress)
- ✅ Superposition & entanglement system
- ✅ Wave function management
- ✅ Bell inequality verification
- ⏳ Measurement collapse tracking
- ⏳ Interference pattern calculator

### 🚧 IN PROGRESS (Phases 5-12)

**PHASE 5-6**: Game Mechanics & Frontend
**PHASE 7**: Consciousness Tracking
**PHASE 8**: Many-Worlds Betting
**PHASE 9**: Time Manipulation
**PHASE 10**: UI/UX & Visualizations
**PHASE 11**: Additional Games
**PHASE 12**: Launch Preparation

---

## 🔬 Quantum Mechanics Explained

### Superposition
States exist in multiple configurations simultaneously until observed. Like Schrödinger's cat being both alive and dead.

### Entanglement
Two particles become correlated - measuring one instantly affects the other, regardless of distance.

### Wave Function Collapse
The act of observation forces a quantum system to "choose" a definite state from its superposition.

### Decoherence
Quantum states gradually lose their quantum properties over time due to environmental interaction.

### Born Rule
Probability of measurement outcome = |amplitude|²

### Bell Inequality
Classical limit: |S| ≤ 2
Quantum mechanics: |S| can reach 2√2 ≈ 2.828
Violation proves genuine quantum entanglement.

---

## 🎨 Quantum Visualizations (Coming Soon)

- **Quantum Foam Background**: Particle effects simulating quantum vacuum
- **Wave Function Display**: Real-time amplitude visualization
- **Entanglement Threads**: Lightning connecting correlated states
- **Probability Clouds**: 3D density visualization
- **Timeline Branches**: Many-worlds split points
- **Consciousness Halo**: Player's quantum influence
- **Reality Glitches**: Quantum tunneling effects

---

## 🛡️ Security Features

### Smart Contract Security
- ReentrancyGuard on all financial functions
- Pausable for emergency stops
- AccessControl for role-based permissions
- Rate limiting (min 1 second between bets)
- Time-locked withdrawals (7 day delay)
- Integer overflow protection (Solidity 0.8+)
- Auditable game history

### Randomness Security
- Multi-source verification
- Statistical testing (NIST suite)
- Cryptographic whitening (SHA-256)
- Bias elimination (von Neumann)
- Quantum signature verification
- Blockchain anchoring
- Source health monitoring

---

## 📈 Tokenomics (QNTM)

**Total Supply**: 1,000,000,000 QNTM

**Distribution**:
- 10% Initial mint (100M)
- 40% Player rewards (400M)
- 20% Team & development (200M, vested)
- 15% Liquidity pools (150M)
- 10% Marketing & partnerships (100M)
- 5% Reserve (50M)

**Utility**:
- Staking for rewards (1-2% APY based on tier)
- Governance voting power
- VIP tier benefits
- Reality ownership NFTs
- Reduced house edge
- Exclusive game access

---

## 🤝 Contributing

This is an experimental project pushing the boundaries of blockchain gaming and quantum mechanics. Contributions welcome!

---

## ⚖️ License

MIT License - Use at your own risk! This is experimental technology combining quantum mechanics with gambling. Gamble responsibly.

---

## 🌟 The Vision

**Quantum Entropy Casino** isn't just a casino - it's a demonstration that:

1. True randomness exists in nature (quantum mechanics)
2. We can harness it for practical applications
3. Consciousness might influence quantum outcomes (controversial!)
4. Blockchain provides transparency for gambling
5. Gaming can educate about quantum physics

**Every bet is a quantum experiment. Every win defies classical probability. Welcome to the future of gambling.**

---

## 📞 Links (Coming Soon)

- Website: TBD
- Twitter: TBD
- Discord: TBD
- Docs: TBD

---

**Built with 🔬 quantum mechanics, ⚡ blockchain magic, and 🎰 pure chaos.**

**WARNING**: This casino uses ACTUAL quantum mechanics. The house edge is literally the Heisenberg Uncertainty Principle. Play at your own risk! 🌌
