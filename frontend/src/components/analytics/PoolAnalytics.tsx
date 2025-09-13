'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, ActivityIcon, ZapIcon, InfoIcon } from 'lucide-react'
import { VolumeChart } from './VolumeChart'
import { FeeAnalytics } from './FeeAnalytics'

interface AnalyticsData {
  tvl: number
  volume24h: number
  fees24h: number
  uniqueUsers: number
  transactions: number
  avgFee: number
  feeChange: number
  volumeChange: number
  tvlChange: number
}

export const PoolAnalytics: FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    tvl: 2_540_000,
    volume24h: 1_250_000,
    fees24h: 4_200,
    uniqueUsers: 1_847,
    transactions: 3_524,
    avgFee: 0.35,
    feeChange: -0.05,
    volumeChange: 12.4,
    tvlChange: 5.2,
  })

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(false)

  // Mock data update when timerange changes
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      // Simulate data fetch with different values for different time ranges
      const multiplier = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
      setData(prev => ({
        ...prev,
        volume24h: prev.volume24h * multiplier,
        fees24h: prev.fees24h * multiplier,
        transactions: prev.transactions * multiplier,
      }))
      setLoading(false)
    }, 500)
  }, [timeRange])

  const formatNumber = (num: number, prefix: string = '$') => {
    if (num >= 1_000_000) {
      return `${prefix}${(num / 1_000_000).toFixed(2)}M`
    }
    if (num >= 1_000) {
      return `${prefix}${(num / 1_000).toFixed(1)}K`
    }
    return `${prefix}${num.toFixed(0)}`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    const Icon = change >= 0 ? TrendingUpIcon : TrendingDownIcon
    return <Icon className="w-3 h-3" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Pool Analytics</h2>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* TVL */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <DollarSignIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">TVL</span>
                <InfoIcon className="w-3 h-3 text-gray-500" />
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(data.tvlChange)}`}>
                {getChangeIcon(data.tvlChange)}
                <span className="text-xs font-medium">{Math.abs(data.tvlChange).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data.tvl)}
            </p>
          </div>

          {/* 24h Volume */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ActivityIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">24h Volume</span>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(data.volumeChange)}`}>
                {getChangeIcon(data.volumeChange)}
                <span className="text-xs font-medium">{Math.abs(data.volumeChange).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data.volume24h)}
            </p>
          </div>

          {/* Fees Earned */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ZapIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">24h Fees</span>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(data.feeChange)}`}>
                {getChangeIcon(data.feeChange)}
                <span className="text-xs font-medium">{Math.abs(data.feeChange).toFixed(2)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data.fees24h)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Avg fee: {data.avgFee}%
            </p>
          </div>

          {/* Transactions */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ActivityIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {data.transactions.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data.uniqueUsers.toLocaleString()} unique users
            </p>
          </div>
        </div>

        {/* Adaptive Fee Status */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-purple-400">Adaptive Fee Active</p>
                <p className="text-xs text-gray-400">Current: {data.avgFee}% • Auto-adjusting to volatility</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">Optimal</p>
              <p className="text-xs text-green-400">Low volatility period</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Volume Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Volume & Price History</h3>
        <VolumeChart timeRange={timeRange} />
      </motion.div>

      {/* Fee Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Adaptive Fee Analysis</h3>
        <FeeAnalytics timeRange={timeRange} />
      </motion.div>

      {/* Pool Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Pool Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Token Reserves</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                    alt="SOL"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-white">SOL</span>
                </div>
                <span className="text-white font-medium">1,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                    alt="USDC"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-white">USDC</span>
                </div>
                <span className="text-white font-medium">50,000.00</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Pool Statistics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pool Age</span>
                <span className="text-white">14 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">All-time Volume</span>
                <span className="text-white">$25.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">All-time Fees</span>
                <span className="text-white">$84.2K</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}