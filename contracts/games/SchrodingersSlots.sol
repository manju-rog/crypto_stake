// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../core/QuantumCasino.sol";

/**
 * @title SchrodingersSlots
 * @notice Quantum slot machine where reels exist in superposition
 * @dev Revolutionary slots with quantum mechanics: superposition, entanglement, collapse
 */
contract SchrodingersSlots is ReentrancyGuard {
    QuantumCasino public casino;

    // ============ Quantum State Definitions ============

    enum QuantumState {
        SUPERPOSITION,    // Reels in multiple states simultaneously
        ENTANGLED,        // Reels correlated
        COLLAPSED,        // Measurement complete
        TUNNELED         // Quantum tunneling occurred
    }

    struct SpinResult {
        uint8[5] reels;           // Final collapsed values (0-9 symbols)
        QuantumState state;
        uint256 waveAmplitude;    // Probability amplitude (0-1000)
        uint16 entanglementLevel; // 0-100%
        bool tunnelEvent;         // Did quantum tunneling occur?
        uint256 timestamp;
        bytes32 quantumSeed;
    }

    struct BetConfig {
        uint256 amount;
        uint8 betType;            // 0=normal, 1=superposition, 2=entanglement, 3=meta
        uint16 linesActive;       // Which paylines active
        bool quantumBoostActive;
    }

    // ============ Symbols & Payouts ============

    // Symbol IDs
    uint8 constant SYMBOL_QUANTUM = 0;   // Special quantum symbol
    uint8 constant SYMBOL_ENTANGLE = 1;  // Entanglement symbol
    uint8 constant SYMBOL_WAVE = 2;      // Wave function symbol
    uint8 constant SYMBOL_PHOTON = 3;
    uint8 constant SYMBOL_ELECTRON = 4;
    uint8 constant SYMBOL_PROTON = 5;
    uint8 constant SYMBOL_NEUTRON = 6;
    uint8 constant SYMBOL_QUARK = 7;
    uint8 constant SYMBOL_HIGGS = 8;
    uint8 constant SYMBOL_VOID = 9;

    // Payout multipliers for 5-of-a-kind (in basis points, 10000 = 1x)
    mapping(uint8 => uint256) public symbolPayouts;

    // ============ Game Configuration ============

    uint256 public minBet = 0.001 ether;
    uint256 public maxBet = 10 ether;
    uint256 public maxPayout = 1000 ether;

    // Quantum feature probabilities (out of 10000)
    uint16 public superpositionChance = 2000;  // 20%
    uint16 public entanglementChance = 1500;   // 15%
    uint16 public tunnelingChance = 500;       // 5%

    // Special feature costs
    uint256 public quantumBoostCost = 1.5 ether; // 1.5x bet for quantum boost

    // ============ State ============

    mapping(address => SpinResult) public lastSpins;
    mapping(address => uint256) public freeSpinsRemaining;

    uint256 public totalSpins;
    uint256 public totalPayout;

    // ============ Events ============

    event SpinStarted(address indexed player, uint256 betAmount, uint8 betType);
    event SpinCompleted(
        address indexed player,
        uint8[5] reels,
        QuantumState state,
        uint256 payout,
        bytes32 quantumSeed
    );
    event QuantumFeatureTriggered(address indexed player, string featureName);
    event SuperpositionCollapse(address indexed player, uint256 waveAmplitude);
    event EntanglementCreated(address indexed player, uint16 level);
    event QuantumTunneling(address indexed player, uint8 from, uint8 to);
    event FreeSpinsAwarded(address indexed player, uint256 count);

    // ============ Constructor ============

    constructor(address _casino) {
        casino = QuantumCasino(_casino);

        // Initialize symbol payouts (multipliers in basis points)
        symbolPayouts[SYMBOL_QUANTUM] = 1000000;    // 100x
        symbolPayouts[SYMBOL_ENTANGLE] = 500000;    // 50x
        symbolPayouts[SYMBOL_WAVE] = 250000;        // 25x
        symbolPayouts[SYMBOL_PHOTON] = 100000;      // 10x
        symbolPayouts[SYMBOL_ELECTRON] = 75000;     // 7.5x
        symbolPayouts[SYMBOL_PROTON] = 50000;       // 5x
        symbolPayouts[SYMBOL_NEUTRON] = 25000;      // 2.5x
        symbolPayouts[SYMBOL_QUARK] = 10000;        // 1x
        symbolPayouts[SYMBOL_HIGGS] = 5000;         // 0.5x
        symbolPayouts[SYMBOL_VOID] = 0;             // 0x (scatter)
    }

    // ============ Main Game Functions ============

    /**
     * @notice Spin the quantum slot machine
     * @param betAmount Amount to bet
     * @param betType 0=normal, 1=superposition bet, 2=entanglement bet, 3=meta-bet
     * @param quantumBoost Enable quantum boost for better odds
     */
    function spin(
        uint256 betAmount,
        uint8 betType,
        bool quantumBoost
    ) external nonReentrant returns (SpinResult memory) {
        require(betAmount >= minBet && betAmount <= maxBet, "Invalid bet amount");
        require(betType <= 3, "Invalid bet type");

        // Check if using free spin
        bool isFreeSpin = freeSpinsRemaining[msg.sender] > 0;
        if (isFreeSpin) {
            freeSpinsRemaining[msg.sender]--;
            betAmount = 0; // Free spins don't cost anything
        }

        emit SpinStarted(msg.sender, betAmount, betType);

        // Generate quantum seed from multiple entropy sources
        bytes32 quantumSeed = generateQuantumSeed(msg.sender);

        // Initialize reels in superposition
        SpinResult memory result = SpinResult({
            reels: [uint8(0), 0, 0, 0, 0],
            state: QuantumState.SUPERPOSITION,
            waveAmplitude: calculateWaveAmplitude(quantumSeed),
            entanglementLevel: 0,
            tunnelEvent: false,
            timestamp: block.timestamp,
            quantumSeed: quantumSeed
        });

        // Apply quantum effects
        result = applyQuantumEffects(result, quantumSeed, betType, quantumBoost);

        // Collapse wave function to determine symbols
        result = collapseWaveFunction(result, quantumSeed);

        // Calculate payout
        uint256 payout = calculatePayout(result, betAmount, betType);

        // Apply VIP multiplier
        uint16 vipMultiplier = casino.getVIPMultiplier(msg.sender);
        payout = (payout * vipMultiplier) / 10000;

        // Check for special features
        checkSpecialFeatures(result, msg.sender);

        // Record result
        lastSpins[msg.sender] = result;
        totalSpins++;
        totalPayout += payout;

        // Process bet through casino
        bool won = payout > betAmount;
        if (!isFreeSpin) {
            casino.placeBet(msg.sender, betAmount, payout, quantumSeed, won);
        } else if (won) {
            // For free spins, just add winnings
            casino.placeBet(msg.sender, 0, payout, quantumSeed, true);
        }

        emit SpinCompleted(msg.sender, result.reels, result.state, payout, quantumSeed);

        return result;
    }

    // ============ Quantum Mechanics ============

    /**
     * @notice Apply quantum effects to spin
     */
    function applyQuantumEffects(
        SpinResult memory result,
        bytes32 seed,
        uint8 betType,
        bool quantumBoost
    ) internal returns (SpinResult memory) {
        uint256 rand = uint256(seed);

        // Superposition state (reels in multiple states)
        if ((rand % 10000) < superpositionChance || betType == 1) {
            result.state = QuantumState.SUPERPOSITION;
            result.waveAmplitude = 800 + ((rand % 200)); // High amplitude
            emit QuantumFeatureTriggered(msg.sender, "Superposition");
        }

        // Entanglement (reels become correlated)
        rand = uint256(keccak256(abi.encode(seed, "entangle")));
        if ((rand % 10000) < entanglementChance || betType == 2) {
            result.state = QuantumState.ENTANGLED;
            result.entanglementLevel = uint16(50 + (rand % 50)); // 50-100%
            emit EntanglementCreated(msg.sender, result.entanglementLevel);
        }

        // Quantum tunneling (symbols can jump barriers)
        rand = uint256(keccak256(abi.encode(seed, "tunnel")));
        if ((rand % 10000) < tunnelingChance || quantumBoost) {
            result.tunnelEvent = true;
            emit QuantumFeatureTriggered(msg.sender, "Tunneling");
        }

        return result;
    }

    /**
     * @notice Collapse wave function to determine final symbols
     */
    function collapseWaveFunction(
        SpinResult memory result,
        bytes32 seed
    ) internal returns (SpinResult memory) {
        uint256 rand = uint256(seed);

        if (result.state == QuantumState.ENTANGLED) {
            // Entangled reels - first reel determines others
            uint8 baseSymbol = uint8((rand % 10));
            result.reels[0] = baseSymbol;

            for (uint8 i = 1; i < 5; i++) {
                rand = uint256(keccak256(abi.encode(rand)));
                // High chance of matching entangled symbol
                if ((rand % 100) < result.entanglementLevel) {
                    result.reels[i] = baseSymbol;
                } else {
                    result.reels[i] = uint8((rand % 10));
                }
            }

            emit EntanglementCreated(msg.sender, result.entanglementLevel);
        } else {
            // Normal collapse - independent reels
            for (uint8 i = 0; i < 5; i++) {
                rand = uint256(keccak256(abi.encode(rand, i)));
                result.reels[i] = uint8((rand % 10));

                // Apply tunneling if active
                if (result.tunnelEvent && (rand % 100) < 20) {
                    uint8 from = result.reels[i];
                    result.reels[i] = SYMBOL_QUANTUM; // Tunnel to best symbol
                    emit QuantumTunneling(msg.sender, from, result.reels[i]);
                }
            }
        }

        result.state = QuantumState.COLLAPSED;
        emit SuperpositionCollapse(msg.sender, result.waveAmplitude);

        return result;
    }

    /**
     * @notice Calculate payout based on symbols and quantum mechanics
     */
    function calculatePayout(
        SpinResult memory result,
        uint256 betAmount,
        uint8 betType
    ) internal view returns (uint256) {
        uint256 payout = 0;

        // Check for matching symbols
        uint8[10] memory symbolCounts;
        for (uint8 i = 0; i < 5; i++) {
            symbolCounts[result.reels[i]]++;
        }

        // Calculate base payout
        for (uint8 symbol = 0; symbol < 10; symbol++) {
            uint8 count = symbolCounts[symbol];
            if (count >= 3) {
                uint256 multiplier = symbolPayouts[symbol];

                // Scale multiplier based on count
                if (count == 3) multiplier = multiplier / 5;
                else if (count == 4) multiplier = multiplier / 2;
                // count == 5 uses full multiplier

                payout += (betAmount * multiplier) / 10000;
            }
        }

        // Apply quantum bonuses
        if (result.state == QuantumState.ENTANGLED) {
            // Entanglement bonus: +50% payout
            payout = (payout * 150) / 100;
        }

        if (result.tunnelEvent) {
            // Tunneling bonus: +25% payout
            payout = (payout * 125) / 100;
        }

        // Superposition bet pays more but costs more
        if (betType == 1) {
            payout = (payout * 200) / 100; // 2x payout
        }

        // Meta-bet (betting on quantum effects themselves)
        if (betType == 3 && (result.tunnelEvent || result.entanglementLevel > 0)) {
            payout += betAmount * 5; // 5x bonus for quantum events
        }

        // Cap payout at maximum
        if (payout > maxPayout) {
            payout = maxPayout;
        }

        return payout;
    }

    // ============ Special Features ============

    /**
     * @notice Check for special feature triggers
     */
    function checkSpecialFeatures(SpinResult memory result, address player) internal {
        // Check for free spins (3+ VOID symbols)
        uint8 voidCount = 0;
        for (uint8 i = 0; i < 5; i++) {
            if (result.reels[i] == SYMBOL_VOID) voidCount++;
        }

        if (voidCount >= 3) {
            uint256 freeSpins = uint256(voidCount) * 5; // 5 spins per void
            freeSpinsRemaining[player] += freeSpins;
            emit FreeSpinsAwarded(player, freeSpins);
        }

        // Check for jackpot trigger (5 QUANTUM symbols)
        uint8 quantumCount = 0;
        for (uint8 i = 0; i < 5; i++) {
            if (result.reels[i] == SYMBOL_QUANTUM) quantumCount++;
        }

        if (quantumCount == 5) {
            casino.awardJackpot(player);
        }
    }

    // ============ Utility Functions ============

    /**
     * @notice Generate quantum seed from multiple sources
     */
    function generateQuantumSeed(address player) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            player,
            totalSpins,
            blockhash(block.number - 1)
        ));
    }

    /**
     * @notice Calculate wave function amplitude
     */
    function calculateWaveAmplitude(bytes32 seed) internal pure returns (uint256) {
        return uint256(seed) % 1000; // 0-1000 amplitude
    }

    // ============ Admin Functions ============

    function setMinBet(uint256 _minBet) external {
        minBet = _minBet;
    }

    function setMaxBet(uint256 _maxBet) external {
        maxBet = _maxBet;
    }

    function setQuantumChances(
        uint16 _superposition,
        uint16 _entanglement,
        uint16 _tunneling
    ) external {
        require(_superposition <= 10000, "Invalid probability");
        require(_entanglement <= 10000, "Invalid probability");
        require(_tunneling <= 10000, "Invalid probability");

        superpositionChance = _superposition;
        entanglementChance = _entanglement;
        tunnelingChance = _tunneling;
    }

    // ============ View Functions ============

    function getLastSpin(address player) external view returns (SpinResult memory) {
        return lastSpins[player];
    }

    function getFreeSpins(address player) external view returns (uint256) {
        return freeSpinsRemaining[player];
    }

    function getStats() external view returns (uint256, uint256) {
        return (totalSpins, totalPayout);
    }
}
