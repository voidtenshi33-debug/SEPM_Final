
/**
 * @fileOverview Centralized financial calculation engine for UdyamRakshak.
 * Ensures consistent math across all financial sub-modules.
 */

/**
 * Calculates EBITDA (Monthly).
 * EBITDA = Net Revenue - Operating Expenses
 */
export const calcEBITDA = (netRevenue: number, opEx: number): number => 
  (netRevenue || 0) - (opEx || 0);

/**
 * Calculates EBITDA Margin %.
 * EBITDA Margin % = (EBITDA / Net Revenue) * 100
 */
export const calcEBITDAMargin = (ebitda: number, netRevenue: number): number => 
  (netRevenue && netRevenue > 0) ? (ebitda / netRevenue) * 100 : 0;

/**
 * Calculates remaining deal tenure in years based on end date.
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
 * Calculates Runway in months based on current cash and average burn.
 */
export const calcRunway = (cash: number, burn: number): number => {
  if (burn <= 0) return 99; // Effectively infinite
  return (cash || 0) / burn;
};

/**
 * Formats numbers as INR currency using en-IN locale.
 * Strict enforcement: No "$" symbols, ever.
 */
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

/**
 * Validates Equity Distribution.
 * Ensures the sum of Founders, Leadership, Investors, and ESOP does not exceed 100%.
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
 * Logic for reconciling monthly expenses with global categories.
 * Maps categoryId to names/types and calculates percentages.
 */
export const getMonthlyDistribution = (monthlyExpenses: any[], globalCategories: any[]) => {
  if (!monthlyExpenses || monthlyExpenses.length === 0) return [];

  // 1. Create Lookup Map
  const catMap = globalCategories.reduce((acc, cat) => ({ 
    ...acc, 
    [cat.id]: { name: cat.name, type: cat.type, color: cat.color || "#94A3B8" } 
  }), {});

  // 2. Aggregate
  const total = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const grouped = monthlyExpenses.reduce((acc, exp) => {
    const catId = exp.categoryId;
    const cat = catMap[catId] || { name: "Uncategorized", type: "Variable", color: "#94A3B8" };
    
    if (!acc[catId]) {
      acc[catId] = { 
        name: cat.name, 
        type: cat.type, 
        color: cat.color,
        amount: 0, 
        percentage: 0 
      };
    }
    acc[catId].amount += exp.amount;
    return acc;
  }, {} as any);

  return Object.values(grouped).map((item: any) => ({
    ...item,
    percentage: total > 0 ? Number(((item.amount / total) * 100).toFixed(1)) : 0
  })).sort((a: any, b: any) => b.amount - a.amount);
};

/**
 * Adaptive Sales Intelligence Logic
 */

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

/**
 * Intelligence Layer Extensions
 */

export interface HealthMetrics {
  runway: number;
  ebitdaMargin: number;
  burnRate: number;
  netRevenue: number;
  founderEquity: number;
  totalInvestorEquity: number;
  salesGrowth?: number;
}

/**
 * Calculates a startup Health Score (0-100) based on Guardian Rules.
 */
export const calculateHealthScore = (data: HealthMetrics): number => {
  let score = 100;
  // Deductions based on "Rakshak" (Protector) logic
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

/**
 * Generates rule-based strategic insights for the founder.
 */
export const generateInsights = (data: HealthMetrics): StrategicInsight[] => {
  const reports: StrategicInsight[] = [];
  
  // 🚩 SURVIVAL RULES
  if (data.runway < 6) {
    reports.push({ 
      level: 'CRITICAL', 
      msg: "Runway critical (< 6 months). Immediate cost optimization required.", 
      type: 'survival',
      icon: 'ShieldAlert'
    });
  }
  
  // 📈 GROWTH & EFFICIENCY RULES
  if (data.ebitdaMargin < 15 && (data.salesGrowth || 0) > 20) {
    reports.push({ 
      level: 'WARNING', 
      msg: "High growth but low efficiency. Your CAC (Acquisition Cost) might be too high.", 
      type: 'efficiency',
      icon: 'TrendingUp'
    });
  } else if (data.ebitdaMargin < 15) {
    reports.push({ 
      level: 'WARNING', 
      msg: "EBITDA margin below benchmark (15%). Review variable operating expenses to reach sustainability.", 
      type: 'efficiency',
      icon: 'Activity'
    });
  }
  
  // 💰 CAPITAL RULES
  if (data.founderEquity < 50) {
    reports.push({ 
      level: 'ADVISORY', 
      msg: "Founder equity is dropping. Consider debt-financing for the next milestone to avoid losing control.", 
      type: 'equity',
      icon: 'Users'
    });
  } else if (data.totalInvestorEquity > 30) {
    reports.push({ 
      level: 'ADVISORY', 
      msg: "High external dilution. Focus on hitting aggressive milestones before the next round.", 
      type: 'equity',
      icon: 'Briefcase'
    });
  }
  
  return reports;
};
