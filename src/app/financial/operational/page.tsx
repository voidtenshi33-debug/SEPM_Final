'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  calcEBITDA, 
  calculateRunway, 
  formatINR,
  getMonthlyDistribution,
  calculateBudgetVariance
} from "@/modules/financial/utils/financialEngine";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  AlertCircle,
  PieChart as PieIcon,
  CheckCircle2,
  Loader2,
  Target,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import { SetBudgetModal } from "@/components/financials/set-budget-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CHART_COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function OperationalPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  const { financials, categories, expenses, budget, isLoading } = useFinancials(selectedMonth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMonth = financials?.find(f => f.id === selectedMonth) || financials?.[0];
  
  const netRev = currentMonth?.netRevenue || 0;
  const opEx = currentMonth?.operatingExpenses || 0;
  const ebitda = calcEBITDA(netRev, opEx);
  const burn = opEx > netRev ? opEx - netRev : 0;
  const runway = burn > 0 ? calculateRunway(0, burn) : 999;

  // Distribution Logic
  const monthExpenses = expenses?.filter(e => (e.monthId === selectedMonth || e.month === selectedMonth)) || [];
  const distributionData = React.useMemo(() => {
    return getMonthlyDistribution(monthExpenses, categories);
  }, [monthExpenses, categories]);

  // Variance Logic
  const varianceReport = React.useMemo(() => {
    if (!budget?.categoryBudgets) return [];
    
    return categories.map(cat => {
      const budgetItem = budget.categoryBudgets.find((b: any) => b.categoryId === cat.id);
      const actualItem = distributionData.find(d => d.id === cat.id);
      const budgetAmount = budgetItem?.budgetAmount || 0;
      const actualAmount = actualItem?.amount || 0;
      
      const { variance, variancePct, status } = calculateBudgetVariance(actualAmount, budgetAmount);
      
      return {
        ...cat,
        budgetAmount,
        actualAmount,
        variance,
        variancePct,
        status
      };
    }).filter(v => v.budgetAmount > 0 || v.actualAmount > 0);
  }, [budget, categories, distributionData]);

  const totalBudget = varianceReport.reduce((sum, v) => sum + v.budgetAmount, 0);
  const totalActual = varianceReport.slice().reduce((sum, v) => sum + v.actualAmount, 0);
  const totalProgress = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const chartData = financials?.map(f => ({
    month: f.id,
    revenue: f.netRevenue,
    expenses: f.operatingExpenses,
  })).reverse() || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold font-headline">Operational Guard</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] h-9 font-bold">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {financials?.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.id}</SelectItem>
              ))}
              {(!financials?.some(f => f.id === selectedMonth)) && (
                <SelectItem value={selectedMonth}>{selectedMonth}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <SetBudgetModal categories={categories} monthId={selectedMonth} existingBudget={budget} />
          <AddExpenseModal categories={categories} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-[#0F172A] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cash Runway</p>
               <Wallet className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{runway >= 999 ? '∞ Stable' : `${runway} Mo`}</p>
            <p className="text-[10px] text-slate-500 mt-2 italic">{burn > 0 ? `Burn: ${formatINR(burn)}/mo` : 'No burn detected'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Burn</p>
            <p className="text-3xl font-bold font-headline">{formatINR(burn)}</p>
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Efficiency</p>
            <p className={cn("text-3xl font-bold font-headline", totalProgress > 100 ? 'text-rose-600' : 'text-emerald-600')}>
              {totalProgress.toFixed(1)}%
            </p>
            <div className="flex items-center text-[10px] text-slate-400 mt-2 font-bold uppercase">
               {totalActual > totalBudget ? <AlertCircle className="h-3 w-3 mr-1 text-rose-500" /> : <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />}
               Plan vs. Execution
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Summary Preview */}
      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              Budget vs. Actual Variance
            </CardTitle>
            <CardDescription>Situational spend auditing for {selectedMonth}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-accent font-bold group">
            <Link href="/financial/operational/budget">
              Detailed Ledger <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {varianceReport.length > 0 ? (
            <div className="relative overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-bold tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Utilization Indicator</th>
                    <th className="px-6 py-4 text-right">Variance (₹)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {varianceReport.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{row.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-[180px] ml-auto">
                          <Progress 
                            value={Math.min((row.actualAmount / (row.budgetAmount || 1)) * 100, 100)} 
                            className={cn("h-1.5 rounded-full", row.status === 'OVER' ? 'bg-rose-100 [&>div]:bg-rose-500' : 'bg-slate-100 [&>div]:bg-emerald-500')} 
                          />
                        </div>
                      </td>
                      <td className={cn("px-6 py-4 text-right font-bold", row.status === 'OVER' ? 'text-rose-600' : 'text-emerald-600')}>
                        {row.status === 'OVER' ? '+' : '-'}{formatINR(Math.abs(row.variance))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[8px] font-bold",
                          row.status === 'OVER' ? "bg-rose-50 text-rose-700 border-rose-100" : row.status === 'UNDER' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""
                        )}>
                          {row.status === 'OVER' ? 'Over' : row.status === 'UNDER' ? 'Under' : 'Track'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <ShieldAlert className="h-8 w-8 text-slate-200" />
              <p className="text-sm text-muted-foreground">Establish categorical targets to activate variance intelligence.</p>
              <SetBudgetModal categories={categories} monthId={selectedMonth} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Burn vs. Revenue Velocity</CardTitle>
            <CardDescription>Historical trend analysis (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-6 pt-0">
            {mounted && chartData.length > 0 ? (
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
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Insufficient performance history.</div>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-accent" />
              Categorical Burn (%)
            </CardTitle>
            <CardDescription>Current month allocation</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {mounted && distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [formatINR(value), `${props.payload.name} (${props.payload.percentage}%)`]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-lg text-slate-400 p-8 text-center">
                <PieIcon className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No Data Recorded for {selectedMonth}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}