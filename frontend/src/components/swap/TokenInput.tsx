'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'
import { TokenInfo } from '@/stores/poolStore'

interface TokenInputProps {
  token: TokenInfo | null
  amount: string
  onTokenSelect: (token: TokenInfo) => void
  onAmountChange: (amount: string) => void
  tokenList: TokenInfo[]
  balance?: string
  readOnly?: boolean
}

export const TokenInput: FC<TokenInputProps> = ({
  token,
  amount,
  onTokenSelect,
  onAmountChange,
  tokenList,
  balance = '0.00',
  readOnly = false,
}) => {
  const [showTokenList, setShowTokenList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTokens = tokenList.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTokenSelect = (selectedToken: TokenInfo) => {
    onTokenSelect(selectedToken)
    setShowTokenList(false)
    setSearchQuery('')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value)
    }
  }

  return (
    <div className="relative">
      <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={handleAmountChange}
              readOnly={readOnly}
              className={`
                w-full bg-transparent text-2xl font-medium text-white placeholder-gray-400 
                outline-none ${readOnly ? 'cursor-default' : ''}
              `}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-400">
                ${(parseFloat(amount || '0') * 50).toFixed(2)} {/* Mock USD value */}
              </span>
              {balance && (
                <span className="text-sm text-gray-400">
                  Balance: {balance}
                </span>
              )}
            </div>
          </div>

          <div className="ml-4">
            <button
              onClick={() => setShowTokenList(true)}
              className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-xl px-3 py-2 transition-colors group"
            >
              {token ? (
                <>
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <span className="font-medium text-white">{token.symbol}</span>
                </>
              ) : (
                <span className="font-medium text-white">Select Token</span>
              )}
              <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Token List Modal */}
      <AnimatePresence>
        {showTokenList && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowTokenList(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl z-50 overflow-hidden"
            >
              {/* Search */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Token List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((tokenItem) => (
                    <button
                      key={tokenItem.mint.toString()}
                      onClick={() => handleTokenSelect(tokenItem)}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-gray-700/50 transition-colors text-left"
                    >
                      {tokenItem.logoURI && (
                        <img
                          src={tokenItem.logoURI}
                          alt={tokenItem.symbol}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{tokenItem.symbol}</p>
                            <p className="text-sm text-gray-400 truncate">{tokenItem.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">0.00</p>
                            <p className="text-xs text-gray-400">$0.00</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No tokens found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}