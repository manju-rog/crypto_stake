// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../core/QuantumCasino.sol";

/**
 * @title UncertaintyRoulette
 * @notice Quantum roulette based on Heisenberg Uncertainty Principle
 * @dev Bet on probability clouds, position/momentum trades, quantum tunneling
 */
contract UncertaintyRoulette is ReentrancyGuard {
    QuantumCasino public casino;

    // Betting types
    enum BetType {
        SINGLE_NUMBER,      // Classic single number
        PROBABILITY_CLOUD,  // Bet on range with uncertainty
        POSITION_MOMENTUM,  // Trade precision for payout
        TUNNELING_BET,      // Bet can tunnel to adjacent numbers
        WAVE_COLLAPSE       // Bet on measurement outcome
    }

    struct Spin {
        uint8 result;           // 0-36
        uint256 position;       // Position uncertainty
        uint256 momentum;       // Momentum uncertainty
        bool tunnelingOccurred;
        bytes32 quantumSeed;
        uint256 timestamp;
    }

    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint8[] numbers;        // Numbers bet on
        uint256 uncertaintyRadius; // For probability cloud bets
        uint256 timestamp;
    }

    mapping(address => Spin) public lastSpins;
    uint256 public totalSpins;

    // Payouts (basis points)
    mapping(BetType => uint256) public payouts;

    event BetPlaced(address indexed player, BetType betType, uint256 amount);
    event SpinResult(address indexed player, uint8 result, bool tunneled, uint256 payout);
    event QuantumTunneling(address indexed player, uint8 from, uint8 to);
    event UncertaintyApplied(address indexed player, uint256 position, uint256 momentum);

    constructor(address _casino) {
        casino = QuantumCasino(_casino);

        // Initialize payouts
        payouts[BetType.SINGLE_NUMBER] = 360000;        // 36x
        payouts[BetType.PROBABILITY_CLOUD] = 100000;    // 10x (variable by size)
        payouts[BetType.POSITION_MOMENTUM] = 180000;    // 18x
        payouts[BetType.TUNNELING_BET] = 240000;        // 24x
        payouts[BetType.WAVE_COLLAPSE] = 500000;        // 50x
    }

    /**
     * @notice Place bet and spin
     */
    function spin(
        uint256 betAmount,
        BetType betType,
        uint8[] calldata numbers,
        uint256 uncertaintyRadius
    ) external nonReentrant returns (uint8) {
        require(betAmount > 0, "Invalid bet");
        require(numbers.length > 0, "Must bet on numbers");

        // Generate quantum result
        bytes32 seed = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalSpins++
        ));

        uint256 rand = uint256(seed);

        // Apply Heisenberg uncertainty
        uint256 position = rand % 1000; // Position measurement
        uint256 momentum = (1000 - position) + (rand % 200); // Inverse correlation

        emit UncertaintyApplied(msg.sender, position, momentum);

        // Determine result with quantum effects
        uint8 result = uint8((rand % 37)); // 0-36

        // Check for tunneling (5% chance)
        bool tunneled = false;
        if ((rand % 100) < 5 && betType == BetType.TUNNELING_BET) {
            uint8 originalResult = result;
            result = (result + 1) % 37; // Tunnel to adjacent
            tunneled = true;
            emit QuantumTunneling(msg.sender, originalResult, result);
        }

        // Record spin
        lastSpins[msg.sender] = Spin({
            result: result,
            position: position,
            momentum: momentum,
            tunnelingOccurred: tunneled,
            quantumSeed: seed,
            timestamp: block.timestamp
        });

        // Calculate payout
        uint256 payout = calculatePayout(result, betAmount, betType, numbers, uncertaintyRadius, tunneled);

        // Process bet
        bool won = payout > 0;
        if (won) {
            casino.placeBet(msg.sender, betAmount, payout, seed, true);
        } else {
            casino.placeBet(msg.sender, betAmount, 0, seed, false);
        }

        emit SpinResult(msg.sender, result, tunneled, payout);

        return result;
    }

    /**
     * @notice Calculate payout based on quantum mechanics
     */
    function calculatePayout(
        uint8 result,
        uint256 betAmount,
        BetType betType,
        uint8[] calldata numbers,
        uint256 uncertaintyRadius,
        bool tunneled
    ) internal view returns (uint256) {
        bool won = false;

        if (betType == BetType.SINGLE_NUMBER) {
            for (uint i = 0; i < numbers.length; i++) {
                if (numbers[i] == result) {
                    won = true;
                    break;
                }
            }
        } else if (betType == BetType.PROBABILITY_CLOUD) {
            // Check if result within uncertainty radius of any bet number
            for (uint i = 0; i < numbers.length; i++) {
                if (isWithinRadius(numbers[i], result, uncertaintyRadius)) {
                    won = true;
                    break;
                }
            }
        } else if (betType == BetType.TUNNELING_BET) {
            // Win if result or adjacent matches
            for (uint i = 0; i < numbers.length; i++) {
                if (numbers[i] == result ||
                    ((result + 1) % 37 == numbers[i]) ||
                    ((result + 36) % 37 == numbers[i])) {
                    won = true;
                    break;
                }
            }
        } else {
            // Other bet types
            for (uint i = 0; i < numbers.length; i++) {
                if (numbers[i] == result) {
                    won = true;
                    break;
                }
            }
        }

        if (!won) return 0;

        uint256 payout = (betAmount * payouts[betType]) / 10000;

        // Tunneling bonus
        if (tunneled) {
            payout = (payout * 150) / 100; // +50%
        }

        return payout;
    }

    function isWithinRadius(uint8 center, uint8 target, uint256 radius) internal pure returns (bool) {
        if (center > target) {
            return (center - target) <= radius;
        } else {
            return (target - center) <= radius;
        }
    }

    function getLastSpin(address player) external view returns (Spin memory) {
        return lastSpins[player];
    }
}
