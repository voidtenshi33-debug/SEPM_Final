
'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  calcEBITDA, 
  calcEBITDAMargin, 
  calcRunway, 
  formatINR
} from "@/modules/financial/utils/financialEngine";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  AlertCircle,
  Loader2,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import Link from "next/link";

export default function OperationalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  // Data subscriptions
  const finQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('month', 'desc'), limit(12)), [db]);
  const catQuery = useMemoFirebase(() => collection(db, 'expenseCategories'), [db]);

  const { data: financials, isLoading: loadingFin } = useCollection(finQuery);
  const { data: categories } = useCollection(catQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loadingFin) {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Operational Profitability</h2>
        <AddExpenseModal categories={categories || []} />
      </div>

      {/* Metric Cards */}
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

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Burn</p>
            <p className="text-3xl font-bold font-headline">{formatINR(opEx)}</p>
            <div className="flex items-center text-[10px] text-rose-600 mt-2 font-bold uppercase tracking-wider">
               <TrendingUp className="h-3 w-3 mr-1" /> Variable Ops Risk
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">EBITDA (Monthly)</p>
            <p className="text-3xl font-bold font-headline">{formatINR(ebitda)}</p>
            <div className={`flex items-center text-[10px] mt-2 font-bold uppercase tracking-wider ${ebitda >= prevEbitda ? 'text-emerald-600' : 'text-rose-600'}`}>
               {ebitda >= prevEbitda ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
               {formatINR(Math.abs(ebitda - prevEbitda))} vs prev
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
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

      {/* Performance Chart */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Burn vs. Revenue intelligence
          </CardTitle>
          <CardDescription>Historical performance in INR (₹)</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] p-8 pt-0">
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

      {/* Insight Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-accent/5 border border-accent/10">
          <CardContent className="p-6 flex items-start gap-4">
             <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-accent" />
             </div>
             <div>
                <h4 className="font-bold text-slate-900 mb-1 font-headline">Guardian Intelligence</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {margin < 15 && margin > 0 ? (
                    "Efficiency Alert: Your EBITDA Margin is below 15%. Direct focus to variable OpEx optimization."
                  ) : margin >= 15 ? (
                    "Sustainable Growth: Your business model supports scaling. Current efficiency is healthy."
                  ) : (
                    "Critical: Operational burn detected. Revisit your pricing model or unit economics immediately."
                  )}
                </p>
             </div>
          </CardContent>
        </Card>

        <Link href="/financial/categories">
          <Card className="border-none shadow-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group h-full border border-slate-200">
            <CardContent className="p-6 flex items-start gap-4">
               <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Zap className="h-6 w-6 text-accent" />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-900 font-headline">Distribution Audit</h4>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-2 py-1 rounded">View Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Audit exactly where your capital is deployed across Fixed vs. Variable cost buckets.
                  </p>
               </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
