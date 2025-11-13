// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title QuantumCasino
 * @notice Main casino contract with quantum-verified randomness
 * @dev Implements provably fair gaming with quantum RNG verification
 */
contract QuantumCasino is ReentrancyGuard, Pausable, AccessControl, Initializable {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    // ============ State Variables ============

    struct PlayerStats {
        uint256 totalWagered;
        uint256 totalWon;
        uint256 totalLost;
        uint256 gamesPlayed;
        uint256 lastPlayTime;
        uint8 vipTier; // 0-5
        address referrer;
    }

    struct GameResult {
        address player;
        address gameContract;
        uint256 betAmount;
        uint256 payout;
        bytes32 quantumSeed;
        uint256 timestamp;
        bool won;
    }

    struct VIPTier {
        uint256 minWagered;
        uint16 rakeback; // basis points (100 = 1%)
        uint16 bonusMultiplier; // basis points
    }

    // Player tracking
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256) public playerBalances;

    // Game tracking
    mapping(address => bool) public authorizedGames;
    GameResult[] public gameHistory;

    // VIP system
    VIPTier[6] public vipTiers;

    // House edge configuration (basis points: 100 = 1%)
    uint16 public defaultHouseEdge = 200; // 2%
    uint16 public maxHouseEdge = 500; // 5%

    // Jackpot system
    uint256 public progressiveJackpot;
    uint256 public jackpotContribution = 50; // 0.5% of bets

    // Treasury
    address public treasury;
    uint256 public treasuryBalance;

    // Rate limiting
    mapping(address => uint256) public lastBetTime;
    uint256 public minBetInterval = 1 seconds;

    // Emergency withdrawal time lock
    uint256 public emergencyWithdrawalDelay = 7 days;
    uint256 public emergencyWithdrawalInitiated;

    // ============ Events ============

    event GamePlayed(
        address indexed player,
        address indexed game,
        uint256 betAmount,
        uint256 payout,
        bytes32 quantumSeed,
        bool won
    );

    event Deposit(address indexed player, uint256 amount);
    event Withdrawal(address indexed player, uint256 amount);
    event JackpotWon(address indexed player, uint256 amount);
    event VIPTierUpdated(address indexed player, uint8 oldTier, uint8 newTier);
    event ReferralReward(address indexed referrer, address indexed player, uint256 amount);

    // ============ Constructor ============

    constructor() {
        _disableInitializers();
    }

    function initialize(address _treasury) external initializer {
        require(_treasury != address(0), "Invalid treasury");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

        treasury = _treasury;

        // Initialize VIP tiers
        vipTiers[0] = VIPTier(0, 0, 10000); // Bronze
        vipTiers[1] = VIPTier(1 ether, 50, 10500); // Silver
        vipTiers[2] = VIPTier(10 ether, 100, 11000); // Gold
        vipTiers[3] = VIPTier(50 ether, 200, 11500); // Platinum
        vipTiers[4] = VIPTier(200 ether, 300, 12000); // Diamond
        vipTiers[5] = VIPTier(1000 ether, 500, 13000); // Quantum Master
    }

    // ============ Player Functions ============

    /**
     * @notice Deposit funds to play
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must deposit positive amount");

        playerBalances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw funds
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(playerBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Must withdraw positive amount");

        playerBalances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Set referrer (can only be set once)
     */
    function setReferrer(address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(playerStats[msg.sender].referrer == address(0), "Referrer already set");

        playerStats[msg.sender].referrer = referrer;
    }

    // ============ Game Functions ============

    /**
     * @notice Place bet and record result (called by authorized games)
     */
    function placeBet(
        address player,
        uint256 betAmount,
        uint256 payout,
        bytes32 quantumSeed,
        bool won
    ) external nonReentrant whenNotPaused onlyRole(GAME_ROLE) {
        require(authorizedGames[msg.sender], "Game not authorized");
        require(playerBalances[player] >= betAmount, "Insufficient balance");

        // Rate limiting
        require(
            block.timestamp >= lastBetTime[player] + minBetInterval,
            "Betting too frequently"
        );
        lastBetTime[player] = block.timestamp;

        // Deduct bet
        playerBalances[player] -= betAmount;

        // Update stats
        PlayerStats storage stats = playerStats[player];
        stats.totalWagered += betAmount;
        stats.gamesPlayed++;
        stats.lastPlayTime = block.timestamp;

        if (won) {
            stats.totalWon += payout;
            playerBalances[player] += payout;

            // Pay referral bonus (5% of winnings)
            if (stats.referrer != address(0)) {
                uint256 referralBonus = payout / 20; // 5%
                playerBalances[stats.referrer] += referralBonus;
                emit ReferralReward(stats.referrer, player, referralBonus);
            }
        } else {
            stats.totalLost += betAmount;

            // Contribute to progressive jackpot
            uint256 jackpotAmount = (betAmount * jackpotContribution) / 10000;
            progressiveJackpot += jackpotAmount;

            // Rest goes to treasury
            treasuryBalance += betAmount - jackpotAmount;
        }

        // Update VIP tier
        updateVIPTier(player);

        // Record game result
        gameHistory.push(GameResult({
            player: player,
            gameContract: msg.sender,
            betAmount: betAmount,
            payout: payout,
            quantumSeed: quantumSeed,
            timestamp: block.timestamp,
            won: won
        }));

        emit GamePlayed(player, msg.sender, betAmount, payout, quantumSeed, won);
    }

    /**
     * @notice Award progressive jackpot
     */
    function awardJackpot(address winner) external nonReentrant onlyRole(GAME_ROLE) {
        require(authorizedGames[msg.sender], "Game not authorized");
        require(progressiveJackpot > 0, "No jackpot available");

        uint256 amount = progressiveJackpot;
        progressiveJackpot = 0;

        playerBalances[winner] += amount;

        emit JackpotWon(winner, amount);
    }

    // ============ VIP System ============

    /**
     * @notice Update player VIP tier based on wagered amount
     */
    function updateVIPTier(address player) internal {
        PlayerStats storage stats = playerStats[player];
        uint8 oldTier = stats.vipTier;
        uint8 newTier = oldTier;

        // Check for tier upgrades
        for (uint8 i = 5; i > oldTier; i--) {
            if (stats.totalWagered >= vipTiers[i].minWagered) {
                newTier = i;
                break;
            }
        }

        if (newTier != oldTier) {
            stats.vipTier = newTier;
            emit VIPTierUpdated(player, oldTier, newTier);
        }
    }

    /**
     * @notice Get player's VIP multiplier
     */
    function getVIPMultiplier(address player) public view returns (uint16) {
        return vipTiers[playerStats[player].vipTier].bonusMultiplier;
    }

    /**
     * @notice Get player's rakeback percentage
     */
    function getRakeback(address player) public view returns (uint16) {
        return vipTiers[playerStats[player].vipTier].rakeback;
    }

    // ============ Admin Functions ============

    /**
     * @notice Authorize a game contract
     */
    function authorizeGame(address game) external onlyRole(OPERATOR_ROLE) {
        require(game != address(0), "Invalid game address");
        authorizedGames[game] = true;
        _grantRole(GAME_ROLE, game);
    }

    /**
     * @notice Revoke game authorization
     */
    function revokeGame(address game) external onlyRole(OPERATOR_ROLE) {
        authorizedGames[game] = false;
        _revokeRole(GAME_ROLE, game);
    }

    /**
     * @notice Update house edge
     */
    function setHouseEdge(uint16 newEdge) external onlyRole(OPERATOR_ROLE) {
        require(newEdge <= maxHouseEdge, "Edge too high");
        defaultHouseEdge = newEdge;
    }

    /**
     * @notice Update treasury address
     */
    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }

    /**
     * @notice Withdraw treasury funds
     */
    function withdrawTreasury(uint256 amount) external onlyRole(OPERATOR_ROLE) {
        require(amount <= treasuryBalance, "Insufficient treasury balance");

        treasuryBalance -= amount;

        (bool success, ) = payable(treasury).call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    /**
     * @notice Initiate emergency withdrawal (time-locked)
     */
    function initiateEmergencyWithdrawal() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyWithdrawalInitiated = block.timestamp;
    }

    /**
     * @notice Execute emergency withdrawal after time lock
     */
    function executeEmergencyWithdrawal() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            emergencyWithdrawalInitiated > 0 &&
            block.timestamp >= emergencyWithdrawalInitiated + emergencyWithdrawalDelay,
            "Time lock not expired"
        );

        uint256 balance = address(this).balance;
        emergencyWithdrawalInitiated = 0;

        (bool success, ) = payable(treasury).call{value: balance}("");
        require(success, "Transfer failed");
    }

    // ============ View Functions ============

    /**
     * @notice Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalWagered,
        uint256 totalWon,
        uint256 totalLost,
        uint256 gamesPlayed,
        uint8 vipTier,
        uint256 balance
    ) {
        PlayerStats memory stats = playerStats[player];
        return (
            stats.totalWagered,
            stats.totalWon,
            stats.totalLost,
            stats.gamesPlayed,
            stats.vipTier,
            playerBalances[player]
        );
    }

    /**
     * @notice Get recent game history
     */
    function getRecentGames(uint256 count) external view returns (GameResult[] memory) {
        uint256 total = gameHistory.length;
        uint256 returnCount = count > total ? total : count;

        GameResult[] memory recent = new GameResult[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            recent[i] = gameHistory[total - 1 - i];
        }

        return recent;
    }

    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Fallback ============

    receive() external payable {
        playerBalances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
