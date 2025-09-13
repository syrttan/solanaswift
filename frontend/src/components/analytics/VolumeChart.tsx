'use client'

import { FC, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Lazy load Recharts components for better performance
const ComposedChart = dynamic(() => import('recharts').then((mod) => mod.ComposedChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false })
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })

interface VolumeChartProps {
  timeRange: '24h' | '7d' | '30d'
}

interface ChartDataPoint {
  time: string
  volume: number
  price: number
  fee: number
  timestamp: number
}

export const VolumeChart: FC<VolumeChartProps> = ({ timeRange }) => {
  // Generate mock data based on time range
  const chartData = useMemo(() => {
    const now = Date.now()
    const intervals = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    const intervalMs = timeRange === '24h' ? 3600000 : timeRange === '7d' ? 86400000 : 86400000
    
    return Array.from({ length: intervals }, (_, i) => {
      const timestamp = now - (intervals - 1 - i) * intervalMs
      const date = new Date(timestamp)
      
      // Generate realistic-looking data with some volatility
      const baseVolume = 50000
      const volatility = Math.sin(i * 0.5) * 0.3 + Math.random() * 0.4 - 0.2
      const volume = baseVolume * (1 + volatility)
      
      const basePrice = 50
      const priceVolatility = Math.sin(i * 0.3) * 0.1 + Math.random() * 0.1 - 0.05
      const price = basePrice * (1 + priceVolatility)
      
      // Adaptive fee based on volatility
      const baseFee = 0.3
      const feeAdjustment = Math.abs(volatility) * 0.5
      const fee = baseFee + feeAdjustment
      
      return {
        time: timeRange === '24h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume),
        price: Math.round(price * 100) / 100,
        fee: Math.round(fee * 100) / 100,
        timestamp,
      }
    })
  }, [timeRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-sm capitalize">{entry.dataKey}</span>
              </div>
              <span className="text-white font-medium">
                {entry.dataKey === 'volume' 
                  ? `$${entry.value.toLocaleString()}`
                  : entry.dataKey === 'price'
                  ? `$${entry.value}`
                  : `${entry.value}%`
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Volume and Price Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="volume"
              orientation="left"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis 
              yAxisId="price"
              orientation="right"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Volume bars */}
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="url(#volumeGradient)"
              radius={[2, 2, 0, 0]}
              opacity={0.7}
            />
            
            {/* Price line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10B981" }}
            />
            
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Volume</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Price</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            ${Math.round(chartData.reduce((sum, d) => sum + d.volume, 0) / 1000)}K
          </p>
          <p className="text-sm text-gray-400">Total Volume</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            ${chartData[chartData.length - 1]?.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Current Price</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-400">
            {chartData[chartData.length - 1]?.fee.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-400">Current Fee</p>
        </div>
      </div>
    </div>
  )
}