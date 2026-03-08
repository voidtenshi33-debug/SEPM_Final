'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  formatINR, 
  calculateBreakEvenAnalysis, 
  groupExpensesByType 
} from "@/modules/financial/utils/financialEngine";
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Info,
  Loader2,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from "recharts";

export default function BreakEvenPage() {
  const { financials, latestMonth, expenses, categories, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Calculating Survival Thresholds...</p>
      </div>
    );
  }

  const currentMonthId = latestMonth?.id || new Date().toISOString().substring(0, 7);
  const monthlyExpenses = expenses?.filter(e => (e.monthId === currentMonthId || e.month === currentMonthId)) || [];
  
  const costGroups = groupExpensesByType(monthlyExpenses, categories);
  const fixedCosts = (costGroups.Fixed || 0) + (costGroups["R&D"] || 0);
  const variableCosts = costGroups.Variable || 0;
  const totalRevenue = latestMonth?.netRevenue || 0;

  const analysis = calculateBreakEvenAnalysis(fixedCosts, totalRevenue, variableCosts);

  const chartData = [
    { name: 'Actual Revenue', value: totalRevenue, color: '#3B82F6' },
    { name: 'Break-Even Point', value: analysis?.breakEvenPoint || 0, color: '#0F172A' },
  ];

  const survivalProgress = analysis ? Math.min((totalRevenue / analysis.breakEvenPoint) * 100, 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Scale className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Scale className="h-8 w-8 text-accent" />
            Break-Even Intelligence
          </h2>
          <p className="text-slate-400 mt-1">Mathematical survival mapping for current operational period.</p>
        </div>
        <div className="relative z-10 flex gap-4">
          {analysis && (
            <Badge className={`px-4 py-1.5 text-sm font-bold uppercase tracking-widest ${analysis.isProfitable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {analysis.isProfitable ? 'Self-Sustaining' : 'Burn Phase'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Break-Even Card */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-white overflow-hidden flex flex-col justify-center text-center p-8">
          <CardHeader className="p-0 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Break-Even Revenue</p>
            <CardTitle className="text-4xl font-bold text-slate-900 font-headline">
              {analysis ? formatINR(analysis.breakEvenPoint) : '---'}
            </CardTitle>
            <CardDescription className="text-xs font-bold text-accent mt-2">Required monthly survival revenue</CardDescription>
          </CardHeader>
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fixed Costs</p>
                <p className="text-lg font-bold text-slate-700">{formatINR(fixedCosts)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Variable %</p>
                <p className="text-lg font-bold text-slate-700">
                  {totalRevenue > 0 ? ((variableCosts / totalRevenue) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-slate-500">Survival Progress</span>
                <span className={survivalProgress >= 100 ? 'text-emerald-600' : 'text-rose-600'}>
                  {survivalProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={survivalProgress} className={`h-2 ${survivalProgress >= 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-rose-500'}`} />
            </div>
          </div>
        </Card>

        {/* Survival Velocity Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Survival Velocity
            </CardTitle>
            <CardDescription>Actual Revenue vs. Survival Threshold (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(v: number) => [formatINR(v), "Revenue"]} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Margin of Safety & Contribution */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margin of Safety</p>
                  <p className={`text-2xl font-bold ${analysis?.isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {analysis ? `${analysis.marginOfSafety}%` : '---'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed italic">
                {analysis?.isProfitable 
                  ? "Revenue can drop by this much before the business enters a net loss." 
                  : "Revenue needs to grow by this margin to stabilize the operation."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contribution Margin Ratio</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analysis ? `${analysis.marginRatio}%` : '---'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Percentage of every rupee that contributes to covering fixed costs after variable expenses.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gap and AI Advice */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl bg-accent text-accent-foreground h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Strategic Survival Tip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-70">The Profitability Gap</p>
                  <Badge variant="secondary" className="bg-white/20 text-white border-none font-bold">
                    {analysis ? formatINR(analysis.gap) : '---'}
                  </Badge>
                </div>
                <p className="text-lg italic leading-relaxed">
                  {analysis?.isProfitable 
                    ? "Excellent performance. You are currently operating above the break-even line. Consider reinvesting the surplus into scalable variable-cost growth channels." 
                    : analysis?.gap && analysis.gap > (totalRevenue * 0.5) 
                    ? "Critical Gap: High Fixed Costs detected. Suggest auditing R&D and Salaries or shifting to a leaner, performance-based variable model to reduce the survival threshold."
                    : "Close to Survival: You are within reach of profitability. Focus on increasing high-margin sales or implementing minor price adjustments this month to cross the threshold."}
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0F172A]/30">
                <Info className="h-5 w-5 text-white/60" />
                <p className="text-xs opacity-80 leading-relaxed">
                  The **Break-Even Point** is dynamically linked to your category classifications (Fixed vs. Variable). Ensure your **Cost Categories** are accurately bucketed for maximum precision.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
