'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Wallet, TrendingUp, ShieldCheck, Activity, Loader2 } from "lucide-react";
import { calcEBITDA, calcRunway } from "@/modules/financial/utils/financialEngine";

export default function FinancialOverview() {
  const { latestMonth, capTable, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const ebitda = latestMonth ? calcEBITDA(latestMonth.revenueNet, latestMonth.operatingExpenses) : 0;
  const burn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.revenueNet) : 0;
  const runway = calcRunway(168000, burn); // Mock cash for now

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Monthly EBITDA" 
          value={`$${ebitda.toLocaleString()}`} 
          icon={Activity} 
          description="Operational profit/loss"
          className={ebitda < 0 ? "bg-rose-50/50" : "bg-emerald-50/50"}
        />
        <KPICard 
          title="Cash Runway" 
          value={runway >= 99 ? "∞ Months" : `${runway.toFixed(1)} Mo`} 
          icon={Wallet} 
          description="Survival threshold"
        />
        <KPICard 
          title="MRR" 
          value={`$${(latestMonth?.recurringRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          description="Recurring velocity"
        />
        <KPICard 
          title="Total Dilution" 
          value={`${capTable?.totalInvestorEquityPct || 0}%`} 
          icon={ShieldCheck} 
          description="Investor ownership"
        />
      </div>

      <Card className="border-none shadow-xl bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Financial Health Summary</CardTitle>
          <CardDescription className="text-primary-foreground/70">
            Automated intelligence assessment based on current data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-white/10 border border-white/20">
            <p className="text-sm italic">
              {ebitda > 0 
                ? "Your operations are self-sustaining. Consider reinvesting EBITDA into growth-oriented sales channels."
                : "Operational burn is detected. Focus on increasing Net Revenue or optimizing OpEx to extend survival runway."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
