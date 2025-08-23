"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RegionalDistributionDonutProps {
  data?: Array<{
    region: string
    count: number
    percentage: number
  }>
}

const defaultData = [
  { region: 'So Cal (except SD)', count: 18, percentage: 45 },
  { region: 'San Francisco Bay Area', count: 8, percentage: 20 },
  { region: 'Rural', count: 7, percentage: 18 },
  { region: 'Sacramento/Central Valley', count: 4, percentage: 10 },
  { region: 'San Diego', count: 3, percentage: 8 },
]

// Color palette for the donut chart
const COLORS = {
  'So Cal (except SD)': '#8b5cf6',      // Purple
  'San Francisco Bay Area': '#3b82f6',  // Blue
  'Rural': '#10b981',                   // Green
  'Sacramento/Central Valley': '#f59e0b', // Amber
  'San Diego': '#ef4444',                // Red
}

export default function RegionalDistributionDonut({ data = defaultData }: RegionalDistributionDonutProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm">{data.region}</p>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-2xl font-bold text-gray-800">{data.count}</span>
            <span className="text-sm text-gray-600">organizations</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {data.percentage}% of total sample
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label if less than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const renderLegendText = (value: string, entry: any) => {
    return (
      <span className="text-sm text-gray-700">
        {value}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Distribution</CardTitle>
        <CardDescription>
          Geographic breakdown of {total} peer organizations in your benchmark group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Donut Chart with center text */}
          <div className="relative h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="percentage"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.region as keyof typeof COLORS]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={renderLegendText}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text - Positioned absolutely within the chart container */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: '-20px' }}>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{total}</p>
                <p className="text-sm text-gray-600">Total Orgs</p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Primary Region</p>
              <p className="font-semibold text-sm">Southern California</p>
              <p className="text-xs text-purple-600 mt-1">45% concentration</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Urban vs Rural</p>
              <p className="font-semibold text-sm">82% Urban</p>
              <p className="text-xs text-blue-600 mt-1">18% Rural markets</p>
            </div>
          </div>

          {/* Regional Comparison Note */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Benchmark Note:</strong> Your peer group is heavily concentrated in high-cost California markets. 
              Consider adjusting compensation and benefits expectations accordingly, as 65% of peers operate in 
              SoCal and Bay Area regions with significantly higher cost of living.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}