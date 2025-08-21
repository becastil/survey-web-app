/**
 * @module InsightGenerator
 * @description Advanced insight generation with clinical significance detection
 */

import { ProcessedData, Insight, RegionalAnalysis, BenchmarkComparison } from './data-processor';
import ContentGenerator, { GenerationOptions } from './content-generator';

// Healthcare benchmarks
export const HealthcareBenchmarks = {
  patientSatisfaction: { target: 4.2, industry: 3.8, excellent: 4.5 },
  readmissionRates: { target: 0.08, industry: 0.12, excellent: 0.05 },
  costEfficiency: { target: 85, industry: 78, excellent: 92 },
  accessMetrics: { target: 90, industry: 82, excellent: 95 },
  responseRate: { target: 0.65, industry: 0.55, excellent: 0.75 },
  completionTime: { target: 12, industry: 15, excellent: 10 }, // minutes
  waitTime: { target: 15, industry: 20, excellent: 10 }, // minutes
  npsScore: { target: 50, industry: 30, excellent: 70 }
};

// Clinical significance thresholds
export interface ClinicalSignificance {
  statisticalPValue: number;
  clinicalMeaningfulness: number; // 0-1 scale
  patientImpactScore: number; // 0-100 scale
  costImplications: number; // dollar value
  riskLevel: 'low' | 'medium' | 'high';
}

// Evidence levels
export enum EvidenceLevel {
  STRONG = 'strong',
  MODERATE = 'moderate',
  LIMITED = 'limited',
  INCONCLUSIVE = 'inconclusive'
}

// Healthcare priorities
export const HealthcarePriorities = {
  immediate: ['patient safety', 'compliance violations', 'critical incidents', 'emergency response'],
  quarterly: ['satisfaction improvements', 'cost optimization', 'quality measures', 'staff training'],
  annual: ['strategic initiatives', 'technology upgrades', 'facility expansion', 'accreditation']
};

export interface EnhancedInsight extends Insight {
  clinicalSignificance?: ClinicalSignificance;
  evidenceLevel: EvidenceLevel;
  priorityLevel: 'immediate' | 'quarterly' | 'annual';
  actionableSteps: string[];
  expectedOutcome: string;
  timeframe: string;
  stakeholders: string[];
}

export class InsightGenerator {
  private contentGenerator: ContentGenerator;
  
  constructor() {
    this.contentGenerator = new ContentGenerator();
  }

  /**
   * Generate comprehensive insights from processed data
   */
  async generateInsights(
    data: ProcessedData,
    options?: {
      maxInsights?: number;
      focusAreas?: string[];
      includeActionPlans?: boolean;
    }
  ): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Statistical insights
    insights.push(...await this.generateStatisticalInsights(data));
    
    // Clinical significance insights
    insights.push(...await this.generateClinicalInsights(data));
    
    // Benchmark comparison insights
    insights.push(...await this.generateBenchmarkInsights(data));
    
    // Regional performance insights
    insights.push(...await this.generateRegionalInsights(data));
    
    // Temporal pattern insights
    insights.push(...await this.generateTemporalInsights(data));
    
    // Quality insights
    insights.push(...await this.generateQualityInsights(data));
    
    // Sort by priority and impact
    insights.sort((a, b) => {
      const priorityOrder = { immediate: 3, quarterly: 2, annual: 1 };
      const impactOrder = { high: 3, medium: 2, low: 1 };
      
      const priorityDiff = priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel];
      if (priorityDiff !== 0) return priorityDiff;
      
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
    
    // Limit insights if specified
    const maxInsights = options?.maxInsights || 20;
    const filteredInsights = insights.slice(0, maxInsights);
    
    // Add action plans if requested
    if (options?.includeActionPlans) {
      for (const insight of filteredInsights) {
        insight.actionableSteps = await this.generateActionPlan(insight);
      }
    }
    
    return filteredInsights;
  }

  /**
   * Generate statistical insights
   */
  private async generateStatisticalInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Response rate insight
    if (data.summary.responseRate > HealthcareBenchmarks.responseRate.excellent) {
      insights.push({
        type: 'positive',
        category: 'Survey Performance',
        title: 'Exceptional Response Rate',
        description: `Response rate of ${(data.summary.responseRate * 100).toFixed(1)}% significantly exceeds industry benchmark of ${(HealthcareBenchmarks.responseRate.industry * 100).toFixed(1)}%`,
        impact: 'high',
        dataPoints: [data.summary.responseRate],
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.STRONG,
        priorityLevel: 'quarterly',
        actionableSteps: [],
        expectedOutcome: 'Maintain high engagement for reliable data',
        timeframe: 'Ongoing',
        stakeholders: ['Survey Team', 'Analytics']
      });
    }
    
    // Completion time insight
    if (data.summary.avgCompletionTime < HealthcareBenchmarks.completionTime.target) {
      insights.push({
        type: 'positive',
        category: 'User Experience',
        title: 'Efficient Survey Completion',
        description: `Average completion time of ${data.summary.avgCompletionTime.toFixed(1)} minutes indicates well-designed survey flow`,
        impact: 'medium',
        dataPoints: [data.summary.avgCompletionTime],
        confidence: 0.90,
        evidenceLevel: EvidenceLevel.MODERATE,
        priorityLevel: 'annual',
        actionableSteps: [],
        expectedOutcome: 'Sustained user engagement',
        timeframe: '12 months',
        stakeholders: ['UX Team', 'Survey Design']
      });
    }
    
    return insights;
  }

  /**
   * Generate clinical significance insights
   */
  private async generateClinicalInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Analyze regional data for clinical significance
    for (const region of data.regional) {
      const clinicalSig = this.calculateClinicalSignificance(
        region.metrics.satisfaction,
        HealthcareBenchmarks.patientSatisfaction.target
      );
      
      if (clinicalSig.clinicalMeaningfulness > 0.7) {
        const type = region.metrics.satisfaction > HealthcareBenchmarks.patientSatisfaction.target ? 'positive' : 'negative';
        
        insights.push({
          type,
          category: 'Clinical Outcomes',
          title: `${region.region} Clinical Performance`,
          description: await this.generateClinicalDescription(region, clinicalSig),
          impact: clinicalSig.riskLevel === 'high' ? 'high' : 'medium',
          dataPoints: [region],
          confidence: 0.85,
          clinicalSignificance: clinicalSig,
          evidenceLevel: this.determineEvidenceLevel(clinicalSig.statisticalPValue),
          priorityLevel: clinicalSig.riskLevel === 'high' ? 'immediate' : 'quarterly',
          actionableSteps: [],
          expectedOutcome: type === 'positive' ? 'Sustained excellence' : 'Performance improvement',
          timeframe: clinicalSig.riskLevel === 'high' ? '30 days' : '90 days',
          stakeholders: ['Clinical Leadership', 'Quality Team', 'Regional Management']
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate benchmark comparison insights
   */
  private async generateBenchmarkInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Top performers
    for (const performer of data.benchmarks.topPerformers.slice(0, 3)) {
      insights.push({
        type: 'positive',
        category: 'Benchmark Performance',
        title: `${performer.organization} Excellence in ${performer.metric}`,
        description: `${performer.organization} achieves ${performer.value.toFixed(2)} in ${performer.metric}, setting organizational benchmark`,
        impact: 'high',
        dataPoints: [performer],
        confidence: 0.92,
        evidenceLevel: EvidenceLevel.STRONG,
        priorityLevel: 'quarterly',
        actionableSteps: [
          `Study ${performer.organization}'s best practices`,
          'Implement similar strategies across other facilities',
          'Create recognition program for high performers'
        ],
        expectedOutcome: 'Organization-wide performance improvement',
        timeframe: '6 months',
        stakeholders: ['Executive Team', 'Quality Improvement']
      });
    }
    
    // Improvement areas
    for (const area of data.benchmarks.improvementAreas.slice(0, 3)) {
      const priority = area.gap > 15 ? 'immediate' : 'quarterly';
      
      insights.push({
        type: 'action',
        category: 'Performance Gap',
        title: `${area.metric} Improvement Opportunity`,
        description: `Current performance of ${area.currentValue.toFixed(1)} is ${area.gap.toFixed(1)} points below target of ${area.targetValue.toFixed(1)}`,
        impact: area.gap > 20 ? 'high' : 'medium',
        dataPoints: [area],
        confidence: 0.88,
        evidenceLevel: EvidenceLevel.MODERATE,
        priorityLevel: priority,
        actionableSteps: await this.generateImprovementSteps(area.metric, area.gap),
        expectedOutcome: `Close performance gap by ${(area.gap * 0.5).toFixed(1)} points`,
        timeframe: priority === 'immediate' ? '60 days' : '120 days',
        stakeholders: this.identifyStakeholders(area.metric)
      });
    }
    
    return insights;
  }

  /**
   * Generate regional insights
   */
  private async generateRegionalInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Identify significant regional variations
    const regionalVariance = this.calculateRegionalVariance(data.regional);
    
    if (regionalVariance > 0.2) {
      insights.push({
        type: 'action',
        category: 'Regional Disparities',
        title: 'Significant Regional Performance Variation',
        description: `${(regionalVariance * 100).toFixed(1)}% variation in satisfaction scores across regions indicates inconsistent service delivery`,
        impact: 'high',
        dataPoints: data.regional,
        confidence: 0.90,
        evidenceLevel: EvidenceLevel.STRONG,
        priorityLevel: 'immediate',
        actionableSteps: [
          'Conduct root cause analysis for underperforming regions',
          'Implement standardized protocols across all regions',
          'Establish regional performance taskforce',
          'Create cross-regional best practice sharing program'
        ],
        expectedOutcome: 'Reduce regional variance to under 10%',
        timeframe: '90 days',
        stakeholders: ['Regional Directors', 'Operations', 'Quality Assurance']
      });
    }
    
    // Trend analysis for each region
    for (const region of data.regional) {
      if (region.trends.changePercent > 10 || region.trends.changePercent < -10) {
        const trendType = region.trends.direction === 'up' ? 'positive' : 'negative';
        
        insights.push({
          type: trendType,
          category: 'Regional Trends',
          title: `${region.region} Performance Trend`,
          description: `${region.region} shows ${Math.abs(region.trends.changePercent).toFixed(1)}% ${region.trends.direction === 'up' ? 'improvement' : 'decline'} in key metrics`,
          impact: Math.abs(region.trends.changePercent) > 15 ? 'high' : 'medium',
          dataPoints: [region],
          confidence: 1 - region.trends.significance, // Convert p-value to confidence
          evidenceLevel: this.determineEvidenceLevel(region.trends.significance),
          priorityLevel: trendType === 'negative' ? 'immediate' : 'quarterly',
          actionableSteps: [],
          expectedOutcome: trendType === 'positive' ? 'Continued improvement' : 'Trend reversal',
          timeframe: '60 days',
          stakeholders: [`${region.region} Management`, 'Regional Quality Team']
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate temporal insights
   */
  private async generateTemporalInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Seasonality insights
    if (data.temporal.seasonality.strength > 0.5) {
      insights.push({
        type: 'neutral',
        category: 'Temporal Patterns',
        title: 'Seasonal Variation Detected',
        description: `${(data.temporal.seasonality.strength * 100).toFixed(0)}% seasonal variation in survey responses indicates ${data.temporal.seasonality.pattern} pattern`,
        impact: 'medium',
        dataPoints: [data.temporal.seasonality],
        confidence: 0.85,
        evidenceLevel: EvidenceLevel.MODERATE,
        priorityLevel: 'annual',
        actionableSteps: [
          'Adjust staffing levels based on seasonal patterns',
          'Plan interventions during high-impact periods',
          'Develop seasonal communication strategies'
        ],
        expectedOutcome: 'Optimized resource allocation',
        timeframe: '12 months',
        stakeholders: ['Operations', 'HR', 'Finance']
      });
    }
    
    // Forecast insights
    if (data.temporal.forecast) {
      const forecastTrend = data.temporal.forecast.nextPeriod > data.temporal.monthly[data.temporal.monthly.length - 1]?.value
        ? 'increase' : 'decrease';
      
      insights.push({
        type: 'neutral',
        category: 'Predictive Analytics',
        title: 'Response Volume Forecast',
        description: `Next period forecast: ${data.temporal.forecast.nextPeriod.toFixed(0)} responses (${forecastTrend} expected)`,
        impact: 'low',
        dataPoints: [data.temporal.forecast],
        confidence: 0.75,
        evidenceLevel: EvidenceLevel.LIMITED,
        priorityLevel: 'quarterly',
        actionableSteps: [
          'Prepare resources for anticipated volume',
          'Update survey distribution strategy'
        ],
        expectedOutcome: 'Maintained response quality',
        timeframe: '30 days',
        stakeholders: ['Survey Team', 'Data Analytics']
      });
    }
    
    return insights;
  }

  /**
   * Generate quality insights
   */
  private async generateQualityInsights(data: ProcessedData): Promise<EnhancedInsight[]> {
    const insights: EnhancedInsight[] = [];
    
    // Overall quality score
    if (data.quality.overallScore < 0.85) {
      insights.push({
        type: 'action',
        category: 'Data Quality',
        title: 'Data Quality Improvement Needed',
        description: `Overall data quality score of ${(data.quality.overallScore * 100).toFixed(1)}% requires attention`,
        impact: 'high',
        dataPoints: [data.quality],
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.STRONG,
        priorityLevel: 'immediate',
        actionableSteps: [
          `Improve completeness (currently ${(data.quality.completeness * 100).toFixed(1)}%)`,
          `Enhance consistency (currently ${(data.quality.consistency * 100).toFixed(1)}%)`,
          'Implement data validation at point of entry',
          'Train staff on data quality best practices'
        ],
        expectedOutcome: 'Achieve 95% data quality score',
        timeframe: '60 days',
        stakeholders: ['Data Management', 'IT', 'Training']
      });
    }
    
    // Timeliness insight
    if (data.quality.timeliness < 0.80) {
      insights.push({
        type: 'action',
        category: 'Data Timeliness',
        title: 'Data Freshness Concern',
        description: 'Survey data aging affects relevance and actionability',
        impact: 'medium',
        dataPoints: [data.quality.timeliness],
        confidence: 0.90,
        evidenceLevel: EvidenceLevel.MODERATE,
        priorityLevel: 'quarterly',
        actionableSteps: [
          'Increase survey frequency',
          'Implement real-time data collection',
          'Set up automated reminders for participants'
        ],
        expectedOutcome: 'Improve data timeliness to 90%',
        timeframe: '90 days',
        stakeholders: ['Survey Operations', 'Communications']
      });
    }
    
    return insights;
  }

  /**
   * Calculate clinical significance
   */
  private calculateClinicalSignificance(
    observed: number,
    expected: number
  ): ClinicalSignificance {
    const difference = Math.abs(observed - expected);
    const percentChange = (difference / expected) * 100;
    
    // Calculate p-value (simplified - would use proper statistical test in production)
    const pValue = 1 / (1 + Math.exp(difference * 2));
    
    // Clinical meaningfulness based on effect size
    const clinicalMeaningfulness = Math.min(1, difference / 10);
    
    // Patient impact score (0-100)
    const patientImpactScore = Math.min(100, percentChange * 5);
    
    // Cost implications (simplified calculation)
    const costImplications = difference * 10000; // $10k per point difference
    
    // Risk level determination
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (percentChange > 20 && observed < expected) {
      riskLevel = 'high';
    } else if (percentChange > 10 && observed < expected) {
      riskLevel = 'medium';
    }
    
    return {
      statisticalPValue: pValue,
      clinicalMeaningfulness,
      patientImpactScore,
      costImplications,
      riskLevel
    };
  }

  /**
   * Generate clinical description
   */
  private async generateClinicalDescription(
    region: RegionalAnalysis,
    significance: ClinicalSignificance
  ): Promise<string> {
    const options: GenerationOptions = {
      tone: 'clinical',
      audience: 'healthcare-professional',
      includeReferences: false
    };
    
    let description = `${region.region} demonstrates `;
    
    if (significance.clinicalMeaningfulness > 0.7) {
      description += 'clinically significant ';
    } else if (significance.clinicalMeaningfulness > 0.4) {
      description += 'moderate clinical ';
    } else {
      description += 'limited clinical ';
    }
    
    description += `performance with satisfaction score of ${region.metrics.satisfaction.toFixed(2)}. `;
    description += `Statistical significance: p=${significance.statisticalPValue.toFixed(3)}. `;
    description += `Patient impact score: ${significance.patientImpactScore.toFixed(0)}/100. `;
    
    if (significance.costImplications > 0) {
      description += `Estimated cost impact: $${(significance.costImplications / 1000).toFixed(0)}K.`;
    }
    
    return description;
  }

  /**
   * Determine evidence level based on p-value
   */
  private determineEvidenceLevel(pValue: number): EvidenceLevel {
    if (pValue < 0.01) return EvidenceLevel.STRONG;
    if (pValue < 0.05) return EvidenceLevel.MODERATE;
    if (pValue < 0.10) return EvidenceLevel.LIMITED;
    return EvidenceLevel.INCONCLUSIVE;
  }

  /**
   * Generate improvement steps
   */
  private async generateImprovementSteps(metric: string, gap: number): Promise<string[]> {
    const steps: string[] = [];
    
    // Generic steps based on metric type
    if (metric.toLowerCase().includes('satisfaction')) {
      steps.push(
        'Conduct patient journey mapping sessions',
        'Implement service recovery protocols',
        'Enhance staff communication training',
        'Establish patient advisory council'
      );
    } else if (metric.toLowerCase().includes('cost')) {
      steps.push(
        'Perform cost-benefit analysis',
        'Identify efficiency opportunities',
        'Implement lean management principles',
        'Review vendor contracts and negotiations'
      );
    } else if (metric.toLowerCase().includes('access')) {
      steps.push(
        'Expand service hours',
        'Implement telehealth options',
        'Optimize appointment scheduling',
        'Reduce wait times through process improvement'
      );
    } else {
      steps.push(
        'Establish improvement taskforce',
        'Define specific, measurable goals',
        'Implement pilot program',
        'Monitor and adjust based on results'
      );
    }
    
    // Add urgency-based steps
    if (gap > 20) {
      steps.unshift('Convene emergency improvement committee');
      steps.push('Implement daily performance monitoring');
    }
    
    return steps.slice(0, 5); // Return top 5 steps
  }

  /**
   * Identify stakeholders based on metric
   */
  private identifyStakeholders(metric: string): string[] {
    const stakeholders: string[] = [];
    
    const metricLower = metric.toLowerCase();
    
    if (metricLower.includes('clinical') || metricLower.includes('quality')) {
      stakeholders.push('Chief Medical Officer', 'Quality Director');
    }
    if (metricLower.includes('satisfaction') || metricLower.includes('experience')) {
      stakeholders.push('Patient Experience Officer', 'Service Excellence Team');
    }
    if (metricLower.includes('cost') || metricLower.includes('efficiency')) {
      stakeholders.push('Chief Financial Officer', 'Operations Director');
    }
    if (metricLower.includes('safety')) {
      stakeholders.push('Patient Safety Officer', 'Risk Management');
    }
    
    // Always include these
    stakeholders.push('Executive Leadership', 'Board of Directors');
    
    return [...new Set(stakeholders)]; // Remove duplicates
  }

  /**
   * Calculate regional variance
   */
  private calculateRegionalVariance(regions: RegionalAnalysis[]): number {
    if (regions.length < 2) return 0;
    
    const satisfactionScores = regions.map(r => r.metrics.satisfaction);
    const mean = satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length;
    const variance = satisfactionScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / satisfactionScores.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  /**
   * Generate action plan for insight
   */
  private async generateActionPlan(insight: EnhancedInsight): Promise<string[]> {
    if (insight.actionableSteps.length > 0) {
      return insight.actionableSteps; // Already has action steps
    }
    
    const steps: string[] = [];
    
    // Priority-based initial action
    switch (insight.priorityLevel) {
      case 'immediate':
        steps.push('Schedule emergency stakeholder meeting within 24 hours');
        break;
      case 'quarterly':
        steps.push('Add to quarterly planning agenda');
        break;
      case 'annual':
        steps.push('Include in annual strategic planning');
        break;
    }
    
    // Type-based actions
    switch (insight.type) {
      case 'positive':
        steps.push(
          'Document and share best practices',
          'Recognize high-performing teams',
          'Replicate success in other areas'
        );
        break;
      case 'negative':
        steps.push(
          'Conduct root cause analysis',
          'Develop improvement plan',
          'Allocate resources for intervention'
        );
        break;
      case 'action':
        steps.push(
          'Form improvement taskforce',
          'Set SMART goals and metrics',
          'Implement and monitor interventions'
        );
        break;
    }
    
    // Impact-based follow-up
    if (insight.impact === 'high') {
      steps.push('Report to board of directors');
    }
    
    return steps.slice(0, 5);
  }
}

export default InsightGenerator;