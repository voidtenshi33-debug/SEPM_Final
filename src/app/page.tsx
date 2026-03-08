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
  FileText,
  AlertTriangle
} from "lucide-react";
import { formatINR, calculateRunway, calcEBITDA } from "@/modules/financial/utils/financialEngine";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { calculateProjectHealth } from "@/modules/execution/utils/executionEngine";
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
  const { user } = useUser();
  const { financials, latestMonth, leadership, isLoading: loadingFin } = useFinancials();
  
  const db = useFirestore();
  
  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [db, user]);

  const expensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'expenses');
  }, [db, user]);

  const { data: projects, isLoading: loadingProjects } = useCollection(projectsQuery);
  const { data: tasks, isLoading: loadingTasks } = useCollection(tasksQuery);
  const { data: expenses } = useCollection(expensesQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loadingFin || loadingProjects || loadingTasks || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Synchronizing War Room data...</p>
      </div>
    );
  }

  const currentMRR = latestMonth?.netRevenue || 0;
  const currentBurn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  
  const runway = currentBurn > 0 ? calculateRunway(0, currentBurn) : 99; 
  const teamSize = leadership?.length || 0;
  
  const activeProjects = projects?.filter(p => p.status === 'Active') || [];
  const nearingCompletion = projects?.filter(p => {
    const pTasks = tasks?.filter(t => t.projectId === p.id) || [];
    const health = calculateProjectHealth(p, pTasks, expenses || []);
    return health.progressPct > 70 && health.progressPct < 100;
  }).length || 0;

  const chartData = financials.length > 0 
    ? [...financials].reverse().map(f => ({
        month: f.id,
        revenue: f.netRevenue,
        ebitda: calcEBITDA(f.netRevenue, f.operatingExpenses)
      }))
    : [{ month: 'No Data', revenue: 0, ebitda: 0 }];

  const stats = [
    {
      title: "Cash Runway",
      value: runway >= 99 ? "∞ Months" : `${runway} Mo`,
      description: currentBurn > 0 ? `Burn: ${formatINR(currentBurn)}/mo` : "No burn detected",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      alert: runway < 6 && currentBurn > 0
    },
    {
      title: "Active Team",
      value: teamSize.toString(),
      description: "Leadership members",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Active Strategy",
      value: activeProjects.length.toString(),
      description: `${nearingCompletion} nearing completion`,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Monthly Revenue",
      value: formatINR(currentMRR),
      description: latestMonth ? `Updated: ${latestMonth.id}` : "No revenue logged",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="Command Center" 
        description="Data-driven oversight of your startup's execution, financial health, and strategic growth."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-none shadow-xl hover:shadow-2xl transition-all duration-300 group ${stat.alert ? 'bg-rose-50' : 'bg-white'}`}>
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
                <div className="flex items-center gap-1">
                  {stat.alert && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${stat.alert ? 'text-rose-600' : 'text-slate-400'}`}>{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    Revenue Velocity
                  </CardTitle>
                  <CardDescription>Performance trend from logged monthly data.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              {mounted && financials.length > 0 ? (
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
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Activity className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Log your first month of revenue to view trends.</p>
                  <Button variant="link" asChild className="text-accent font-bold mt-2">
                    <Link href="/financial/operational">Go to Ledger</Link>
                  </Button>
                </div>
              )}
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
                  Growth Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <p className="text-sm italic leading-relaxed">
                    {latestMonth ? "Analyzing revenue composition... Conversion models ready." : "Setup profile and log metrics to activate AI Expansion Modeling."}
                  </p>
                </div>
                <Button variant="secondary" className="w-full font-bold group" asChild>
                  <Link href="/ai-growth">
                    Open Strategy Engine
                    <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  Audit Vault
                </CardTitle>
                <Link href="/documents" className="text-[10px] font-bold text-accent hover:underline">Vault Hub</Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-500 italic">Secure strategic assets and compliance documents in the encrypted vault.</p>
                <Button variant="outline" className="w-full h-9 text-[10px] font-bold uppercase tracking-widest border-slate-100" asChild>
                  <Link href="/documents">Enter Vault</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                Strategic Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeProjects.length > 0 ? activeProjects.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-accent transition-all cursor-pointer group">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-accent transition-colors truncate max-w-[150px]">{p.name}</p>
                    <Badge variant="outline" className="text-[8px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100">
                      Active
                    </Badge>
                  </div>
                )) : (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">No Strategic Initiatives</p>
                    <Button variant="link" asChild className="text-[10px] font-bold h-auto p-0 mt-1">
                      <Link href="/projects">Define Blueprint</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
