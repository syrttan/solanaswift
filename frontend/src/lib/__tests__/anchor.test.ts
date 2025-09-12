/**
 * @jest-environment node
 */
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  getPoolAddress,
  getLpMintAddress,
  calculatePrice,
  calculateSwapOutput,
  calculatePriceImpact,
  formatTokenAmount,
  parseTokenAmount,
  PROGRAM_ID
} from '../anchor'

describe('SolanaSwift Anchor Utils', () => {
  describe('PDA Generation', () => {
    const tokenA = new PublicKey('So11111111111111111111111111111111111111112') // SOL
    const tokenB = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC

    it('should generate consistent pool addresses', () => {
      const [poolPDA1] = getPoolAddress(tokenA, tokenB)
      const [poolPDA2] = getPoolAddress(tokenB, tokenA) // Reversed order
      
      expect(poolPDA1.toString()).toBe(poolPDA2.toString())
    })

    it('should generate valid LP mint address', () => {
      const [poolPDA] = getPoolAddress(tokenA, tokenB)
      const [lpMintPDA, bump] = getLpMintAddress(poolPDA)
      
      expect(lpMintPDA).toBeInstanceOf(PublicKey)
      expect(bump).toBeGreaterThanOrEqual(0)
      expect(bump).toBeLessThanOrEqual(255)
    })
  })

  describe('Price Calculations', () => {
    it('should calculate price correctly', () => {
      const reserveA = new BN('1000000000000') // 1000 tokens
      const reserveB = new BN('50000000000')   // 50 tokens
      
      const price = calculatePrice(reserveA, reserveB)
      expect(price).toBe(0.05) // 50/1000
    })

    it('should handle zero reserves', () => {
      const reserveA = new BN('0')
      const reserveB = new BN('1000')
      
      const price = calculatePrice(reserveA, reserveB)
      expect(price).toBe(0)
    })
  })

  describe('Swap Output Calculation', () => {
    const reserveIn = new BN('1000000000000')  // 1000 tokens
    const reserveOut = new BN('500000000000')  // 500 tokens

    it('should calculate swap output with fee', () => {
      const amountIn = new BN('10000000000') // 10 tokens
      const feeBps = 30 // 0.3%
      
      const output = calculateSwapOutput(amountIn, reserveIn, reserveOut, feeBps)
      
      expect(output.gt(new BN(0))).toBe(true)
      expect(output.lt(amountIn)).toBe(true) // Output should be less than input
    })

    it('should calculate higher output with lower fee', () => {
      const amountIn = new BN('10000000000') // 10 tokens
      
      const outputHighFee = calculateSwapOutput(amountIn, reserveIn, reserveOut, 50) // 0.5%
      const outputLowFee = calculateSwapOutput(amountIn, reserveIn, reserveOut, 25)  // 0.25%
      
      expect(outputLowFee.gt(outputHighFee)).toBe(true)
    })
  })

  describe('Price Impact Calculation', () => {
    it('should calculate price impact for small trade', () => {
      const amountIn = new BN('1000000000')    // 1 token
      const reserveIn = new BN('1000000000000') // 1000 tokens
      const reserveOut = new BN('1000000000000') // 1000 tokens
      
      const impact = calculatePriceImpact(amountIn, reserveIn, reserveOut)
      
      expect(impact).toBeGreaterThan(0)
      expect(impact).toBeLessThan(1) // Should be less than 1% for small trade
    })

    it('should calculate higher price impact for large trade', () => {
      const smallTrade = new BN('1000000000')   // 1 token
      const largeTrade = new BN('100000000000') // 100 tokens
      const reserveIn = new BN('1000000000000') // 1000 tokens
      const reserveOut = new BN('1000000000000') // 1000 tokens
      
      const smallImpact = calculatePriceImpact(smallTrade, reserveIn, reserveOut)
      const largeImpact = calculatePriceImpact(largeTrade, reserveIn, reserveOut)
      
      expect(largeImpact).toBeGreaterThan(smallImpact)
    })
  })

  describe('Token Amount Formatting', () => {
    it('should format token amounts correctly', () => {
      const amount = new BN('1000000000') // 1 token with 9 decimals
      const formatted = formatTokenAmount(amount, 9)
      
      expect(formatted).toBe('1')
    })

    it('should format fractional amounts', () => {
      const amount = new BN('1500000000') // 1.5 tokens with 9 decimals
      const formatted = formatTokenAmount(amount, 9)
      
      expect(formatted).toBe('1.5')
    })

    it('should handle different decimal places', () => {
      const amount = new BN('1000000') // 1 token with 6 decimals (like USDC)
      const formatted = formatTokenAmount(amount, 6)
      
      expect(formatted).toBe('1')
    })
  })

  describe('Token Amount Parsing', () => {
    it('should parse token amounts correctly', () => {
      const parsed = parseTokenAmount('1', 9)
      const expected = new BN('1000000000')
      
      expect(parsed.toString()).toBe(expected.toString())
    })

    it('should parse fractional amounts', () => {
      const parsed = parseTokenAmount('1.5', 9)
      const expected = new BN('1500000000')
      
      expect(parsed.toString()).toBe(expected.toString())
    })

    it('should handle different decimal places', () => {
      const parsed = parseTokenAmount('1.5', 6)
      const expected = new BN('1500000')
      
      expect(parsed.toString()).toBe(expected.toString())
    })
  })

  describe('Constants', () => {
    it('should have valid program ID', () => {
      expect(PROGRAM_ID).toBeInstanceOf(PublicKey)
      expect(PROGRAM_ID.toString().length).toBe(44) // Base58 encoded public key length
    })
  })
})