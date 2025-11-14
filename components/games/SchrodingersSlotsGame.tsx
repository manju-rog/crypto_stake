'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  schrodingersSlots,
  SchrodingersSlots,
  BetType,
  SlotSymbol,
  type SpinResult,
  type BetConfig
} from '@/lib/games/schrodingers-slots-engine';
import QuantumSlotVisualization from './QuantumSlotVisualization';

export default function SchrodingersSlotsGame() {
  const [betAmount, setBetAmount] = useState(0.01);
  const [betType, setBetType] = useState<BetType>(BetType.NORMAL);
  const [quantumBoost, setQuantumBoost] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpin, setCurrentSpin] = useState<SpinResult | null>(null);
  const [balance, setBalance] = useState(10); // Demo balance
  const [totalWon, setTotalWon] = useState(0);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalSpins: 0,
    totalWagered: 0,
    biggestWin: 0,
    quantumFeatureCount: 0
  });

  /**
   * Handle spin
   */
  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) return;

    setIsSpinning(true);
    setBalance(prev => prev - betAmount);

    const config: BetConfig = {
      amount: betAmount,
      betType,
      linesActive: 5,
      quantumBoost
    };

    try {
      const result = await schrodingersSlots.spin(config);

      // Simulate spin animation delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      setCurrentSpin(result);
      setSpinHistory(prev => [result, ...prev.slice(0, 9)]);

      // Update balance
      if (result.payout > 0) {
        setBalance(prev => prev + result.payout);
        setTotalWon(prev => prev + result.payout);
      }

      // Update stats
      setStats(prev => ({
        totalSpins: prev.totalSpins + 1,
        totalWagered: prev.totalWagered + betAmount,
        biggestWin: Math.max(prev.biggestWin, result.payout),
        quantumFeatureCount: prev.quantumFeatureCount + (
          result.quantumFeatures.entanglement ||
          result.quantumFeatures.superposition ||
          result.quantumFeatures.tunneling ? 1 : 0
        )
      }));

      // Handle special features
      handleSpecialFeatures(result);

    } catch (error) {
      console.error('Spin error:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  /**
   * Handle special features
   */
  const handleSpecialFeatures = (result: SpinResult) => {
    result.specialFeatures.forEach(feature => {
      if (feature.startsWith('FREE_SPINS_')) {
        const count = parseInt(feature.split('_')[2]);
        // TODO: Trigger free spins
        console.log(`Won ${count} free spins!`);
      } else if (feature === 'PROGRESSIVE_JACKPOT') {
        // TODO: Award jackpot
        console.log('JACKPOT!!!');
      } else if (feature === 'SCHRODINGERS_CAT_BONUS') {
        // TODO: Trigger cat bonus
        console.log("Schrödinger's Cat bonus!");
      } else if (feature === 'TIMELINE_SPLIT') {
        // TODO: Show alternate timelines
        console.log('Timeline split!');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Schrödinger's Slots
          </motion.h1>
          <p className="text-xl text-cyan-300">
            Where reels exist in quantum superposition until observed
          </p>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Balance */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Balance</h3>
              <div className="text-4xl font-bold text-white">
                {balance.toFixed(4)} ETH
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Total Won: {totalWon.toFixed(4)} ETH
              </div>
            </motion.div>

            {/* Bet Controls */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Bet Settings</h3>

              {/* Bet Amount */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Bet Amount (ETH)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  step="0.01"
                  min="0.01"
                  max={balance}
                  disabled={isSpinning}
                  className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white"
                />
                <div className="flex gap-2 mt-2">
                  {[0.01, 0.05, 0.1, 0.5].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={isSpinning}
                      className="flex-1 bg-purple-600/30 hover:bg-purple-600/50 px-2 py-1 rounded text-sm transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Type */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Bet Type</label>
                <select
                  value={betType}
                  onChange={(e) => setBetType(parseInt(e.target.value) as BetType)}
                  disabled={isSpinning}
                  className="w-full bg-gray-700 border border-purple-500/30 rounded px-4 py-2 text-white"
                >
                  <option value={BetType.NORMAL}>Normal Bet</option>
                  <option value={BetType.SUPERPOSITION}>Superposition Bet (2x)</option>
                  <option value={BetType.ENTANGLEMENT}>Entanglement Bet</option>
                  <option value={BetType.META}>Meta Bet (Quantum Effects)</option>
                </select>
              </div>

              {/* Quantum Boost */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quantumBoost}
                    onChange={(e) => setQuantumBoost(e.target.checked)}
                    disabled={isSpinning}
                    className="mr-2 w-5 h-5"
                  />
                  <span className="text-sm">
                    Quantum Boost (+50% cost, better odds)
                  </span>
                </label>
              </div>

              {/* Spin Button */}
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || balance < betAmount}
                className={`w-full py-4 rounded-lg font-bold text-xl transition-all ${
                  isSpinning || balance < betAmount
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/50'
                }`}
                whileHover={!isSpinning ? { scale: 1.05 } : {}}
                whileTap={!isSpinning ? { scale: 0.95 } : {}}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Collapsing Wave Function...
                  </span>
                ) : (
                  'SPIN'
                )}
              </motion.button>

              {/* Current Bet Cost */}
              <div className="mt-2 text-sm text-center text-gray-400">
                Cost: {(betAmount * (quantumBoost ? 1.5 : 1)).toFixed(4)} ETH
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-pink-400">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Spins:</span>
                  <span className="font-bold">{stats.totalSpins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Wagered:</span>
                  <span className="font-bold">{stats.totalWagered.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Biggest Win:</span>
                  <span className="font-bold text-green-400">{stats.biggestWin.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Features:</span>
                  <span className="font-bold text-cyan-400">{stats.quantumFeatureCount}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Panel - Visualization */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <QuantumSlotVisualization
                reels={currentSpin?.reels || []}
                isSpinning={isSpinning}
                onSpinComplete={() => {}}
              />

              {/* Result Display */}
              <AnimatePresence>
                {currentSpin && !isSpinning && (
                  <motion.div
                    className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                  >
                    {/* Symbols */}
                    <div className="flex justify-center gap-4 mb-4">
                      {currentSpin.finalSymbols.map((symbol, index) => {
                        const info = SchrodingersSlots.getSymbolInfo(symbol);
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg border-2"
                            style={{ borderColor: info.color }}
                          >
                            <div className="text-5xl mb-2">{info.emoji}</div>
                            <div className="text-xs text-gray-400">{info.name}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Payout */}
                    {currentSpin.payout > 0 ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          WIN: {currentSpin.payout.toFixed(4)} ETH
                        </div>
                        <div className="text-sm text-gray-400">
                          Multiplier: {currentSpin.multiplier.toFixed(2)}x
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-2xl text-gray-500">
                        Wave Function Collapsed - No Win
                      </div>
                    )}

                    {/* Quantum Features */}
                    {(currentSpin.quantumFeatures.entanglement ||
                      currentSpin.quantumFeatures.superposition ||
                      currentSpin.quantumFeatures.tunneling) && (
                      <div className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <div className="text-sm font-semibold text-purple-300 mb-2">
                          Quantum Effects Detected:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentSpin.quantumFeatures.superposition && (
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                              ⚛️ Superposition
                            </span>
                          )}
                          {currentSpin.quantumFeatures.entanglement && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                              🔗 Entanglement
                            </span>
                          )}
                          {currentSpin.quantumFeatures.tunneling && (
                            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">
                              🌀 Tunneling
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Features */}
                    {currentSpin.specialFeatures.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                        <div className="text-sm font-semibold text-yellow-300 mb-2">
                          Special Features Triggered:
                        </div>
                        <div className="space-y-1">
                          {currentSpin.specialFeatures.map((feature, index) => (
                            <div key={index} className="text-sm text-yellow-200">
                              ✨ {feature.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History */}
              {spinHistory.length > 0 && (
                <motion.div
                  className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-500/30 rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-semibold mb-3 text-gray-300">Recent Spins</h3>
                  <div className="space-y-2">
                    {spinHistory.slice(0, 5).map((spin, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs p-2 bg-gray-700/30 rounded"
                      >
                        <div className="flex gap-1">
                          {spin.finalSymbols.map((symbol, i) => (
                            <span key={i}>{SchrodingersSlots.getSymbolInfo(symbol).emoji}</span>
                          ))}
                        </div>
                        <div className={spin.payout > 0 ? 'text-green-400 font-bold' : 'text-gray-500'}>
                          {spin.payout > 0 ? `+${spin.payout.toFixed(4)}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quantum Explanation */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4 text-cyan-300">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-purple-300 mb-2">⚛️ Superposition</div>
              <p className="text-gray-400">
                Reels exist in multiple states simultaneously until you observe them (spin).
                Higher amplitude = more possibilities!
              </p>
            </div>
            <div>
              <div className="font-semibold text-purple-300 mb-2">🔗 Entanglement</div>
              <p className="text-gray-400">
                Reels become quantum-correlated. When one collapses, entangled reels are affected.
                Creates higher win probabilities!
              </p>
            </div>
            <div>
              <div className="font-semibold text-purple-300 mb-2">🌀 Tunneling</div>
              <p className="text-gray-400">
                Symbols can quantum-tunnel through barriers to become the highest-paying QUANTUM symbol!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
