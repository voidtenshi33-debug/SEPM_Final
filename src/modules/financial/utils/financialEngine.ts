'use client';

/**
 * @fileOverview Centralized financial calculation engine for UdyamRakshak.
 * Handles EBITDA, Margins, Runway, Burn Rate, and Equity Dilution with INR support.
 */

/**
 * Calculates monthly EBITDA
 * EBITDA = Net Revenue - Operating Expenses
 */
export const calcEBITDA = (netRevenue: number, opEx: number): number => 
  (netRevenue || 0) - (opEx || 0);

/**
 * Calculates EBITDA Margin %
 */
export const calcEBITDAMargin = (ebitda: number, netRevenue: number): number => 
  netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0;

/**
 * Estimates runway in months based on current cash and average burn
 */
export function calculateRunway(currentCash: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return 99.9;
  return parseFloat((currentCash / monthlyBurn).toFixed(1));
}

/**
 * Calculates Growth Percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Formats currency to INR (₹) using en-IN locale
 */
export const formatINR = (amount: number | undefined | null): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

/**
 * Validates the cap table total equity split
 */
export function validateEquity(
  founderPct: number, 
  leadershipPct: number, 
  investorPct: number, 
  esopPct: number
): { isValid: boolean; total: number; remaining: number } {
  const total = (founderPct || 0) + (leadershipPct || 0) + (investorPct || 0) + (esopPct || 0);
  return { 
    isValid: total <= 100.01, 
    total: parseFloat(total.toFixed(2)),
    remaining: parseFloat((100 - total).toFixed(2))
  };
}

/**
 * Calculates Post-Money Valuation
 */
export const calculatePostMoney = (preMoney: number, totalRaised: number): number => 
  (preMoney || 0) + (totalRaised || 0);

/**
 * Calculates dilution based on a new round
 */
export const calculateDilution = (totalRaised: number, postMoney: number): number =>
  postMoney > 0 ? (totalRaised / postMoney) * 100 : 0;

/**
 * Calculates remaining tenure/deal years
 */
export const calculateRemainingDealYears = (endDate: string | Date | null): string => {
  if (!endDate) return "0.0";
  try {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    return years > 0 ? years.toFixed(1) : "0.0";
  } catch (e) {
    return "0.0";
  }
};

// Alias for UI components using old name
export const calcRemainingTenure = calculateRemainingDealYears;

/**
 * Calculates vesting progress percentage
 */
export const calculateVestingProgress = (startDate: string | Date, years: number): string => {
  if (!startDate || !years) return "0.0";
  try {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const totalDuration = years * 365.25 * 24 * 60 * 60 * 1000;
    const elapsed = now - start;
    
    if (elapsed <= 0) return "0.0";
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(progress, 100).toFixed(1);
  } catch (e) {
    return "0.0";
  }
};

/**
 * Product-specific sales metrics
 */
export const calculateProductMetrics = (data: any) => ({
  aov: (data.ordersCount || 0) > 0 ? (data.netRevenue || 0) / data.ordersCount : 0,
  revenuePerUnit: (data.unitsSold || 0) > 0 ? (data.netRevenue || 0) / data.unitsSold : 0,
  dailyOrderAvg: (data.ordersCount || 0) / 30 
});

/**
 * Service-specific sales metrics
 */
export const calculateServiceMetrics = (data: any, teamSize: number = 0) => ({
  revenuePerClient: (data.activeClients || 0) > 0 ? (data.netRevenue || 0) / data.activeClients : 0,
  utilizationRate: (teamSize > 0) ? ((data.billableHours || 0) / (teamSize * 160)) * 100 : 0,
  clientRetention: (data.totalClients || 0) > 0 
    ? ((data.retainedClients || 0) / data.totalClients) * 100 
    : 0
});

/**
 * Calculates Health Score
 */
export const calculateHealthScore = (data: { 
  runway: number; 
  ebitdaMargin: number; 
  burnRate: number; 
  netRevenue: number; 
  founderEquity: number 
}): number => {
  let score = 100;
  if (data.runway < 6) score -= 30;
  if (data.ebitdaMargin < 15) score -= 20;
  if (data.burnRate > data.netRevenue) score -= 15;
  if (data.founderEquity < 51) score -= 10;
  return Math.max(score, 0);
};

/**
 * Proactive Risk Monitoring Engine
 */
export const analyzeRiskProfile = (data: {
  runway: number;
  totalInvestorPct: number;
  ebitdaMargin: number;
  netRevenue: number;
  burnRate: number;
}) => {
  const risks = [];

  // 1. Survival Risk (Runway)
  if (data.runway < 3) {
    risks.push({ 
      level: 'CRITICAL', 
      label: 'Insolvency Risk', 
      msg: 'Runway < 3 months. Immediate capital injection or 40% cost cut required.', 
      icon: 'AlertOctagon',
      action: 'Execute Emergency Burn Reduction Plan'
    });
  } else if (data.runway < 6) {
    risks.push({ 
      level: 'WARNING', 
      label: 'Liquidity Stress', 
      msg: 'Runway < 6 months. Begin fundraising or pause non-essential hiring.', 
      icon: 'AlertTriangle',
      action: 'Open Strategic Funding Round'
    });
  }

  // 2. Governance Risk (Dilution)
  if (data.totalInvestorPct > 45) {
    risks.push({ 
      level: 'CRITICAL', 
      label: 'Loss of Control', 
      msg: 'Investor equity exceeds 45%. Founders may lose board control in the next round.', 
      icon: 'Users',
      action: 'Review Shareholder Agreement Control Clauses'
    });
  }

  // 3. Efficiency Risk (EBITDA)
  if (data.ebitdaMargin < 10) {
    risks.push({ 
      level: 'ADVISORY', 
      label: 'Margin Compression', 
      msg: 'EBITDA < 10%. Business model lacks operational leverage. Review COGS.', 
      icon: 'TrendingDown',
      action: 'Conduct Category-Level Cost Rigidity Audit'
    });
  }

  // 4. Cash Flow Risk (Burn vs Revenue)
  if (data.burnRate > data.netRevenue && (data.netRevenue || 0) > 0) {
    risks.push({
      level: 'WARNING',
      label: 'Negative Cash Cycle',
      msg: 'Monthly burn exceeds revenue. Business is not yet self-sustaining.',
      icon: 'TrendingDown',
      action: 'Calibrate Revenue Velocity vs OpEx Burn'
    });
  }

  return risks;
};

/**
 * Generates actionable strategic insights
 */
export const generateInsights = (data: { 
  runway: number; 
  ebitdaMargin: number; 
  totalInvestorEquity: number;
  totalVariancePct?: number;
  marketingVariancePct?: number;
}) => {
  const reports = [];
  
  if (data.runway < 6) {
    reports.push({ 
      level: 'CRITICAL', 
      msg: "Runway critical (< 6 months). Immediate cost optimization required.", 
      type: 'Survival',
      icon: 'ShieldAlert'
    });
  }
  
  if (data.ebitdaMargin < 15) {
    reports.push({ 
      level: 'WARNING', 
      msg: "EBITDA margin below benchmark. Review variable operating expenses.", 
      type: 'Efficiency',
      icon: 'Activity'
    });
  }

  if (data.totalVariancePct && data.totalVariancePct > 20) {
    reports.push({
      level: 'WARNING',
      msg: "Operating expenses exceeding budget by >20%. Review discretionary spending.",
      type: 'Budget Control',
      icon: 'ShieldAlert'
    });
  }

  if (data.marketingVariancePct && data.marketingVariancePct > 30) {
    reports.push({
      level: 'WARNING',
      msg: "Marketing cost spike detected (>30% variance). Evaluate CAC efficiency immediately.",
      type: 'Growth Efficiency',
      icon: 'TrendingUp'
    });
  }
  
  if (data.totalInvestorEquity > 30) {
    reports.push({ 
      level: 'ADVISORY', 
      msg: "High external dilution. Focus on hitting milestones before next round.", 
      type: 'Governance',
      icon: 'Users'
    });
  }
  
  return reports;
};

/**
 * Aggregates monthly expenses by category
 */
export const getMonthlyDistribution = (monthlyExpenses: any[] | null, globalCategories: any[] | null) => {
  if (!monthlyExpenses || monthlyExpenses.length === 0 || !globalCategories) return [];

  const catMap = globalCategories.reduce((acc, cat) => ({ 
    ...acc, 
    [cat.id]: { name: cat.name, type: cat.type } 
  }), {} as Record<string, { name: string, type: string }>);

  const total = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const grouped = monthlyExpenses.reduce((acc, exp) => {
    const categoryId = exp.categoryId;
    const cat = catMap[categoryId] || { name: "Other", type: "Variable" };
    
    if (!acc[categoryId]) {
      acc[categoryId] = { 
        id: categoryId,
        name: cat.name, 
        type: cat.type, 
        amount: 0, 
        percentage: 0 
      };
    }
    acc[categoryId].amount += (exp.amount || 0);
    acc[categoryId].percentage = total > 0 ? parseFloat(((acc[categoryId].amount / total) * 100).toFixed(1)) : 0;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a: any, b: any) => b.amount - a.amount);
};

/**
 * Groups expenses by type
 */
export const groupExpensesByType = (expenses: any[], categories: any[]) => {
  const catMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.type }), {} as Record<string, string>);
  return expenses.reduce((acc, exp) => {
    const type = catMap[exp.categoryId] || "Variable";
    acc[type] = (acc[type] || 0) + exp.amount;
    return acc;
  }, { Fixed: 0, Variable: 0, "R&D": 0 } as Record<string, number>);
};

/**
 * Calculates variance between actual spend and budget
 */
export const calculateBudgetVariance = (actualAmount: number, budgetAmount: number) => {
  const variance = (actualAmount || 0) - (budgetAmount || 0);
  const variancePct = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

  return {
    variance,
    variancePct: parseFloat(variancePct.toFixed(1)),
    status: variance > 0 ? "OVER" : (variance < 0 && Math.abs(variancePct) > 1) ? "UNDER" : "ON_TRACK"
  };
};

/**
 * Break-Even Analysis Intelligence
 */
export const calculateBreakEvenAnalysis = (fixedCosts: number, totalRevenue: number, variableCosts: number) => {
  if (totalRevenue <= 0) return null;
  if (fixedCosts < 0) return { error: "Invalid fixed cost value." };

  // 1. Contribution Margin: Money left after covering variable costs
  const contributionMargin = totalRevenue - variableCosts;
  const contributionMarginRatio = contributionMargin / totalRevenue;

  if (contributionMarginRatio <= 0) {
    return { error: "Variable costs exceed revenue. Break-even impossible." };
  }

  // 2. Break-Even Revenue: The "Survival Number"
  const breakEvenPoint = fixedCosts / contributionMarginRatio;

  // 3. Margin of Safety: How much revenue can drop before you hit loss
  const marginOfSafety = ((totalRevenue - breakEvenPoint) / totalRevenue) * 100;

  return {
    breakEvenPoint: Math.round(breakEvenPoint),
    contributionMargin: Math.round(contributionMargin),
    marginRatio: (contributionMarginRatio * 100).toFixed(1),
    marginOfSafety: marginOfSafety.toFixed(1),
    isProfitable: totalRevenue >= breakEvenPoint,
    gap: Math.abs(Math.round(totalRevenue - breakEvenPoint))
  };
};
