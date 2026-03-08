"use client";

import * as React from "react";
import { generateStrategicInsights, type GenerateStrategicInsightsOutput } from "@/ai/flows/ai-strategic-insight-generator-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Loader2, Target, CheckCircle2, AlertTriangle, Sparkles, Activity, Rocket, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { getStrategicSuggestions } from "@/modules/execution/utils/executionEngine";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AIInsightsPage() {
  const [loading, setLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<GenerateStrategicInsightsOutput | null>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const { profile, latestMonth, prevMonth, financials } = useFinancials();

  // Rule-based strategic suggestions based on live data
  const suggestions = React.useMemo(() => {
    if (!profile || !latestMonth) return [];
    
    const revenueTrend = (latestMonth.netRevenue > (prevMonth?.netRevenue || 0)) ? 'up' : 'flat';
    const runway = 42000000 / (latestMonth.operatingExpenses - latestMonth.netRevenue || 1);

    return getStrategicSuggestions({
      businessType: profile.businessType || 'Hybrid',
      revenueTrend: revenueTrend as any,
      runway: runway
    });
  }, [profile, latestMonth, prevMonth]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateStrategicInsights({
        startupName: profile?.name || "StartupOS",
        industry: profile?.industry || "Technology",
        stage: "Seed",
        cashRunwayMonths: 14,
        currentRevenueMonthly: latestMonth?.netRevenue || 0,
        teamSize: profile?.teamSize || 1,
        activeProjectsCount: 8,
        recentChallenges: "User churn has slightly increased, and we are facing difficulties hiring a senior backend engineer.",
        currentGoals: "Reach ₹3L MRR by end of year and launch a new AI integration feature."
      });
      setInsights(result);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate insights at this time.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToInitiative = async (suggestion: any) => {
    try {
      await addDoc(collection(db, 'projects'), {
        name: suggestion.title,
        type: suggestion.type === 'Growth' ? 'Growth' : suggestion.type === 'Product' ? 'Product' : 'Infrastructure',
        description: suggestion.reason,
        budgetAllocated: 50000,
        budgetUsed: 0,
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
        createdAt: serverTimestamp()
      });
      toast({ title: "Initiative Launched", description: "Suggestion converted into a strategic project." });
    } catch (e) {
      toast({ title: "Conversion Failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-accent" />
            Growth Intelligence Engine
          </h1>
          <p className="text-muted-foreground">AI-driven strategic decision support based on operational data.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="bg-accent hover:bg-accent/90 shadow-lg px-8 h-12 font-bold"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          Generate Full Strategic Analysis
        </Button>
      </div>

      {/* Suggested Strategic Initiatives (Rule-Based) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 px-1">
          <Rocket className="h-5 w-5 text-indigo-600" />
          Recommended Strategic Initiatives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((s, i) => (
            <Card key={i} className="border-none shadow-xl bg-white group hover:-translate-y-1 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[8px] font-bold uppercase">{s.type}</Badge>
                  <Badge className={s.impact === 'Critical' ? "bg-rose-500" : "bg-blue-500"}>{s.impact} Impact</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed italic">"{s.reason}"</p>
                <Button 
                  onClick={() => convertToInitiative(s)}
                  className="w-full h-9 text-[10px] font-bold uppercase bg-slate-900 hover:bg-accent group"
                >
                  Convert to Project <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {loading && !insights && (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-3xl space-y-4 bg-slate-50">
          <BrainCircuit className="h-16 w-16 text-accent animate-pulse" />
          <p className="text-muted-foreground font-medium">Crunching your startup DNA with GenAI...</p>
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700">
          <Card className="lg:col-span-2 border-none shadow-xl">
            <CardHeader className="bg-primary/5 rounded-t-xl">
              <CardTitle>Strategic Insights</CardTitle>
              <CardDescription>Comprehensive assessment of your current trajectory.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="prose prose-slate max-w-none">
                <p className="leading-relaxed text-lg italic text-slate-700">
                  {insights.strategicInsights}
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Key Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.keyRecommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-accent text-accent-foreground">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Critical Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.criticalAreasToFocus.map((area, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/10 border border-white/20 font-medium text-sm">
                    {area}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <AlertTriangle className={`h-8 w-8 ${
                    insights.sentimentAnalysis.toLowerCase().includes('urgent') ? 'text-rose-500' :
                    insights.sentimentAnalysis.toLowerCase().includes('positive') ? 'text-emerald-500' :
                    'text-amber-500'
                  }`} />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Health Status</p>
                    <p className="text-xl font-headline font-bold">{insights.sentimentAnalysis}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
