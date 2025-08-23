"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, Server, CheckCircle, XCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface VisualizationData {
  regional: {
    data: Array<{ region: string; count: number; percentage: number }>
    total: number
    topRegion: string
    topRegionPercentage: number
  }
  sizeBand: {
    data: Array<{ band: string; count: number; percentage: number }>
    total: number
    largestBand: string
  }
  metrics?: {
    medianDeductible?: number
    avgDeductible?: number
    medianRetirement?: number
    avgRetirement?: number
  }
  metadata: {
    totalOrganizations: number
    dataSource?: string
    fileName?: string
  }
}

export default function DataVisualizationDashboard() {
  const [data, setData] = useState<VisualizationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check API status - simplified for Next.js API route
  const checkApiStatus = async () => {
    setApiStatus('online') // Next.js API is always available
    return true
  }

  // Load sample data from API
  const loadSampleData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/visualization-data')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      if (result.success) {
        setData(result)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      const isOnline = await checkApiStatus()
      if (isOnline) {
        await loadSampleData()
      }
    }
    initializeData()
    
    // Check API status periodically
    const interval = setInterval(checkApiStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Colors for charts
  const REGION_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const BAR_COLOR = '#4472C4'

  const renderRegionalTable = () => {
    if (!data?.regional) return null
    
    const tableData = [
      ...data.regional.data,
      { region: 'Total', count: data.regional.total, percentage: 100 }
    ]
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index} className={row.region === 'Total' ? 'bg-gray-100 font-bold' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.region}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSizeBandTable = () => {
    if (!data?.sizeBand) return null
    
    const tableData = [
      ...data.sizeBand.data,
      { band: 'Total', count: data.sizeBand.total, percentage: 100 }
    ]
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Benefit Eligible Size Band
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index} className={row.band === 'Total' ? 'bg-gray-100 font-bold' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.band}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm">{data.region || data.band}</p>
          <p className="text-sm">Count: {data.count}</p>
          <p className="text-sm">Percentage: {data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Data Status Banner */}
      <Alert className="border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Healthcare Survey Data Visualization Dashboard
            </AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </Alert>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {data && !loading && (
        <>
          {/* Header with Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.metadata.totalOrganizations}</div>
              </CardContent>
            </Card>
            {data.metrics?.medianDeductible && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Median Deductible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${data.metrics.medianDeductible.toLocaleString()}</div>
                </CardContent>
              </Card>
            )}
            {data.metrics?.avgRetirement && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Retirement Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.metrics.avgRetirement.toFixed(1)}%</div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{data.regional.topRegion}</div>
                <div className="text-sm text-gray-500">{data.regional.topRegionPercentage}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Exhibit 1: Regional Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Table 1.1: Regional Distribution</CardTitle>
                <CardDescription>Geographic breakdown of organizations</CardDescription>
              </CardHeader>
              <CardContent>
                {renderRegionalTable()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Figure 1.1 — Region</CardTitle>
                <CardDescription>Regional distribution visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.regional.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.regional.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Exhibit 2: Size Band Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Table 1.2: Organization Size Distribution</CardTitle>
                <CardDescription>Distribution by employee count</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSizeBandTable()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Figure 1.2 — Benefit Eligible Size Band</CardTitle>
                <CardDescription>Size distribution visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.sizeBand.data}
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} />
                    <YAxis dataKey="band" type="category" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" fill={BAR_COLOR}>
                      {data.sizeBand.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}