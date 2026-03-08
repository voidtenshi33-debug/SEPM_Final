/**
 * @fileOverview Financial calculation engine for StartupOS.
 * Handles EBITDA, Margin, Runway, and Equity Dilution logic.
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

export interface CapTable {
  founderEquityPct: number;
  ceoEquityPct: number;
  esopEquityPct: number;
  totalInvestorEquityPct: number;
}

/**
 * Calculates EBITDA for a given financial record.
 * EBITDA = Net Revenue - Operating Expenses
 */
export function calculateEBITDA(record: FinancialRecord): number {
  return record.revenueNet - record.operatingExpenses;
}

/**
 * Calculates EBITDA Margin percentage.
 * EBITDA Margin % = (EBITDA / Net Revenue) * 100
 */
export function calculateEBITDAMargin(record: FinancialRecord): number {
  if (record.revenueNet === 0) return 0;
  const ebitda = calculateEBITDA(record);
  return (ebitda / record.revenueNet) * 100;
}

/**
 * Calculates Average Order Value.
 */
export function calculateAOV(record: FinancialRecord): number {
  if (record.unitsSold === 0) return 0;
  return record.revenueNet / record.unitsSold;
}

/**
 * Calculates Runway in months based on current cash and average burn.
 */
export function calculateRunway(currentCash: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return 99; // Effectively infinite runway if profitable
  return currentCash / monthlyBurn;
}

/**
 * Logic for diluting existing equity when a new round is added.
 * Dilutes Founder and CEO equity proportionally by the diluted percentage.
 */
export function calculateNewCapitalStructure(
  current: CapTable,
  dilutedPct: number
): CapTable {
  const dilutionMultiplier = (100 - dilutedPct) / 100;

  return {
    founderEquityPct: current.founderEquityPct * dilutionMultiplier,
    ceoEquityPct: current.ceoEquityPct * dilutionMultiplier,
    esopEquityPct: current.esopEquityPct, // Usually ESOP is topped up separately, but for MVP we keep stable
    totalInvestorEquityPct: current.totalInvestorEquityPct * dilutionMultiplier + dilutedPct,
  };
}
