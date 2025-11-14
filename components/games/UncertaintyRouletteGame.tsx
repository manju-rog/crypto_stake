'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  uncertaintyRoulette,
  UncertaintyRouletteEngine,
  type RouletteGameState,
  type BetType,
  type QuantumBetType,
  NUMBER_COLORS,
  ROULETTE_NUMBERS,
} from '@/lib/games/uncertainty-roulette-engine';

export default function UncertaintyRouletteGame() {
  const [gameState, setGameState] = useState<RouletteGameState | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBetType, setSelectedBetType] = useState<BetType | QuantumBetType>('straight');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [balance, setBalance] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [probabilities, setProbabilities] = useState<Array<{ number: number; probability: number }>>([]);

  // Initialize game
  const initializeGame = () => {
    const newGame = uncertaintyRoulette.initGame();
    setGameState(newGame);
    setProbabilities(uncertaintyRoulette.getProbabilityDistribution());
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Place bet
  const placeBet = () => {
    if (!gameState || selectedNumbers.length === 0 || balance < betAmount) return;

    uncertaintyRoulette.placeBet({
      type: selectedBetType,
      numbers: selectedNumbers,
      amount: betAmount,
    });

    setBalance(balance - betAmount);
    const updatedState = uncertaintyRoulette.getGameState();
    setGameState(updatedState);
    setSelectedNumbers([]);
  };

  // Spin wheel
  const spin = async () => {
    if (!gameState || gameState.bets.length === 0 || loading) return;

    setLoading(true);
    try {
      await uncertaintyRoulette.spin();

      // Update probabilities during spin
      const interval = setInterval(() => {
        setProbabilities(uncertaintyRoulette.getProbabilityDistribution());
      }, 100);

      setTimeout(async () => {
        clearInterval(interval);
        const result = await uncertaintyRoulette.collapse();
        const updatedState = uncertaintyRoulette.getGameState();
        setGameState(updatedState);
        setProbabilities(uncertaintyRoulette.getProbabilityDistribution());

        // Update balance with winnings
        if (updatedState?.winAmount) {
          setBalance(balance + updatedState.winAmount);
        }

        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Spin failed:', error);
      setLoading(false);
    }
  };

  // Select number for betting
  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedBetType === 'straight') {
        setSelectedNumbers([num]);
      } else {
        setSelectedNumbers([...selectedNumbers, num]);
      }
    }
  };

  // Quick bet selection
  const quickBet = (type: BetType | QuantumBetType) => {
    setSelectedBetType(type);
    const numbers = UncertaintyRouletteEngine.getNumbersForBetType(type as BetType);
    setSelectedNumbers(numbers);
  };

  // New game
  const newGame = () => {
    initializeGame();
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading Quantum Roulette...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎡 Uncertainty Roulette
        </motion.h1>
        <p className="text-center text-lg text-gray-300 mb-6">
          Heisenberg's Casino • Quantum Tunneling • Wave Function Collapse
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <InfoCard label="Balance" value={`${balance} chips`} highlight={true} />
          <InfoCard label="Total Bet" value={`${gameState.totalBet} chips`} />
          <InfoCard label="Phase" value={gameState.phase.toUpperCase()} />
          <InfoCard
            label="Result"
            value={gameState.result !== null ? `${gameState.result}` : 'Spinning...'}
          />
        </div>

        {/* Roulette Wheel Visualization */}
        <motion.div
          className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-red-300">Quantum Wheel</h2>
          <div className="relative">
            {/* Probability Distribution */}
            <div className="grid grid-cols-19 gap-1 mb-4">
              {probabilities.slice(0, 19).map((state, idx) => (
                <ProbabilityBar
                  key={state.number}
                  number={state.number}
                  probability={state.probability}
                  isResult={gameState.result === state.number}
                />
              ))}
            </div>
            <div className="grid grid-cols-18 gap-1">
              {probabilities.slice(19).map((state, idx) => (
                <ProbabilityBar
                  key={state.number}
                  number={state.number}
                  probability={state.probability}
                  isResult={gameState.result === state.number}
                />
              ))}
            </div>

            {/* Quantum State Info */}
            <div className="mt-4 text-sm text-gray-400">
              {!gameState.ball.isObserved && (
                <div>⚛️ Ball in superposition across all numbers</div>
              )}
              {gameState.ball.tunneledFromNumber !== null && (
                <div className="text-cyan-400">
                  🌀 Quantum tunneling detected from number {gameState.ball.tunneledFromNumber}!
                </div>
              )}
              {gameState.ball.isObserved && (
                <div className="text-green-400">
                  ✓ Wave function collapsed to: {gameState.ball.position}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Betting Grid */}
        <motion.div
          className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Place Your Bets</h2>

          {/* Number Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-13 gap-2">
              {/* Zero */}
              <button
                onClick={() => toggleNumber(0)}
                className={`col-span-1 row-span-3 py-4 rounded-lg font-bold text-lg transition-all ${
                  selectedNumbers.includes(0)
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-green-700 hover:bg-green-600'
                }`}
              >
                0
              </button>

              {/* Numbers 1-36 */}
              {[...Array(12)].map((_, rowIdx) => (
                <>
                  {[...Array(3)].map((_, colIdx) => {
                    const num = rowIdx * 3 + colIdx + 1;
                    const color = NUMBER_COLORS[num];
                    const bgColor =
                      color === 'red'
                        ? selectedNumbers.includes(num)
                          ? 'bg-red-500 shadow-lg shadow-red-500/50'
                          : 'bg-red-700 hover:bg-red-600'
                        : selectedNumbers.includes(num)
                        ? 'bg-gray-900 shadow-lg shadow-gray-500/50'
                        : 'bg-gray-700 hover:bg-gray-600';

                    return (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        className={`py-2 rounded font-bold transition-all ${bgColor}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
            <QuickBetButton label="Red" onClick={() => quickBet('red')} color="red" />
            <QuickBetButton label="Black" onClick={() => quickBet('black')} color="gray" />
            <QuickBetButton label="Even" onClick={() => quickBet('even')} color="blue" />
            <QuickBetButton label="Odd" onClick={() => quickBet('odd')} color="purple" />
            <QuickBetButton label="Low (1-18)" onClick={() => quickBet('low')} color="cyan" />
            <QuickBetButton label="High (19-36)" onClick={() => quickBet('high')} color="orange" />
          </div>

          {/* Bet Amount */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Bet Amount (chips)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-yellow-500"
              min={1}
              max={balance}
            />
          </div>

          {/* Selected Numbers */}
          {selectedNumbers.length > 0 && (
            <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Selected Numbers:</div>
              <div className="flex flex-wrap gap-2">
                {selectedNumbers.map(num => (
                  <span key={num} className="px-2 py-1 bg-yellow-500 rounded text-sm font-bold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Place Bet Button */}
          <button
            onClick={placeBet}
            disabled={selectedNumbers.length === 0 || balance < betAmount || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 mb-4"
          >
            Place Bet ({betAmount} chips)
          </button>

          {/* Current Bets */}
          {gameState.bets.length > 0 && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Current Bets:</div>
              {gameState.bets.map(bet => (
                <div key={bet.id} className="text-sm mb-1">
                  {bet.type}: {bet.numbers.join(', ')} - {bet.amount} chips
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Spin Button */}
        {gameState.phase === 'betting' && gameState.bets.length > 0 && (
          <motion.div className="text-center mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <button
              onClick={spin}
              disabled={loading}
              className="px-12 py-6 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg text-3xl font-bold shadow-lg hover:shadow-red-500/50 disabled:opacity-50"
            >
              {loading ? 'Spinning...' : '🎡 SPIN THE WHEEL'}
            </button>
          </motion.div>
        )}

        {/* Result Display */}
        <AnimatePresence>
          {gameState.phase === 'result' && gameState.result !== null && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-400 rounded-2xl p-8 max-w-2xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h2 className="text-5xl font-bold text-center mb-4 text-red-200">
                  {gameState.result}
                </h2>
                <p className="text-2xl text-center mb-2 text-yellow-300">
                  {NUMBER_COLORS[gameState.result].toUpperCase()}
                </p>
                {gameState.winAmount > 0 && (
                  <p className="text-3xl text-center mb-6 text-green-400">
                    YOU WIN {gameState.winAmount} CHIPS! 🎉
                  </p>
                )}
                {gameState.winAmount === 0 && (
                  <p className="text-2xl text-center mb-6 text-gray-400">Better luck next time!</p>
                )}
                <button
                  onClick={newGame}
                  className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-xl font-bold"
                >
                  New Game
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Probability Bar Component
function ProbabilityBar({
  number,
  probability,
  isResult,
}: {
  number: number;
  probability: number;
  isResult: boolean;
}) {
  const height = Math.max(probability * 500, 20);
  const color = NUMBER_COLORS[number];
  const bgColor =
    color === 'red' ? 'bg-red-500' : color === 'black' ? 'bg-gray-800' : 'bg-green-500';

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`w-full ${bgColor} rounded-t ${isResult ? 'ring-2 ring-yellow-400' : ''}`}
        style={{ height: `${height}px` }}
        animate={{ height: `${height}px` }}
        transition={{ duration: 0.3 }}
      />
      <div className="text-xs mt-1">{number}</div>
    </div>
  );
}

// Quick Bet Button Component
function QuickBetButton({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: string;
}) {
  const bgClass = `bg-${color}-600 hover:bg-${color}-500`;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 ${bgClass} rounded font-bold text-sm transition-all`}
    >
      {label}
    </button>
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
        highlight ? 'border-yellow-500' : 'border-red-500/20'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-yellow-300' : 'text-red-300'}`}>
        {value}
      </div>
    </motion.div>
  );
}
