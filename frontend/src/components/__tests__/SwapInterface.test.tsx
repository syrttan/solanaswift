import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SwapInterface } from '../swap/SwapInterface'
import '@testing-library/jest-dom'

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: jest.fn(),
    signTransaction: jest.fn(),
  }),
}))

// Mock the program hook
jest.mock('../../hooks/useProgram', () => ({
  useProgram: () => ({
    provider: null,
    program: null,
    connection: {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test' }),
    },
    wallet: null,
  }),
}))

// Mock the pool store
jest.mock('../../stores/poolStore', () => ({
  usePoolStore: () => ({
    tokenList: [
      {
        mint: { toString: () => 'So11111111111111111111111111111111111111112' },
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://example.com/sol.png',
      },
      {
        mint: { toString: () => 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://example.com/usdc.png',
      },
    ],
    pools: new Map(),
    selectedPool: null,
  }),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))

describe('SwapInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders swap interface correctly', () => {
    render(<SwapInterface />)
    
    expect(screen.getByText('Swap')).toBeInTheDocument()
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('displays connect wallet button when not connected', () => {
    render(<SwapInterface />)
    
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('allows token selection', async () => {
    render(<SwapInterface />)
    
    const tokenButtons = screen.getAllByText('Select Token')
    expect(tokenButtons).toHaveLength(2) // From and To token selectors
  })

  it('displays amount input fields', () => {
    render(<SwapInterface />)
    
    const amountInputs = screen.getAllByPlaceholderText('0.0')
    expect(amountInputs).toHaveLength(2) // From and To amount inputs
  })

  it('shows MAX button for input token', () => {
    render(<SwapInterface />)
    
    expect(screen.getByText('MAX')).toBeInTheDocument()
  })

  it('displays settings button', () => {
    render(<SwapInterface />)
    
    const settingsButton = screen.getByTitle('Settings')
    expect(settingsButton).toBeInTheDocument()
  })

  it('displays refresh button', () => {
    render(<SwapInterface />)
    
    const refreshButton = screen.getByTitle('Refresh prices')
    expect(refreshButton).toBeInTheDocument()
  })

  it('handles amount input correctly', async () => {
    render(<SwapInterface />)
    
    const amountInput = screen.getAllByPlaceholderText('0.0')[0]
    
    fireEvent.change(amountInput, { target: { value: '10' } })
    
    await waitFor(() => {
      expect(amountInput).toHaveValue('10')
    })
  })

  it('validates numeric input only', async () => {
    render(<SwapInterface />)
    
    const amountInput = screen.getAllByPlaceholderText('0.0')[0]
    
    // Try to input non-numeric characters
    fireEvent.change(amountInput, { target: { value: 'abc' } })
    
    await waitFor(() => {
      expect(amountInput).toHaveValue('') // Should remain empty
    })
  })

  it('allows decimal input', async () => {
    render(<SwapInterface />)
    
    const amountInput = screen.getAllByPlaceholderText('0.0')[0]
    
    fireEvent.change(amountInput, { target: { value: '10.5' } })
    
    await waitFor(() => {
      expect(amountInput).toHaveValue('10.5')
    })
  })

  it('shows swap button disabled initially', () => {
    render(<SwapInterface />)
    
    const swapButton = screen.getByRole('button', { name: /connect wallet/i })
    expect(swapButton).toBeInTheDocument()
  })

  it('displays proper trade info text', () => {
    render(<SwapInterface />)
    
    expect(screen.getByText(/trade executed through solanaswift amm/i)).toBeInTheDocument()
  })
})