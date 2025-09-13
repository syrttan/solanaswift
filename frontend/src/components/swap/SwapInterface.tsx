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
import { calculateSwapOutput, calculatePriceImpact, parseTokenAmount, formatTokenAmount, fetchPoolData, fetchTokenBalance, getPoolAddress } from '@/lib/anchor'

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
  const [poolData, setPoolData] = useState<any>(null)
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>({})
  const [fetchingData, setFetchingData] = useState(false)

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

  // Fetch pool data and balances
  useEffect(() => {
    if (tokenIn && tokenOut && program && connection) {
      fetchPoolAndBalanceData()
    }
  }, [tokenIn, tokenOut, program, connection, publicKey])

  const fetchPoolAndBalanceData = async () => {
    if (!tokenIn || !tokenOut || !program || !connection) return
    
    setFetchingData(true)
    try {
      // Fetch pool data
      const pool = await fetchPoolData(program, tokenIn.mint, tokenOut.mint)
      setPoolData(pool)
      
      if (pool) {
        setCurrentFee(pool.baseFeeBps + pool.volatilityFeeBps)
      }
      
      // Fetch token balances if user is connected
      if (publicKey) {
        const balances: { [key: string]: string } = {}
        
        const balanceA = await fetchTokenBalance(connection, tokenIn.mint, publicKey)
        const balanceB = await fetchTokenBalance(connection, tokenOut.mint, publicKey)
        
        balances[tokenIn.mint.toString()] = formatTokenAmount(balanceA, tokenIn.decimals)
        balances[tokenOut.mint.toString()] = formatTokenAmount(balanceB, tokenOut.decimals)
        
        setTokenBalances(balances)
      }
    } catch (error) {
      console.error('Error fetching pool data:', error)
    } finally {
      setFetchingData(false)
    }
  }

  const calculateAmountOut = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn) return

    try {
      let reserveIn: BN, reserveOut: BN
      
      if (poolData && poolData.isInitialized) {
        // Use real pool data
        const isAToB = tokenIn.mint.equals ? tokenIn.mint.equals(poolData.tokenAMint) : 
                       tokenIn.mint.toString() === poolData.tokenAMint.toString()
        
        if (isAToB) {
          reserveIn = poolData.reserveA
          reserveOut = poolData.reserveB
        } else {
          reserveIn = poolData.reserveB
          reserveOut = poolData.reserveA
        }
      } else {
        // Fallback to mock data if pool doesn't exist
        reserveIn = new BN('1000000000000') // 1000 tokens
        reserveOut = new BN('50000000000') // 50 tokens
      }
      
      const amountInBN = parseTokenAmount(amountIn, tokenIn.decimals)
      
      // Calculate output with current fee
      const output = calculateSwapOutput(amountInBN, reserveIn, reserveOut, currentFee)
      const outputFormatted = formatTokenAmount(output, tokenOut.decimals)
      
      setAmountOut(outputFormatted)
      
      // Calculate price impact
      const impact = calculatePriceImpact(amountInBN, reserveIn, reserveOut)
      setPriceImpact(impact)
      
      // Calculate minimum received with slippage
      const minOutput = output.mul(new BN(Math.floor((100 - slippage) * 100))).div(new BN(10000))
      setMinimumReceived(formatTokenAmount(minOutput, tokenOut.decimals))
      
    } catch (error) {
      console.error('Error calculating swap:', error)
      setAmountOut('0')
      setPriceImpact(0)
    }
  }, [tokenIn, tokenOut, amountIn, poolData, currentFee, slippage])

  const handleSwapTokens = () => {
    const tempToken = tokenIn
    const tempAmount = amountOut
    
    setTokenIn(tokenOut)
    setTokenOut(tempToken)
    setAmountIn(tempAmount)
    setAmountOut('')
  }

  const handleMaxClick = () => {
    if (tokenIn && tokenBalances[tokenIn.mint.toString()]) {
      setAmountIn(tokenBalances[tokenIn.mint.toString()])
    }
  }

  const executeSwap = async () => {
    if (!publicKey || !program || !tokenIn || !tokenOut || !connection) {
      toast.error('Please connect your wallet')
      return
    }

    if (!amountIn || parseFloat(amountIn) <= 0) {
      toast.error('Please enter an amount')
      return
    }

    if (!poolData || !poolData.isInitialized) {
      toast.error('Pool not found or not initialized')
      return
    }

    setLoading(true)
    
    try {
      toast.loading('Preparing swap transaction...', { id: 'swap' })
      
      const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token')
      const { SystemProgram } = await import('@solana/web3.js')
      
      // Calculate amounts
      const amountInBN = parseTokenAmount(amountIn, tokenIn.decimals)
      const minimumAmountOutBN = parseTokenAmount(minimumReceived, tokenOut.decimals)
      
      // Get token accounts
      const userTokenIn = await getAssociatedTokenAddress(tokenIn.mint, publicKey)
      const userTokenOut = await getAssociatedTokenAddress(tokenOut.mint, publicKey)
      
      // Determine which vault is which based on token order
      const isAToB = tokenIn.mint.toString() === poolData.tokenAMint.toString()
      const poolTokenIn = isAToB ? poolData.tokenAVault : poolData.tokenBVault
      const poolTokenOut = isAToB ? poolData.tokenBVault : poolData.tokenAVault
      
      // Execute swap
      const txId = await program.methods
        .swap(amountInBN, minimumAmountOutBN)
        .accounts({
          pool: poolData.address,
          user: publicKey,
          userTokenIn,
          userTokenOut,
          poolTokenIn,
          poolTokenOut,
          tokenInMint: tokenIn.mint,
          tokenOutMint: tokenOut.mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      
      toast.success(
        `Successfully swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol}`,
        { 
          id: 'swap',
          duration: 5000
        }
      )
      
      console.log('Swap transaction ID:', txId)
      
      // Reset form and refresh data
      setAmountIn('')
      setAmountOut('')
      await fetchPoolAndBalanceData()
      
    } catch (error: any) {
      console.error('Swap error:', error)
      
      let errorMessage = 'Swap failed'
      if (error.message?.includes('SlippageExceeded')) {
        errorMessage = 'Slippage exceeded. Try increasing slippage tolerance.'
      } else if (error.message?.includes('InsufficientLiquidity')) {
        errorMessage = 'Insufficient liquidity in the pool'
      } else if (error.message?.includes('InsufficientAmount')) {
        errorMessage = 'Insufficient token balance'
      }
      
      toast.error(errorMessage, { id: 'swap' })
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
              balance={tokenIn ? tokenBalances[tokenIn.mint.toString()] || '0.00' : '0.00'}
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
              balance={tokenOut ? tokenBalances[tokenOut.mint.toString()] || '0.00' : '0.00'}
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