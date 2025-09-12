'use client'

import { FC, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

interface FeeAnalyticsProps {
  timeRange: '24h' | '7d' | '30d'
}

interface FeeDataPoint {
  time: string
  adaptiveFee: number
  staticFee: number
  volatility: number
  savings: number
  timestamp: number
}

export const FeeAnalytics: FC<FeeAnalyticsProps> = ({ timeRange }) => {
  // Generate mock fee data
  const feeData = useMemo(() => {
    const now = Date.now()
    const intervals = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    const intervalMs = timeRange === '24h' ? 3600000 : timeRange === '7d' ? 86400000 : 86400000
    
    return Array.from({ length: intervals }, (_, i) => {
      const timestamp = now - (intervals - 1 - i) * intervalMs
      const date = new Date(timestamp)
      
      // Simulate market volatility patterns
      const volatility = Math.abs(Math.sin(i * 0.4) * 0.8 + Math.random() * 0.4 - 0.2)
      
      // Static fee is always 0.3%
      const staticFee = 0.3
      
      // Adaptive fee adjusts to volatility
      const baseFee = 0.25
      const maxFee = 0.8
      const adaptiveFee = Math.min(baseFee + volatility * 0.7, maxFee)
      
      // Calculate savings (negative means adaptive fee is higher)
      const savings = ((staticFee - adaptiveFee) / staticFee) * 100
      
      return {
        time: timeRange === '24h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        adaptiveFee: Math.round(adaptiveFee * 1000) / 1000,
        staticFee: staticFee,
        volatility: Math.round(volatility * 1000) / 1000,
        savings: Math.round(savings * 10) / 10,
        timestamp,
      }
    })
  }, [timeRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="text-gray-300 text-sm font-medium mb-3">{label}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm">Adaptive Fee:</span>
              <span className="text-white font-medium">{data?.adaptiveFee}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Static Fee:</span>
              <span className="text-white">{data?.staticFee}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 text-sm">Volatility:</span>
              <span className="text-white">{(data?.volatility * 100).toFixed(1)}%</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-400">Savings:</span>
              <span className={`font-medium flex items-center space-x-1 ${
                data?.savings >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data?.savings >= 0 ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : (
                  <TrendingDownIcon className="w-3 h-3" />
                )}
                <span>{Math.abs(data?.savings).toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const avgSavings = feeData.reduce((sum, d) => sum + d.savings, 0) / feeData.length
  const totalSavingsCount = feeData.filter(d => d.savings > 0).length
  const avgVolatility = feeData.reduce((sum, d) => sum + d.volatility, 0) / feeData.length

  return (
    <div className="space-y-6">
      {/* Fee Comparison Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={feeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Static fee reference line */}
            <ReferenceLine 
              y={0.3} 
              stroke="#6B7280" 
              strokeDasharray="5 5"
              label={{ value: "Static 0.3%", position: "topLeft" }}
            />
            
            {/* Adaptive fee line */}
            <Line
              type="monotone"
              dataKey="adaptiveFee"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#8B5CF6" }}
              name="Adaptive Fee"
            />
            
            {/* Volatility indicator (scaled for visibility) */}
            <Line
              type="monotone"
              dataKey="volatility"
              stroke="#F59E0B"
              strokeWidth={1}
              dot={false}
              strokeDasharray="2 2"
              name="Volatility"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Adaptive Fee</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-gray-500 opacity-60"></div>
          <span className="text-sm text-gray-400">Static Fee (0.3%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-yellow-500"></div>
          <span className="text-sm text-gray-400">Market Volatility</span>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Savings */}
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${avgSavings >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">Avg. Fee Savings</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${avgSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgSavings >= 0 ? '+' : ''}{avgSavings.toFixed(1)}%
            </span>
            {avgSavings >= 0 ? (
              <TrendingUpIcon className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDownIcon className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            vs static 0.3% fee model
          </p>
        </div>

        {/* Efficiency Periods */}
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-400">Efficiency Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-400">
              {Math.round((totalSavingsCount / feeData.length) * 100)}%
            </span>
            <span className="text-sm text-gray-400">
              ({totalSavingsCount}/{feeData.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            periods with lower fees
          </p>
        </div>

        {/* Average Volatility */}
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-400">Avg. Volatility</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-400">
              {(avgVolatility * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            market volatility index
          </p>
        </div>
      </div>

      {/* How Adaptive Fees Work */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-purple-400 mb-3">
          How Adaptive Fees Work
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-white font-medium mb-2">📉 Low Volatility</h5>
            <p className="text-gray-300 text-xs">
              When markets are stable, fees automatically decrease to 0.25-0.35%, 
              saving traders money on routine transactions.
            </p>
          </div>
          <div>
            <h5 className="text-white font-medium mb-2">📈 High Volatility</h5>
            <p className="text-gray-300 text-xs">
              During volatile periods, fees increase to 0.4-0.8% to account for 
              higher slippage risk and provide MEV protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}