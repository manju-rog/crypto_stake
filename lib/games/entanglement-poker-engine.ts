/**
 * Entanglement Poker Game Engine
 * Texas Hold'em with Quantum Mechanics
 * - Cards exist in superposition until observed
 * - EPR paired cards (quantum entanglement)
 * - Bell states for maximum entanglement
 * - Measurement collapse affects entangled cards
 * - Special quantum hands
 */

import { quantumStateManager } from '../quantum/quantum-state';
import { quantumPipeline } from '../quantum/randomness-pipeline';
import * as math from 'mathjs';

// Card suits and ranks
export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export interface QuantumCard {
  id: string;
  suit: Suit | null; // null = superposition
  rank: Rank | null; // null = superposition
  isObserved: boolean;
  isEntangled: boolean;
  entangledWith: string[];
  probability: number; // Probability of current state
  possibleStates: Array<{ suit: Suit; rank: Rank; probability: number }>;
  bellState: 'phi+' | 'phi-' | 'psi+' | 'psi-' | null;
}

export interface QuantumHand {
  cards: QuantumCard[];
  handStrength: number;
  handName: string;
  isQuantumHand: boolean; // Special quantum hand type
}

export interface PokerPlayer {
  id: string;
  name: string;
  chips: number;
  hand: QuantumCard[];
  currentBet: number;
  folded: boolean;
  allIn: boolean;
}

export interface PokerGameState {
  players: PokerPlayer[];
  communityCards: QuantumCard[];
  pot: number;
  currentBet: number;
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  activePlayerIndex: number;
  dealerIndex: number;
  deck: QuantumCard[];
}

export type BetAction = 'fold' | 'call' | 'raise' | 'check' | 'all-in';

// Special quantum bet types
export type QuantumBetType =
  | 'eigenvalue-bet'      // Bet on specific card eigenstate
  | 'entanglement-raise'  // Raise causes card entanglement
  | 'superposition-call'  // Call keeps cards in superposition
  | 'measurement-fold';   // Fold collapses all cards

/**
 * Entanglement Poker Engine
 */
export class EntanglementPokerEngine {
  private gameState: PokerGameState | null = null;
  private usedCardIds: Set<string> = new Set();

  /**
   * Create a quantum card in superposition
   */
  private createQuantumCard(forceObserved: boolean = false): QuantumCard {
    const id = `card-${Date.now()}-${Math.random()}`;

    // Create superposition of all possible cards
    const possibleStates: Array<{ suit: Suit; rank: Rank; probability: number }> = [];
    const totalStates = SUITS.length * RANKS.length;
    const baseProbability = 1 / totalStates;

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        possibleStates.push({ suit, rank, probability: baseProbability });
      }
    }

    // Register quantum state
    const amplitudes = possibleStates.map(s =>
      math.complex(Math.sqrt(s.probability), 0)
    );
    quantumStateManager.createSuperposition(id, amplitudes, false);

    const card: QuantumCard = {
      id,
      suit: forceObserved ? SUITS[0] : null,
      rank: forceObserved ? RANKS[0] : null,
      isObserved: forceObserved,
      isEntangled: false,
      entangledWith: [],
      probability: 1.0,
      possibleStates,
      bellState: null,
    };

    this.usedCardIds.add(id);
    return card;
  }

  /**
   * Observe/measure a card (collapse wave function)
   */
  async observeCard(card: QuantumCard): Promise<void> {
    if (card.isObserved) return;

    // Use quantum RNG to determine outcome
    const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;

    // Measure the quantum state
    const measurement = quantumStateManager.measure(card.id);

    // Select card based on probability distribution
    let cumulativeProbability = 0;
    for (const state of card.possibleStates) {
      cumulativeProbability += state.probability;
      if (rand < cumulativeProbability) {
        card.suit = state.suit;
        card.rank = state.rank;
        break;
      }
    }

    // Ensure we have a suit and rank
    if (!card.suit || !card.rank) {
      card.suit = card.possibleStates[0].suit;
      card.rank = card.possibleStates[0].rank;
    }

    card.isObserved = true;
    card.probability = 1.0;

    // Collapse entangled cards
    if (card.isEntangled) {
      for (const entangledId of card.entangledWith) {
        const entangledCard = this.findCardById(entangledId);
        if (entangledCard && !entangledCard.isObserved) {
          await this.collapseEntangledCard(entangledCard, card);
        }
      }
    }
  }

  /**
   * Collapse entangled card based on observed card
   */
  private async collapseEntangledCard(
    entangledCard: QuantumCard,
    observedCard: QuantumCard
  ): Promise<void> {
    const bellState = entangledCard.bellState || 'phi+';

    // Get quantum random number
    const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;

    switch (bellState) {
      case 'phi+': // Same suit, correlated rank
        entangledCard.suit = observedCard.suit;
        entangledCard.rank = this.correlatedRank(observedCard.rank!, rand);
        break;
      case 'phi-': // Same suit, anti-correlated rank
        entangledCard.suit = observedCard.suit;
        entangledCard.rank = this.antiCorrelatedRank(observedCard.rank!, rand);
        break;
      case 'psi+': // Different suit, correlated rank
        entangledCard.suit = this.differentSuit(observedCard.suit!);
        entangledCard.rank = this.correlatedRank(observedCard.rank!, rand);
        break;
      case 'psi-': // Different suit, anti-correlated rank
        entangledCard.suit = this.differentSuit(observedCard.suit!);
        entangledCard.rank = this.antiCorrelatedRank(observedCard.rank!, rand);
        break;
    }

    entangledCard.isObserved = true;
    entangledCard.probability = 1.0;
  }

  /**
   * Get correlated rank
   */
  private correlatedRank(originalRank: Rank, randomness: number): Rank {
    const originalIndex = RANKS.indexOf(originalRank);
    // 70% chance same rank, 30% chance adjacent
    if (randomness < 0.7) {
      return originalRank;
    } else {
      const offset = randomness < 0.85 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(RANKS.length - 1, originalIndex + offset));
      return RANKS[newIndex];
    }
  }

  /**
   * Get anti-correlated rank
   */
  private antiCorrelatedRank(originalRank: Rank, randomness: number): Rank {
    const originalIndex = RANKS.indexOf(originalRank);
    const oppositeIndex = RANKS.length - 1 - originalIndex;
    // 70% chance opposite rank, 30% chance nearby opposite
    if (randomness < 0.7) {
      return RANKS[oppositeIndex];
    } else {
      const offset = randomness < 0.85 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(RANKS.length - 1, oppositeIndex + offset));
      return RANKS[newIndex];
    }
  }

  /**
   * Get different suit
   */
  private differentSuit(originalSuit: Suit): Suit {
    const otherSuits = SUITS.filter(s => s !== originalSuit);
    return otherSuits[Math.floor(Math.random() * otherSuits.length)];
  }

  /**
   * Create entanglement between two cards
   */
  createEntanglement(
    card1: QuantumCard,
    card2: QuantumCard,
    bellState: 'phi+' | 'phi-' | 'psi+' | 'psi-' = 'phi+'
  ): void {
    if (card1.isObserved || card2.isObserved) {
      console.warn('Cannot entangle observed cards');
      return;
    }

    // Create quantum entanglement
    quantumStateManager.createEntanglement(card1.id, card2.id, bellState);

    // Update cards
    card1.isEntangled = true;
    card1.entangledWith.push(card2.id);
    card1.bellState = bellState;

    card2.isEntangled = true;
    card2.entangledWith.push(card1.id);
    card2.bellState = bellState;
  }

  /**
   * Find card by ID in current game
   */
  private findCardById(id: string): QuantumCard | null {
    if (!this.gameState) return null;

    // Check community cards
    for (const card of this.gameState.communityCards) {
      if (card.id === id) return card;
    }

    // Check player hands
    for (const player of this.gameState.players) {
      for (const card of player.hand) {
        if (card.id === id) return card;
      }
    }

    return null;
  }

  /**
   * Initialize new poker game
   */
  async initGame(playerNames: string[], startingChips: number = 1000): Promise<PokerGameState> {
    // Create players
    const players: PokerPlayer[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      chips: startingChips,
      hand: [],
      currentBet: 0,
      folded: false,
      allIn: false,
    }));

    // Create deck (52 cards in superposition)
    const deck: QuantumCard[] = [];
    for (let i = 0; i < 52; i++) {
      deck.push(this.createQuantumCard());
    }

    this.gameState = {
      players,
      communityCards: [],
      pot: 0,
      currentBet: 0,
      phase: 'preflop',
      activePlayerIndex: 0,
      dealerIndex: 0,
      deck,
    };

    // Deal hole cards
    await this.dealHoleCards();

    return this.gameState;
  }

  /**
   * Deal hole cards to all players
   */
  private async dealHoleCards(): Promise<void> {
    if (!this.gameState) return;

    for (const player of this.gameState.players) {
      // Deal 2 cards to each player
      const card1 = this.gameState.deck.pop()!;
      const card2 = this.gameState.deck.pop()!;

      // 20% chance of EPR pair (entangled hole cards)
      const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;
      if (rand < 0.2) {
        this.createEntanglement(card1, card2, 'phi+');
      }

      player.hand = [card1, card2];
    }
  }

  /**
   * Deal flop (3 community cards)
   */
  async dealFlop(): Promise<void> {
    if (!this.gameState || this.gameState.phase !== 'preflop') return;

    const card1 = this.gameState.deck.pop()!;
    const card2 = this.gameState.deck.pop()!;
    const card3 = this.gameState.deck.pop()!;

    // 30% chance of creating entanglement between flop cards
    const rand = (await quantumPipeline.getSecureRandom(0, 100)).value / 100;
    if (rand < 0.3) {
      this.createEntanglement(card1, card2, 'psi+');
    }

    this.gameState.communityCards = [card1, card2, card3];
    this.gameState.phase = 'flop';
  }

  /**
   * Deal turn (4th community card)
   */
  async dealTurn(): Promise<void> {
    if (!this.gameState || this.gameState.phase !== 'flop') return;

    const card = this.gameState.deck.pop()!;
    this.gameState.communityCards.push(card);
    this.gameState.phase = 'turn';
  }

  /**
   * Deal river (5th community card)
   */
  async dealRiver(): Promise<void> {
    if (!this.gameState || this.gameState.phase !== 'turn') return;

    const card = this.gameState.deck.pop()!;
    this.gameState.communityCards.push(card);
    this.gameState.phase = 'river';
  }

  /**
   * Evaluate poker hand (classical + quantum hands)
   */
  async evaluateHand(playerCards: QuantumCard[], communityCards: QuantumCard[]): Promise<QuantumHand> {
    // Observe all cards
    for (const card of [...playerCards, ...communityCards]) {
      await this.observeCard(card);
    }

    const allCards = [...playerCards, ...communityCards];

    // Check for special quantum hands first
    const quantumHand = this.checkQuantumHands(allCards);
    if (quantumHand) {
      return quantumHand;
    }

    // Standard poker hand evaluation
    return this.evaluateStandardHand(allCards);
  }

  /**
   * Check for special quantum hands
   */
  private checkQuantumHands(cards: QuantumCard[]): QuantumHand | null {
    // Superposition Flush: All cards were in superposition (impossible after observe)
    const superpositionCount = cards.filter(c => !c.isObserved).length;

    // Entangled Pair: Two entangled cards with same rank
    const entangledPairs = this.findEntangledPairs(cards);
    if (entangledPairs.length >= 2) {
      return {
        cards,
        handStrength: 9000, // Higher than royal flush
        handName: 'Quantum Entangled Pairs',
        isQuantumHand: true,
      };
    }

    // Bell State Bonus: Cards in perfect Bell state correlation
    const bellStateCards = cards.filter(c => c.bellState !== null);
    if (bellStateCards.length >= 4) {
      return {
        cards,
        handStrength: 8500,
        handName: 'Bell State Harmony',
        isQuantumHand: true,
      };
    }

    return null;
  }

  /**
   * Find entangled pairs in cards
   */
  private findEntangledPairs(cards: QuantumCard[]): QuantumCard[][] {
    const pairs: QuantumCard[][] = [];
    const checked = new Set<string>();

    for (const card of cards) {
      if (checked.has(card.id) || !card.isEntangled) continue;

      for (const entangledId of card.entangledWith) {
        const entangled = cards.find(c => c.id === entangledId);
        if (entangled && card.rank === entangled.rank) {
          pairs.push([card, entangled]);
          checked.add(card.id);
          checked.add(entangled.id);
          break;
        }
      }
    }

    return pairs;
  }

  /**
   * Evaluate standard poker hand
   */
  private evaluateStandardHand(cards: QuantumCard[]): QuantumHand {
    // Convert to rank values (2=2, 3=3, ..., J=11, Q=12, K=13, A=14)
    const rankValues = cards.map(c => {
      const rank = c.rank!;
      if (rank === 'J') return 11;
      if (rank === 'Q') return 12;
      if (rank === 'K') return 13;
      if (rank === 'A') return 14;
      return parseInt(rank);
    });

    // Check flush
    const suitCounts: Record<string, number> = {};
    for (const card of cards) {
      suitCounts[card.suit!] = (suitCounts[card.suit!] || 0) + 1;
    }
    const isFlush = Object.values(suitCounts).some(count => count >= 5);

    // Check straight
    const sortedRanks = [...new Set(rankValues)].sort((a, b) => a - b);
    let isStraight = false;
    for (let i = 0; i <= sortedRanks.length - 5; i++) {
      if (sortedRanks[i + 4] - sortedRanks[i] === 4) {
        isStraight = true;
        break;
      }
    }

    // Check rank frequencies
    const rankCounts: Record<number, number> = {};
    for (const rank of rankValues) {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    }
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    // Determine hand
    if (isStraight && isFlush) {
      return {
        cards,
        handStrength: 8000,
        handName: 'Straight Flush',
        isQuantumHand: false,
      };
    } else if (counts[0] === 4) {
      return {
        cards,
        handStrength: 7000,
        handName: 'Four of a Kind',
        isQuantumHand: false,
      };
    } else if (counts[0] === 3 && counts[1] === 2) {
      return {
        cards,
        handStrength: 6000,
        handName: 'Full House',
        isQuantumHand: false,
      };
    } else if (isFlush) {
      return {
        cards,
        handStrength: 5000,
        handName: 'Flush',
        isQuantumHand: false,
      };
    } else if (isStraight) {
      return {
        cards,
        handStrength: 4000,
        handName: 'Straight',
        isQuantumHand: false,
      };
    } else if (counts[0] === 3) {
      return {
        cards,
        handStrength: 3000,
        handName: 'Three of a Kind',
        isQuantumHand: false,
      };
    } else if (counts[0] === 2 && counts[1] === 2) {
      return {
        cards,
        handStrength: 2000,
        handName: 'Two Pair',
        isQuantumHand: false,
      };
    } else if (counts[0] === 2) {
      return {
        cards,
        handStrength: 1000,
        handName: 'One Pair',
        isQuantumHand: false,
      };
    }

    return {
      cards,
      handStrength: Math.max(...rankValues),
      handName: 'High Card',
      isQuantumHand: false,
    };
  }

  /**
   * Process player action
   */
  async processAction(
    playerId: string,
    action: BetAction,
    amount: number = 0,
    quantumBetType?: QuantumBetType
  ): Promise<void> {
    if (!this.gameState) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || player.folded) return;

    switch (action) {
      case 'fold':
        player.folded = true;
        if (quantumBetType === 'measurement-fold') {
          // Collapse all cards
          for (const card of player.hand) {
            await this.observeCard(card);
          }
        }
        break;

      case 'call':
        const callAmount = this.gameState.currentBet - player.currentBet;
        player.chips -= callAmount;
        player.currentBet = this.gameState.currentBet;
        this.gameState.pot += callAmount;
        break;

      case 'raise':
        const raiseAmount = amount;
        player.chips -= raiseAmount;
        player.currentBet += raiseAmount;
        this.gameState.currentBet = player.currentBet;
        this.gameState.pot += raiseAmount;

        if (quantumBetType === 'entanglement-raise') {
          // Create entanglement between player cards
          if (player.hand.length >= 2) {
            this.createEntanglement(player.hand[0], player.hand[1], 'phi+');
          }
        }
        break;

      case 'check':
        // No action needed
        break;

      case 'all-in':
        const allInAmount = player.chips;
        this.gameState.pot += allInAmount;
        player.chips = 0;
        player.allIn = true;
        break;
    }

    this.gameState.activePlayerIndex = (this.gameState.activePlayerIndex + 1) % this.gameState.players.length;
  }

  /**
   * Get current game state
   */
  getGameState(): PokerGameState | null {
    return this.gameState;
  }

  /**
   * Reset game
   */
  reset(): void {
    this.gameState = null;
    this.usedCardIds.clear();
    quantumStateManager.reset();
  }
}

// Export singleton
export const entanglementPoker = new EntanglementPokerEngine();
export default EntanglementPokerEngine;
