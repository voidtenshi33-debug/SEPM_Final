"use client";

import { KPICard } from "@/components/dashboard/kpi-card";
import { TrendingDown, Activity, Wallet, Zap, AlertCircle } from "lucide-react";
import { calcEBITDA, calculateRunway, formatINR } from "@/modules/financial/utils/financialEngine";

interface MetricCardsProps {
  currentFinancials: any | null;
  prevFinancials: any | null;
  currentCash: number;
}

export function MetricCards({ currentFinancials, prevFinancials, currentCash }: MetricCardsProps) {
  const ebitda = currentFinancials ? calcEBITDA(currentFinancials.netRevenue, currentFinancials.operatingExpenses) : 0;
  const prevEbitda = prevFinancials ? calcEBITDA(prevFinancials.netRevenue, prevFinancials.operatingExpenses) : 0;
  
  const burnRate = currentFinancials ? Math.max(0, currentFinancials.operatingExpenses - currentFinancials.netRevenue) : 0;
  const runway = calculateRunway(currentCash, burnRate);

  const ebitdaTrend = ebitda >= prevEbitda;
  const ebitdaDiff = prevEbitda !== 0 ? ((ebitda - prevEbitda) / Math.abs(prevEbitda) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard 
        title="Monthly EBITDA" 
        value={formatINR(ebitda)} 
        icon={Zap} 
        description={ebitda >= 0 ? "Operationally Profitable" : "Operating at Loss"}
        trend={{ value: `${Math.abs(Number(ebitdaDiff))}%`, positive: ebitdaTrend }}
        className={ebitda < 0 ? "bg-rose-50/30" : "bg-emerald-50/30"}
      />
      <KPICard 
        title="Monthly Burn" 
        value={formatINR(burnRate)} 
        icon={TrendingDown} 
        description="Net cash outflow"
      />
      <KPICard 
        title="Cash Runway" 
        value={runway >= 999 ? "∞ Stable" : `${runway.toFixed(1)} Mo`} 
        icon={Activity} 
        description={burnRate > 0 ? "Survival threshold detected" : "Safe: No burn detected"}
        className={runway < 6 && burnRate > 0 ? "bg-rose-50/50" : "bg-emerald-50/50"}
      />
      <KPICard 
        title="Available Cash" 
        value={currentCash > 0 ? formatINR(currentCash) : "---"} 
        icon={Wallet} 
        description={currentCash > 0 ? "Primary account balance" : "Baseline signal required"}
      />
    </div>
  );
}