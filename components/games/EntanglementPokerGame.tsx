'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  entanglementPoker,
  type QuantumCard,
  type PokerGameState,
  type PokerPlayer,
  type BetAction,
  type QuantumBetType,
  SUITS,
  RANKS,
} from '@/lib/games/entanglement-poker-engine';

export default function EntanglementPokerGame() {
  const [gameState, setGameState] = useState<PokerGameState | null>(null);
  const [selectedAction, setSelectedAction] = useState<BetAction>('check');
  const [raiseAmount, setRaiseAmount] = useState(100);
  const [quantumBetType, setQuantumBetType] = useState<QuantumBetType | undefined>();
  const [isInitializing, setIsInitializing] = useState(false);
  const [showHandResult, setShowHandResult] = useState(false);
  const [winner, setWinner] = useState<PokerPlayer | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize game
  const initializeGame = async () => {
    setIsInitializing(true);
    setLoading(true);
    try {
      const newGame = await entanglementPoker.initGame(['You', 'Quantum Bot 1', 'Quantum Bot 2'], 1000);
      setGameState(newGame);
      setShowHandResult(false);
      setWinner(null);
    } catch (error) {
      console.error('Failed to initialize game:', error);
    } finally {
      setIsInitializing(false);
      setLoading(false);
    }
  };

  // Process player action
  const handleAction = async () => {
    if (!gameState || loading) return;

    setLoading(true);
    try {
      const player = gameState.players[0]; // Human player
      await entanglementPoker.processAction(player.id, selectedAction, raiseAmount, quantumBetType);

      const updatedState = entanglementPoker.getGameState();
      setGameState(updatedState);

      // Check if betting round is over, advance game phase
      if (selectedAction !== 'fold') {
        await advanceGamePhase();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Advance game phase
  const advanceGamePhase = async () => {
    if (!gameState) return;

    try {
      if (gameState.phase === 'preflop') {
        await entanglementPoker.dealFlop();
      } else if (gameState.phase === 'flop') {
        await entanglementPoker.dealTurn();
      } else if (gameState.phase === 'turn') {
        await entanglementPoker.dealRiver();
      } else if (gameState.phase === 'river') {
        await showdown();
      }

      const updatedState = entanglementPoker.getGameState();
      setGameState(updatedState);
    } catch (error) {
      console.error('Failed to advance phase:', error);
    }
  };

  // Showdown - evaluate hands
  const showdown = async () => {
    if (!gameState) return;

    const activePlayers = gameState.players.filter(p => !p.folded);
    const hands = await Promise.all(
      activePlayers.map(async player =>
        entanglementPoker.evaluateHand(player.hand, gameState.communityCards)
      )
    );

    // Find winner (highest hand strength)
    let winnerIndex = 0;
    let maxStrength = hands[0].handStrength;

    for (let i = 1; i < hands.length; i++) {
      if (hands[i].handStrength > maxStrength) {
        maxStrength = hands[i].handStrength;
        winnerIndex = i;
      }
    }

    const winningPlayer = activePlayers[winnerIndex];
    winningPlayer.chips += gameState.pot;

    setWinner(winningPlayer);
    setShowHandResult(true);
  };

  // Observe card (collapse superposition)
  const observeCard = async (card: QuantumCard) => {
    if (loading) return;
    setLoading(true);
    try {
      await entanglementPoker['observeCard'](card);
      const updatedState = entanglementPoker.getGameState();
      setGameState(updatedState);
    } catch (error) {
      console.error('Failed to observe card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🃏 Entanglement Poker
        </motion.h1>
        <p className="text-center text-lg text-gray-300 mb-6">
          Texas Hold'em with Quantum Mechanics • EPR Pairs • Bell States • Wave Function Collapse
        </p>

        {!gameState && (
          <div className="text-center">
            <motion.button
              onClick={initializeGame}
              disabled={isInitializing}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xl font-bold shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isInitializing ? 'Initializing Quantum State...' : 'Start Quantum Poker'}
            </motion.button>
          </div>
        )}
      </div>

      {gameState && (
        <div className="max-w-7xl mx-auto">
          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <InfoCard label="Phase" value={gameState.phase.toUpperCase()} />
            <InfoCard label="Pot" value={`${gameState.pot} chips`} />
            <InfoCard label="Current Bet" value={`${gameState.currentBet} chips`} />
            <InfoCard
              label="Your Chips"
              value={`${gameState.players[0].chips} chips`}
              highlight={true}
            />
          </div>

          {/* Community Cards */}
          <motion.div
            className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Community Cards</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {gameState.communityCards.map((card, index) => (
                <QuantumCardDisplay
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => observeCard(card)}
                />
              ))}
              {gameState.communityCards.length === 0 && (
                <div className="text-gray-500 text-lg">No community cards yet</div>
              )}
            </div>
          </motion.div>

          {/* Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {gameState.players.map((player, index) => (
              <PlayerDisplay key={player.id} player={player} isHuman={index === 0} />
            ))}
          </div>

          {/* Betting Controls */}
          {!showHandResult && gameState.players[0].chips > 0 && !gameState.players[0].folded && (
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Your Action</h2>

              {/* Action Selection */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {(['fold', 'check', 'call', 'raise', 'all-in'] as BetAction[]).map(action => (
                  <button
                    key={action}
                    onClick={() => setSelectedAction(action)}
                    className={`px-4 py-3 rounded-lg font-bold transition-all ${
                      selectedAction === action
                        ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {action.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Raise Amount */}
              {selectedAction === 'raise' && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Raise Amount</label>
                  <input
                    type="number"
                    value={raiseAmount}
                    onChange={e => setRaiseAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500"
                    min={gameState.currentBet}
                    max={gameState.players[0].chips}
                  />
                </div>
              )}

              {/* Quantum Bet Type */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Quantum Bet Type (Optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {([
                    'eigenvalue-bet',
                    'entanglement-raise',
                    'superposition-call',
                    'measurement-fold',
                  ] as QuantumBetType[]).map(type => (
                    <button
                      key={type}
                      onClick={() =>
                        setQuantumBetType(quantumBetType === type ? undefined : type)
                      }
                      className={`px-3 py-2 rounded text-sm transition-all ${
                        quantumBetType === type
                          ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {type.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <button
                onClick={handleAction}
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xl font-bold shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Submit ${selectedAction.toUpperCase()}`}
              </button>
            </motion.div>
          )}

          {/* Hand Result */}
          <AnimatePresence>
            {showHandResult && winner && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-400 rounded-2xl p-8 max-w-2xl"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <h2 className="text-4xl font-bold text-center mb-4 text-purple-200">
                    {winner.name === 'You' ? '🎉 YOU WIN! 🎉' : `${winner.name} Wins`}
                  </h2>
                  <p className="text-2xl text-center mb-6 text-cyan-300">
                    Pot: {gameState.pot} chips
                  </p>
                  <button
                    onClick={initializeGame}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-xl font-bold"
                  >
                    Play Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quantum Card Display Component
function QuantumCardDisplay({
  card,
  index,
  onClick,
}: {
  card: QuantumCard;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      className={`relative w-24 h-36 rounded-lg border-2 cursor-pointer transition-all ${
        card.isObserved
          ? 'bg-white border-purple-400 text-black'
          : 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-cyan-400'
      }`}
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: card.isObserved ? 0 : 180 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={onClick}
    >
      {card.isObserved ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl mb-2">{card.suit}</div>
          <div className="text-2xl font-bold">{card.rank}</div>
          {card.isEntangled && (
            <div className="absolute top-1 right-1 text-xs bg-cyan-500 text-white px-1 rounded">
              EPR
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-cyan-300">
          <div className="text-2xl mb-2">⚛️</div>
          <div className="text-xs">SUPERPOSITION</div>
          {card.isEntangled && (
            <div className="absolute top-1 right-1 text-xs bg-purple-500 text-white px-1 rounded">
              🔗
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Player Display Component
function PlayerDisplay({ player, isHuman }: { player: PokerPlayer; isHuman: boolean }) {
  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-4 ${
        isHuman ? 'border-cyan-500' : 'border-purple-500/30'
      } ${player.folded ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-purple-300">
          {player.name}
          {player.folded && ' (Folded)'}
        </h3>
        <div className="text-sm text-gray-400">{player.chips} chips</div>
      </div>

      {/* Player Cards */}
      <div className="flex gap-2 mb-2">
        {player.hand.map((card, index) => (
          <div
            key={card.id}
            className={`w-16 h-24 rounded border-2 flex items-center justify-center text-xs ${
              card.isObserved && isHuman
                ? 'bg-white border-purple-400 text-black'
                : 'bg-purple-900/50 border-purple-500 text-purple-300'
            }`}
          >
            {card.isObserved && isHuman ? (
              <div className="text-center">
                <div className="text-2xl">{card.suit}</div>
                <div className="font-bold">{card.rank}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl">🎴</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400">Current Bet: {player.currentBet}</div>
    </motion.div>
  );
}

// Info Card Component
function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-4 ${
        highlight ? 'border-cyan-500' : 'border-purple-500/20'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-cyan-300' : 'text-purple-300'}`}>
        {value}
      </div>
    </motion.div>
  );
}
