"use client";

import { KPICard } from "@/components/dashboard/kpi-card";
import { TrendingDown, Activity, Wallet, Zap } from "lucide-react";
import { calcEBITDA, calcRunway, formatINR } from "@/modules/financial/utils/financialEngine";

interface MetricCardsProps {
  currentFinancials: any | null;
  prevFinancials: any | null;
  currentCash: number;
}

export function MetricCards({ currentFinancials, prevFinancials, currentCash }: MetricCardsProps) {
  const ebitda = currentFinancials ? calcEBITDA(currentFinancials.netRevenue, currentFinancials.operatingExpenses) : 0;
  const prevEbitda = prevFinancials ? calcEBITDA(prevFinancials.netRevenue, prevFinancials.operatingExpenses) : 0;
  
  const burnRate = currentFinancials ? Math.max(0, currentFinancials.operatingExpenses - currentFinancials.netRevenue) : 0;
  const runway = calcRunway(currentCash, burnRate);

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
        value={runway >= 99 ? "∞ Months" : `${runway.toFixed(1)} Months`} 
        icon={Activity} 
        description={runway < 6 ? "Critical Threshold" : "Healthy Status"}
        className={runway < 6 ? "bg-rose-50/50" : "bg-emerald-50/50"}
      />
      <KPICard 
        title="Available Cash" 
        value={formatINR(currentCash)} 
        icon={Wallet} 
        description="Primary operations account"
      />
    </div>
  );
}
