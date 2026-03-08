
'use client';

import * as React from "react";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  FileDown, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  Loader2,
  TrendingUp,
  ShieldAlert,
  Users,
  Activity,
  HeartPulse,
  AlertOctagon,
  TrendingDown
} from "lucide-react";
import { 
  formatINR, 
  calcEBITDA, 
  calcEBITDAMargin, 
  calculateRunway, 
  calculateHealthScore, 
  generateInsights,
  analyzeRiskProfile
} from "@/modules/financial/utils/financialEngine";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinancialInsightsPage() {
  const { financials, latestMonth, capTable, investors, leadership, budget, expenses, categories, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Calculate Variance for Insights
  let totalVariancePct = 0;
  let marketingVariancePct = 0;

  if (budget?.categoryBudgets && latestMonth) {
    const monthExpenses = expenses.filter(e => e.month === latestMonth.id);
    const totalBud = budget.categoryBudgets.reduce((s: number, b: any) => s + b.budgetAmount, 0);
    const totalAct = monthExpenses.reduce((s: number, e: any) => s + e.amount, 0);
    
    if (totalBud > 0) {
      totalVariancePct = ((totalAct - totalBud) / totalBud) * 100;
    }

    const marketingCat = categories.find(c => c.name.toLowerCase().includes('marketing'));
    if (marketingCat) {
      const markBud = budget.categoryBudgets.find((b: any) => b.categoryId === marketingCat.id)?.budgetAmount || 0;
      const markAct = monthExpenses.filter(e => e.categoryId === marketingCat.id).reduce((s: number, e: any) => s + e.amount, 0);
      if (markBud > 0) {
        marketingVariancePct = ((markAct - markBud) / markBud) * 100;
      }
    }
  }

  // Prep data for engines
  const ebitda = latestMonth ? calcEBITDA(latestMonth.netRevenue, latestMonth.operatingExpenses) : 0;
  const burn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  const totalInvestorPct = (investors || []).reduce((sum, inv) => sum + (inv.equityPct || 0), 0);
  const leadEquity = (leadership || []).reduce((acc, curr) => acc + (curr.equityPct || 0), 0);
  
  const metrics = {
    runway: calculateRunway(168000, burn), // Fixed cash for prototype
    ebitdaMargin: latestMonth ? calcEBITDAMargin(ebitda, latestMonth.netRevenue) : 0,
    burnRate: burn,
    netRevenue: latestMonth?.netRevenue || 0,
    founderEquity: capTable?.founderPct || 0,
    totalInvestorPct,
    totalVariancePct,
    marketingVariancePct
  };

  const healthScore = calculateHealthScore({
    ...metrics,
    founderEquity: metrics.founderEquity // Health score expects explicit prop
  });
  
  const insights = generateInsights({
    ...metrics,
    totalInvestorEquity: metrics.totalInvestorPct
  });

  const risks = analyzeRiskProfile({
    runway: metrics.runway,
    totalInvestorPct: metrics.totalInvestorPct,
    ebitdaMargin: metrics.ebitdaMargin,
    burnRate: metrics.burnRate,
    netRevenue: metrics.netRevenue
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text("UdyamRakshak: Executive Financial Brief", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Startup Health Score: ${healthScore}/100`, 14, 36);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Vital Signs (INR)", 14, 48);
    
    autoTable(doc, {
      startY: 53,
      head: [['Metric', 'Current Value']],
      body: [
        ['Net Revenue', formatINR(metrics.netRevenue)],
        ['Monthly Burn', formatINR(metrics.burnRate)],
        ['EBITDA Margin', `${metrics.ebitdaMargin.toFixed(1)}%`],
        ['Cash Runway', `${metrics.runway.toFixed(1)} Months`],
        ['Budget Variance', `${totalVariancePct.toFixed(1)}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text("2. Ownership Snapshot", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Stakeholder', 'Equity %']],
      body: [
        ['Founders', `${metrics.founderEquity}%`],
        ['Investors', `${metrics.totalInvestorPct}%`],
        ['Leadership', `${leadEquity}%`],
        ['ESOP', `${capTable?.esopPct || 0}%`],
      ],
      theme: 'grid'
    });

    const secondY = (doc as any).lastAutoTable.finalY || 120;
    doc.text("3. Strategic Risk Assessment", 14, secondY + 15);
    doc.setFontSize(10);
    let currentY = secondY + 25;
    risks.forEach((risk, i) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. [${risk.level}] ${risk.label}`, 14, currentY);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(risk.msg, 170);
      doc.text(splitText, 45, currentY);
      currentY += (splitText.length * 5) + 5;
    });

    doc.save("UdyamRakshak_Executive_Report.pdf");
  };

  const getRiskIcon = (iconName?: string) => {
    switch (iconName) {
      case 'AlertOctagon': return <AlertOctagon className="h-6 w-6" />;
      case 'AlertTriangle': return <AlertTriangle className="h-6 w-6" />;
      case 'TrendingDown': return <TrendingDown className="h-6 w-6" />;
      case 'Users': return <Users className="h-6 w-6" />;
      case 'ShieldAlert': return <ShieldAlert className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-accent" />
            War Room: Strategic Intelligence
          </h2>
          <p className="text-muted-foreground">Proactive risk detection and survival monitoring layer.</p>
        </div>
        <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 shadow-lg">
          <FileDown className="h-4 w-4 mr-2" />
          Download Executive Report (₹)
        </Button>
      </div>

      {/* 1. Proactive Risk Monitoring View */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          Risk Guardian Assessment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risks.length === 0 ? (
            <Card className="col-span-full border-none shadow-md bg-emerald-50 border border-emerald-100">
              <CardContent className="flex items-center gap-4 p-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-900">Guardian Status: Secure</p>
                  <p className="text-sm text-emerald-700">All vital operational and governance parameters are within safe thresholds.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            risks.map((risk, i) => (
              <Card key={i} className={cn(
                "border-none shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group",
                risk.level === 'CRITICAL' ? "bg-white border-l-4 border-rose-500" : 
                risk.level === 'WARNING' ? "bg-white border-l-4 border-amber-500" : 
                "bg-white border-l-4 border-blue-500"
              )}>
                <div className={cn(
                  "absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity",
                  risk.level === 'CRITICAL' ? "text-rose-500" : "text-slate-500"
                )}>
                  {getRiskIcon(risk.icon)}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      risk.level === 'CRITICAL' ? "bg-rose-50 text-rose-600" : 
                      risk.level === 'WARNING' ? "bg-amber-50 text-amber-600" : 
                      "bg-blue-50 text-blue-600"
                    )}>
                      {getRiskIcon(risk.icon)}
                    </div>
                    <div>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-tighter",
                        risk.level === 'CRITICAL' ? "text-rose-500" : "text-slate-400"
                      )}>{risk.level} • {risk.label}</p>
                      <h4 className="font-bold text-slate-900 leading-tight">{risk.label}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {risk.msg}
                  </p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended:</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase h-5",
                      risk.level === 'CRITICAL' ? "border-rose-200 text-rose-700 bg-rose-50" : ""
                    )}>
                      {risk.action}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Stability Gauge */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-[#0F172A] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="h-24 w-24 text-accent" />
          </div>
          <div className="relative h-48 w-48 flex items-center justify-center mb-6">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
              <circle
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 * (1 - healthScore / 100)}
                className={cn(
                  "transition-all duration-1000 ease-out",
                  healthScore > 80 ? "text-emerald-400" : healthScore > 60 ? "text-amber-400" : "text-rose-400"
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-bold">{healthScore}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
            </div>
          </div>
          <CardTitle className="text-white">Situational Stability</CardTitle>
          <CardDescription className="mt-2 text-slate-400">
            Dynamic assessment of survival runway, unit economics, and governance health.
          </CardDescription>
        </Card>

        {/* 3. Strategic Advisories */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
            <Zap className="h-4 w-4 text-accent" />
            Operational Efficiency Advisories
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {insights.length === 0 ? (
              <Card className="border-none shadow-md bg-slate-50">
                <CardContent className="flex items-center gap-4 p-6 text-slate-400">
                  <Activity className="h-6 w-6" />
                  <p className="text-sm font-medium">No efficiency warnings detected for the current period.</p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight, i) => (
                <Card key={i} className={cn(
                  "border-none shadow-md",
                  insight.level === 'CRITICAL' ? "bg-rose-50/50" : "bg-blue-50/50"
                )}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={cn(
                      "mt-1",
                      insight.level === 'CRITICAL' ? "text-rose-500" : "text-blue-500"
                    )}>
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-bold uppercase text-[10px] tracking-widest mb-1",
                        insight.level === 'CRITICAL' ? "text-rose-700" : "text-blue-700"
                      )}>
                        {insight.level} • {insight.type}
                      </p>
                      <p className="text-slate-800 font-medium leading-relaxed text-sm">{insight.msg}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 4. Threshold Tracking */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Vital Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-500">Runway Buffer (Target: 6 Mo)</span>
                  <span className={metrics.runway < 6 ? "text-rose-500" : "text-emerald-500"}>
                    {metrics.runway.toFixed(1)} Months
                  </span>
                </div>
                <Progress value={(metrics.runway / 12) * 100} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-500">EBITDA Margin (Target: 15%)</span>
                  <span className={metrics.ebitdaMargin < 15 ? "text-amber-500" : "text-emerald-500"}>
                    {metrics.ebitdaMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(100, (metrics.ebitdaMargin / 30) * 100)} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-500">Budget Variance (Target: < 5%)</span>
                  <span className={totalVariancePct > 10 ? "text-rose-500" : "text-emerald-500"}>
                    {totalVariancePct.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(100, totalVariancePct)} className={cn("h-1.5", totalVariancePct > 10 ? "[&>div]:bg-rose-500" : "")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
