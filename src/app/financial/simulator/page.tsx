'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { 
  formatINR, 
  groupExpensesByType,
  runFinancialSimulation,
  calculateRunway,
  calcEBITDA
} from "@/modules/financial/utils/financialEngine";
import { 
  Sliders, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Rocket, 
  Wallet, 
  ArrowRight,
  RefreshCcw,
  Sparkles,
  Info
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ScenarioSimulatorPage() {
  const [mounted, setMounted] = useState(false);
  const [sliders, setSliders] = useState({
    revGrowth: 0,
    costCut: 0,
    fundingInjection: 0
  });

  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch latest month for "Reality" base
  const finQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('id', 'desc'), limit(1)), [db]);
  const { data: financials, isLoading: loadingFin } = useCollection(finQuery);
  const currentMonth = financials?.[0];

  const categoriesQuery = useMemoFirebase(() => collection(db, 'expenseCategories'), [db]);
  const { data: categories, isLoading: loadingCats } = useCollection(categoriesQuery);

  const expensesQuery = useMemoFirebase(() => 
    currentMonth ? query(collection(db, 'expenses'), where('monthId', '==', currentMonth.id)) : null, 
    [db, currentMonth]
  );
  const { data: expenses, isLoading: loadingExps } = useCollection(expensesQuery);

  const reality = React.useMemo(() => {
    if (!currentMonth || !expenses || !categories) return null;
    
    const costSplit = groupExpensesByType(expenses, categories);
    const fixed = costSplit.Fixed + (costSplit["R&D"] || 0);
    const variable = costSplit.Variable;
    const revenue = currentMonth.netRevenue || 0;
    const burn = (fixed + variable) - revenue;
    const cash = 42000000; // Mock ₹4.2Cr reality base for prototype

    return {
      revenue,
      fixed,
      variable,
      totalExpenses: fixed + variable,
      burn: burn > 0 ? burn : 0,
      ebitda: calcEBITDA(revenue, fixed + variable),
      runway: calculateRunway(cash, burn > 0 ? burn : 0),
      cash
    };
  }, [currentMonth, expenses, categories]);

  const simulation = React.useMemo(() => {
    if (!reality) return null;
    
    return runFinancialSimulation(
      {
        netRevenue: reality.revenue,
        fixedCosts: reality.fixed,
        variableCosts: reality.variable,
        cashBalance: reality.cash
      },
      sliders
    );
  }, [reality, sliders]);

  const resetSim = () => setSliders({ revGrowth: 0, costCut: 0, fundingInjection: 0 });

  if (!mounted) return null;

  if (loadingFin || loadingCats || loadingExps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCcw className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Booting Simulation Sandbox...</p>
      </div>
    );
  }

  if (!reality) {
    return (
      <Card className="border-none shadow-sm p-12 text-center bg-slate-50 border-2 border-dashed">
        <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-600 font-headline">Baseline Sync Required</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          The simulator needs at least one month of revenue data and categorical expenses to create your "Reality" baseline.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 font-headline">
            <Rocket className="h-6 w-6 text-accent" />
            What-If Scenario Simulator
          </h3>
          <p className="text-sm text-slate-500">Project your startup's future based on growth and optimization choices.</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSim} className="text-slate-500 border-slate-200 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px]">
          <RefreshCcw className="h-3 w-3 mr-2" /> Reset Sandbox
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: The Cockpit */}
        <Card className="border-none shadow-xl bg-white overflow-hidden h-fit sticky top-24">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sliders className="h-4 w-4" /> Founder Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-slate-700 text-sm">Revenue Growth</Label>
                <Badge className={sliders.revGrowth >= 0 ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}>
                  {sliders.revGrowth >= 0 ? '+' : ''}{sliders.revGrowth}%
                </Badge>
              </div>
              <Slider 
                value={[sliders.revGrowth]} 
                onValueChange={(val) => setSliders({...sliders, revGrowth: val[0]})}
                max={200} 
                min={-50} 
                step={5} 
                className="[&>span:first-child]:bg-accent"
              />
              <p className="text-[10px] text-slate-400 italic leading-relaxed">Model the impact of sales scale-up, churn events, or seasonal contraction.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-slate-700 text-sm">OpEx Reduction</Label>
                <Badge className="bg-emerald-100 text-emerald-700">-{sliders.costCut}%</Badge>
              </div>
              <Slider 
                value={[sliders.costCut]} 
                onValueChange={(val) => setSliders({...sliders, costCut: val[0]})}
                max={50} 
                min={0} 
                step={1} 
                className="[&>span:first-child]:bg-emerald-500"
              />
              <p className="text-[10px] text-slate-400 italic leading-relaxed">Simulate cost optimization in variable buckets like Ads, SaaS, and Cloud.</p>
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                Funding Injection (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input 
                  type="number"
                  className="pl-8 h-12 text-lg font-bold border-slate-200 focus:ring-accent"
                  placeholder="0"
                  value={sliders.fundingInjection || ""}
                  onChange={(e) => setSliders({...sliders, fundingInjection: Number(e.target.value)})}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic leading-relaxed">Simulate impact of a SAFE round, grant, or internal capital boost.</p>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: The Results */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Simulation Comparison Table */}
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-[#0F172A] text-white py-4 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2 font-headline">
                <Zap className="h-5 w-5 text-yellow-400" />
                Simulated Reality Delta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-bold tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Metric</th>
                      <th className="px-6 py-4">Baseline Reality</th>
                      <th className="px-6 py-4">Projected Future</th>
                      <th className="px-6 py-4 text-right">Delta Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Net Revenue</td>
                      <td className="px-6 py-4 text-slate-500">{formatINR(reality.revenue)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatINR(simulation?.simRevenue)}</td>
                      <td className="px-6 py-4 text-right">
                        {sliders.revGrowth !== 0 && (
                          <span className={`font-bold px-2 py-1 rounded text-[10px] ${sliders.revGrowth > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {sliders.revGrowth > 0 ? '+' : ''}{sliders.revGrowth}%
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Monthly Burn</td>
                      <td className="px-6 py-4 text-slate-500">{formatINR(reality.burn)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatINR(simulation?.simBurn)}</td>
                      <td className="px-6 py-4 text-right">
                        {simulation && simulation.simBurn < reality.burn ? (
                          <span className="text-emerald-600 font-bold">-{formatINR(reality.burn - simulation.simBurn)}</span>
                        ) : simulation && simulation.simBurn > reality.burn ? (
                          <span className="text-rose-600 font-bold">+{formatINR(simulation.simBurn - reality.burn)}</span>
                        ) : '-'}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Monthly EBITDA</td>
                      <td className="px-6 py-4 text-slate-500">{formatINR(reality.ebitda)}</td>
                      <td className={`px-6 py-4 font-bold ${simulation && simulation.simEBITDA >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {formatINR(simulation?.simEBITDA)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {simulation && (
                          <span className={`font-bold flex items-center justify-end gap-1 ${simulation.simEBITDA > reality.ebitda ? 'text-emerald-600' : simulation.simEBITDA < reality.ebitda ? 'text-rose-600' : ''}`}>
                            {simulation.simEBITDA > reality.ebitda ? <TrendingUp className="h-3 w-3" /> : simulation.simEBITDA < reality.ebitda ? <TrendingDown className="h-3 w-3" /> : null}
                            {formatINR(Math.abs(simulation.simEBITDA - reality.ebitda))}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Runway Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl bg-white p-8 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runway Extension impact</p>
                <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-blue-50 text-blue-600 border-none">Decision Value</Badge>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400 uppercase">Current Reality</span>
                    <span className="text-slate-600">{reality.runway} Months</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300" style={{ width: `${Math.min((reality.runway / 24) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-accent uppercase">Simulated Future</span>
                    <span className={typeof simulation?.simRunway === 'string' ? "text-2xl font-bold text-emerald-600" : "text-2xl font-bold text-slate-900"}>
                      {simulation?.simRunway} {typeof simulation?.simRunway === 'number' ? 'Months' : ''}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${typeof simulation?.simRunway === 'string' ? 'bg-emerald-500' : 'bg-accent'}`} 
                      style={{ width: `${typeof simulation?.simRunway === 'number' ? Math.min((simulation.simRunway / 24) * 100, 100) : 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl bg-accent text-accent-foreground p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-lg font-headline">Strategic Guard Insight</h4>
                  {typeof simulation?.simRunway === 'string' ? (
                    <p className="text-sm italic leading-relaxed opacity-90">
                      "Excellent. This scenario achieves <strong>Net Zero Burn</strong>. At this point, your startup becomes self-sustaining and external capital is used purely for scaling, not survival."
                    </p>
                  ) : simulation && simulation.simRunway > reality.runway ? (
                    <p className="text-sm italic leading-relaxed opacity-90">
                      "Strategic Pivot: These choices extend your lifeline by <strong>{(simulation.simRunway - reality.runway).toFixed(1)} months</strong>. This buys you critical time to reach your next valuation milestone."
                    </p>
                  ) : simulation && simulation.simRunway < reality.runway ? (
                    <p className="text-sm italic leading-relaxed opacity-90 text-rose-100">
                      "Caution: This growth trajectory increases burn faster than revenue. You are shortening your runway. Ensure your LTV/CAC ratios justify this aggressive scale."
                    </p>
                  ) : (
                    <p className="text-sm italic leading-relaxed opacity-90">
                      Adjust the sliders to explore how small changes in revenue growth or cost discipline can significantly impact your survival timeline.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Info className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Safe Mode Active: Simulations are transient and do not modify your actual Firestore records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
