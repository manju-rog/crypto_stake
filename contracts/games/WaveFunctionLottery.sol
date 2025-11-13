// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../core/QuantumCasino.sol";

/**
 * @title WaveFunctionLottery
 * @notice Many-worlds lottery with parallel universe jackpots
 * @dev Superposition tickets, quantum interference, timeline splitting
 */
contract WaveFunctionLottery is ReentrancyGuard {
    QuantumCasino public casino;

    struct QuantumTicket {
        address owner;
        uint8[6] numbers;           // Chosen numbers (1-49)
        uint256 superpositionStates; // Number of parallel states
        uint256 amplitude;           // Wave function amplitude
        bool collapsed;
        uint256 purchaseTime;
        bytes32 quantumSignature;
    }

    struct Draw {
        uint256 drawId;
        uint8[6] winningNumbers;
        uint256 jackpot;
        uint256 timestamp;
        bytes32 quantumSeed;
        mapping(address => uint256) winners;
        uint256 totalWinners;
        bool completed;
    }

    uint256 public currentDrawId;
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => QuantumTicket[]) public tickets; // drawId => tickets

    uint256 public ticketPrice = 0.01 ether;
    uint256 public jackpot;
    uint256 public jackpotContribution = 7000; // 70% to jackpot

    // Many-worlds multipliers
    uint256 public constant SUPERPOSITION_MULTIPLIER = 15000; // 1.5x
    uint256 public constant INTERFERENCE_BONUS = 20000; // 2x

    event TicketPurchased(
        address indexed player,
        uint256 indexed drawId,
        uint8[6] numbers,
        uint256 superpositionStates
    );
    event DrawExecuted(uint256 indexed drawId, uint8[6] winningNumbers, uint256 jackpot);
    event WinnerClaimed(address indexed winner, uint256 amount, uint8 matchCount);
    event QuantumInterference(address indexed player, uint256 bonus);

    constructor(address _casino) {
        casino = QuantumCasino(_casino);
        currentDrawId = 1;
    }

    /**
     * @notice Purchase quantum lottery ticket
     */
    function buyTicket(
        uint8[6] calldata numbers,
        bool enableSuperposition
    ) external nonReentrant returns (uint256) {
        require(validateNumbers(numbers), "Invalid numbers");

        // Generate quantum properties
        bytes32 signature = keccak256(abi.encodePacked(
            msg.sender,
            numbers,
            block.timestamp
        ));

        uint256 superpositionStates = enableSuperposition ? 3 : 1; // 3 parallel states
        uint256 cost = ticketPrice * superpositionStates;

        // Create ticket
        QuantumTicket memory ticket = QuantumTicket({
            owner: msg.sender,
            numbers: numbers,
            superpositionStates: superpositionStates,
            amplitude: uint256(signature) % 1000,
            collapsed: false,
            purchaseTime: block.timestamp,
            quantumSignature: signature
        });

        tickets[currentDrawId].push(ticket);

        // Add to jackpot
        jackpot += (cost * jackpotContribution) / 10000;

        emit TicketPurchased(msg.sender, currentDrawId, numbers, superpositionStates);

        return tickets[currentDrawId].length - 1;
    }

    /**
     * @notice Execute draw and determine winners
     */
    function executeDraw() external nonReentrant {
        require(tickets[currentDrawId].length > 0, "No tickets");

        Draw storage draw = draws[currentDrawId];
        draw.drawId = currentDrawId;
        draw.jackpot = jackpot;
        draw.timestamp = block.timestamp;

        // Generate quantum winning numbers
        bytes32 seed = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            currentDrawId,
            blockhash(block.number - 1)
        ));

        draw.quantumSeed = seed;
        uint256 rand = uint256(seed);

        for (uint8 i = 0; i < 6; i++) {
            rand = uint256(keccak256(abi.encode(rand, i)));
            draw.winningNumbers[i] = uint8(1 + (rand % 49)); // 1-49
        }

        draw.completed = true;

        emit DrawExecuted(currentDrawId, draw.winningNumbers, jackpot);

        // Move to next draw
        currentDrawId++;
        jackpot = 0; // Reset jackpot
    }

    /**
     * @notice Claim winnings for a ticket
     */
    function claimWinnings(uint256 drawId, uint256 ticketIndex) external nonReentrant {
        require(draws[drawId].completed, "Draw not completed");
        QuantumTicket storage ticket = tickets[drawId][ticketIndex];
        require(ticket.owner == msg.sender, "Not ticket owner");
        require(!ticket.collapsed, "Already claimed");

        Draw storage draw = draws[drawId];

        // Count matches
        uint8 matches = countMatches(ticket.numbers, draw.winningNumbers);

        ticket.collapsed = true; // Mark as claimed

        if (matches >= 3) {
            // Calculate payout based on matches
            uint256 payout = calculatePayout(matches, draw.jackpot);

            // Apply superposition bonus
            if (ticket.superpositionStates > 1) {
                payout = (payout * SUPERPOSITION_MULTIPLIER) / 10000;
            }

            // Check for quantum interference (random bonus)
            uint256 rand = uint256(keccak256(abi.encode(draw.quantumSeed, msg.sender)));
            if ((rand % 100) < 10) { // 10% chance
                payout = (payout * INTERFERENCE_BONUS) / 10000;
                emit QuantumInterference(msg.sender, payout);
            }

            // Process payout
            casino.placeBet(msg.sender, 0, payout, draw.quantumSeed, true);

            emit WinnerClaimed(msg.sender, payout, matches);
        }
    }

    /**
     * @notice Count matching numbers
     */
    function countMatches(uint8[6] memory ticket, uint8[6] memory winning) internal pure returns (uint8) {
        uint8 count = 0;
        for (uint8 i = 0; i < 6; i++) {
            for (uint8 j = 0; j < 6; j++) {
                if (ticket[i] == winning[j]) {
                    count++;
                    break;
                }
            }
        }
        return count;
    }

    /**
     * @notice Calculate payout based on matches
     */
    function calculatePayout(uint8 matches, uint256 totalJackpot) internal pure returns (uint256) {
        if (matches == 6) return totalJackpot;              // Full jackpot
        if (matches == 5) return totalJackpot / 10;         // 10%
        if (matches == 4) return totalJackpot / 100;        // 1%
        if (matches == 3) return totalJackpot / 1000;       // 0.1%
        return 0;
    }

    /**
     * @notice Validate lottery numbers
     */
    function validateNumbers(uint8[6] calldata numbers) internal pure returns (bool) {
        for (uint8 i = 0; i < 6; i++) {
            if (numbers[i] < 1 || numbers[i] > 49) return false;
            // Check for duplicates
            for (uint8 j = i + 1; j < 6; j++) {
                if (numbers[i] == numbers[j]) return false;
            }
        }
        return true;
    }

    function getCurrentDraw() external view returns (uint256, uint256, uint256) {
        return (currentDrawId, jackpot, tickets[currentDrawId].length);
    }

    function getTicket(uint256 drawId, uint256 index) external view returns (QuantumTicket memory) {
        return tickets[drawId][index];
    }

    function getWinningNumbers(uint256 drawId) external view returns (uint8[6] memory) {
        return draws[drawId].winningNumbers;
    }
}
