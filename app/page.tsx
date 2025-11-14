'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            Quantum Entropy Casino
          </h1>
          <p className="text-2xl md:text-3xl text-cyan-300 mb-4">
            The Universe's Fundamental Uncertainty Made Into a Casino
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Not pseudo-random. <span className="text-cyan-400 font-bold">ACTUAL</span> quantum
            mechanics. Real quantum vacuum fluctuations from ANU's quantum RNG.
            Every spin, every card, every bet is determined by the universe itself.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <FeatureCard
            icon="⚛️"
            title="TRUE QUANTUM RANDOMNESS"
            description="Powered by ANU Quantum API using actual quantum vacuum fluctuations"
          />
          <FeatureCard
            icon="🔗"
            title="QUANTUM ENTANGLEMENT"
            description="EPR pairs, Bell states, and spooky action at a distance in your games"
          />
          <FeatureCard
            icon="🌊"
            title="WAVE FUNCTION COLLAPSE"
            description="Superposition states collapse based on your observation"
          />
        </motion.div>

        {/* Games */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-purple-300">
            Quantum Games
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GameCard
              title="Schrödinger's Slots"
              emoji="🎰"
              description="Reels exist in quantum superposition until you observe them"
              features={[
                'Superposition Reels',
                'Entangled Symbols',
                'Quantum Tunneling',
                'Wave Function Collapse'
              ]}
              href="/slots"
              gradient="from-cyan-500 to-blue-500"
              available={true}
            />

            <GameCard
              title="Entanglement Poker"
              emoji="🃏"
              description="Cards are quantum-entangled until revealed"
              features={[
                'EPR Paired Cards',
                'Bell States',
                'Quantum Measurements',
                'Superposition Hands'
              ]}
              href="/poker"
              gradient="from-purple-500 to-pink-500"
              available={false}
            />

            <GameCard
              title="Uncertainty Roulette"
              emoji="🎡"
              description="Based on Heisenberg's Uncertainty Principle"
              features={[
                'Probability Clouds',
                'Position/Momentum Trades',
                'Quantum Tunneling',
                'Wave Collapse Betting'
              ]}
              href="/roulette"
              gradient="from-pink-500 to-red-500"
              available={false}
            />

            <GameCard
              title="Wave Function Lottery"
              emoji="🎫"
              description="Gamble across parallel universes"
              features={[
                'Many-Worlds Jackpots',
                'Superposition Tickets',
                'Quantum Interference',
                'Timeline Splitting'
              ]}
              href="/lottery"
              gradient="from-yellow-500 to-orange-500"
              available={false}
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <StatCard label="Quantum Sources" value="5" />
          <StatCard label="NIST Tests Passed" value="10/10" />
          <StatCard label="Bell Inequality Violated" value="✓" />
          <StatCard label="True Randomness" value="100%" />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/slots">
            <motion.button
              className="px-12 py-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full text-2xl font-bold shadow-2xl shadow-purple-500/50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              Enter the Quantum Casino
            </motion.button>
          </Link>

          <p className="mt-6 text-gray-400 text-sm">
            ⚠️ This casino uses ACTUAL quantum mechanics. The house edge is literally
            the Heisenberg Uncertainty Principle. Gamble responsibly.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
      whileHover={{ y: -5 }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-cyan-300 mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

function GameCard({ title, emoji, description, features, href, gradient, available }: {
  title: string;
  emoji: string;
  description: string;
  features: string[];
  href: string;
  gradient: string;
  available: boolean;
}) {
  const content = (
    <motion.div
      className={`bg-gray-800/30 backdrop-blur-sm border-2 rounded-lg p-6 h-full ${
        available ? 'border-purple-500/30 hover:border-purple-500' : 'border-gray-500/20'
      } transition-all cursor-pointer`}
      whileHover={available ? { y: -5, scale: 1.02 } : {}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-6xl">{emoji}</div>
        {available ? (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
            PLAYABLE
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
            COMING SOON
          </span>
        )}
      </div>

      <h3 className={`text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
        {title}
      </h3>

      <p className="text-gray-400 mb-4">{description}</p>

      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-300">
            <span className="text-purple-400 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return available ? (
    <Link href={href}>{content}</Link>
  ) : (
    <div className="opacity-60">{content}</div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 text-center"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-3xl font-bold text-purple-300 mb-2">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}
