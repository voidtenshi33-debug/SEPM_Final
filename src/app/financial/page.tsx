'use client';

import React, { useState, useEffect } from "react";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { KPICard } from "@/components/dashboard/kpi-card";
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Target,
  ArrowRight,
  Activity
} from "lucide-react";
import { 
  calcEBITDA, 
  calculateRunway, 
  formatINR, 
  validateEquity 
} from "@/modules/financial/utils/financialEngine";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function FinancialOverview() {
  const [mounted, setMounted] = useState(false);
  const { financials, latestMonth, capTable, leadership, isLoading } = useFinancials();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Prep metrics
  const ebitda = latestMonth ? calcEBITDA(latestMonth.netRevenue, latestMonth.operatingExpenses) : 0;
  const burn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  // Use zero as base instead of mock value to avoid confusion
  const runway = burn > 0 ? calculateRunway(0, burn) : 999; 
  
  const totalLeadershipEquity = leadership?.reduce((sum, member) => sum + (member.equityPct || 0), 0) || 0;
  const totalInvestorEquity = capTable?.totalInvestorEquityPct || 0;
  
  const validation = validateEquity(
    capTable?.founderPct || 0,
    totalLeadershipEquity,
    totalInvestorEquity,
    capTable?.esopPct || 0
  );

  const chartData = [...financials].reverse().map(f => ({
    month: f.month,
    revenue: f.netRevenue,
    ebitda: calcEBITDA(f.netRevenue, f.operatingExpenses)
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Command Center" 
        description="Unified oversight of your startup's execution, financial health, and team coordination."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/financial/insights">
                <ShieldCheck className="h-4 w-4 mr-2" /> War Room
              </Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/financial/operational">
                Log Metrics
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Cash Runway" 
          value={runway >= 999 ? "∞ Stable" : `${runway} Mo`} 
          icon={Wallet} 
          description={burn > 0 ? `Detected burn: ${formatINR(burn)}` : "No operational burn"}
          className="bg-primary text-primary-foreground"
        />
        <KPICard 
          title="Monthly Burn" 
          value={formatINR(burn)} 
          icon={TrendingUp} 
          description="Net cash outflow"
        />
        <KPICard 
          title="Monthly EBITDA" 
          value={formatINR(ebitda)} 
          icon={Zap} 
          description={ebitda >= 0 ? "Profitable" : "Operating at Loss"}
          className={ebitda < 0 ? "bg-rose-50/30" : "bg-emerald-50/30"}
        />
        <KPICard 
          title="Cap Table" 
          value={validation.isValid ? "Secure" : "Overflow"} 
          icon={ShieldCheck} 
          description={`${validation.total}% Allocated`}
          className={!validation.isValid ? "bg-rose-50 text-rose-600" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Revenue Velocity
            </CardTitle>
            <CardDescription>Historical performance in INR (₹)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip 
                    formatter={(v: number) => [formatINR(v), "Revenue"]}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">No revenue trends logged yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Strategic Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Finalize Equity Split", urgency: "High", color: "bg-rose-50 text-rose-600 border-rose-100" },
                { label: "Monthly Investor Brief", urgency: "Medium", color: "bg-amber-50 text-amber-600 border-amber-100" },
                { label: "Q3 Budget calibration", urgency: "Low", color: "bg-slate-50 text-slate-600 border-slate-100" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-accent transition-all cursor-pointer group">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-accent transition-colors">{item.label}</p>
                  <Badge variant="outline" className={`text-[8px] font-bold uppercase ${item.color}`}>
                    {item.urgency}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 group text-accent" asChild>
              <Link href="/financial/insights">
                Go to War Room <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}