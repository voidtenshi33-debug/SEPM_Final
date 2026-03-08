'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Wallet, TrendingUp, ShieldCheck, Zap, Loader2, Target } from "lucide-react";
import { calcEBITDA, calculateRunway, formatINR, validateEquity } from "@/modules/financial/utils/financialEngine";

export default function FinancialOverview() {
  const { latestMonth, capTable, leadership, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const ebitda = latestMonth ? calcEBITDA(latestMonth.netRevenue, latestMonth.operatingExpenses) : 0;
  const burn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  const runway = calculateRunway(168000, burn); 

  const leadershipTotalEquity = leadership.reduce((acc, curr) => acc + (curr.equityPct || 0), 0);
  const { total } = validateEquity(
    capTable?.founderEquityPct || 0,
    leadershipTotalEquity,
    capTable?.totalInvestorEquityPct || 0,
    capTable?.esopEquityPct || 0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Monthly EBITDA" 
          value={formatINR(ebitda)} 
          icon={Zap} 
          description="Operational Efficiency"
          className={ebitda < 0 ? "bg-rose-50/50" : "bg-emerald-50/50"}
        />
        <KPICard 
          title="Cash Runway" 
          value={runway >= 99 ? "∞ Months" : `${runway.toFixed(1)} Mo`} 
          icon={Wallet} 
          description="Survival threshold"
        />
        <KPICard 
          title="Recurring Revenue" 
          value={formatINR(latestMonth?.recurringRevenue || 0)} 
          icon={TrendingUp} 
          description="Sales Velocity"
        />
        <KPICard 
          title="Cap Table Total" 
          value={`${total}%`} 
          icon={ShieldCheck} 
          description="Total Dilution"
          className={total > 100 ? "bg-rose-100 text-rose-700" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-accent" />
              Strategic Health Assessment
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Automated INR-based intelligence context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <p className="text-lg italic leading-relaxed">
                {ebitda > 0 
                  ? "Your operations are self-sustaining. This is a critical milestone. Consider reinvesting EBITDA into high-margin sales channels to maintain growth velocity."
                  : "Operational burn is currently suppressing your runway. Focus on optimizing high-cost OpEx centers or aggressive Net Revenue acquisition to reach break-even."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Governance Alert</CardTitle>
            <CardDescription>Equity and Compliance Guard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              total > 100 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-100'
            }`}>
              <ShieldCheck className={`h-8 w-8 ${total > 100 ? 'text-rose-500' : 'text-emerald-500'}`} />
              <div>
                <p className="font-bold">Cap Table Status</p>
                <p className="text-sm">{total > 100 ? "Critical: Equity exceeds 100%. Review Leadership and Investor allocations immediately." : "Equity distribution is within valid compliance parameters."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
