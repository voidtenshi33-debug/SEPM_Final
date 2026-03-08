/**
 * @fileOverview Centralized financial calculation engine for UdyamRakshak.
 * Ensures consistent math across all financial sub-modules.
 */

/**
 * Calculates EBITDA (Monthly).
 * EBITDA = Net Revenue - Operating Expenses
 */
export const calcEBITDA = (netRevenue: number, opEx: number): number => 
  netRevenue - opEx;

/**
 * Calculates EBITDA Margin %.
 * EBITDA Margin % = (EBITDA / Net Revenue) * 100
 */
export const calcEBITDAMargin = (ebitda: number, netRevenue: number): number => 
  netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0;

/**
 * Calculates remaining deal tenure in years.
 */
export const calcRemainingTenure = (endDate: string): string => {
  if (!endDate) return "0.0";
  const diff = new Date(endDate).getTime() - new Date().getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);
  return years > 0 ? years.toFixed(1) : "0.0";
};

/**
 * Calculates Runway in months based on current cash and average burn.
 */
export const calcRunway = (cash: number, burn: number): number => {
  if (burn <= 0) return 99; // Effectively infinite
  return cash / burn;
};

/**
 * Formats numbers as INR currency using en-IN locale.
 */
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

/**
 * Validates Equity Distribution.
 * Ensures the sum of all shareholders does not exceed 100%.
 */
export function validateEquity(founder: number, leadership: number, investor: number, esop: number): { isValid: boolean; total: number } {
  const total = founder + leadership + investor + esop;
  return {
    isValid: total <= 100.01 && total >= 99.99, // Allow for floating point minor variance
    total: Number(total.toFixed(2))
  };
}
