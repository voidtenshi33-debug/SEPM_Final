'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
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
  LayoutList,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";

const CHART_COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function OperationalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  // Fetch snapshots
  const finQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('id', 'desc'), limit(12)), [db]);
  const { data: financials, isLoading: loadingFin } = useCollection(finQuery);

  // Fetch categories
  const catQuery = useMemoFirebase(() => collection(db, 'expenseCategories'), [db]);
  const { data: categories } = useCollection(catQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMonth = financials?.[0];
  const prevMonth = financials?.[1];

  const netRev = currentMonth?.netRevenue || 0;
  const opEx = currentMonth?.operatingExpenses || 0;
  const ebitda = calcEBITDA(netRev, opEx);
  const margin = calcEBITDAMargin(ebitda, netRev);
  
  const prevEbitda = prevMonth ? calcEBITDA(prevMonth.netRevenue, prevMonth.operatingExpenses) : 0;

  const runway = calculateRunway(42000000, opEx); // Mock ₹4.2Cr cash

  // Fetch expenses for current month
  const currentMonthId = currentMonth?.id || '';
  const expensesQuery = useMemoFirebase(() => 
    currentMonthId ? query(collection(db, 'expenses'), where('monthId', '==', currentMonthId)) : null, 
    [db, currentMonthId]
  );
  const { data: expenses } = useCollection(expensesQuery);

  const distributionData = React.useMemo(() => {
    return getMonthlyDistribution(expenses, categories);
  }, [expenses, categories]);

  const fixedVsVariable = React.useMemo(() => {
    const fixed = distributionData.filter(d => d.type === 'Fixed').reduce((sum, d) => sum + d.percentage, 0);
    return { fixed };
  }, [distributionData]);

  const chartData = financials?.map(f => ({
    month: f.id,
    revenue: f.netRevenue,
    expenses: f.operatingExpenses,
  })).reverse() || [];

  if (loadingFin) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-[#0F172A] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cash Runway</p>
               <Wallet className="h-4 w-4 text-blue-400" />
            </div>
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
          <CardHeader>
            <CardTitle className="text-lg font-bold">Burn vs. Revenue Intelligence</CardTitle>
            <CardDescription>Historical trend analysis (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-6 pt-0">
            {mounted ? (
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
            ) : null}
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
                      <span className="font-bold">{fixedVsVariable.fixed.toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${fixedVsVariable.fixed}%` }} />
                   </div>
                   <p className="text-[10px] text-slate-400 italic">High rigidity reduces pivot elasticity.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-accent" />
              Expense Distribution (%)
            </CardTitle>
            <CardDescription>Current month allocation by category</CardDescription>
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
                <p className="text-sm font-medium mb-4">No Data Recorded for {currentMonthId || 'Current Month'}</p>
                <AddExpenseModal categories={categories || []} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <LayoutList className="h-5 w-5 text-accent" />
              Detailed Breakdown
            </CardTitle>
            <CardDescription>Exact numbers vs % of total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Amount (₹)</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">% Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributionData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-700">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-tighter ${
                        row.type === 'Fixed' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                        row.type === 'Variable' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                        'text-emerald-600 bg-emerald-50 border-emerald-100'
                      }`}>
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatINR(row.amount)}</TableCell>
                    <TableCell className="text-right font-bold text-accent">{row.percentage}%</TableCell>
                  </TableRow>
                ))}
                {distributionData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-400 italic">No expense data for this month.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
