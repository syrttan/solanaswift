import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { SolanaSwift, IDL } from './types'

// Program ID - will be updated after deployment
export const PROGRAM_ID = new PublicKey('SwiftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

export interface PoolData {
  address: PublicKey
  authority: PublicKey
  tokenAMint: PublicKey
  tokenBMint: PublicKey
  tokenAVault: PublicKey
  tokenBVault: PublicKey
  lpMint: PublicKey
  reserveA: BN
  reserveB: BN
  baseFeeBps: number
  volatilityFeeBps: number
  lastPrice: BN
  lastUpdateSlot: BN
  priceHistory: BN[]
  historyIndex: number
  totalVolumeUsd: BN
  totalFeesCollected: BN
  createdAt: BN
  isInitialized: boolean
  bump: number
}

export interface SwapParams {
  amountIn: BN
  minimumAmountOut: BN
  tokenInMint: PublicKey
  tokenOutMint: PublicKey
}

// Connection setup
export const getConnection = () => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl('devnet')
  return new Connection(endpoint, 'confirmed')
}

// Get Anchor provider
export const getProvider = (connection: Connection, wallet: AnchorWallet) => {
  return new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
}

// Get Program instance
export const getProgram = (provider: AnchorProvider) => {
  return new Program(IDL, PROGRAM_ID, provider)
}

// Helper functions for PDA generation
export const getPoolAddress = (tokenAMint: PublicKey, tokenBMint: PublicKey): [PublicKey, number] => {
  // Sort tokens to ensure consistent PDA
  const [token0, token1] = tokenAMint.toString() < tokenBMint.toString() 
    ? [tokenAMint, tokenBMint] 
    : [tokenBMint, tokenAMint]

  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), token0.toBuffer(), token1.toBuffer()],
    PROGRAM_ID
  )
}

export const getLpMintAddress = (poolAddress: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('lp_mint'), poolAddress.toBuffer()],
    PROGRAM_ID
  )
}

export const getUserPositionAddress = (
  poolAddress: PublicKey,
  userAddress: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_position'), poolAddress.toBuffer(), userAddress.toBuffer()],
    PROGRAM_ID
  )
}

// Price calculation helpers
export const calculatePrice = (reserveA: BN, reserveB: BN): number => {
  if (reserveA.isZero()) return 0
  return reserveB.toNumber() / reserveA.toNumber()
}

export const calculateSwapOutput = (
  amountIn: BN,
  reserveIn: BN,
  reserveOut: BN,
  feeBps: number
): BN => {
  const amountInWithFee = amountIn.mul(new BN(10000 - feeBps)).div(new BN(10000))
  const numerator = amountInWithFee.mul(reserveOut)
  const denominator = reserveIn.add(amountInWithFee)
  return numerator.div(denominator)
}

export const calculatePriceImpact = (
  amountIn: BN,
  reserveIn: BN,
  reserveOut: BN
): number => {
  const spotPrice = calculatePrice(reserveIn, reserveOut)
  const amountOut = calculateSwapOutput(amountIn, reserveIn, reserveOut, 30) // 0.3% fee
  const executionPrice = amountOut.toNumber() / amountIn.toNumber()
  
  return Math.abs((executionPrice - spotPrice) / spotPrice) * 100
}

// Format helpers
export const formatTokenAmount = (amount: BN, decimals: number = 9): string => {
  const divisor = new BN(10).pow(new BN(decimals))
  const quotient = amount.div(divisor)
  const remainder = amount.mod(divisor)
  
  if (remainder.isZero()) {
    return quotient.toString()
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0')
  return `${quotient.toString()}.${remainderStr.replace(/0+$/, '')}`
}

export const parseTokenAmount = (amount: string, decimals: number = 9): BN => {
  const [whole, fraction = '0'] = amount.split('.')
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals)
  return new BN(whole + fractionPadded)
}

// Pool data fetching functions
export const fetchPoolData = async (
  program: any,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey
): Promise<PoolData | null> => {
  try {
    const [poolAddress] = getPoolAddress(tokenAMint, tokenBMint)
    const poolAccount = await program.account.liquidityPool.fetch(poolAddress)
    
    return {
      address: poolAddress,
      authority: poolAccount.authority,
      tokenAMint: poolAccount.tokenAMint,
      tokenBMint: poolAccount.tokenBMint,
      tokenAVault: poolAccount.tokenAVault,
      tokenBVault: poolAccount.tokenBVault,
      lpMint: poolAccount.lpMint,
      reserveA: poolAccount.reserveA,
      reserveB: poolAccount.reserveB,
      baseFeeBps: poolAccount.baseFeeBps,
      volatilityFeeBps: poolAccount.volatilityFeeBps,
      lastPrice: poolAccount.lastPrice,
      lastUpdateSlot: poolAccount.lastUpdateSlot,
      priceHistory: poolAccount.priceHistory,
      historyIndex: poolAccount.historyIndex,
      totalVolumeUsd: poolAccount.totalVolumeUsd,
      totalFeesCollected: poolAccount.totalFeesCollected,
      createdAt: poolAccount.createdAt,
      isInitialized: poolAccount.isInitialized,
      bump: poolAccount.bump,
    }
  } catch (error) {
    console.error('Error fetching pool data:', error)
    return null
  }
}

export const fetchTokenBalance = async (
  connection: Connection,
  tokenMint: PublicKey,
  owner: PublicKey
): Promise<BN> => {
  try {
    const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token')
    const tokenAddress = await getAssociatedTokenAddress(tokenMint, owner)
    const tokenAccount = await getAccount(connection, tokenAddress)
    return new BN(tokenAccount.amount.toString())
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return new BN(0)
  }
}