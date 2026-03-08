'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  formatINR, 
  calculateGrowth,
  calculateProductMetrics, 
  calculateServiceMetrics 
} from "@/modules/financial/utils/financialEngine";
import { 
  TrendingUp, 
  Package, 
  Sparkles,
  Users,
  ArrowUpRight,
  BarChart3,
  Loader2,
  Activity,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function SalesIntelligencePage() {
  const { profile, latestMonth, prevMonth, leadership, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Calibrating Sales Intelligence...</p>
      </div>
    );
  }

  const businessType = profile?.businessType || "Hybrid";
  const teamSize = profile?.teamSize || leadership?.length || 1;

  const growth = (latestMonth && prevMonth) ? calculateGrowth(latestMonth.netRevenue, prevMonth.netRevenue) : 0;

  const productMetrics = latestMonth ? calculateProductMetrics(latestMonth) : { aov: 0, revenuePerUnit: 0, dailyOrderAvg: 0 };
  const serviceMetrics = latestMonth ? calculateServiceMetrics(latestMonth, teamSize) : { revenuePerClient: 0, utilizationRate: 0, clientRetention: 0 };

  const renderProductSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-5 w-5 text-accent" />
        <h3 className="text-xl font-bold text-slate-900 font-headline">Product Sales Engine</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units Sold</p>
            <p className="text-3xl font-bold text-slate-900">{latestMonth?.unitsSold || 0}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-bold uppercase">
              <Activity className="h-3 w-3" /> Avg {productMetrics.dailyOrderAvg.toFixed(1)} / day
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-slate-900">{formatINR(productMetrics.aov)}</p>
            <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-2 font-bold uppercase">
              <Target className="h-3 w-3" /> Transaction Efficiency
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue Per Unit</p>
            <p className="text-3xl font-bold text-slate-900">{formatINR(productMetrics.revenuePerUnit)}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-bold uppercase">
              <TrendingUp className="h-3 w-3" /> Unit Economics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderServiceSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-indigo-600" />
        <h3 className="text-xl font-bold text-slate-900 font-headline">Service Delivery Intel</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Clients</p>
            <p className="text-3xl font-bold text-slate-900">{latestMonth?.activeClients || 0}</p>
            <Badge variant="outline" className="text-[8px] h-4 mt-2 font-bold bg-indigo-50 border-indigo-100 text-indigo-700">
              RETENTION: {serviceMetrics.clientRetention.toFixed(1)}%
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue Per Client</p>
            <p className="text-3xl font-bold text-slate-900">{formatINR(serviceMetrics.revenuePerClient)}</p>
            <div className="flex items-center gap-1 text-[10px] text-indigo-600 mt-2 font-bold uppercase">
              <Target className="h-3 w-3" /> Client Lifetime Value
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Utilization Rate</p>
            <p className="text-3xl font-bold text-slate-900">{serviceMetrics.utilizationRate.toFixed(1)}%</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-bold uppercase">
              <Activity className="h-3 w-3" /> Cap: {teamSize * 160} hrs/mo
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* High Level Growth Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0F172A] p-10 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <TrendingUp className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 font-headline">Sales Intelligence</h2>
          <p className="text-slate-400 text-sm">Strategic performance mapping for <span className="text-accent font-bold uppercase">{businessType}</span> models.</p>
        </div>
        <div className="flex justify-end gap-12 relative z-10">
           <div className="text-right">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Growth Index</p>
             <p className={`text-4xl font-bold flex items-center justify-end ${growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
               {growth.toFixed(1)}% 
               <ArrowUpRight className={`ml-2 h-8 w-8 ${growth < 0 && 'rotate-90'}`} />
             </p>
           </div>
           <div className="text-right">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Net Revenue</p>
             <p className="text-4xl font-bold text-accent">{formatINR(latestMonth?.netRevenue)}</p>
           </div>
        </div>
      </div>

      {/* Adaptive Metrics Sections */}
      {(businessType === "Product" || businessType === "Hybrid") && renderProductSection()}
      {(businessType === "Service" || businessType === "Hybrid") && renderServiceSection()}

      {/* Strategic Visualization & AI Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Revenue Composition
            </CardTitle>
            <CardDescription>Recurring vs. One-Time Split (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Recurring', value: latestMonth?.recurringRevenue || 0 },
                { name: 'One-Time', value: latestMonth?.oneTimeRevenue || 0 }
              ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(v: number) => [formatINR(v), "Revenue"]} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  <Cell fill="#3B82F6" />
                  <Cell fill="#0F172A" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-accent text-accent-foreground flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Sparkles className="h-24 w-24" />
          </div>
          <CardHeader>
             <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Guardian AI Suggestions
             </CardTitle>
             <CardDescription className="text-accent-foreground/70">Strategic adjustments based on current model health.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6 pt-4">
             <div className="p-5 rounded-[1.5rem] bg-white/10 border border-white/20 backdrop-blur-sm">
                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Model Health Diagnostic</h4>
                <p className="text-base italic leading-relaxed">
                  {businessType === "Product" ? (
                    productMetrics.aov < 1000 ? "AOV is currently below segment benchmark. Suggest bundling high-margin accessories or implementing multi-buy discounts to increase transaction value." : "Healthy AOV maintained. Unit economics are scaling efficiently at the current transaction volume."
                  ) : (
                    serviceMetrics.utilizationRate < 60 ? "Team utilization is low (under 60%). High bench-time detected—consider aggressive outbound sales or temporary resource reallocation." : "Optimal team utilization. Model scalability now depends on immediate strategic hires to increase billable capacity."
                  )}
                </p>
             </div>
             
             <div className="p-5 rounded-[1.5rem] bg-white/10 border border-white/20 backdrop-blur-sm">
                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Revenue Elasticity Warning</h4>
                <p className="text-base italic leading-relaxed">
                  {latestMonth && latestMonth.recurringRevenue < (latestMonth.netRevenue * 0.4) 
                    ? "Warning: Dependence on one-time sales is >60%. Strategic pivot toward subscription conversion is required to stabilize long-term cash flow predictability."
                    : "Excellent recurring revenue mix. Your business stability is significantly above segment benchmark."}
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
