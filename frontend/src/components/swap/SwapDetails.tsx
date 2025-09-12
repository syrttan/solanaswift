'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, InfoIcon } from 'lucide-react'
import { TokenInfo } from '@/stores/poolStore'

interface SwapDetailsProps {
  priceImpact: number
  minimumReceived: string
  fee: number
  route: string[]
  tokenOut: TokenInfo
}

export const SwapDetails: FC<SwapDetailsProps> = ({
  priceImpact,
  minimumReceived,
  fee,
  route,
  tokenOut,
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-400'
    if (impact < 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPriceImpactBg = (impact: number) => {
    if (impact < 1) return 'bg-green-500/10 border-green-500/20'
    if (impact < 3) return 'bg-yellow-500/10 border-yellow-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }

  return (
    <div className="mt-4">
      {/* Summary Row */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-3 px-2 text-sm text-gray-400 hover:text-gray-300 transition-colors group"
      >
        <div className="flex items-center space-x-2">
          <span>
            1 {route[0]} = {(50).toFixed(4)} {route[1]} {/* Mock exchange rate */}
          </span>
          {priceImpact > 0 && (
            <span className={`text-xs ${getPriceImpactColor(priceImpact)}`}>
              ({priceImpact.toFixed(2)}% impact)
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${
            showDetails ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 py-3 px-2 text-sm">
              {/* Expected Output */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Expected Output</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-white font-medium">
                  {minimumReceived} {tokenOut.symbol}
                </span>
              </div>

              {/* Price Impact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Price Impact</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                </div>
                <span className={getPriceImpactColor(priceImpact)}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>

              {/* Minimum Received */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Minimum Received</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-white">
                  {minimumReceived} {tokenOut.symbol}
                </span>
              </div>

              {/* Network Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Network Fee</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-white">~0.00025 SOL</span>
              </div>

              {/* Adaptive Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Adaptive Fee</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded">
                    DYNAMIC
                  </span>
                </div>
                <span className="text-purple-400 font-medium">
                  {fee.toFixed(2)}%
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Route</span>
                  <InfoIcon className="w-3 h-3 text-gray-500" />
                </div>
                <div className="flex items-center space-x-1">
                  {route.map((token, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-white text-xs">{token}</span>
                      {index < route.length - 1 && (
                        <span className="text-gray-500 mx-1">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* High Price Impact Warning */}
              {priceImpact > 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-lg border ${getPriceImpactBg(priceImpact)}`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      ⚠️
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        High Price Impact
                      </p>
                      <p className="text-xs text-red-300 mt-1">
                        This swap will have a significant impact on the token price. 
                        Consider reducing your trade size.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Adaptive Fee Explanation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    🎯
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-400">
                      Adaptive Fee Active
                    </p>
                    <p className="text-xs text-purple-300 mt-1">
                      Fee adjusts to market volatility for optimal trading conditions. 
                      Lower volatility = lower fees.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}