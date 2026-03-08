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
  if (monthlyBurn <= 0) return 999;
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
 * Calculates remaining tenure in years for deals or vesting
 */
export const calcRemainingTenure = (endDate: string | Date | null): string => {
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
 * Validates if the cap table total equity split is within the 100% threshold
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
 * Product-specific sales metrics
 */
export const calculateProductMetrics = (data: any) => ({
  aov: data.ordersCount > 0 ? (data.netRevenue || 0) / data.ordersCount : 0,
  revenuePerUnit: data.unitsSold > 0 ? (data.netRevenue || 0) / data.unitsSold : 0,
  dailyOrderAvg: (data.ordersCount || 0) / 30 
});

/**
 * Service-specific sales metrics
 */
export const calculateServiceMetrics = (data: any, teamSize: number = 0) => ({
  revenuePerClient: data.activeClients > 0 ? (data.netRevenue || 0) / data.activeClients : 0,
  utilizationRate: (teamSize > 0) ? ((data.billableHours || 0) / (teamSize * 160)) * 100 : 0,
  clientRetention: (data.totalClients > 0) 
    ? ((data.retainedClients || 0) / data.totalClients) * 100 
    : 0
});

/**
 * Calculates Health Score (0-100) based on Rakshak (Protector) logic.
 * Deductions based on critical financial and equity benchmarks.
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
 * Generates actionable strategic insights based on financial and capital state.
 */
export const generateInsights = (data: { 
  runway: number; 
  ebitdaMargin: number; 
  burnRate: number;
  netRevenue: number;
  founderEquity: number;
  totalInvestorEquity: number 
}) => {
  const reports = [];
  
  // Critical Alerts
  if (data.runway < 6) {
    reports.push({ 
      level: 'CRITICAL', 
      msg: "Runway critical (< 6 months). Immediate cost optimization required.", 
      type: 'Survival',
      icon: 'ShieldAlert'
    });
  }
  
  // Operational Advice
  if (data.ebitdaMargin < 15) {
    reports.push({ 
      level: 'WARNING', 
      msg: "EBITDA margin below benchmark. Review variable operating expenses.", 
      type: 'Efficiency',
      icon: 'Activity'
    });
  }
  
  // Capital Advice
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
 * Aggregates monthly expenses by category and calculates percentages.
 */
export const getMonthlyDistribution = (monthlyExpenses: any[] | null, globalCategories: any[] | null) => {
  if (!monthlyExpenses || monthlyExpenses.length === 0 || !globalCategories) return [];

  // 1. Create Lookup Map
  const catMap = globalCategories.reduce((acc, cat) => ({ 
    ...acc, 
    [cat.id]: { name: cat.name, type: cat.type } 
  }), {} as Record<string, { name: string, type: string }>);

  // 2. Aggregate
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
    acc[categoryId].amount += exp.amount;
    acc[categoryId].percentage = total > 0 ? parseFloat(((acc[categoryId].amount / total) * 100).toFixed(1)) : 0;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a, b) => b.amount - a.amount);
};

/**
 * Groups expenses by their category type (Fixed/Variable)
 */
export const groupExpensesByType = (expenses: any[], categories: any[]) => {
  const catMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.type }), {} as Record<string, string>);
  
  return expenses.reduce((acc, exp) => {
    const type = catMap[exp.categoryId] || "Variable";
    acc[type] = (acc[type] || 0) + exp.amount;
    return acc;
  }, { Fixed: 0, Variable: 0, "R&D": 0 } as Record<string, number>);
};
