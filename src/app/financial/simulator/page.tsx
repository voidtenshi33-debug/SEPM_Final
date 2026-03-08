'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { 
  formatINR, 
  runFinancialSimulation, 
  groupExpensesByType 
} from "@/modules/financial/utils/financialEngine";
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Info,
  Loader2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ScenarioSimulatorPage() {
  const { latestMonth, expenses, categories, isLoading } = useFinancials();

  // Simulation Sliders State
  const [revGrowth, setRevGrowth] = useState(0); // -50 to 200
  const [costCut, setCostCut] = useState(0); // 0 to 50
  const [funding, setFunding] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Booting Simulation Sandbox...</p>
      </div>
    );
  }

  // Base Reality Data
  const currentMonthId = latestMonth?.id || new Date().toISOString().substring(0, 7);
  const monthlyExpenses = expenses?.filter(e => (e.monthId === currentMonthId || e.month === currentMonthId)) || [];
  const costGroups = groupExpensesByType(monthlyExpenses, categories);
  
  const baseData = {
    netRevenue: latestMonth?.netRevenue || 0,
    fixedCosts: (costGroups.Fixed || 0) + (costGroups["R&D"] || 0),
    variableCosts: costGroups.Variable || 0,
    cashBalance: 42000000 // Mock base cash ₹4.2Cr
  };

  const baseEBITDA = baseData.netRevenue - (baseData.fixedCosts + baseData.variableCosts);
  const baseBurn = Math.max(0, (baseData.fixedCosts + baseData.variableCosts) - baseData.netRevenue);
  const baseRunway = baseBurn > 0 ? (baseData.cashBalance / baseBurn).toFixed(1) : "99.9";

  // Simulated Reality Data
  const sim = runFinancialSimulation(baseData, {
    revGrowth,
    costCut,
    fundingInjection: funding
  });

  const resetSim = () => {
    setRevGrowth(0);
    setCostCut(0);
    setFunding(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BrainCircuit className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-accent" />
            Founder's Sandbox
          </h2>
          <p className="text-slate-400 mt-1">Non-destructive "What-If" decision modeling for strategic planning.</p>
        </div>
        <div className="relative z-10">
          <button 
            onClick={resetSim}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <RefreshCcw className="h-3 w-3" /> Reset Reality
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: The Cockpit Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Scenario Cockpit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-10">
              {/* Revenue Growth Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-slate-700">Revenue Growth</Label>
                  <Badge variant="secondary" className={cn(
                    "font-bold",
                    revGrowth > 0 ? "bg-emerald-50 text-emerald-700" : revGrowth < 0 ? "bg-rose-50 text-rose-700" : ""
                  )}>
                    {revGrowth > 0 ? '+' : ''}{revGrowth}%
                  </Badge>
                </div>
                <Slider 
                  value={[revGrowth]} 
                  onValueChange={(v) => setRevGrowth(v[0])} 
                  min={-50} 
                  max={200} 
                  step={5} 
                  className="[&>span:first-child]:bg-accent"
                />
                <p className="text-[10px] text-slate-400 font-medium italic">Models impact of sales scale or churn events.</p>
              </div>

              {/* Expense Optimization Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-slate-700">OpEx Reduction</Label>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold">
                    {costCut}% optimization
                  </Badge>
                </div>
                <Slider 
                  value={[costCut]} 
                  onValueChange={(v) => setCostCut(v[0])} 
                  min={0} 
                  max={50} 
                  step={1} 
                  className="[&>span:first-child]:bg-indigo-600"
                />
                <p className="text-[10px] text-slate-400 font-medium italic">Simulates cutting non-essential variable costs.</p>
              </div>

              {/* Funding Injection Input */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  Funding Injection (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="pl-8 font-bold text-slate-900 border-slate-200"
                    value={funding || ""}
                    onChange={(e) => setFunding(Number(e.target.value))}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">Simulates impact of a new SAFE or Equity round.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-accent text-accent-foreground p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-16 w-16" />
            </div>
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Strategic Guard
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              Simulations are <strong>Read-Only</strong>. Feel free to model aggressive growth or emergency cuts without affecting your actual records.
            </p>
          </Card>
        </div>

        {/* Right: The Simulation Results */}
        <div className="lg:col-span-2 space-y-8">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Projected MRR</p>
                <CardTitle className="text-3xl font-bold font-headline">{formatINR(sim.simRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold border-none",
                    sim.simRevenue > baseData.netRevenue ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                  )}>
                    {sim.simRevenue > baseData.netRevenue ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {((sim.simRevenue / (baseData.netRevenue || 1) - 1) * 100).toFixed(1)}% vs. Reality
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Simulated EBITDA</p>
                <CardTitle className={cn(
                  "text-3xl font-bold font-headline",
                  sim.simEBITDA >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {formatINR(sim.simEBITDA)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {sim.simEBITDA >= 0 ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Profit Achieved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 text-[10px] font-bold">
                      <TrendingDown className="h-3 w-3 mr-1" /> Burn Phase
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Runway Decision Value Visualization */}
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Lifeline Extension Impact
              </CardTitle>
              <CardDescription>Visualizing the value of simulated choices on survival time.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              {/* Runway Bar Comparison */}
              <div className="space-y-6">
                {/* Base Runway */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Reality Runway</p>
                    <span className="text-sm font-bold text-slate-600">{baseRunway === "99.9" ? "Self-Sustaining" : `${baseRunway} Months`}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400" style={{ width: `${Math.min(parseFloat(baseRunway) * 5, 100)}%` }} />
                  </div>
                </div>

                {/* Simulated Runway */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Simulated Runway</p>
                    <span className={cn(
                      "text-sm font-bold",
                      sim.simRunway > parseFloat(baseRunway) ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {sim.simRunway >= 99.9 ? "∞ (Self-Sustaining)" : `${sim.simRunway} Months`}
                    </span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end px-3",
                        sim.simRunway >= 99.9 ? "bg-emerald-500" : sim.simRunway > parseFloat(baseRunway) ? "bg-accent" : "bg-rose-500"
                      )} 
                      style={{ width: `${Math.min(sim.simRunway * 5, 100)}%` }} 
                    >
                      {sim.simRunway > parseFloat(baseRunway) && (
                        <TrendingUp className="h-3 w-3 text-white animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Insights */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="p-3 h-fit rounded-xl bg-white border border-slate-200 shadow-sm">
                    <Info className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Monthly Burn Delta</h5>
                    <p className="text-lg font-bold text-slate-900">
                      {sim.burnImpact < baseBurn ? '-' : ''}{formatINR(Math.abs(baseBurn - sim.burnImpact))}
                    </p>
                    <p className="text-[10px] text-slate-500 italic">Net monthly cash flow change.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 h-fit rounded-xl bg-white border border-slate-200 shadow-sm">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Cash Injection Impact</h5>
                    <p className="text-lg font-bold text-slate-900">
                      +{formatINR(funding)}
                    </p>
                    <p className="text-[10px] text-slate-500 italic">Simulated liquidity boost.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
