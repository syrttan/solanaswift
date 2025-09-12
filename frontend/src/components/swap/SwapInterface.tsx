'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ArrowDownIcon, SettingsIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { BN } from '@coral-xyz/anchor'

import { TokenInput } from './TokenInput'
import { SwapSettings } from './SwapSettings'
import { SwapDetails } from './SwapDetails'
import { useProgram } from '@/hooks/useProgram'
import { usePoolStore, TokenInfo } from '@/stores/poolStore'
import { calculateSwapOutput, calculatePriceImpact, parseTokenAmount, formatTokenAmount } from '@/lib/anchor'

export const SwapInterface: FC = () => {
  const { publicKey } = useWallet()
  const { program, connection } = useProgram()
  const { tokenList, pools, selectedPool } = usePoolStore()
  
  // Swap state
  const [tokenIn, setTokenIn] = useState<TokenInfo | null>(tokenList[0] || null)
  const [tokenOut, setTokenOut] = useState<TokenInfo | null>(tokenList[1] || null)
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  
  // Price impact and route info
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [minimumReceived, setMinimumReceived] = useState<string>('0')
  const [currentFee, setCurrentFee] = useState<number>(30) // 0.3% default

  // Calculate output amount when inputs change
  useEffect(() => {
    if (tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0) {
      calculateAmountOut()
    } else {
      setAmountOut('')
      setPriceImpact(0)
      setMinimumReceived('0')
    }
  }, [tokenIn, tokenOut, amountIn, selectedPool])

  const calculateAmountOut = async () => {
    if (!tokenIn || !tokenOut || !amountIn) return

    try {
      // Find pool for this pair
      const mockReserveA = new BN('1000000000000') // 1000 tokens
      const mockReserveB = new BN('50000000000') // 50000 tokens (assuming 1:50 ratio)
      
      const amountInBN = parseTokenAmount(amountIn, tokenIn.decimals)
      
      // Calculate output with current fee
      const output = calculateSwapOutput(amountInBN, mockReserveA, mockReserveB, currentFee)
      const outputFormatted = formatTokenAmount(output, tokenOut.decimals)
      
      setAmountOut(outputFormatted)
      
      // Calculate price impact
      const impact = calculatePriceImpact(amountInBN, mockReserveA, mockReserveB)
      setPriceImpact(impact)
      
      // Calculate minimum received with slippage
      const minOutput = output.mul(new BN(Math.floor((100 - slippage) * 100))).div(new BN(10000))
      setMinimumReceived(formatTokenAmount(minOutput, tokenOut.decimals))
      
    } catch (error) {
      console.error('Error calculating swap:', error)
      setAmountOut('0')
      setPriceImpact(0)
    }
  }

  const handleSwapTokens = () => {
    const tempToken = tokenIn
    const tempAmount = amountOut
    
    setTokenIn(tokenOut)
    setTokenOut(tempToken)
    setAmountIn(tempAmount)
    setAmountOut('')
  }

  const handleMaxClick = () => {
    // TODO: Implement actual balance fetching
    setAmountIn('100') // Mock max balance
  }

  const executeSwap = async () => {
    if (!publicKey || !program || !tokenIn || !tokenOut) {
      toast.error('Please connect your wallet')
      return
    }

    if (!amountIn || parseFloat(amountIn) <= 0) {
      toast.error('Please enter an amount')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Implement actual swap execution
      // This is a mock implementation for demo purposes
      
      toast.loading('Preparing swap transaction...', { id: 'swap' })
      
      // Simulate transaction time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success
      toast.success(
        `Successfully swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol}`,
        { 
          id: 'swap',
          duration: 5000
        }
      )
      
      // Reset form
      setAmountIn('')
      setAmountOut('')
      
    } catch (error: any) {
      console.error('Swap error:', error)
      toast.error(error.message || 'Swap failed', { id: 'swap' })
    } finally {
      setLoading(false)
    }
  }

  const isSwapDisabled = !publicKey || !tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0 || loading

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => calculateAmountOut()}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
              title="Refresh prices"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700/50"
          >
            <SwapSettings
              slippage={slippage}
              deadline={deadline}
              onSlippageChange={setSlippage}
              onDeadlineChange={setDeadline}
              onClose={() => setShowSettings(false)}
            />
          </motion.div>
        )}

        <div className="p-4 space-y-2">
          {/* From Token */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">From</label>
              <button
                onClick={handleMaxClick}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                MAX
              </button>
            </div>
            <TokenInput
              token={tokenIn}
              amount={amountIn}
              onTokenSelect={setTokenIn}
              onAmountChange={setAmountIn}
              tokenList={tokenList}
              balance="100.00" // Mock balance
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center py-2">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors group"
            >
              <ArrowDownIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">To</label>
            <TokenInput
              token={tokenOut}
              amount={amountOut}
              onTokenSelect={setTokenOut}
              onAmountChange={() => {}} // Read only
              tokenList={tokenList}
              readOnly
              balance="0.00" // Mock balance
            />
          </div>

          {/* Swap Details */}
          {amountIn && amountOut && tokenIn && tokenOut && (
            <SwapDetails
              priceImpact={priceImpact}
              minimumReceived={minimumReceived}
              fee={currentFee / 100} // Convert bps to percentage
              route={[tokenIn.symbol, tokenOut.symbol]}
              tokenOut={tokenOut}
            />
          )}

          {/* Swap Button */}
          <div className="pt-4">
            {!publicKey ? (
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !border-none !rounded-xl !text-base !font-medium !transition-all !duration-200 !py-4" />
            ) : (
              <button
                onClick={executeSwap}
                disabled={isSwapDisabled}
                className={`
                  w-full py-4 rounded-xl font-medium text-base transition-all duration-200
                  ${isSwapDisabled
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Swapping...</span>
                  </div>
                ) : (
                  'Swap'
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 text-center"
      >
        <p className="text-xs text-gray-500">
          Trade executed through SolanaSwift AMM with adaptive fees
        </p>
      </motion.div>
    </div>
  )
}