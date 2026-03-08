'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  formatINR, 
  calculateProductMetrics, 
  calculateServiceMetrics 
} from "@/modules/financial/utils/financialEngine";
import { 
  TrendingUp, 
  Package, 
  Users, 
  Clock, 
  Activity, 
  Target, 
  Loader2,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SalesIntelligencePage() {
  const { profile, latestMonth, leadership, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const businessType = profile?.businessType || "Product";
  const teamSize = profile?.teamSize || leadership?.length || 1;

  const productMetrics = latestMonth ? calculateProductMetrics(latestMonth) : { aov: 0, revenuePerUnit: 0, dailyOrderAvg: 0 };
  const serviceMetrics = latestMonth ? calculateServiceMetrics(latestMonth, teamSize) : { revenuePerClient: 0, utilizationRate: 0, clientRetention: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            Sales Intelligence: {businessType} Focus
          </h2>
          <p className="text-muted-foreground">Dynamic performance metrics based on your business DNA.</p>
        </div>
        <Badge variant="outline" className="bg-white px-4 py-1 font-bold text-accent border-accent/20">
          {businessType} Model
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businessType === 'Product' || businessType === 'Hybrid' ? (
          <>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold font-headline">{formatINR(productMetrics.aov)}</p>
                <div className="flex items-center gap-1 text-[10px] text-accent mt-2 font-bold uppercase">
                  <Package className="h-3 w-3" /> {latestMonth?.ordersCount || 0} Orders
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue Per Unit</p>
                <p className="text-3xl font-bold font-headline">{formatINR(productMetrics.revenuePerUnit)}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">{latestMonth?.unitsSold || 0} Units Sold</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Velocity</p>
                <p className="text-3xl font-bold font-headline">{productMetrics.dailyOrderAvg.toFixed(1)}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">Orders / Day</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Utilization Rate</p>
                <p className="text-3xl font-bold font-headline">{serviceMetrics.utilizationRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-bold uppercase">
                  <Clock className="h-3 w-3" /> {latestMonth?.billableHours || 0} Billed Hrs
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue / Client</p>
                <p className="text-3xl font-bold font-headline">{formatINR(serviceMetrics.revenuePerClient)}</p>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-2 font-bold uppercase">
                  <Users className="h-3 w-3" /> {latestMonth?.activeClients || 0} Clients
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retention Rate</p>
                <p className="text-3xl font-bold font-headline">{serviceMetrics.clientRetention.toFixed(1)}%</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">Active Continuity</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Growth Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10">
              <p className="text-sm italic leading-relaxed text-slate-300">
                "{businessType === 'Product' 
                  ? "AOV is stable. Recommend high-margin SKU bundling to increase unit economics." 
                  : "Retention is high. Seek expansion revenue through short-term advisory contracts."}"
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Recurring Stream</p>
                <p className="text-xl font-bold">{formatINR(latestMonth?.recurringRevenue || 0)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">One-Time Stream</p>
                <p className="text-xl font-bold">{formatINR(latestMonth?.oneTimeRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Strategic Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold">Q3 Revenue Target</span>
                <Badge className="bg-accent">₹50L REACHED</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold">Active Pipeline</span>
                <span className="font-bold text-accent">₹1.2Cr</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
