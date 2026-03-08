'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  calcEBITDA, 
  calcEBITDAMargin, 
  calculateRunway, 
  formatINR,
  getMonthlyDistribution
} from "@/modules/financial/utils/financialEngine";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OperationalPage() {
  const { financials, expenses, categories, latestMonth, prevMonth, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const netRev = latestMonth?.netRevenue || 0;
  const opEx = latestMonth?.operatingExpenses || 0;
  const ebitda = calcEBITDA(netRev, opEx);
  const margin = calcEBITDAMargin(ebitda, netRev);
  
  const runway = calculateRunway(42000000, opEx); // Mock ₹4.2Cr cash balance

  const chartData = [...financials].reverse().map(f => ({
    month: f.id,
    revenue: f.netRevenue,
    expenses: f.operatingExpenses,
  }));

  const monthlyExpenses = expenses?.filter(e => e.monthId === latestMonth?.id) || [];
  const distribution = getMonthlyDistribution(monthlyExpenses, categories);
  const fixedPct = distribution.filter(d => d.type === 'Fixed').reduce((s, d) => s + d.percentage, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-[#0F172A] text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cash Runway</p>
            <p className="text-3xl font-bold">{runway} Months</p>
            <p className="text-[10px] text-slate-500 mt-2 italic">Est. depletion: Nov 2025</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Burn</p>
            <p className="text-3xl font-bold font-headline">{formatINR(opEx)}</p>
            <div className="flex items-center text-[10px] text-rose-600 mt-2 font-bold uppercase">
               <TrendingUp className="h-3 w-3 mr-1" /> Variable Risk
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly EBITDA</p>
            <p className="text-3xl font-bold font-headline">{formatINR(ebitda)}</p>
            <div className={`flex items-center text-[10px] mt-2 font-bold uppercase ${ebitda >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
               {ebitda >= 0 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
               {ebitda >= 0 ? 'Profitable' : 'Net Loss'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
              {margin < 15 && margin > 0 && (
                <Badge variant="destructive" className="text-[8px] h-4 uppercase">Low Margin</Badge>
              )}
            </div>
            <p className="text-3xl font-bold font-headline">{margin.toFixed(1)}%</p>
            <div className="flex items-center text-[10px] text-accent mt-2 font-bold uppercase tracking-widest">
               <Activity className="h-3 w-3 mr-1" /> Target: 25.0%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Burn vs. Revenue Intelligence</CardTitle>
              <CardDescription>Historical trend analysis (₹)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(value: number) => formatINR(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} name="Net Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#0F172A" strokeWidth={4} dot={{ r: 6, fill: '#0F172A', strokeWidth: 2, stroke: '#fff' }} name="OpEx" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-accent/5 border border-accent/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-accent flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Operational Guard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Efficiency Analysis</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  {margin < 15 ? "EBITDA Margin is below benchmark. Focus on optimizing overhead costs." : "Healthy unit economics detected. Model is trending towards scale."}
                </p>
             </div>
             
             <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cost Rigidity</h4>
                <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Structural Rigidity</span>
                      <span className="font-bold">{fixedPct.toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${fixedPct}%` }} />
                   </div>
                   <p className="text-[10px] text-slate-400 italic">High rigidity reduces pivot elasticity.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
