import { useMemo } from 'react'
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import { getProvider, getProgram } from '@/lib/anchor'

export const useProgram = () => {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  const { provider, program } = useMemo(() => {
    if (!wallet) {
      return { provider: null, program: null }
    }

    try {
      const provider = getProvider(connection, wallet)
      const program = getProgram(provider)
      return { provider, program }
    } catch (error) {
      console.error('Error creating program:', error)
      return { provider: null, program: null }
    }
  }, [connection, wallet])

  return { provider, program, connection, wallet }
}