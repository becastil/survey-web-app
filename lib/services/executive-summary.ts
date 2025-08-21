/**
 * @module ExecutiveSummaryWriter
 * @description Strategic narrative generation with ROI calculations for C-suite
 */

import { ProcessedData } from './data-processor';
import { EnhancedInsight } from './insight-generator';
import ContentGenerator, { GenerationOptions } from './content-generator';

// Healthcare ROI metrics
export interface HealthcareROI {
  qualityImprovements: number; // Percentage improvement
  costSavings: number; // Dollar amount
  riskMitigation: number; // Risk score reduction (0-100)
  complianceValue: number; // Compliance score improvement
  patientSatisfactionGain: number; // Points gained
  operationalEfficiency: number; // Percentage improvement
  
  totalValue: number; // Combined dollar value
  paybackPeriod: number; // Months
  roi: number; // Return on investment percentage
}

// Strategic priorities
export interface StrategicPriority {
  category: 'immediate' | 'quarterly' | 'annual';
  items: PriorityItem[];
}

export interface PriorityItem {
  title: string;
  impact: 'transformational' | 'significant' | 'moderate' | 'incremental';
  effort: 'low' | 'medium' | 'high';
  cost: number;
  timeline: string;
  owner: string;
  dependencies: string[];
}

// Executive summary structure
export interface ExecutiveSummary {
  headline: string;
  keyTakeaways: string[];
  strategicNarrative: string;
  roiAnalysis: HealthcareROI;
  priorities: StrategicPriority[];
  callToAction: string;
  riskAssessment: RiskAssessment;
  competitivePosition: string;
  nextSteps: string[];
}

export interface RiskAssessment {
  identifiedRisks: Risk[];
  mitigationStrategies: string[];
  residualRisk: number; // 0-100
}

export interface Risk {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export class ExecutiveSummaryWriter {
  private contentGenerator: ContentGenerator;
  
  constructor() {
    this.contentGenerator = new ContentGenerator();
  }

  /**
   * Generate complete executive summary
   */
  async generateExecutiveSummary(
    data: ProcessedData,
    insights: EnhancedInsight[],
    options?: {
      focusArea?: string;
      includeFinancials?: boolean;
      tone?: 'optimistic' | 'balanced' | 'cautious';
    }
  ): Promise<ExecutiveSummary> {
    // Generate headline
    const headline = await this.generateHeadline(data, insights, options?.tone);
    
    // Extract key takeaways
    const keyTakeaways = await this.generateKeyTakeaways(insights);
    
    // Create strategic narrative
    const strategicNarrative = await this.generateStrategicNarrative(
      data,
      insights,
      options?.focusArea
    );
    
    // Calculate ROI
    const roiAnalysis = await this.calculateHealthcareROI(data, insights);
    
    // Prioritize initiatives
    const priorities = await this.generateStrategicPriorities(insights);
    
    // Generate call to action
    const callToAction = await this.generateCallToAction(insights, priorities);
    
    // Assess risks
    const riskAssessment = await this.assessRisks(data, insights);
    
    // Evaluate competitive position
    const competitivePosition = await this.evaluateCompetitivePosition(data);
    
    // Define next steps
    const nextSteps = await this.generateNextSteps(priorities);
    
    return {
      headline,
      keyTakeaways,
      strategicNarrative,
      roiAnalysis,
      priorities,
      callToAction,
      riskAssessment,
      competitivePosition,
      nextSteps
    };
  }

  /**
   * Generate executive headline
   */
  private async generateHeadline(
    data: ProcessedData,
    insights: EnhancedInsight[],
    tone?: 'optimistic' | 'balanced' | 'cautious'
  ): Promise<string> {
    const positiveInsights = insights.filter(i => i.type === 'positive').length;
    const totalInsights = insights.length;
    const positiveRatio = positiveInsights / totalInsights;
    
    const headlines = {
      optimistic: [
        'Strategic Excellence: Healthcare Performance Exceeds Benchmarks',
        'Transformational Progress in Patient Care and Operational Efficiency',
        'Leading the Market: Superior Outcomes Drive Competitive Advantage'
      ],
      balanced: [
        'Healthcare Performance Analysis: Strengths and Opportunities Identified',
        'Strategic Assessment Reveals Mixed Results with Clear Path Forward',
        'Comprehensive Review Highlights Progress and Areas for Investment'
      ],
      cautious: [
        'Performance Review Indicates Need for Strategic Intervention',
        'Critical Gaps Identified Requiring Executive Action',
        'Urgent Priorities Emerge from Comprehensive Assessment'
      ]
    };
    
    const selectedTone = tone || (positiveRatio > 0.6 ? 'optimistic' : positiveRatio > 0.4 ? 'balanced' : 'cautious');
    const headlineOptions = headlines[selectedTone];
    
    return headlineOptions[Math.floor(Math.random() * headlineOptions.length)];
  }

  /**
   * Generate key takeaways
   */
  private async generateKeyTakeaways(insights: EnhancedInsight[]): Promise<string[]> {
    const takeaways: string[] = [];
    
    // Top positive insight
    const topPositive = insights.find(i => i.type === 'positive' && i.impact === 'high');
    if (topPositive) {
      takeaways.push(`✓ ${topPositive.title}: ${topPositive.description}`);
    }
    
    // Critical action item
    const criticalAction = insights.find(i => i.type === 'action' && i.priorityLevel === 'immediate');
    if (criticalAction) {
      takeaways.push(`⚡ Immediate Action Required: ${criticalAction.title}`);
    }
    
    // Biggest opportunity
    const opportunity = insights.find(i => i.type === 'negative' && i.impact === 'high');
    if (opportunity) {
      takeaways.push(`📈 Growth Opportunity: ${opportunity.expectedOutcome}`);
    }
    
    // Financial impact
    const financialImpact = insights
      .filter(i => i.clinicalSignificance?.costImplications)
      .reduce((sum, i) => sum + (i.clinicalSignificance?.costImplications || 0), 0);
    
    if (financialImpact > 0) {
      takeaways.push(`💰 Potential Cost Impact: $${(financialImpact / 1000000).toFixed(1)}M`);
    }
    
    // Quality metric
    const qualityInsight = insights.find(i => i.category.includes('Quality') || i.category.includes('Clinical'));
    if (qualityInsight) {
      takeaways.push(`🏥 Quality Performance: ${qualityInsight.description}`);
    }
    
    return takeaways.slice(0, 5); // Top 5 takeaways
  }

  /**
   * Generate strategic narrative
   */
  private async generateStrategicNarrative(
    data: ProcessedData,
    insights: EnhancedInsight[],
    focusArea?: string
  ): Promise<string> {
    const options: GenerationOptions = {
      tone: 'executive',
      audience: 'c-suite',
      maxLength: 500
    };
    
    let narrative = '';
    
    // Opening context
    narrative += `Based on analysis of ${data.summary.totalResponses.toLocaleString()} responses across ${data.summary.uniqueOrganizations} facilities, `;
    narrative += `our organization demonstrates ${this.assessOverallPerformance(insights)} performance with clear strategic imperatives.\n\n`;
    
    // Performance summary
    const performanceMetrics = this.summarizePerformance(data);
    narrative += `Key performance indicators show ${performanceMetrics}. `;
    
    // Focus area analysis
    if (focusArea) {
      const focusInsights = insights.filter(i => i.category.toLowerCase().includes(focusArea.toLowerCase()));
      if (focusInsights.length > 0) {
        narrative += `\n\nFocus Area Analysis (${focusArea}):\n`;
        narrative += `${focusInsights.length} critical insights identified with ${focusInsights.filter(i => i.priorityLevel === 'immediate').length} requiring immediate attention. `;
      }
    }
    
    // Strategic implications
    narrative += '\n\nStrategic Implications:\n';
    const implications = this.identifyStrategicImplications(insights);
    for (const implication of implications.slice(0, 3)) {
      narrative += `• ${implication}\n`;
    }
    
    // Competitive advantage
    const competitiveEdge = this.assessCompetitiveAdvantage(data);
    narrative += `\n${competitiveEdge}`;
    
    return narrative;
  }

  /**
   * Calculate healthcare ROI
   */
  private async calculateHealthcareROI(
    data: ProcessedData,
    insights: EnhancedInsight[]
  ): Promise<HealthcareROI> {
    // Quality improvements
    const qualityImprovements = this.calculateQualityImprovements(data, insights);
    
    // Cost savings
    const costSavings = this.calculateCostSavings(insights);
    
    // Risk mitigation value
    const riskMitigation = this.calculateRiskMitigation(insights);
    
    // Compliance value
    const complianceValue = this.calculateComplianceValue(data);
    
    // Patient satisfaction gains
    const patientSatisfactionGain = this.calculateSatisfactionGains(data);
    
    // Operational efficiency
    const operationalEfficiency = this.calculateOperationalEfficiency(data);
    
    // Total value calculation
    const totalValue = costSavings + 
                      (qualityImprovements * 100000) + // $100k per quality point
                      (riskMitigation * 50000) + // $50k per risk point
                      (complianceValue * 75000) + // $75k per compliance point
                      (patientSatisfactionGain * 200000); // $200k per satisfaction point
    
    // Payback period (assuming $500k investment)
    const investmentAmount = 500000;
    const monthlyReturn = totalValue / 12;
    const paybackPeriod = investmentAmount / monthlyReturn;
    
    // ROI calculation
    const roi = ((totalValue - investmentAmount) / investmentAmount) * 100;
    
    return {
      qualityImprovements,
      costSavings,
      riskMitigation,
      complianceValue,
      patientSatisfactionGain,
      operationalEfficiency,
      totalValue,
      paybackPeriod,
      roi
    };
  }

  /**
   * Generate strategic priorities
   */
  private async generateStrategicPriorities(
    insights: EnhancedInsight[]
  ): Promise<StrategicPriority[]> {
    const priorities: StrategicPriority[] = [
      { category: 'immediate', items: [] },
      { category: 'quarterly', items: [] },
      { category: 'annual', items: [] }
    ];
    
    // Group insights by priority
    for (const insight of insights) {
      const priority = priorities.find(p => p.category === insight.priorityLevel);
      if (priority) {
        priority.items.push({
          title: insight.title,
          impact: this.determineImpactLevel(insight.impact),
          effort: this.estimateEffort(insight),
          cost: this.estimateCost(insight),
          timeline: insight.timeframe,
          owner: this.assignOwner(insight),
          dependencies: this.identifyDependencies(insight)
        });
      }
    }
    
    // Sort items within each priority by impact
    for (const priority of priorities) {
      priority.items.sort((a, b) => {
        const impactOrder = { transformational: 4, significant: 3, moderate: 2, incremental: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      });
      
      // Limit to top 5 per category
      priority.items = priority.items.slice(0, 5);
    }
    
    return priorities;
  }

  /**
   * Generate call to action
   */
  private async generateCallToAction(
    insights: EnhancedInsight[],
    priorities: StrategicPriority[]
  ): Promise<string> {
    const immediateItems = priorities.find(p => p.category === 'immediate')?.items || [];
    const highImpactCount = insights.filter(i => i.impact === 'high').length;
    
    if (immediateItems.length > 3) {
      return `URGENT: ${immediateItems.length} critical initiatives require immediate executive approval and resource allocation. Convene emergency leadership meeting within 48 hours to authorize action plans and assign accountability.`;
    } else if (highImpactCount > 5) {
      return `STRATEGIC IMPERATIVE: ${highImpactCount} high-impact opportunities identified. Schedule strategic planning session to prioritize initiatives and allocate FY resources for maximum ROI.`;
    } else {
      return `OPPORTUNITY: Analysis reveals balanced performance with selective improvement opportunities. Review quarterly priorities and integrate into existing strategic roadmap for sustained excellence.`;
    }
  }

  /**
   * Assess risks
   */
  private async assessRisks(
    data: ProcessedData,
    insights: EnhancedInsight[]
  ): Promise<RiskAssessment> {
    const identifiedRisks: Risk[] = [];
    
    // Compliance risks
    if (data.quality.overallScore < 0.85) {
      identifiedRisks.push({
        category: 'Compliance',
        description: 'Data quality issues may impact regulatory reporting accuracy',
        likelihood: 'medium',
        impact: 'high',
        mitigation: 'Implement automated data validation and quality monitoring'
      });
    }
    
    // Operational risks
    const negativeInsights = insights.filter(i => i.type === 'negative');
    if (negativeInsights.length > 3) {
      identifiedRisks.push({
        category: 'Operational',
        description: 'Multiple performance gaps indicate systemic operational challenges',
        likelihood: 'high',
        impact: 'medium',
        mitigation: 'Deploy cross-functional improvement teams with executive sponsorship'
      });
    }
    
    // Financial risks
    const costImplications = insights
      .filter(i => i.clinicalSignificance?.costImplications)
      .reduce((sum, i) => sum + (i.clinicalSignificance?.costImplications || 0), 0);
    
    if (costImplications > 1000000) {
      identifiedRisks.push({
        category: 'Financial',
        description: `Potential cost exposure of $${(costImplications / 1000000).toFixed(1)}M identified`,
        likelihood: 'medium',
        impact: 'high',
        mitigation: 'Develop cost containment strategy with CFO oversight'
      });
    }
    
    // Reputational risks
    const satisfactionIssues = insights.filter(i => 
      i.category.includes('Satisfaction') && i.type === 'negative'
    );
    
    if (satisfactionIssues.length > 0) {
      identifiedRisks.push({
        category: 'Reputational',
        description: 'Patient satisfaction gaps may impact market position and referrals',
        likelihood: 'medium',
        impact: 'medium',
        mitigation: 'Launch patient experience transformation initiative'
      });
    }
    
    // Generate mitigation strategies
    const mitigationStrategies = [
      'Establish enterprise risk management committee',
      'Implement quarterly risk assessment reviews',
      'Deploy predictive analytics for early risk detection',
      'Create risk-adjusted performance dashboards',
      'Develop contingency plans for high-impact scenarios'
    ];
    
    // Calculate residual risk
    const residualRisk = this.calculateResidualRisk(identifiedRisks);
    
    return {
      identifiedRisks: identifiedRisks.slice(0, 5), // Top 5 risks
      mitigationStrategies: mitigationStrategies.slice(0, 3),
      residualRisk
    };
  }

  /**
   * Evaluate competitive position
   */
  private async evaluateCompetitivePosition(data: ProcessedData): Promise<string> {
    const benchmarkPerformance = data.benchmarks.percentileRank;
    const avgPercentile = Object.values(benchmarkPerformance).reduce((sum, val) => sum + val, 0) / 
                         Object.values(benchmarkPerformance).length;
    
    if (avgPercentile > 75) {
      return 'MARKET LEADER: Organization performs in top quartile across key metrics, providing strong competitive differentiation and market positioning advantages.';
    } else if (avgPercentile > 50) {
      return 'COMPETITIVE PARITY: Organization meets industry standards with selective areas of excellence. Targeted investments can drive differentiation.';
    } else if (avgPercentile > 25) {
      return 'IMPROVEMENT OPPORTUNITY: Below-median performance creates competitive vulnerability. Strategic intervention required to achieve market parity.';
    } else {
      return 'COMPETITIVE RISK: Significant performance gaps threaten market position. Comprehensive transformation program urgently needed.';
    }
  }

  /**
   * Generate next steps
   */
  private async generateNextSteps(priorities: StrategicPriority[]): Promise<string[]> {
    const steps: string[] = [];
    
    // Immediate actions
    const immediateCount = priorities.find(p => p.category === 'immediate')?.items.length || 0;
    if (immediateCount > 0) {
      steps.push(`1. Convene executive committee to approve ${immediateCount} immediate initiatives (Week 1)`);
    }
    
    // Resource allocation
    steps.push('2. Secure budget allocation and resource commitments for priority initiatives (Week 2)');
    
    // Accountability
    steps.push('3. Assign executive sponsors and project leads with clear accountability metrics (Week 2)');
    
    // Communication
    steps.push('4. Develop and execute organization-wide communication plan (Week 3)');
    
    // Monitoring
    steps.push('5. Establish KPI dashboards and weekly executive progress reviews (Week 4)');
    
    // Quick wins
    steps.push('6. Identify and execute 2-3 quick wins to build momentum (Month 1)');
    
    // Long-term planning
    steps.push('7. Integrate priorities into annual strategic planning cycle (Quarter 1)');
    
    return steps;
  }

  // Helper methods
  
  private assessOverallPerformance(insights: EnhancedInsight[]): string {
    const positiveRatio = insights.filter(i => i.type === 'positive').length / insights.length;
    
    if (positiveRatio > 0.7) return 'exceptional';
    if (positiveRatio > 0.5) return 'strong';
    if (positiveRatio > 0.3) return 'mixed';
    return 'concerning';
  }

  private summarizePerformance(data: ProcessedData): string {
    const metrics: string[] = [];
    
    if (data.summary.responseRate > 0.6) {
      metrics.push(`${(data.summary.responseRate * 100).toFixed(0)}% response rate`);
    }
    
    if (data.summary.completionRate > 0.8) {
      metrics.push(`${(data.summary.completionRate * 100).toFixed(0)}% completion rate`);
    }
    
    if (data.quality.overallScore > 0.9) {
      metrics.push(`${(data.quality.overallScore * 100).toFixed(0)}% data quality`);
    }
    
    return metrics.join(', ') || 'varied performance across metrics';
  }

  private identifyStrategicImplications(insights: EnhancedInsight[]): string[] {
    const implications: string[] = [];
    
    // High-impact insights
    const highImpact = insights.filter(i => i.impact === 'high');
    if (highImpact.length > 3) {
      implications.push(`${highImpact.length} high-impact initiatives can transform organizational performance`);
    }
    
    // Immediate priorities
    const immediate = insights.filter(i => i.priorityLevel === 'immediate');
    if (immediate.length > 0) {
      implications.push(`${immediate.length} initiatives require immediate executive action to prevent value erosion`);
    }
    
    // Cost implications
    const totalCost = insights
      .filter(i => i.clinicalSignificance?.costImplications)
      .reduce((sum, i) => sum + (i.clinicalSignificance?.costImplications || 0), 0);
    
    if (totalCost > 0) {
      implications.push(`Total addressable cost opportunity of $${(totalCost / 1000000).toFixed(1)}M identified`);
    }
    
    // Quality improvements
    const qualityInsights = insights.filter(i => i.category.includes('Quality'));
    if (qualityInsights.length > 0) {
      implications.push(`Quality improvements can enhance CMS star ratings and value-based care performance`);
    }
    
    return implications;
  }

  private assessCompetitiveAdvantage(data: ProcessedData): string {
    const topPerformers = data.benchmarks.topPerformers;
    
    if (topPerformers.length > 3) {
      return `Competitive Advantage: Organization demonstrates excellence in ${topPerformers.length} key performance areas, creating sustainable market differentiation.`;
    } else {
      return 'Competitive Position: Selective areas of excellence provide foundation for broader market leadership.';
    }
  }

  private calculateQualityImprovements(data: ProcessedData, insights: EnhancedInsight[]): number {
    const qualityInsights = insights.filter(i => 
      i.category.includes('Quality') || i.category.includes('Clinical')
    );
    
    return qualityInsights.reduce((sum, i) => {
      if (i.type === 'positive') return sum + 2;
      if (i.type === 'negative') return sum - 1;
      return sum;
    }, 0);
  }

  private calculateCostSavings(insights: EnhancedInsight[]): number {
    return insights.reduce((sum, i) => {
      return sum + (i.clinicalSignificance?.costImplications || 0);
    }, 0);
  }

  private calculateRiskMitigation(insights: EnhancedInsight[]): number {
    const riskInsights = insights.filter(i => i.type === 'action' || i.type === 'negative');
    return Math.min(100, riskInsights.length * 10); // 10 points per risk addressed
  }

  private calculateComplianceValue(data: ProcessedData): number {
    return data.quality.overallScore * 100; // Quality score as proxy for compliance
  }

  private calculateSatisfactionGains(data: ProcessedData): number {
    // Calculate based on regional performance
    const avgSatisfaction = data.regional.reduce((sum, r) => sum + r.metrics.satisfaction, 0) / 
                           data.regional.length;
    return Math.max(0, avgSatisfaction - 3.5); // Gains above baseline of 3.5
  }

  private calculateOperationalEfficiency(data: ProcessedData): number {
    // Based on completion time and response rate
    const efficiency = (data.summary.responseRate * 50) + 
                       ((15 - data.summary.avgCompletionTime) * 3); // Bonus for quick completion
    return Math.max(0, Math.min(100, efficiency));
  }

  private determineImpactLevel(impact: string): 'transformational' | 'significant' | 'moderate' | 'incremental' {
    switch (impact) {
      case 'high':
        return 'transformational';
      case 'medium':
        return 'significant';
      case 'low':
        return 'moderate';
      default:
        return 'incremental';
    }
  }

  private estimateEffort(insight: EnhancedInsight): 'low' | 'medium' | 'high' {
    const steps = insight.actionableSteps.length;
    if (steps <= 3) return 'low';
    if (steps <= 5) return 'medium';
    return 'high';
  }

  private estimateCost(insight: EnhancedInsight): number {
    // Base cost on priority and impact
    const baseCost = insight.priorityLevel === 'immediate' ? 100000 : 
                     insight.priorityLevel === 'quarterly' ? 50000 : 25000;
    
    const multiplier = insight.impact === 'high' ? 3 : 
                      insight.impact === 'medium' ? 2 : 1;
    
    return baseCost * multiplier;
  }

  private assignOwner(insight: EnhancedInsight): string {
    // Assign based on category
    if (insight.category.includes('Clinical')) return 'Chief Medical Officer';
    if (insight.category.includes('Quality')) return 'Quality Director';
    if (insight.category.includes('Financial')) return 'Chief Financial Officer';
    if (insight.category.includes('Operational')) return 'Chief Operating Officer';
    if (insight.category.includes('Satisfaction')) return 'Patient Experience Officer';
    return 'Executive Team';
  }

  private identifyDependencies(insight: EnhancedInsight): string[] {
    const deps: string[] = [];
    
    // Resource dependencies
    if (insight.impact === 'high') {
      deps.push('Executive approval');
      deps.push('Budget allocation');
    }
    
    // Stakeholder dependencies
    if (insight.stakeholders.length > 3) {
      deps.push('Cross-functional alignment');
    }
    
    // Technical dependencies
    if (insight.category.includes('Data') || insight.category.includes('Analytics')) {
      deps.push('IT infrastructure');
    }
    
    // Regulatory dependencies
    if (insight.category.includes('Compliance')) {
      deps.push('Regulatory approval');
    }
    
    return deps;
  }

  private calculateResidualRisk(risks: Risk[]): number {
    // Calculate based on likelihood and impact
    let totalRisk = 0;
    
    for (const risk of risks) {
      const likelihoodScore = risk.likelihood === 'high' ? 3 : risk.likelihood === 'medium' ? 2 : 1;
      const impactScore = risk.impact === 'high' ? 3 : risk.impact === 'medium' ? 2 : 1;
      totalRisk += likelihoodScore * impactScore;
    }
    
    // Normalize to 0-100 scale
    const maxRisk = risks.length * 9; // Max possible risk
    return Math.min(100, (totalRisk / maxRisk) * 100);
  }
}

export default ExecutiveSummaryWriter;