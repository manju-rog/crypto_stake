'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  waveFunctionLottery,
  type LotteryGameState,
  type LotteryTicket,
  type WinningTicket,
  LOTTERY_NUMBER_RANGE,
  NUMBERS_PER_TICKET,
  BONUS_NUMBER_RANGE,
} from '@/lib/games/wave-function-lottery-engine';

export default function WaveFunctionLotteryGame() {
  const [gameState, setGameState] = useState<LotteryGameState | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);
  const [balance, setBalance] = useState(1000);
  const [ticketType, setTicketType] = useState<'classical' | 'quantum'>('classical');
  const [loading, setLoading] = useState(false);

  // Initialize game
  useEffect(() => {
    const newGame = waveFunctionLottery.initGame();
    setGameState(newGame);
  }, []);

  // Toggle number selection
  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < NUMBERS_PER_TICKET) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Quick pick
  const quickPick = async () => {
    setLoading(true);
    try {
      const { numbers, bonusNumber } = await waveFunctionLottery.quickPick();
      setSelectedNumbers(numbers);
      setSelectedBonus(bonusNumber);
    } catch (error) {
      console.error('Quick pick failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buy ticket
  const buyTicket = async () => {
    if (!gameState || selectedNumbers.length !== NUMBERS_PER_TICKET || !selectedBonus) return;

    const cost = ticketType === 'quantum' ? 50 : 10;
    if (balance < cost) return;

    setLoading(true);
    try {
      if (ticketType === 'quantum') {
        await waveFunctionLottery.buyQuantumTicket(selectedNumbers, cost);
      } else {
        waveFunctionLottery.buyClassicalTicket(selectedNumbers, selectedBonus, cost);
      }

      setBalance(balance - cost);
      const updatedState = waveFunctionLottery.getGameState();
      setGameState(updatedState);
      setSelectedNumbers([]);
      setSelectedBonus(null);
    } catch (error) {
      console.error('Buy ticket failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Draw lottery
  const drawLottery = async () => {
    if (!gameState || gameState.tickets.length === 0 || loading) return;

    setLoading(true);
    try {
      await waveFunctionLottery.draw();

      setTimeout(async () => {
        await waveFunctionLottery.collapseAndCheckWinners();
        const updatedState = waveFunctionLottery.getGameState();
        setGameState(updatedState);

        // Add winnings to balance
        if (updatedState?.winners) {
          const totalWin = updatedState.winners.reduce((sum, w) => sum + w.prize, 0);
          setBalance(balance + totalWin);
        }

        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Draw failed:', error);
      setLoading(false);
    }
  };

  // New game
  const newGame = () => {
    const newGameState = waveFunctionLottery.initGame();
    setGameState(newGameState);
    setSelectedNumbers([]);
    setSelectedBonus(null);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading Quantum Lottery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-black text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎫 Wave Function Lottery
        </motion.h1>
        <p className="text-center text-lg text-gray-300 mb-6">
          Many-Worlds Jackpot • Quantum Interference • Timeline Splitting
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <InfoCard label="Balance" value={`${balance} chips`} highlight={true} />
          <InfoCard label="Jackpot" value={`${gameState.jackpot} chips`} highlight={true} />
          <InfoCard label="Your Tickets" value={`${gameState.tickets.length}`} />
          <InfoCard label="Parallel Universes" value={`${gameState.totalUniverses}`} />
        </div>

        {/* Number Selection */}
        {gameState.phase === 'buying' && (
          <motion.div
            className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-yellow-300">Select Your Numbers</h2>

            {/* Ticket Type */}
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setTicketType('classical')}
                  className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                    ticketType === 'classical'
                      ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-lg">Classical Ticket</div>
                  <div className="text-sm text-gray-300">10 chips • Single universe</div>
                </button>
                <button
                  onClick={() => setTicketType('quantum')}
                  className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                    ticketType === 'quantum'
                      ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-lg">⚛️ Quantum Ticket</div>
                  <div className="text-sm text-gray-300">50 chips • 5 parallel universes</div>
                </button>
              </div>
            </div>

            {/* Main Numbers */}
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">
                Main Numbers ({selectedNumbers.length}/{NUMBERS_PER_TICKET})
              </div>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: LOTTERY_NUMBER_RANGE }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={
                      selectedNumbers.length >= NUMBERS_PER_TICKET &&
                      !selectedNumbers.includes(num)
                    }
                    className={`py-3 rounded-lg font-bold transition-all ${
                      selectedNumbers.includes(num)
                        ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                        : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-30'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Bonus Number */}
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Bonus Number</div>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: BONUS_NUMBER_RANGE }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedBonus(num)}
                    className={`py-3 rounded-lg font-bold transition-all ${
                      selectedBonus === num
                        ? 'bg-orange-500 shadow-lg shadow-orange-500/50'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={quickPick}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold disabled:opacity-50"
              >
                Quick Pick
              </button>
              <button
                onClick={buyTicket}
                disabled={
                  selectedNumbers.length !== NUMBERS_PER_TICKET ||
                  !selectedBonus ||
                  balance < (ticketType === 'quantum' ? 50 : 10) ||
                  loading
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50"
              >
                Buy Ticket ({ticketType === 'quantum' ? 50 : 10} chips)
              </button>
            </div>
          </motion.div>
        )}

        {/* Your Tickets */}
        {gameState.tickets.length > 0 && (
          <motion.div
            className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-orange-300">Your Tickets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.tickets.map(ticket => (
                <TicketDisplay key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Draw Button */}
        {gameState.phase === 'buying' && gameState.tickets.length > 0 && (
          <motion.div className="text-center mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <button
              onClick={drawLottery}
              disabled={loading}
              className="px-12 py-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-lg text-3xl font-bold shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50"
            >
              {loading ? 'Drawing...' : '🎫 DRAW LOTTERY'}
            </button>
          </motion.div>
        )}

        {/* Draw Result */}
        {gameState.drawResult && (
          <motion.div
            className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-green-300 text-center">
              🌟 Winning Numbers 🌟
            </h2>
            <div className="flex justify-center gap-4 mb-4">
              {gameState.drawResult.mainNumbers.map((num, idx) => (
                <motion.div
                  key={idx}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl font-bold text-black"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  {num}
                </motion.div>
              ))}
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: NUMBERS_PER_TICKET * 0.2 }}
              >
                {gameState.drawResult.bonusNumber}
              </motion.div>
            </div>
            <div className="text-center text-sm text-gray-400">
              Quantum Signature: {gameState.drawResult.quantumSignature}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {gameState.phase === 'results' && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-400 rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h2 className="text-4xl font-bold text-center mb-6 text-yellow-200">
                  {gameState.winners.length > 0 ? '🎉 WINNERS! 🎉' : 'No Winners This Round'}
                </h2>

                {gameState.winners.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {gameState.winners.map((winner, idx) => (
                      <WinnerDisplay key={idx} winner={winner} />
                    ))}
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={newGame}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-xl font-bold"
                  >
                    New Game
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Ticket Display Component
function TicketDisplay({ ticket }: { ticket: LotteryTicket }) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        ticket.isQuantum
          ? 'bg-purple-900/30 border-purple-400'
          : 'bg-blue-900/30 border-blue-400'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold">
          {ticket.isQuantum ? '⚛️ Quantum Ticket' : 'Classical Ticket'}
        </span>
        <span className="text-xs text-gray-400">{ticket.cost} chips</span>
      </div>
      <div className="flex gap-2 mb-2">
        {ticket.numbers.map((num, idx) => (
          <div
            key={idx}
            className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black"
          >
            {num}
          </div>
        ))}
        {!ticket.isQuantum && (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold border border-white">
            {ticket.bonusNumber}
          </div>
        )}
      </div>
      {ticket.isQuantum && (
        <div className="text-xs text-purple-300">{ticket.universes.length} parallel universes</div>
      )}
    </div>
  );
}

// Winner Display Component
function WinnerDisplay({ winner }: { winner: WinningTicket }) {
  return (
    <div className="p-4 bg-green-900/50 rounded-lg border border-green-400">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-green-300">
          {winner.ticket.isQuantum ? '⚛️ Quantum Win' : 'Classical Win'}
        </span>
        <span className="text-2xl font-bold text-yellow-300">{winner.prize} chips</span>
      </div>
      <div className="text-sm mb-2">
        Matched {winner.matchedNumbers.length} numbers
        {winner.matchedBonus && ' + BONUS'}
      </div>
      {winner.universe && (
        <div className="text-xs text-cyan-300">Universe: {winner.universe}</div>
      )}
    </div>
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
        highlight ? 'border-yellow-500' : 'border-orange-500/20'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-yellow-300' : 'text-orange-300'}`}>
        {value}
      </div>
    </motion.div>
  );
}
