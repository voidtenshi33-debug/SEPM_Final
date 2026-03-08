/**
 * @fileOverview Centralized financial calculation engine for UdyamRakshak.
 * Ensures consistent math across all financial sub-modules.
 */

/**
 * Calculates EBITDA (Monthly).
 */
export const calcEBITDA = (netRevenue: number, opEx: number): number => 
  (netRevenue || 0) - (opEx || 0);

/**
 * Calculates EBITDA Margin %.
 */
export const calcEBITDAMargin = (ebitda: number, netRevenue: number): number => 
  (netRevenue && netRevenue > 0) ? (ebitda / netRevenue) * 100 : 0;

/**
 * Calculates remaining deal tenure in years.
 */
export const calcRemainingTenure = (endDate: string): string => {
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
 * Calculates Vesting Progress %.
 */
export const calculateVestingProgress = (startDate: string, years: number): string => {
  if (!startDate || !years) return "0.0";
  try {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const totalMs = years * 365.25 * 24 * 60 * 60 * 1000;
    const elapsedMs = now - start;
    const progress = Math.min((elapsedMs / totalMs) * 100, 100);
    return Math.max(0, progress).toFixed(1);
  } catch (e) {
    return "0.0";
  }
};

/**
 * Calculates Runway in months.
 */
export const calcRunway = (cash: number, burn: number): number => {
  if (burn <= 0) return 99;
  return (cash || 0) / burn;
};

/**
 * Formats numbers as INR.
 */
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

/**
 * Validates Equity Distribution.
 */
export function validateEquity(
  founder: number, 
  leadership: number, 
  investor: number, 
  esop: number
): { isValid: boolean; total: number } {
  const total = (founder || 0) + (leadership || 0) + (investor || 0) + (esop || 0);
  return {
    isValid: total <= 100.01 && total >= 0,
    total: Number(total.toFixed(2))
  };
}

/**
 * Expense Distribution logic.
 */
export const getMonthlyDistribution = (monthlyExpenses: any[], globalCategories: any[]) => {
  if (!monthlyExpenses || monthlyExpenses.length === 0) return [];
  const catMap = globalCategories.reduce((acc, cat) => ({ 
    ...acc, 
    [cat.id]: { name: cat.name, type: cat.type, color: cat.color || "#94A3B8" } 
  }), {});
  const total = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const grouped = monthlyExpenses.reduce((acc, exp) => {
    const catId = exp.categoryId;
    const cat = catMap[catId] || { name: "Uncategorized", type: "Variable", color: "#94A3B8" };
    if (!acc[catId]) {
      acc[catId] = { name: cat.name, type: cat.type, color: cat.color, amount: 0, percentage: 0 };
    }
    acc[catId].amount += exp.amount;
    return acc;
  }, {} as any);
  return Object.values(grouped).map((item: any) => ({
    ...item,
    percentage: total > 0 ? Number(((item.amount / total) * 100).toFixed(1)) : 0
  })).sort((a: any, b: any) => b.amount - a.amount);
};

export const calculateProductMetrics = (data: any) => ({
  aov: data.ordersCount > 0 ? (data.netRevenue || 0) / data.ordersCount : 0,
  revenuePerUnit: data.unitsSold > 0 ? (data.netRevenue || 0) / data.unitsSold : 0,
  dailyOrderAvg: (data.ordersCount || 0) / 30
});

export const calculateServiceMetrics = (data: any, teamSize: number = 1) => ({
  revenuePerClient: data.activeClients > 0 ? (data.netRevenue || 0) / data.activeClients : 0,
  utilizationRate: (teamSize > 0) ? ((data.billableHours || 0) / (teamSize * 160)) * 100 : 0,
  clientRetention: data.activeClients > 0 ? ((data.retainedClients || 0) / data.activeClients) * 100 : 0
});

export interface HealthMetrics {
  runway: number;
  ebitdaMargin: number;
  burnRate: number;
  netRevenue: number;
  founderEquity: number;
  totalInvestorEquity: number;
  salesGrowth?: number;
}

export const calculateHealthScore = (data: HealthMetrics): number => {
  let score = 100;
  if (data.runway < 6) score -= 30;
  if (data.ebitdaMargin < 15) score -= 20;
  if (data.burnRate > data.netRevenue) score -= 15;
  if (data.founderEquity < 51) score -= 10;
  return Math.max(score, 0);
};

export interface StrategicInsight {
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  msg: string;
  type: 'survival' | 'efficiency' | 'equity' | 'growth';
  icon?: string;
}

export const generateInsights = (data: HealthMetrics): StrategicInsight[] => {
  const reports: StrategicInsight[] = [];
  if (data.runway < 6) {
    reports.push({ level: 'CRITICAL', msg: "Runway critical (< 6 months). Immediate cost optimization required.", type: 'survival', icon: 'ShieldAlert' });
  }
  if (data.ebitdaMargin < 15) {
    reports.push({ level: 'WARNING', msg: "EBITDA margin below benchmark (15%). Review variable operating expenses.", type: 'efficiency', icon: 'Activity' });
  }
  if (data.founderEquity < 50) {
    reports.push({ level: 'ADVISORY', msg: "Founder equity is dropping. Consider debt-financing to maintain control.", type: 'equity', icon: 'Users' });
  }
  return reports;
};