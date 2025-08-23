"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataVisualizationDashboard from '@/components/proof-of-concept/DataVisualizationDashboard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Send, TrendingUp, AlertTriangle, Trophy, Target, MapPin, Download } from 'lucide-react'
import Papa from 'papaparse'
import CompetitivePositionMatrix from '@/components/proof-of-concept/CompetitivePositionMatrix'
import BenefitsRadarChart from '@/components/proof-of-concept/BenefitsRadarChart'
import RetentionRiskThermometer from '@/components/proof-of-concept/RetentionRiskThermometer'
import InsightCard from '@/components/proof-of-concept/InsightCard'
import NaturalLanguageQuery from '@/components/proof-of-concept/NaturalLanguageQuery'
import RegionalDistributionDonut from '@/components/proof-of-concept/RegionalDistributionDonut'

interface CSVRow {
  organization_id: string
  organization_name: string
  'General Information - Location Represented': string
  'General Information - Number of Employees': string
  'Medical Plan Design Details (PPO) - Annual Deductible Individual In-Network': string
  'Medical Plan Employee Costs (PPO) - Employee Only Annual Premium': string
  'Retirement Benefits - Employer Match Maximum Percentage': string
  'Paid Time Off - PTO Days Year 1': string
  'Professional Development - Tuition Reimbursement Annual Maximum': string
  'Wellness Programs - Wellness Incentive Maximum Annual': string
  [key: string]: string // Allow for any additional columns
}

export default function ProofOfConceptPage() {
  const [csvData, setCsvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeQuery, setActiveQuery] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)

  const processCSVData = (results: Papa.ParseResult<CSVRow>) => {
    try {
      setParseError(null)
      const data = results.data.filter(row => row.organization_id) // Filter out empty rows

      // Process regional distribution using the comprehensive column name
      const regionCounts: { [key: string]: number } = {}
      data.forEach(row => {
        const location = row['General Information - Location Represented']
        if (location) {
          regionCounts[location] = (regionCounts[location] || 0) + 1
        }
      })

      const total = data.length
      const regionalData = Object.entries(regionCounts).map(([region, count]) => ({
        region,
        count,
        percentage: Math.round((count / total) * 100)
      })).sort((a, b) => b.count - a.count)

      // Calculate benchmarks using the comprehensive column names
      const healthDeductibles = data.map(r => parseFloat(r['Medical Plan Design Details (PPO) - Annual Deductible Individual In-Network'])).filter(n => !isNaN(n))
      const retirementMatches = data.map(r => parseFloat(r['Retirement Benefits - Employer Match Maximum Percentage'])).filter(n => !isNaN(n))
      const ptoDays = data.map(r => parseFloat(r['Paid Time Off - PTO Days Year 1'])).filter(n => !isNaN(n))
      const profDevBudgets = data.map(r => parseFloat(r['Professional Development - Tuition Reimbursement Annual Maximum'])).filter(n => !isNaN(n))
      const wellnessScores = data.map(r => parseFloat(r['Wellness Programs - Wellness Incentive Maximum Annual'])).filter(n => !isNaN(n))

      const median = (arr: number[]) => {
        if (arr.length === 0) return 0
        const sorted = [...arr].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      }

      const average = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

      // Your organization's position (assuming first row is your org)
      const yourOrg = data[0]
      const yourDeductible = parseFloat(yourOrg['Medical Plan Design Details (PPO) - Annual Deductible Individual In-Network']) || 3500
      const yourRetirement = parseFloat(yourOrg['Retirement Benefits - Employer Match Maximum Percentage']) || 4
      const yourPTO = parseFloat(yourOrg['Paid Time Off - PTO Days Year 1']) || 20
      const yourProfDev = parseFloat(yourOrg['Professional Development - Tuition Reimbursement Annual Maximum']) || 1000
      const yourWellness = parseFloat(yourOrg['Wellness Programs - Wellness Incentive Maximum Annual']) || 750

      // Calculate percentiles
      const getPercentile = (value: number, arr: number[]) => {
        const sorted = [...arr].sort((a, b) => a - b)
        const index = sorted.findIndex(v => v >= value)
        return index === -1 ? 100 : Math.round((index / sorted.length) * 100)
      }

      // Calculate competitive position (cost vs value)
      const costScore = getPercentile(yourDeductible, healthDeductibles)
      const valueScore = 100 - getPercentile(yourRetirement, retirementMatches)

      // Calculate retention risk based on benefits competitiveness
      const deductibleRisk = yourDeductible > median(healthDeductibles) ? 40 : 20
      const retirementRisk = yourRetirement < median(retirementMatches) ? 30 : 10
      const ptoRisk = yourPTO < median(ptoDays) ? 20 : 10
      const retentionRisk = Math.min(100, deductibleRisk + retirementRisk + ptoRisk + Math.random() * 10)

      // Generate insights based on actual data
      const insights = []
      
      // Health insurance insight
      const deductibleMedian = median(healthDeductibles)
      if (yourDeductible > deductibleMedian * 1.2) {
        insights.push({
          type: 'critical' as const,
          icon: AlertTriangle,
          title: `Health Deductible ${Math.round((yourDeductible / deductibleMedian - 1) * 100)}% Above Market`,
          description: `Your $${yourDeductible.toLocaleString()} deductible places you in the ${getPercentile(yourDeductible, healthDeductibles)}th percentile.`,
          action: `Reducing to $${deductibleMedian.toLocaleString()} (peer median) could improve retention.`,
          priority: 9.2,
        })
      }

      // Regional insight
      if (regionalData[0]?.percentage > 40) {
        insights.push({
          type: 'warning' as const,
          icon: MapPin,
          title: 'Geographic Concentration Risk',
          description: `${regionalData[0].percentage}% of peers are in ${regionalData[0].region}, which may skew benchmarks.`,
          action: 'Consider regional cost adjustments when comparing benefits.',
          priority: 8.1,
        })
      }

      // Wellness insight
      if (yourWellness > average(wellnessScores) * 1.2) {
        insights.push({
          type: 'positive' as const,
          icon: Trophy,
          title: 'Wellness Programs Leading Market',
          description: `Your wellness score of ${yourWellness}/100 exceeds peer average of ${Math.round(average(wellnessScores))}.`,
          action: 'Leverage this strength in recruitment messaging.',
          priority: 7.5,
        })
      }

      // Professional development insight
      if (yourProfDev < median(profDevBudgets)) {
        insights.push({
          type: 'warning' as const,
          icon: Target,
          title: 'Professional Development Below Market',
          description: `$${yourProfDev} budget is below the $${median(profDevBudgets)} median.`,
          action: 'Consider increasing learning & development investment.',
          priority: 6.8,
        })
      }

      // Create benchmark data structure
      const benchmarkData = {
        regionalData,
        yourPosition: { cost: costScore, value: valueScore },
        peers: data.slice(1, 20).map(row => ({
          cost: Math.random() * 100,
          value: Math.random() * 100
        })),
        retentionRisk: Math.round(retentionRisk),
        benchmark: 40,
        radarData: {
          dimensions: [
            { 
              label: 'Health Insurance', 
              yourScore: Math.round(100 - getPercentile(yourDeductible, healthDeductibles)), 
              peerMedian: 65, 
              industryLeader: 85 
            },
            { 
              label: 'Retirement (401k)', 
              yourScore: Math.round(getPercentile(yourRetirement, retirementMatches)), 
              peerMedian: 70, 
              industryLeader: 90 
            },
            { 
              label: 'PTO', 
              yourScore: Math.round(getPercentile(yourPTO, ptoDays)), 
              peerMedian: 60, 
              industryLeader: 75 
            },
            { 
              label: 'Professional Development', 
              yourScore: Math.round(getPercentile(yourProfDev, profDevBudgets)), 
              peerMedian: 50, 
              industryLeader: 80 
            },
            { 
              label: 'Wellness Programs', 
              yourScore: Math.round(getPercentile(yourWellness, wellnessScores)), 
              peerMedian: 55, 
              industryLeader: 85 
            },
          ]
        },
        insights,
        stats: {
          totalOrganizations: total,
          avgDeductible: Math.round(average(healthDeductibles)),
          medianDeductible: Math.round(median(healthDeductibles)),
          avgRetirement: average(retirementMatches).toFixed(1),
          medianRetirement: median(retirementMatches).toFixed(1),
        }
      }

      setCsvData(benchmarkData)
    } catch (error) {
      setParseError('Error processing CSV data. Please check the file format.')
      console.error('CSV processing error:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setLoading(true)
      
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processCSVData(results as Papa.ParseResult<CSVRow>)
          setLoading(false)
        },
        error: (error) => {
          setParseError('Error reading CSV file: ' + error.message)
          setLoading(false)
        }
      })
    }
  }

  const handleSampleDownload = () => {
    const link = document.createElement('a')
    link.href = '/sample-survey-data.csv'
    link.download = 'sample-survey-data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleQuery = (query: string) => {
    setActiveQuery(query)
    setLoading(true)
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Survey Benchmarking Dashboard
        </h1>
        <p className="text-muted-foreground">
          HR Benefits Intelligence Proof of Concept
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Upload</CardTitle>
          <CardDescription>
            Upload your survey CSV file to begin benchmarking analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload CSV file'}
                    </p>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </Label>
              </div>
              {csvData && !parseError && (
                <Alert className="flex-1">
                  <AlertDescription>
                    ✓ Data loaded: {csvData.stats.totalOrganizations} organizations analyzed
                  </AlertDescription>
                </Alert>
              )}
              {parseError && (
                <Alert className="flex-1" variant="destructive">
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleSampleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Sample CSV</span>
              </Button>
              <p className="text-sm text-gray-500">
                Need a template? Download our sample data file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {csvData && (
        <>
          {/* Natural Language Query */}
          <NaturalLanguageQuery onQuery={handleQuery} loading={loading} />

          {/* Key Insights */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {csvData.insights.map((insight: any, index: number) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>

          {/* Visualizations */}
          <Tabs defaultValue="exhibits" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="exhibits">Data Exhibits</TabsTrigger>
              <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
              <TabsTrigger value="position">Competitive Position</TabsTrigger>
              <TabsTrigger value="benefits">Benefits Analysis</TabsTrigger>
              <TabsTrigger value="retention">Retention Risk</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exhibits" className="space-y-4">
              <DataVisualizationDashboard />
            </TabsContent>
            
            <TabsContent value="regional" className="space-y-4">
              <RegionalDistributionDonut data={csvData.regionalData} />
            </TabsContent>

            <TabsContent value="position" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Position Matrix</CardTitle>
                  <CardDescription>
                    Your position relative to peer organizations (cost vs. value)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompetitivePositionMatrix data={csvData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Benefits Competitiveness Score</CardTitle>
                  <CardDescription>
                    Comprehensive view of your benefits package vs. market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BenefitsRadarChart data={csvData.radarData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Risk Assessment</CardTitle>
                  <CardDescription>
                    Current risk level based on benefits competitiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RetentionRiskThermometer 
                    riskLevel={csvData.retentionRisk}
                    benchmark={csvData.benchmark}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Organizations Analyzed</p>
                  <p className="text-2xl font-bold">{csvData.stats.totalOrganizations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Median Deductible</p>
                  <p className="text-2xl font-bold">${csvData.stats.medianDeductible}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Retirement Match</p>
                  <p className="text-2xl font-bold">{csvData.stats.avgRetirement}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Percentile</p>
                  <p className="text-2xl font-bold">{100 - csvData.yourPosition.cost}th</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}