// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title QuantumToken (QNTM)
 * @notice Native token for Quantum Entropy Casino
 * @dev ERC20 with staking, governance, and reality ownership mechanics
 */
contract QuantumToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million (10%)

    // Staking mechanism
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
        uint8 tier; // 0-5 tiers
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per year (in basis points per day)

    // Governance
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) voted;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // Reality ownership (NFT-like for specific universe timelines)
    mapping(uint256 => address) public realityOwners;
    uint256 public realityCount;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event ProposalCreated(uint256 indexed proposalId, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event RealityMinted(uint256 indexed realityId, address indexed owner);

    constructor() ERC20("Quantum Token", "QNTM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        // Mint initial supply
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ============ Staking Functions ============

    /**
     * @notice Stake tokens
     */
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            claimRewards();
        }

        _transfer(msg.sender, address(this), amount);

        Stake storage userStake = stakes[msg.sender];
        userStake.amount += amount;
        userStake.startTime = block.timestamp;
        userStake.rewardDebt = 0;

        // Determine tier based on amount
        userStake.tier = calculateStakeTier(userStake.amount);

        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake tokens
     */
    function unstake(uint256 amount) external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked");

        // Claim rewards
        uint256 reward = calculateRewards(msg.sender);
        if (reward > 0) {
            _mint(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }

        userStake.amount -= amount;
        totalStaked -= amount;

        _transfer(address(this), msg.sender, amount);

        emit Unstaked(msg.sender, amount, reward);
    }

    /**
     * @notice Claim staking rewards
     */
    function claimRewards() public {
        uint256 reward = calculateRewards(msg.sender);
        require(reward > 0, "No rewards");

        stakes[msg.sender].rewardDebt += reward;
        stakes[msg.sender].startTime = block.timestamp;

        _mint(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @notice Calculate pending rewards
     */
    function calculateRewards(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        uint256 daysStaked = stakingDuration / 1 days;

        // Base reward: amount * rate * days / 365 / 10000
        uint256 baseReward = (userStake.amount * rewardRate * daysStaked) / (365 * 10000);

        // Tier multiplier (1x to 2x)
        uint256 tierMultiplier = 10000 + (uint256(userStake.tier) * 2000); // +20% per tier
        uint256 reward = (baseReward * tierMultiplier) / 10000;

        return reward - userStake.rewardDebt;
    }

    /**
     * @notice Calculate stake tier
     */
    function calculateStakeTier(uint256 amount) internal pure returns (uint8) {
        if (amount >= 1_000_000 * 10**18) return 5; // 1M+ tokens
        if (amount >= 500_000 * 10**18) return 4;   // 500K+
        if (amount >= 100_000 * 10**18) return 3;   // 100K+
        if (amount >= 50_000 * 10**18) return 2;    // 50K+
        if (amount >= 10_000 * 10**18) return 1;    // 10K+
        return 0;
    }

    // ============ Governance Functions ============

    /**
     * @notice Create governance proposal
     */
    function createProposal(string memory description, uint256 votingPeriod) external returns (uint256) {
        require(stakes[msg.sender].amount >= 10_000 * 10**18, "Insufficient stake"); // 10K minimum

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.executed = false;

        emit ProposalCreated(proposalId, description);

        return proposalId;
    }

    /**
     * @notice Vote on proposal
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.voted[msg.sender], "Already voted");
        require(stakes[msg.sender].amount > 0, "Must be staker");

        proposal.voted[msg.sender] = true;
        uint256 votePower = stakes[msg.sender].amount;

        if (support) {
            proposal.forVotes += votePower;
        } else {
            proposal.againstVotes += votePower;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    // ============ Reality Ownership ============

    /**
     * @notice Mint reality ownership NFT
     */
    function mintReality(address to) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 realityId = realityCount++;
        realityOwners[realityId] = to;

        emit RealityMinted(realityId, to);

        return realityId;
    }

    // ============ Admin Functions ============

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setRewardRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardRate = newRate;
    }

    // ============ View Functions ============

    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 pendingRewards,
        uint8 tier
    ) {
        Stake memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.startTime,
            calculateRewards(user),
            userStake.tier
        );
    }

    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.endTime,
            proposal.executed
        );
    }
}
