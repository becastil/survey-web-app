"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'

interface RetentionRiskThermometerProps {
  riskLevel: number // 0-100
  benchmark: number // Industry benchmark
}

export default function RetentionRiskThermometer({ riskLevel, benchmark }: RetentionRiskThermometerProps) {
  const [animatedRisk, setAnimatedRisk] = useState(0)

  useEffect(() => {
    // Animate the risk level on mount
    const timer = setTimeout(() => {
      setAnimatedRisk(riskLevel)
    }, 100)
    return () => clearTimeout(timer)
  }, [riskLevel])

  const getRiskColor = (level: number) => {
    if (level < 20) return 'bg-green-500'
    if (level < 40) return 'bg-yellow-500'
    if (level < 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getRiskLabel = (level: number) => {
    if (level < 20) return 'Safe Zone'
    if (level < 40) return 'Monitor Closely'
    if (level < 60) return 'Action Needed'
    return 'Critical Risk'
  }

  const getRiskDescription = (level: number) => {
    if (level < 20) return 'Your benefits package is competitive and supports retention'
    if (level < 40) return 'Some gaps exist but overall position is acceptable'
    if (level < 60) return 'Significant gaps are impacting employee satisfaction'
    return 'Immediate action required to prevent talent exodus'
  }

  return (
    <div className="space-y-6">
      {/* Thermometer Visual */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-24 h-80">
          {/* Thermometer tube */}
          <div className="absolute inset-x-0 top-0 bottom-8 bg-gray-200 rounded-t-full overflow-hidden">
            {/* Risk zones */}
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-red-100 to-red-50"></div>
            <div className="absolute inset-x-0 top-1/4 h-1/4 bg-gradient-to-b from-orange-50 to-yellow-50"></div>
            <div className="absolute inset-x-0 top-2/4 h-1/4 bg-gradient-to-b from-yellow-50 to-green-50"></div>
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-green-50 to-green-100"></div>
            
            {/* Animated fill */}
            <div 
              className={`absolute inset-x-0 bottom-0 ${getRiskColor(animatedRisk)} transition-all duration-1000 ease-out`}
              style={{ height: `${animatedRisk}%` }}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 animate-pulse"></div>
            </div>

            {/* Benchmark line */}
            <div 
              className="absolute inset-x-0 border-t-2 border-dashed border-blue-600"
              style={{ bottom: `${benchmark}%` }}
            >
              <span className="absolute -right-20 -top-2 text-xs text-blue-600 font-medium">
                Benchmark
              </span>
            </div>
          </div>

          {/* Thermometer bulb */}
          <div className={`absolute inset-x-0 bottom-0 h-8 ${getRiskColor(animatedRisk)} rounded-full`}></div>
        </div>

        {/* Scale labels */}
        <div className="absolute left-32 top-0 bottom-8 flex flex-col justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>100%</span>
            <span className="text-red-600 font-medium">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>60%</span>
            <span className="text-orange-600 font-medium">Action Needed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>40%</span>
            <span className="text-yellow-600 font-medium">Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>20%</span>
            <span className="text-green-600 font-medium">Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>0%</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-6 w-6 ${riskLevel >= 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
            <div>
              <p className="font-semibold text-lg">{animatedRisk}% Retention Risk</p>
              <p className="text-sm text-gray-600">{getRiskLabel(animatedRisk)}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(animatedRisk)} text-white`}>
            {riskLevel > benchmark ? `${riskLevel - benchmark}% above benchmark` : `${benchmark - riskLevel}% below benchmark`}
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Risk Assessment:</p>
          <p className="text-gray-800">{getRiskDescription(animatedRisk)}</p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Projected Annual Turnover</p>
            <p className="text-xl font-bold text-red-600">{Math.round(riskLevel * 0.3)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              3x industry average
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Replacement Cost Impact</p>
            <p className="text-xl font-bold text-orange-600">$1.8M</p>
            <p className="text-xs text-gray-500 mt-1">Based on 15% turnover</p>
          </div>
        </div>
      </div>
    </div>
  )
}