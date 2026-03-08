'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  calcEBITDA, 
  calcEBITDAMargin, 
  calcRunway, 
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
  PieChart as PieChartIcon,
  ReceiptText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import { cn } from "@/lib/utils";

export default function OperationalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  // Data subscriptions
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
        <p className="text-sm text-muted-foreground font-medium">Synchronizing operational metrics...</p>
      </div>
    );
  }

  const currentMonthRecord = financials?.[0];
  const prevMonthRecord = financials?.[1];

  const netRev = currentMonthRecord?.netRevenue || 0;
  const opEx = currentMonthRecord?.operatingExpenses || 0;
  const ebitda = calcEBITDA(netRev, opEx);
  const margin = calcEBITDAMargin(ebitda, netRev);
  
  const prevNetRev = prevMonthRecord?.netRevenue || 0;
  const prevOpEx = prevMonthRecord?.operatingExpenses || 0;
  const prevEbitda = calcEBITDA(prevNetRev, prevOpEx);

  const runway = calcRunway(42000000, opEx); // Mock ₹4.2Cr cash balance

  const chartData = financials?.map(f => ({
    month: f.month,
    revenue: f.netRevenue,
    expenses: f.operatingExpenses,
  })).reverse() || [];

  // Distribution logic for current month
  const currentMonthExpenses = expenses?.filter(e => e.month === currentMonthRecord?.month) || [];
  const distributionData = getMonthlyDistribution(currentMonthExpenses, categories || []);
  
  const fixedTotal = distributionData.filter(d => d.type === 'Fixed').reduce((s, d) => s + d.amount, 0);
  const variableTotal = distributionData.filter(d => d.type === 'Variable').reduce((s, d) => s + d.amount, 0);
  const grandTotal = fixedTotal + variableTotal;

  const fixedPct = grandTotal > 0 ? (fixedTotal / grandTotal) * 100 : 0;
  const variablePct = grandTotal > 0 ? (variableTotal / grandTotal) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold font-headline">Operational Command</h2>
        <AddExpenseModal categories={categories || []} />
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2 text-primary-foreground/70 uppercase tracking-widest font-bold text-[10px]">
               <span>Cash Runway</span>
               <Wallet className="h-4 w-4" />
            </div>
            <p className="text-3xl font-bold">{runway >= 99 ? "∞" : runway.toFixed(1)} Months</p>
            <p className="text-[10px] opacity-60 mt-2 font-medium">Est. depletion: Nov 2025</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Burn</p>
            <p className="text-3xl font-bold font-headline">{formatINR(opEx)}</p>
            <div className="flex items-center text-[10px] text-rose-600 mt-2 font-bold uppercase tracking-wider">
               <TrendingUp className="h-3 w-3 mr-1" /> Variable Ops Risk
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">EBITDA (Monthly)</p>
            <p className="text-3xl font-bold font-headline">{formatINR(ebitda)}</p>
            <div className={`flex items-center text-[10px] mt-2 font-bold uppercase tracking-wider ${ebitda >= prevEbitda ? 'text-emerald-600' : 'text-rose-600'}`}>
               {ebitda >= prevEbitda ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
               {formatINR(Math.abs(ebitda - prevEbitda))} vs prev
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">EBITDA Margin</p>
              {margin < 15 && margin > 0 && (
                <Badge variant="destructive" className="text-[8px] h-4 uppercase font-bold">Low Efficiency</Badge>
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
        {/* Performance Chart */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Burn vs. Revenue Intelligence
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

        {/* Expense Distribution Intelligence */}
        <Card className="border-none shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-accent" />
              Expense Distribution Analysis
            </CardTitle>
            <CardDescription>Breakdown for {currentMonthRecord?.month || 'Current Period'}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {distributionData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${formatINR(value)} (${props.payload.percentage}%)`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-6 bg-slate-50/30 flex flex-col justify-center border-l border-slate-100">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white border shadow-sm space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Cost Rigidity: Fixed</span>
                          <span>{fixedPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${fixedPct}%` }} />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white border shadow-sm space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Cost Elasticity: Variable</span>
                          <span>{variablePct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all" style={{ width: `${variablePct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t flex-1">
                  <div className="relative overflow-auto max-h-[300px] mt-6">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] uppercase text-slate-500 font-bold border-b sticky top-0 bg-white">
                        <tr>
                          <th className="pb-3 px-2">Category</th>
                          <th className="pb-3 px-2">Type</th>
                          <th className="pb-3 px-2 text-right">Amount (₹)</th>
                          <th className="pb-3 px-2 text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {distributionData.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className={cn(
                                "text-[9px] h-4 uppercase font-bold",
                                item.type === 'Fixed' ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"
                              )}>
                                {item.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-medium">{formatINR(item.amount)}</td>
                            <td className="py-3 px-2 text-right font-bold text-accent">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <ReceiptText className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">No Expenses Recorded</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                    Begin logging operational costs for {currentMonthRecord?.month || 'this month'} to unlock distribution intelligence.
                  </p>
                </div>
                <AddExpenseModal categories={categories || []} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Intelligence Footer */}
      <Card className="border-none shadow-lg bg-accent/5 border border-accent/10">
        <CardContent className="p-6 flex items-start gap-4">
           <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-accent" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 mb-1 font-headline tracking-tight">Guardian Operational Intelligence</h4>
              {margin < 15 && margin > 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Efficiency Alert: Your EBITDA Margin is below 15%. Analyzing cost rigidity... Fixed costs account for {fixedPct.toFixed(1)}% of burn. Focus on optimizing high-impact variable costs to stabilize unit economics."
                </p>
              ) : margin >= 15 ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Sustainable Growth Detected: EBITDA margin is healthy at {margin.toFixed(1)}%. Current cost elasticity supports scaling. Maintain OpEx discipline."
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Critical Observation: Operating burn detected. Your survival runway depends on reaching break-even or securing follow-on capital. Review '{distributionData[0]?.name || 'Top Cost'}' as the primary optimization target."
                </p>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
