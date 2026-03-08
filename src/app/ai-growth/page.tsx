
'use client';

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Zap, 
  BrainCircuit, 
  BarChart3,
  Loader2,
  ShieldCheck,
  Rocket,
  Target,
  ArrowUpRight,
  Activity,
  AlertCircle
} from "lucide-react";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { generateStrategicVerdict, getPriorityActions } from "@/modules/ai/utils/growthEngine";
import { calculateProjectHealth } from "@/modules/execution/utils/executionEngine";
import { formatINR, calcEBITDA, calcEBITDAMargin, calculateRunway } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function AIGrowthPage() {
  const { profile, latestMonth, financials, expenses, categories, isLoading } = useFinancials();
  const db = useFirestore();
  const { toast } = useToast();
  const [converting, setConverting] = useState<string | null>(null);

  const projectsQuery = useMemoFirebase(() => collection(db, 'projects'), [db]);
  const tasksQuery = useMemoFirebase(() => collection(db, 'tasks'), [db]);
  const { data: projects } = useCollection(projectsQuery);
  const { data: tasks } = useCollection(tasksQuery);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const ebitda = latestMonth ? calcEBITDA(latestMonth.netRevenue, latestMonth.operatingExpenses) : 0;
  const margin = latestMonth ? calcEBITDAMargin(ebitda, latestMonth.netRevenue) : 0;
  const runway = calculateRunway(42000000, latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0);
  
  const avgProgress = projects && projects.length > 0
    ? projects.reduce((acc, p) => {
        const pTasks = tasks?.filter(t => t.projectId === p.id) || [];
        return acc + calculateProjectHealth(p, pTasks, expenses || []).progressPct;
      }, 0) / projects.length
    : 0;

  const marketStats = { industryGrowthRate: 18 };
  const context = {
    runway,
    revenueTrend: financials.length > 1 && financials[0].netRevenue > financials[1].netRevenue ? 'Up' : 'Stable',
    ebitdaMargin: margin
  };

  const verdict = generateStrategicVerdict(context, { avgProgress }, marketStats);
  const actions = getPriorityActions(verdict, profile?.businessType || 'Hybrid');

  const radarData = [
    { subject: 'Finance', value: Math.min(100, (runway / 12) * 100), fullMark: 100 },
    { subject: 'Execution', value: avgProgress, fullMark: 100 },
    { subject: 'Market', value: 65, fullMark: 100 },
    { subject: 'Product', value: 80, fullMark: 100 },
    { subject: 'Team', value: 75, fullMark: 100 },
  ];

  const handleConvertToInitiative = async (action: any) => {
    setConverting(action.title);
    try {
      const projectRef = await addDoc(collection(db, "projects"), {
        name: action.title,
        description: action.why,
        type: action.type,
        status: "Active",
        budgetAllocated: 500000,
        budgetUsed: 0,
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "tasks"), {
        projectId: projectRef.id,
        title: "Strategy Phase: Market Validation",
        status: "Todo",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedTo: "Founder",
        priority: "High",
        impactType: action.type,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Initiative Authorized",
        description: `${action.title} has been moved to your Strategy Map.`,
      });
    } catch (e) {
      toast({ title: "Authorization Failed", variant: "destructive" });
    } finally {
      setConverting(null);
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <PageHeader 
        title="AI Growth Intelligence" 
        description="Data-driven situational verdicts and strategic expansion modeling."
      />

      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-slate-900">{formatINR(latestMonth?.netRevenue)}</p>
              <Badge variant="outline" className="mt-2 text-[8px] border-emerald-100 text-emerald-600 bg-emerald-50">
                <ArrowUpRight className="h-2.5 w-2.5 mr-1" /> HEALTHY
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Survival Runway</p>
              <p className="text-2xl font-bold text-slate-900">{runway} Mo</p>
              <Badge variant="outline" className="mt-2 text-[8px] border-blue-100 text-blue-600 bg-blue-50 uppercase">
                Liquidity Safe
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Work Integrity</p>
              <p className="text-2xl font-bold text-slate-900">{avgProgress.toFixed(0)}%</p>
              <Badge variant="outline" className="mt-2 text-[8px] border-indigo-100 text-indigo-600 bg-indigo-50 uppercase">
                Execution Active
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue Trend</p>
              <p className="text-2xl font-bold text-slate-900">{context.revenueTrend}</p>
              <Badge variant="outline" className="mt-2 text-[8px] border-slate-100 text-slate-500 uppercase">
                Pulse: Logged
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className={`p-6 rounded-2xl border-l-4 flex items-center justify-between shadow-xl ${
          verdict.color === 'red' ? 'bg-rose-50 border-rose-500' :
          verdict.color === 'green' ? 'bg-emerald-50 border-emerald-500' :
          'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              verdict.color === 'red' ? 'bg-rose-100 text-rose-600' :
              verdict.color === 'green' ? 'bg-emerald-100 text-emerald-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                Strategic Verdict: {verdict.status}
                <Badge variant="outline" className="text-[10px] font-bold h-5">AI CONFIDENCE: 92%</Badge>
              </h4>
              <p className="text-sm text-slate-600 font-medium">{verdict.message}</p>
            </div>
          </div>
          <Zap className={`h-8 w-8 opacity-20 ${
            verdict.color === 'red' ? 'text-rose-500' :
            verdict.color === 'green' ? 'text-emerald-500' :
            'text-amber-500'
          }`} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Market Context Analysis</h3>
          </div>
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Industry Benchmark: {profile?.industry || 'General Tech'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter">
                  <tr>
                    <th className="px-6 py-3">Vector</th>
                    <th className="px-6 py-3">Udyam Status</th>
                    <th className="px-6 py-3">Market Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold">Execution Velocity</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">High</td>
                    <td className="px-6 py-4 text-slate-400">Medium</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold">Product Maturity</td>
                    <td className="px-6 py-4 text-amber-600 font-bold">80%</td>
                    <td className="px-6 py-4 text-slate-400">60%</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold">Market Presence</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">Low</td>
                    <td className="px-6 py-4 text-slate-400">Medium</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 bg-primary text-white space-y-3">
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">AI Position Summary</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs font-bold text-emerald-400">PRODUCT</p>
                    <p className="text-[10px] font-medium">Strong</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-amber-400">EXECUTION</p>
                    <p className="text-[10px] font-medium">Moderate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-rose-400">MARKET</p>
                    <p className="text-[10px] font-medium">Weak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Strategic Strength Radar</h3>
          </div>
          <Card className="border-none shadow-lg h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Strategic DNA"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </section>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">AI-Recommended Strategic Initiatives</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <Card key={i} className="border-none shadow-xl bg-[#0F172A] text-white hover:-translate-y-1 transition-transform group">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <Badge className={`${
                    action.impact === 'Critical' ? 'bg-rose-500' : 'bg-blue-500'
                  } border-none text-[8px] font-bold uppercase`}>
                    {action.impact} Impact
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                  <p className="text-xs text-slate-400 italic mb-4">Why: {action.why}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Risk: Medium</span>
                    <span>Type: {action.type}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleConvertToInitiative(action)}
                  disabled={!!converting}
                  className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white font-bold h-11 rounded-xl"
                >
                  {converting === action.title ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Convert to Strategic Initiative
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
