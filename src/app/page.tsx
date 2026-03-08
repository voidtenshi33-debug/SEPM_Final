
"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  Activity,
  Plus,
  Loader2,
  Sparkles,
  ShieldCheck,
  Target,
  FileText
} from "lucide-react";
import { formatINR, calculateRunway, calcEBITDA } from "@/modules/financial/utils/financialEngine";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { calculateProjectHealth } from "@/modules/execution/utils/executionEngine";
import { ScheduleWidget } from "@/components/dashboard/schedule-widget";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { financials, latestMonth, leadership, isLoading: loadingFin } = useFinancials();
  
  const db = useFirestore();
  const projectsQuery = useMemoFirebase(() => collection(db, 'projects'), [db]);
  const tasksQuery = useMemoFirebase(() => collection(db, 'tasks'), [db]);
  const expensesQuery = useMemoFirebase(() => collection(db, 'expenses'), [db]);

  const { data: projects, isLoading: loadingProjects } = useCollection(projectsQuery);
  const { data: tasks, isLoading: loadingTasks } = useCollection(tasksQuery);
  const { data: expenses } = useCollection(expensesQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loadingFin || loadingProjects || loadingTasks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Synchronizing War Room data...</p>
      </div>
    );
  }

  // Calculate Metrics
  const currentMRR = latestMonth?.netRevenue || 0;
  const currentBurn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  const runway = calculateRunway(42000000, currentBurn); // Mock cash balance
  const teamSize = leadership?.length || 0;
  
  const activeProjects = projects?.filter(p => p.status === 'Active') || [];
  const nearingCompletion = projects?.filter(p => {
    const projectTasks = tasks?.filter(t => t.projectId === p.id) || [];
    const health = calculateProjectHealth(p, projectTasks, expenses || []);
    return health.progressPct > 70 && health.progressPct < 100;
  }).length || 0;

  const chartData = [...financials].reverse().map(f => ({
    month: f.id,
    revenue: f.netRevenue,
    ebitda: calcEBITDA(f.netRevenue, f.operatingExpenses)
  }));

  const stats = [
    {
      title: "Cash Runway",
      value: runway >= 99 ? "∞ Months" : `${runway} Months`,
      description: "Critical threshold: 6 months",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Team Size",
      value: teamSize.toString(),
      description: "Active leadership members",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Active Projects",
      value: activeProjects.length.toString(),
      description: `${nearingCompletion} nearing completion`,
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Monthly Revenue",
      value: formatINR(currentMRR),
      description: "Updated this period",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="Command Center" 
        description="Unified oversight of your startup's execution, financial health, and tactical schedule."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white" asChild>
              <Link href="/financial/insights">
                <ShieldCheck className="h-4 w-4 mr-2" /> War Room
              </Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20" asChild>
              <Link href="/financial/operational">
                <Plus className="h-4 w-4 mr-2" /> Log Metrics
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-accent transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-bold text-[#0F172A] font-headline">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-medium italic">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    Revenue Velocity
                  </CardTitle>
                  <CardDescription>Historical growth performance in INR (₹)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748B', fontSize: 10, fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748B', fontSize: 10, fontWeight: 600}} 
                      tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} 
                    />
                    <Tooltip 
                      formatter={(v: number) => [formatINR(v), "Revenue"]}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-20 w-20" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Growth Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <p className="text-sm italic leading-relaxed">
                    "Strategic advice: Based on current maturity, an <strong>Enterprise Sales Blitz</strong> is recommended to scale revenue with low risk."
                  </p>
                </div>
                <Button variant="secondary" className="w-full font-bold group" asChild>
                  <Link href="/ai-growth">
                    Open Growth Intelligence
                    <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  Vault Status
                </CardTitle>
                <Link href="/documents" className="text-[10px] font-bold text-accent hover:underline">Manage All</Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">Growth Brief.pdf</span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px]">SECURE</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">Cap Table V4.xlsx</span>
                  </div>
                  <Badge className="bg-amber-50 text-amber-600 border-none text-[8px]">LOCKED</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tactical Column */}
        <div className="space-y-8">
          <ScheduleWidget />

          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                Critical Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Finalize Equity Split", urgency: "High", color: "bg-rose-50 text-rose-600 border-rose-100" },
                  { label: "Monthly Investor Brief", urgency: "Medium", color: "bg-amber-50 text-amber-600 border-amber-100" },
                  { label: "Q3 Budget Calibration", urgency: "Low", color: "bg-slate-50 text-slate-600 border-slate-100" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-accent transition-all cursor-pointer group">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-accent transition-colors">{item.label}</p>
                    <Badge variant="outline" className={`text-[8px] font-bold uppercase ${item.color}`}>
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
