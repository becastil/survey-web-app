import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function categorizeSize(employeeCount: string): string {
  const count = parseInt(employeeCount)
  if (count < 1000) return "100 - 999"
  if (count < 2500) return "1,000 - 2,499"
  if (count < 5000) return "2,500 - 4,999"
  if (count < 10000) return "5,000 - 9,999"
  if (count < 20000) return "10,000 - 19,999"
  return "20,000+"
}

function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const records = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const record: any = {}
    headers.forEach((header, index) => {
      record[header] = values[index] || ''
    })
    records.push(record)
  }
  
  return records
}

export async function GET() {
  try {
    // Read the sample CSV file
    const csvPath = path.join(process.cwd(), 'public', 'sample-survey-data.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records = parseCSV(fileContent)
    
    // Process regional distribution
    const regionCounts: Record<string, number> = {}
    const sizeCounts: Record<string, number> = {
      "100 - 999": 0,
      "1,000 - 2,499": 0,
      "2,500 - 4,999": 0,
      "5,000 - 9,999": 0,
      "10,000 - 19,999": 0,
      "20,000+": 0
    }
    
    records.forEach((row: any) => {
      // Count regions
      const region = row['General Information - Location Represented']
      if (region) {
        regionCounts[region] = (regionCounts[region] || 0) + 1
      }
      
      // Count size bands
      const employeeCount = row['General Information - Number of Employees']
      if (employeeCount) {
        const sizeBand = categorizeSize(employeeCount)
        sizeCounts[sizeBand]++
      }
    })
    
    const total = records.length
    
    // Format regional data
    const regionalData = Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    // Format size band data
    const sizeData = Object.entries(sizeCounts)
      .map(([band, count]) => ({
        band,
        count,
        percentage: Math.round((count / total) * 100)
      }))
    
    // Calculate metrics
    const deductibles = records
      .map((r: any) => parseFloat(r['Medical Plan Design Details (PPO) - Annual Deductible Individual In-Network']))
      .filter((n: number) => !isNaN(n))
    
    const retirementMatches = records
      .map((r: any) => parseFloat(r['Retirement Benefits - Employer Match Maximum Percentage']))
      .filter((n: number) => !isNaN(n))
    
    const median = (arr: number[]) => {
      if (arr.length === 0) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }
    
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    
    return NextResponse.json({
      success: true,
      regional: {
        data: regionalData,
        total,
        topRegion: regionalData[0]?.region || null,
        topRegionPercentage: regionalData[0]?.percentage || 0
      },
      sizeBand: {
        data: sizeData,
        total,
        largestBand: sizeData.reduce((max, item) => item.count > max.count ? item : max, sizeData[0])?.band || null
      },
      metrics: {
        medianDeductible: Math.round(median(deductibles)),
        avgDeductible: Math.round(avg(deductibles)),
        medianRetirement: Math.round(median(retirementMatches) * 10) / 10,
        avgRetirement: Math.round(avg(retirementMatches) * 10) / 10
      },
      metadata: {
        totalOrganizations: total,
        dataSource: 'sample-survey-data.csv'
      }
    })
  } catch (error) {
    console.error('Error processing CSV:', error)
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    )
  }
}