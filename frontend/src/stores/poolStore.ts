import { create } from 'zustand'
import { PublicKey, Connection } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { PoolData } from '@/lib/anchor'

export interface TokenInfo {
  mint: PublicKey
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  coingeckoId?: string
}

export interface PoolMetrics {
  address: string
  tokenA: TokenInfo
  tokenB: TokenInfo
  tvl: number
  volume24h: number
  fees24h: number
  apy: number
  currentFee: number
  priceChange24h: number
}

interface PoolState {
  // Data
  pools: Map<string, PoolData>
  poolMetrics: Map<string, PoolMetrics>
  selectedPool: PoolData | null
  loading: boolean
  error: string | null
  
  // Token lists
  tokenList: TokenInfo[]
  popularTokens: TokenInfo[]
  
  // Actions
  fetchPools: () => Promise<void>
  fetchPoolData: (address: PublicKey) => Promise<PoolData | null>
  selectPool: (address: PublicKey) => void
  updatePoolData: (address: PublicKey, data: Partial<PoolData>) => void
  addPool: (poolData: PoolData) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  
  // Token actions
  fetchTokenList: () => Promise<void>
  findToken: (mint: PublicKey) => TokenInfo | null
}

// Default token list for devnet
const DEFAULT_TOKENS: TokenInfo[] = [
  {
    mint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
    symbol: 'SOL',
    name: 'Wrapped Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
]

export const usePoolStore = create<PoolState>((set, get) => ({
  // Initial state
  pools: new Map(),
  poolMetrics: new Map(),
  selectedPool: null,
  loading: false,
  error: null,
  tokenList: DEFAULT_TOKENS,
  popularTokens: DEFAULT_TOKENS.slice(0, 2),

  // Actions
  fetchPools: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement actual pool fetching from blockchain
      // For now, we'll create mock data
      const mockPools = new Map<string, PoolData>()
      
      // Mock SOL/USDC pool
      const solUsdcPool: PoolData = {
        address: new PublicKey('11111111111111111111111111111112'),
        authority: new PublicKey('11111111111111111111111111111112'),
        tokenAMint: DEFAULT_TOKENS[0].mint,
        tokenBMint: DEFAULT_TOKENS[1].mint,
        tokenAVault: new PublicKey('11111111111111111111111111111113'),
        tokenBVault: new PublicKey('11111111111111111111111111111114'),
        lpMint: new PublicKey('11111111111111111111111111111115'),
        reserveA: new BN('1000000000000'), // 1000 SOL
        reserveB: new BN('50000000000'), // 50000 USDC
        baseFeeBps: 30,
        volatilityFeeBps: 35,
        lastPrice: new BN('50000'),
        lastUpdateSlot: new BN('123456789'),
        priceHistory: Array(50).fill(new BN('50000')),
        historyIndex: 10,
        totalVolumeUsd: new BN('10000000000000'),
        totalFeesCollected: new BN('500000000'),
        createdAt: new BN(Date.now() / 1000),
        isInitialized: true,
        bump: 254,
      }

      mockPools.set(solUsdcPool.address.toString(), solUsdcPool)

      set({ pools: mockPools, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchPoolData: async (address: PublicKey) => {
    try {
      const pools = get().pools
      const poolData = pools.get(address.toString())
      return poolData || null
    } catch (error) {
      console.error('Error fetching pool data:', error)
      return null
    }
  },

  selectPool: (address: PublicKey) => {
    const pools = get().pools
    const pool = pools.get(address.toString())
    set({ selectedPool: pool || null })
  },

  updatePoolData: (address: PublicKey, data: Partial<PoolData>) => {
    const pools = new Map(get().pools)
    const existingPool = pools.get(address.toString())
    if (existingPool) {
      pools.set(address.toString(), { ...existingPool, ...data })
      set({ pools })
      
      // Update selected pool if it's the same
      const selectedPool = get().selectedPool
      if (selectedPool && selectedPool.address.equals(address)) {
        set({ selectedPool: { ...selectedPool, ...data } })
      }
    }
  },

  addPool: (poolData: PoolData) => {
    const pools = new Map(get().pools)
    pools.set(poolData.address.toString(), poolData)
    set({ pools })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },

  fetchTokenList: async () => {
    try {
      // TODO: Fetch from Solana token list registry
      // For now, using default tokens
      set({ tokenList: DEFAULT_TOKENS })
    } catch (error) {
      console.error('Error fetching token list:', error)
    }
  },

  findToken: (mint: PublicKey) => {
    const tokenList = get().tokenList
    return tokenList.find(token => token.mint.equals(mint)) || null
  },
}))