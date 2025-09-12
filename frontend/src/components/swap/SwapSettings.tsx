'use client'

import { FC } from 'react'
import { XIcon } from 'lucide-react'

interface SwapSettingsProps {
  slippage: number
  deadline: number
  onSlippageChange: (slippage: number) => void
  onDeadlineChange: (deadline: number) => void
  onClose: () => void
}

export const SwapSettings: FC<SwapSettingsProps> = ({
  slippage,
  deadline,
  onSlippageChange,
  onDeadlineChange,
  onClose,
}) => {
  const presetSlippages = [0.1, 0.5, 1.0]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Slippage Tolerance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3">
          Slippage Tolerance
        </label>
        <div className="space-y-3">
          {/* Preset Buttons */}
          <div className="flex space-x-2">
            {presetSlippages.map((preset) => (
              <button
                key={preset}
                onClick={() => onSlippageChange(preset)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${slippage === preset
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {preset}%
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={slippage}
              onChange={(e) => onSlippageChange(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Custom"
            />
            <span className="text-gray-400 text-sm">%</span>
          </div>

          {/* Warning */}
          {slippage > 5 && (
            <p className="text-amber-400 text-xs">
              ⚠️ High slippage tolerance may result in unfavorable trades
            </p>
          )}
          {slippage < 0.1 && slippage > 0 && (
            <p className="text-amber-400 text-xs">
              ⚠️ Very low slippage may cause transaction failures
            </p>
          )}
        </div>
      </div>

      {/* Transaction Deadline */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Transaction Deadline
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="4320" // 3 days in minutes
            value={deadline}
            onChange={(e) => onDeadlineChange(parseInt(e.target.value) || 20)}
            className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <span className="text-gray-400 text-sm">minutes</span>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Your transaction will revert if it is pending for more than this long
        </p>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          Advanced Settings
        </button>
      </div>
    </div>
  )
}