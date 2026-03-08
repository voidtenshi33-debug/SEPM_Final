/**
 * @fileOverview Centralized governance math for UdyamRakshak.
 * Handles valuation, dilution, and vesting progress.
 */

/**
 * Calculates Post-Money Valuation.
 */
export const calculatePostMoney = (preMoney: number, totalRaised: number): number => 
  (preMoney || 0) + (totalRaised || 0);

/**
 * Validates Cap Table distribution.
 */
export const validateCapTable = (segments: { [key: string]: number }) => {
  const total = Object.values(segments).reduce((a, b) => a + (b || 0), 0);
  return {
    isValid: total <= 100.01,
    total: Number(total.toFixed(2)),
    remaining: Number((100 - total).toFixed(2))
  };
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
 * Calculates remaining deal tenure in years.
 */
export const calculateRemainingDealYears = (endDate: string): string => {
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
