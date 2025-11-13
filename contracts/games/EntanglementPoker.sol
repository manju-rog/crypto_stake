// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../core/QuantumCasino.sol";

/**
 * @title EntanglementPoker
 * @notice Quantum poker where cards exist in superposition and become entangled
 * @dev EPR pairs, Bell states, and quantum measurements determine gameplay
 */
contract EntanglementPoker is ReentrancyGuard {
    QuantumCasino public casino;

    // ============ Quantum Card System ============

    // Card states (52 cards + jokers)
    enum CardState {
        SUPERPOSITION,    // Card is in multiple states
        COLLAPSED,        // Card has been observed
        ENTANGLED,        // Card correlated with another
        TELEPORTED        // Card quantum teleported
    }

    struct QuantumCard {
        uint8 value;          // 0-12 (A,2-10,J,Q,K)
        uint8 suit;           // 0-3 (Hearts, Diamonds, Clubs, Spades)
        CardState state;
        uint256 amplitude;    // Probability amplitude
        uint8 entangledWith;  // Index of entangled card (255 if none)
        bool observed;
    }

    struct Hand {
        QuantumCard[5] cards;
        uint256 waveFunction; // Overall hand wave function
        uint8 entanglementCount;
        bool bellState;       // Are cards in Bell state?
        uint256 lastAction;
    }

    struct Game {
        address[6] players;   // Up to 6 players
        uint8 playerCount;
        uint8 currentPlayer;
        uint256 pot;
        uint256 currentBet;
        mapping(address => Hand) hands;
        mapping(address => uint256) bets;
        mapping(address => bool) folded;
        mapping(address => bool) allIn;
        uint8 round;          // 0=pre-flop, 1=flop, 2=turn, 3=river
        QuantumCard[5] communityCards;
        bytes32 quantumSeed;
        bool active;
        uint256 startTime;
    }

    // ============ Quantum Hands (Special) ============

    enum QuantumHandRank {
        HIGH_CARD,
        PAIR,
        TWO_PAIR,
        THREE_OF_KIND,
        STRAIGHT,
        FLUSH,
        FULL_HOUSE,
        FOUR_OF_KIND,
        STRAIGHT_FLUSH,
        ROYAL_FLUSH,
        // Quantum-specific hands
        SUPERPOSITION_FLUSH,      // All cards in superposition
        ENTANGLED_PAIRS,          // 2+ entangled pairs
        QUANTUM_STRAIGHT,         // Tunneled sequence
        INTERFERENCE_FULL_HOUSE,  // Constructive interference
        BELL_STATE,               // Maximum entanglement
        GHZ_STATE,                // Three-way entanglement
        QUANTUM_ROYAL             // All quantum + royal flush
    }

    // ============ State ============

    mapping(uint256 => Game) public games;
    uint256 public gameCount;
    mapping(address => uint256) public playerCurrentGame;

    uint256 public minBuyIn = 0.1 ether;
    uint256 public maxBuyIn = 100 ether;
    uint256 public rake = 250; // 2.5% rake

    // Quantum betting multipliers (basis points)
    mapping(QuantumHandRank => uint256) public handPayouts;

    // ============ Events ============

    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, uint8 playerCount);
    event CardsDealt(uint256 indexed gameId, address indexed player, bool entangled);
    event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount);
    event Fold(uint256 indexed gameId, address indexed player);
    event QuantumMeasurement(uint256 indexed gameId, address indexed player, uint8 cardIndex);
    event EntanglementCreated(uint256 indexed gameId, address player1, address player2);
    event WaveFunctionCollapse(uint256 indexed gameId, address indexed player);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 pot);
    event QuantumHandDetected(uint256 indexed gameId, address indexed player, QuantumHandRank rank);

    // ============ Constructor ============

    constructor(address _casino) {
        casino = QuantumCasino(_casino);

        // Initialize hand payouts (multipliers)
        handPayouts[QuantumHandRank.HIGH_CARD] = 0;
        handPayouts[QuantumHandRank.PAIR] = 10000;           // 1x
        handPayouts[QuantumHandRank.TWO_PAIR] = 20000;       // 2x
        handPayouts[QuantumHandRank.THREE_OF_KIND] = 30000;  // 3x
        handPayouts[QuantumHandRank.STRAIGHT] = 50000;       // 5x
        handPayouts[QuantumHandRank.FLUSH] = 70000;          // 7x
        handPayouts[QuantumHandRank.FULL_HOUSE] = 100000;    // 10x
        handPayouts[QuantumHandRank.FOUR_OF_KIND] = 200000;  // 20x
        handPayouts[QuantumHandRank.STRAIGHT_FLUSH] = 500000; // 50x
        handPayouts[QuantumHandRank.ROYAL_FLUSH] = 1000000;  // 100x

        // Quantum hands
        handPayouts[QuantumHandRank.SUPERPOSITION_FLUSH] = 1500000;      // 150x
        handPayouts[QuantumHandRank.ENTANGLED_PAIRS] = 2000000;          // 200x
        handPayouts[QuantumHandRank.QUANTUM_STRAIGHT] = 2500000;         // 250x
        handPayouts[QuantumHandRank.INTERFERENCE_FULL_HOUSE] = 3000000;  // 300x
        handPayouts[QuantumHandRank.BELL_STATE] = 5000000;               // 500x
        handPayouts[QuantumHandRank.GHZ_STATE] = 7500000;                // 750x
        handPayouts[QuantumHandRank.QUANTUM_ROYAL] = 10000000;           // 1000x
    }

    // ============ Game Management ============

    /**
     * @notice Create new poker game
     */
    function createGame() external nonReentrant returns (uint256) {
        uint256 gameId = gameCount++;

        Game storage game = games[gameId];
        game.players[0] = msg.sender;
        game.playerCount = 1;
        game.active = false;
        game.startTime = block.timestamp;

        playerCurrentGame[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender);

        return gameId;
    }

    /**
     * @notice Join existing game
     */
    function joinGame(uint256 gameId, uint256 buyIn) external nonReentrant {
        Game storage game = games[gameId];

        require(!game.active, "Game already started");
        require(game.playerCount < 6, "Game full");
        require(buyIn >= minBuyIn && buyIn <= maxBuyIn, "Invalid buy-in");
        require(playerCurrentGame[msg.sender] == 0, "Already in a game");

        // Transfer buy-in
        // (In production, this would deduct from casino balance)

        game.players[game.playerCount] = msg.sender;
        game.playerCount++;
        game.pot += buyIn;

        playerCurrentGame[msg.sender] = gameId;

        emit PlayerJoined(gameId, msg.sender);

        // Auto-start if 2+ players
        if (game.playerCount >= 2) {
            startGame(gameId);
        }
    }

    /**
     * @notice Start the game and deal cards
     */
    function startGame(uint256 gameId) internal {
        Game storage game = games[gameId];

        require(!game.active, "Game already active");
        require(game.playerCount >= 2, "Need at least 2 players");

        game.active = true;
        game.round = 0;
        game.currentPlayer = 0;
        game.quantumSeed = generateQuantumSeed(gameId);

        // Deal cards to all players
        for (uint8 i = 0; i < game.playerCount; i++) {
            address player = game.players[i];
            dealCards(gameId, player);
        }

        emit GameStarted(gameId, game.playerCount);
    }

    /**
     * @notice Deal quantum cards to player
     */
    function dealCards(uint256 gameId, address player) internal {
        Game storage game = games[gameId];
        Hand storage hand = game.hands[player];

        bytes32 seed = keccak256(abi.encode(game.quantumSeed, player));
        uint256 rand = uint256(seed);

        for (uint8 i = 0; i < 5; i++) {
            rand = uint256(keccak256(abi.encode(rand, i)));

            hand.cards[i] = QuantumCard({
                value: 0,  // Will be determined on observation
                suit: 0,
                state: CardState.SUPERPOSITION,
                amplitude: rand % 1000,
                entangledWith: 255, // No entanglement initially
                observed: false
            });
        }

        // Random chance to create entanglement
        if ((rand % 100) < 30) { // 30% chance
            createEntanglement(gameId, player);
        }

        emit CardsDealt(gameId, player, hand.entanglementCount > 0);
    }

    // ============ Quantum Mechanics ============

    /**
     * @notice Create entanglement between cards
     */
    function createEntanglement(uint256 gameId, address player) internal {
        Game storage game = games[gameId];
        Hand storage hand = game.hands[player];

        // Entangle cards 0 and 2
        hand.cards[0].entangledWith = 2;
        hand.cards[2].entangledWith = 0;
        hand.cards[0].state = CardState.ENTANGLED;
        hand.cards[2].state = CardState.ENTANGLED;

        hand.entanglementCount++;

        // Check for Bell state (maximum entanglement)
        if (hand.entanglementCount >= 2) {
            hand.bellState = true;
        }
    }

    /**
     * @notice Observe/measure a card (collapse wave function)
     */
    function observeCard(uint256 gameId, uint8 cardIndex) external nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");

        Hand storage hand = game.hands[msg.sender];
        require(cardIndex < 5, "Invalid card index");
        require(!hand.cards[cardIndex].observed, "Card already observed");

        QuantumCard storage card = hand.cards[cardIndex];

        // Collapse wave function
        bytes32 seed = keccak256(abi.encode(
            game.quantumSeed,
            msg.sender,
            cardIndex,
            block.timestamp
        ));

        uint256 rand = uint256(seed);
        card.value = uint8(rand % 13);  // 0-12 (A-K)
        card.suit = uint8((rand >> 8) % 4); // 0-3

        // If entangled, affect the paired card
        if (card.entangledWith != 255) {
            QuantumCard storage pairedCard = hand.cards[card.entangledWith];
            // Entangled cards have correlated outcomes
            pairedCard.value = (card.value + 1) % 13; // Adjacent value
            pairedCard.suit = card.suit; // Same suit
            pairedCard.observed = true;
            pairedCard.state = CardState.COLLAPSED;
        }

        card.observed = true;
        card.state = CardState.COLLAPSED;

        emit QuantumMeasurement(gameId, msg.sender, cardIndex);

        // Check if all cards observed
        bool allObserved = true;
        for (uint8 i = 0; i < 5; i++) {
            if (!hand.cards[i].observed) {
                allObserved = false;
                break;
            }
        }

        if (allObserved) {
            emit WaveFunctionCollapse(gameId, msg.sender);
        }
    }

    // ============ Betting Actions ============

    /**
     * @notice Place bet
     */
    function bet(uint256 gameId, uint256 amount) external nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        require(game.players[game.currentPlayer] == msg.sender, "Not your turn");
        require(!game.folded[msg.sender], "Already folded");
        require(amount >= game.currentBet, "Bet too low");

        game.bets[msg.sender] += amount;
        game.pot += amount;
        game.currentBet = amount;

        emit BetPlaced(gameId, msg.sender, amount);

        nextPlayer(gameId);
    }

    /**
     * @notice Fold hand
     */
    function fold(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        require(game.players[game.currentPlayer] == msg.sender, "Not your turn");

        game.folded[msg.sender] = true;

        emit Fold(gameId, msg.sender);

        // Check if only one player remaining
        uint8 activePlayers = 0;
        address lastPlayer;

        for (uint8 i = 0; i < game.playerCount; i++) {
            if (!game.folded[game.players[i]]) {
                activePlayers++;
                lastPlayer = game.players[i];
            }
        }

        if (activePlayers == 1) {
            endGame(gameId, lastPlayer);
        } else {
            nextPlayer(gameId);
        }
    }

    /**
     * @notice Move to next player
     */
    function nextPlayer(uint256 gameId) internal {
        Game storage game = games[gameId];

        do {
            game.currentPlayer = (game.currentPlayer + 1) % game.playerCount;
        } while (game.folded[game.players[game.currentPlayer]]);

        // Check if round complete
        // (Simplified - in production, check if all players acted)
    }

    // ============ Hand Evaluation ============

    /**
     * @notice Evaluate hand rank (simplified)
     */
    function evaluateHand(uint256 gameId, address player) public view returns (QuantumHandRank) {
        Game storage game = games[gameId];
        Hand storage hand = game.hands[player];

        // Check for quantum hands first
        if (checkBellState(hand)) return QuantumHandRank.BELL_STATE;
        if (checkGHZState(hand)) return QuantumHandRank.GHZ_STATE;
        if (checkSuperpositionFlush(hand)) return QuantumHandRank.SUPERPOSITION_FLUSH;
        if (checkEntangledPairs(hand)) return QuantumHandRank.ENTANGLED_PAIRS;

        // Standard poker hands (simplified implementation)
        // In production, implement full poker hand evaluation
        return QuantumHandRank.HIGH_CARD;
    }

    function checkBellState(Hand storage hand) internal view returns (bool) {
        return hand.bellState;
    }

    function checkGHZState(Hand storage hand) internal view returns (bool) {
        return hand.entanglementCount >= 3;
    }

    function checkSuperpositionFlush(Hand storage hand) internal view returns (bool) {
        uint8 superpositionCount = 0;
        for (uint8 i = 0; i < 5; i++) {
            if (hand.cards[i].state == CardState.SUPERPOSITION) {
                superpositionCount++;
            }
        }
        return superpositionCount >= 5;
    }

    function checkEntangledPairs(Hand storage hand) internal view returns (bool) {
        return hand.entanglementCount >= 2;
    }

    // ============ Game End ============

    /**
     * @notice End game and distribute pot
     */
    function endGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];

        game.active = false;

        // Calculate payout
        uint256 rakeAmount = (game.pot * rake) / 10000;
        uint256 payout = game.pot - rakeAmount;

        // Get hand rank for bonus
        QuantumHandRank rank = evaluateHand(gameId, winner);
        if (uint8(rank) >= uint8(QuantumHandRank.SUPERPOSITION_FLUSH)) {
            emit QuantumHandDetected(gameId, winner, rank);
            // Bonus payout for quantum hands
            uint256 bonus = (payout * handPayouts[rank]) / 10000;
            payout += bonus;
        }

        // Process through casino
        casino.placeBet(winner, 0, payout, game.quantumSeed, true);

        // Clean up
        for (uint8 i = 0; i < game.playerCount; i++) {
            playerCurrentGame[game.players[i]] = 0;
        }

        emit GameComplete(gameId, winner, payout);
    }

    // ============ Utility Functions ============

    function generateQuantumSeed(uint256 gameId) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            gameId,
            blockhash(block.number - 1)
        ));
    }

    // ============ View Functions ============

    function getGame(uint256 gameId) external view returns (
        address[6] memory players,
        uint8 playerCount,
        uint256 pot,
        bool active
    ) {
        Game storage game = games[gameId];
        return (game.players, game.playerCount, game.pot, game.active);
    }

    function getPlayerHand(uint256 gameId, address player) external view returns (Hand memory) {
        return games[gameId].hands[player];
    }
}
