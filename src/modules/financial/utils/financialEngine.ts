/**
 * @fileOverview Centralized financial calculation engine for UdyamRakshak.
 * Ensures consistent math across all financial sub-modules.
 */

export interface FinancialRecord {
  revenueGross: number;
  revenueDiscounts: number;
  revenueNet: number;
  operatingExpenses: number;
  cogs: number;
  unitsSold: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
}

/**
 * Calculates EBITDA (Monthly).
 * EBITDA = Net Revenue - Operating Expenses
 */
export function calcEBITDA(netRev: number, opEx: number): number {
  return netRev - opEx;
}

/**
 * Calculates EBITDA Margin %.
 * EBITDA Margin % = (EBITDA / Net Revenue) * 100
 */
export function calcEBITDAMargin(ebitda: number, netRev: number): number {
  if (netRev === 0) return 0;
  return (ebitda / netRev) * 100;
}

/**
 * Calculates Average Order Value (AOV).
 */
export function calcAOV(netRev: number, unitsSold: number): number {
  if (unitsSold === 0) return 0;
  return netRev / unitsSold;
}

/**
 * Calculates Cash Runway (Months).
 */
export function calcRunway(cash: number, burn: number): number {
  if (burn <= 0) return 99; // Effectively infinite
  return cash / burn;
}

/**
 * Validates Equity Distribution.
 * Ensures the sum of all shareholders does not exceed 100%.
 */
export function validateEquity(founder: number, ceo: number, investor: number, esop: number): { isValid: boolean; total: number } {
  const total = founder + ceo + investor + esop;
  return {
    isValid: total <= 100.01 && total >= 99.99, // Allow for floating point minor variance
    total: Number(total.toFixed(2))
  };
}

/**
 * Calculates proportional dilution for existing shareholders.
 */
export function calculateDilution(currentPct: number, roundDilutionPct: number): number {
  return currentPct * ((100 - roundDilutionPct) / 100);
}
