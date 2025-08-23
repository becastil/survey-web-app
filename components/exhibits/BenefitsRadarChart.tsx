"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'

interface BenefitsRadarChartProps {
  data: {
    dimensions: Array<{
      label: string
      yourScore: number
      peerMedian: number
      industryLeader: number
    }>
  }
}

export default function BenefitsRadarChart({ data }: BenefitsRadarChartProps) {
  // Transform data for Recharts
  const chartData = data.dimensions.map(d => ({
    subject: d.label,
    'Your Organization': d.yourScore,
    'Peer Median': d.peerMedian,
    'Industry Leader': d.industryLeader,
  }))

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Your Organization"
            dataKey="Your Organization"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Peer Median"
            dataKey="Peer Median"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Industry Leader"
            dataKey="Industry Leader"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Areas needing improvement</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Competitive advantages</span>
        </div>
      </div>
    </div>
  )
}