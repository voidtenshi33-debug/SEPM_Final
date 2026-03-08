
'use client';

/**
 * @fileOverview AI Growth Intelligence Engine.
 * Provides data-driven strategic verdicts and market context analysis.
 */

export interface StrategicVerdict {
  status: 'SCALING' | 'STABLE' | 'CRITICAL' | 'EFFICIENCY_RISK';
  color: 'green' | 'yellow' | 'red' | 'orange';
  message: string;
}

export const generateStrategicVerdict = (
  financials: { runway: number; revenueTrend: string; ebitdaMargin: number },
  projectStats: { avgProgress: number },
  marketStats: { industryGrowthRate: number }
): StrategicVerdict => {
  const { runway, revenueTrend, ebitdaMargin } = financials;
  const { avgProgress } = projectStats;
  const { industryGrowthRate } = marketStats;

  // 1. Liquidity Risk
  if (runway < 6) {
    return {
      status: 'CRITICAL',
      color: 'red',
      message: 'Liquidity risk detected. Prioritize fundraising or cost optimization immediately.'
    };
  }

  // 2. Margin Efficiency Risk
  if (ebitdaMargin < 10) {
    return {
      status: 'EFFICIENCY_RISK',
      color: 'orange',
      message: 'Low margin efficiency. Review pricing strategy and variable cost structure.'
    };
  }

  // 3. Scaling Mode
  if (revenueTrend === 'Up' && avgProgress > 75 && industryGrowthRate > 10) {
    return {
      status: 'SCALING',
      color: 'green',
      message: 'Strong scaling conditions. Strategic advice: Aggressively increase market penetration.'
    };
  }

  // Default Stable
  return {
    status: 'STABLE',
    color: 'yellow',
    message: 'Stable operations with moderate growth velocity. Focus on tactical optimizations.'
  };
};

export const getPriorityActions = (verdict: StrategicVerdict, businessType: string) => {
  const actions = [];

  if (verdict.status === 'CRITICAL') {
    actions.push({
      title: 'Emergency Capital Injection',
      why: 'Runway is below critical 6-month threshold.',
      impact: 'Critical',
      risk: 'High',
      type: 'Fundraising',
      template: 'FUNDRAISING'
    });
  }

  if (businessType === 'Product' && verdict.status !== 'CRITICAL') {
    actions.push({
      title: 'Subscription Model Pivot',
      why: 'Diversify revenue streams to improve stability.',
      impact: 'High',
      risk: 'Medium',
      type: 'Product',
      template: 'PRODUCT_LAUNCH'
    });
  }

  if (businessType === 'Service' && verdict.status === 'SCALING') {
    actions.push({
      title: 'Automate Onboarding',
      why: 'Scaling operations requires high delivery efficiency.',
      impact: 'High',
      risk: 'Low',
      type: 'Infrastructure',
      template: 'MARKETING' // Generic infrastructure placeholder
    });
  }

  // Always suggest enterprise expansion for stable/scaling
  if (verdict.status === 'SCALING' || verdict.status === 'STABLE') {
    actions.push({
      title: 'Enterprise Sales Blitz',
      why: 'Market demand is high and product maturity is sufficient.',
      impact: 'High',
      risk: 'Medium',
      type: 'Growth',
      template: 'MARKETING'
    });
  }

  return actions;
};
