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
 * Calculates Runway in months based on current cash and average burn.
 */
export const calcRunway = (cash: number, burn: number): number => {
  if (burn <= 0) return 99; // Effectively infinite
  return (cash || 0) / burn;
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
  const total = (founder || 0) + (leadership || 0) + (investor || 0) + (esop || 0);
  return {
    isValid: total <= 100.01 && total >= 0,
    total: Number(total.toFixed(2))
  };
}