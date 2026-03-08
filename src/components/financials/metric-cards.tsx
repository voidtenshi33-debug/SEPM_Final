"use client";

import { KPICard } from "@/components/dashboard/kpi-card";
import { TrendingDown, Activity, DollarSign, Zap } from "lucide-react";
import { FinancialRecord, calculateEBITDA, calculateRunway } from "@/lib/fin-engine";

interface MetricCardsProps {
  currentFinancials: FinancialRecord | null;
  prevFinancials: FinancialRecord | null;
  currentCash: number;
}

export function MetricCards({ currentFinancials, prevFinancials, currentCash }: MetricCardsProps) {
  const ebitda = currentFinancials ? calculateEBITDA(currentFinancials) : 0;
  const prevEbitda = prevFinancials ? calculateEBITDA(prevFinancials) : 0;
  
  const burnRate = currentFinancials ? currentFinancials.operatingExpenses - currentFinancials.revenueNet : 0;
  const actualBurn = burnRate > 0 ? burnRate : 0;
  
  const runway = calculateRunway(currentCash, actualBurn);

  const ebitdaTrend = ebitda >= prevEbitda;
  const ebitdaDiff = prevEbitda !== 0 ? ((ebitda - prevEbitda) / Math.abs(prevEbitda) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard 
        title="Monthly EBITDA" 
        value={`$${ebitda.toLocaleString()}`} 
        icon={Zap} 
        description={ebitda >= 0 ? "Operationally Profitable" : "Operating at Loss"}
        trend={{ value: `${Math.abs(Number(ebitdaDiff))}%`, positive: ebitdaTrend }}
        className={ebitda < 0 ? "bg-rose-50/30" : "bg-emerald-50/30"}
      />
      <KPICard 
        title="Monthly Burn" 
        value={`$${actualBurn.toLocaleString()}`} 
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
        value={`$${currentCash.toLocaleString()}`} 
        icon={DollarSign} 
        description="Primary operations account"
      />
    </div>
  );
}
