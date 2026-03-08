'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { 
  calcEBITDA, 
  calcEBITDAMargin, 
  calcRunway, 
  formatINR,
  calculateExpenseDistribution
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
  Loader2,
  PieChart as PieChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import { cn } from "@/lib/utils";

export default function OperationalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  // Subscriptions
  const finQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('month', 'desc'), limit(12)), [db]);
  const catQuery = useMemoFirebase(() => collection(db, 'expenseCategories'), [db]);
  const expQuery = useMemoFirebase(() => collection(db, 'expenses'), [db]);

  const { data: financials, isLoading: loadingFin } = useCollection(finQuery);
  const { data: categories } = useCollection(catQuery);
  const { data: expenses, isLoading: loadingExp } = useCollection(expQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loadingFin || loadingExp) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Synchronizing operational metrics...</p>
      </div>
    );
  }

  const currentMonth = financials?.[0];
  const prevMonth = financials?.[1];

  const netRev = currentMonth?.netRevenue || 0;
  const opEx = currentMonth?.operatingExpenses || 0;
  const ebitda = calcEBITDA(netRev, opEx);
  const margin = calcEBITDAMargin(ebitda, netRev);
  
  const prevNetRev = prevMonth?.netRevenue || 0;
  const prevOpEx = prevMonth?.operatingExpenses || 0;
  const prevEbitda = calcEBITDA(prevNetRev, prevOpEx);

  const runway = calcRunway(42000000, opEx); // Mock ₹4.2Cr cash

  const chartData = financials?.map(f => ({
    month: f.month,
    revenue: f.netRevenue,
    expenses: f.operatingExpenses,
  })).reverse() || [];

  // Categorical Analysis for Current Month
  const currentMonthExpenses = expenses?.filter(e => e.month === currentMonth?.month) || [];
  const distribution = calculateExpenseDistribution(currentMonthExpenses, categories || []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Operational Performance</h2>
        <AddExpenseModal categories={categories || []} />
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
               <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Cash Runway</p>
               <Wallet className="h-4 w-4 text-accent" />
            </div>
            <p className="text-3xl font-bold">{runway >= 99 ? "∞" : runway.toFixed(1)} Months</p>
            <p className="text-[10px] opacity-50 mt-2 italic font-medium">Est. burn survival threshold</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Burn</p>
            <p className="text-3xl font-bold font-headline">{formatINR(opEx)}</p>
            <div className="flex items-center text-[10px] text-rose-600 mt-2 font-bold uppercase tracking-wider">
               <TrendingUp className="h-3 w-3 mr-1" /> Variable Ops Risk
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">EBITDA (Monthly)</p>
            <p className="text-3xl font-bold font-headline">{formatINR(ebitda)}</p>
            <div className={`flex items-center text-[10px] mt-2 font-bold uppercase tracking-wider ${ebitda >= prevEbitda ? 'text-emerald-600' : 'text-rose-600'}`}>
               {ebitda >= prevEbitda ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
               {formatINR(Math.abs(ebitda - prevEbitda))} vs prev
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">EBITDA Margin</p>
              {margin < 15 && margin > 0 && (
                <Badge variant="destructive" className="text-[8px] h-4 uppercase">Low Efficiency</Badge>
              )}
            </div>
            <p className="text-3xl font-bold font-headline">{margin.toFixed(1)}%</p>
            <div className="flex items-center text-[10px] text-accent mt-2 font-bold uppercase tracking-wider">
               <Activity className="h-3 w-3 mr-1" /> Target: 25.0%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary Trend Chart */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Revenue vs Expenses Intelligence
            </CardTitle>
            <CardDescription>Historical performance in INR (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-6 pt-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip 
                    formatter={(value: number) => formatINR(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6' }} name="Net Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#0F172A" strokeWidth={4} dot={{ r: 4, fill: '#0F172A' }} name="OpEx" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-lg">
                <Activity className="h-8 w-8 text-slate-200 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Distribution Analysis */}
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-accent" />
              Expense Distribution Breakdown
            </CardTitle>
            <CardDescription>Allocation for {currentMonth?.month || 'Current Month'}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <div className="p-6 h-[300px]">
                {mounted && distribution.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution.categories}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {distribution.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${formatINR(value)} (${props.payload.percentage.toFixed(1)}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl">
                    <PieChartIcon className="h-10 w-10 text-slate-200 mb-2" />
                    <p className="text-xs text-muted-foreground italic">No categorized expenses for this month.</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50/50 flex flex-col justify-center border-l">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fixed Costs</span>
                    </div>
                    <span className="text-sm font-bold">{distribution.fixedPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Variable Costs</span>
                    </div>
                    <span className="text-sm font-bold">{distribution.variablePct.toFixed(1)}%</span>
                  </div>
                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      {distribution.fixedPct > 70 ? "High cost rigidity detected. Review overhead." : "Healthy cost structure for scalability."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {distribution.categories.length > 0 && (
              <div className="p-6 pt-0 border-t">
                <div className="relative overflow-auto max-h-[200px] mt-6">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase text-muted-foreground font-bold border-b">
                      <tr>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2 text-right">Amount (₹)</th>
                        <th className="pb-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {distribution.categories.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 font-medium flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </td>
                          <td className="py-2">
                            <Badge variant="outline" className={cn(
                              "text-[8px] h-4",
                              item.type === 'Fixed' ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"
                            )}>
                              {item.type}
                            </Badge>
                          </td>
                          <td className="py-2 text-right font-medium">{formatINR(item.amount)}</td>
                          <td className="py-2 text-right font-bold text-accent">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Intelligence Block */}
      <Card className="border-none shadow-lg bg-accent/5 border border-accent/10">
        <CardContent className="p-6 flex items-start gap-4">
           <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-accent" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 mb-1 font-headline tracking-tight">Guardian Operational Intelligence</h4>
              {margin < 15 && margin > 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "EBITDA Margin is below the 15% threshold. Efficiency optimization in overhead costs is recommended to stabilize the unit economics."
                </p>
              ) : margin >= 15 ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Business model becoming sustainable. EBITDA margin is healthy and trending towards scale. Maintain OpEx discipline."
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Caution: Operating burn detected. Focus on accelerating Net Revenue or optimizing fixed costs to reach break-even."
                </p>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}