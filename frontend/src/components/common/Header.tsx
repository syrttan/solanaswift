'use client'

import { FC } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'

export const Header: FC = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SolanaSwift
              </h1>
              <p className="text-xs text-gray-400 -mt-1">Adaptive AMM</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#swap"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Swap
            </a>
            <a
              href="#pools"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Pools
            </a>
            <a
              href="#analytics"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Analytics
            </a>
            <a
              href="https://github.com/solanaswift"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              GitHub
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Devnet</span>
            </div>
            
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !border-none !rounded-xl !text-sm !font-medium !transition-all !duration-200 !px-4 !py-2" />
          </div>
        </div>
      </div>
    </motion.header>
  )
}