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
  HeartPulse
} from "lucide-react";
import { 
  formatINR, 
  calcEBITDA, 
  calcEBITDAMargin, 
  calcRunway, 
  calculateHealthScore, 
  generateInsights,
  type HealthMetrics 
} from "@/modules/financial/utils/financialEngine";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinancialInsightsPage() {
  const { financials, latestMonth, prevMonth, capTable, leadership, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Prep data for engine
  const ebitda = latestMonth ? calcEBITDA(latestMonth.netRevenue, latestMonth.operatingExpenses) : 0;
  const burn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  const leadEquity = leadership.reduce((acc, curr) => acc + (curr.equityPct || 0), 0);
  
  // Calculate Growth
  const salesGrowth = (latestMonth && prevMonth && prevMonth.netRevenue > 0)
    ? ((latestMonth.netRevenue - prevMonth.netRevenue) / prevMonth.netRevenue) * 100
    : 0;

  const metrics: HealthMetrics = {
    runway: calcRunway(168000, burn), // Fixed cash for prototype
    ebitdaMargin: latestMonth ? calcEBITDAMargin(ebitda, latestMonth.netRevenue) : 0,
    burnRate: burn,
    netRevenue: latestMonth?.netRevenue || 0,
    founderEquity: capTable?.founderEquityPct || 0,
    totalInvestorEquity: capTable?.totalInvestorEquityPct || 0,
    salesGrowth
  };

  const healthScore = calculateHealthScore(metrics);
  const insights = generateInsights(metrics);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Founder Blue
    doc.text("UdyamRakshak: Executive Financial Brief", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Startup Health Score: ${healthScore}/100`, 14, 36);

    // Section 1: Vital Signs
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
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] } // Startup Electric
    });

    // Section 2: Ownership Snapshot
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text("2. Ownership Snapshot", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Stakeholder', 'Equity %']],
      body: [
        ['Founders', `${metrics.founderEquity}%`],
        ['Investors', `${metrics.totalInvestorEquity}%`],
        ['Leadership', `${leadEquity}%`],
        ['ESOP', `${capTable?.esopEquityPct || 0}%`],
      ],
      theme: 'grid'
    });

    // Section 3: AI Strategic Advisory
    const secondY = (doc as any).lastAutoTable.finalY || 120;
    doc.text("3. AI Strategic Advisory", 14, secondY + 15);
    
    doc.setFontSize(10);
    let currentY = secondY + 25;
    insights.forEach((insight, i) => {
      const level = insight.level;
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. [${level}]`, 14, currentY);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(insight.msg, 170);
      doc.text(splitText, 45, currentY);
      currentY += (splitText.length * 5) + 5;
    });

    doc.save("UdyamRakshak_Executive_Report.pdf");
  };

  const getInsightIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="h-6 w-6" />;
      case 'TrendingUp': return <TrendingUp className="h-6 w-6" />;
      case 'Users': return <Users className="h-6 w-6" />;
      case 'Activity': return <Activity className="h-6 w-6" />;
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
          <p className="text-muted-foreground">Automated risk detection and efficiency intelligence layer.</p>
        </div>
        <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 shadow-lg">
          <FileDown className="h-4 w-4 mr-2" />
          Download Executive Report (₹)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="h-24 w-24 text-primary" />
          </div>
          <div className="relative h-48 w-48 flex items-center justify-center mb-6">
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 * (1 - healthScore / 100)}
                className={cn(
                  "transition-all duration-1000 ease-out",
                  healthScore > 80 ? "text-emerald-500" : healthScore > 60 ? "text-amber-500" : "text-rose-500"
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-bold">{healthScore}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Health Score</span>
            </div>
          </div>
          <CardTitle>Overall Stability</CardTitle>
          <CardDescription className="mt-2">
            Dynamic assessment of survival runway, unit economics, and governance health.
          </CardDescription>
        </Card>

        {/* Advisory List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <Zap className="h-5 w-5 text-accent" />
            Guardian Strategic Advisories
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {insights.length === 0 ? (
              <Card className="border-none shadow-md bg-emerald-50/50 border-emerald-100">
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="font-bold text-emerald-900">Guardian Status: Secure</p>
                    <p className="text-sm text-emerald-700">All vital operational and capital metrics are within optimal parameters.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight, i) => (
                <Card key={i} className={cn(
                  "border-none shadow-md transition-all hover:translate-x-1",
                  insight.level === 'CRITICAL' ? "bg-rose-50 border-l-4 border-rose-500" : 
                  insight.level === 'WARNING' ? "bg-amber-50 border-l-4 border-amber-500" : 
                  "bg-blue-50 border-l-4 border-blue-500"
                )}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={cn(
                      "mt-1",
                      insight.level === 'CRITICAL' ? "text-rose-500" : 
                      insight.level === 'WARNING' ? "text-amber-500" : 
                      "text-blue-500"
                    )}>
                      {getInsightIcon(insight.icon)}
                    </div>
                    <div>
                      <p className={cn(
                        "font-bold uppercase text-xs tracking-widest mb-1",
                        insight.level === 'CRITICAL' ? "text-rose-700" : 
                        insight.level === 'WARNING' ? "text-amber-700" : 
                        "text-blue-700"
                      )}>
                        {insight.level} • {insight.type}
                      </p>
                      <p className="text-slate-800 font-medium leading-relaxed">{insight.msg}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Vital Threshold Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Runway Buffer (Target: 6 Months)</span>
                  <span className={metrics.runway < 6 ? "text-rose-500" : "text-emerald-500"}>
                    {metrics.runway.toFixed(1)} Months
                  </span>
                </div>
                <Progress value={(metrics.runway / 12) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>EBITDA Efficiency (Target: 15%)</span>
                  <span className={metrics.ebitdaMargin < 15 ? "text-amber-500" : "text-emerald-500"}>
                    {metrics.ebitdaMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(100, (metrics.ebitdaMargin / 30) * 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
