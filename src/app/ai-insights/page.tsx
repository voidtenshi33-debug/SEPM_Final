"use client";

import * as React from "react";
import { generateStrategicInsights, type GenerateStrategicInsightsOutput } from "@/ai/flows/ai-strategic-insight-generator-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Loader2, Target, CheckCircle2, AlertTriangle, Sparkles, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIInsightsPage() {
  const [loading, setLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<GenerateStrategicInsightsOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateStrategicInsights({
        startupName: "StartupOS Demo",
        industry: "SaaS",
        stage: "Seed",
        cashRunwayMonths: 14,
        currentRevenueMonthly: 245000,
        teamSize: 12,
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

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-accent" />
            Growth Intelligence Engine
          </h1>
          <p className="text-muted-foreground">AI-driven strategic decision support based on your operational data (INR).</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="bg-accent hover:bg-accent/90 shadow-lg px-8 h-12 font-bold"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          Generate Strategic Analysis
        </Button>
      </div>

      {loading && !insights && (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-3xl space-y-4">
          <div className="relative">
            <BrainCircuit className="h-16 w-16 text-accent animate-pulse" />
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Crunching your startup data with GenAI...</p>
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

      {!insights && !loading && (
        <Card className="border-none shadow-md bg-slate-50">
          <CardContent className="p-12 text-center space-y-4">
            <Sparkles className="h-12 w-12 text-accent/30 mx-auto" />
            <h3 className="text-xl font-bold font-headline">Ready for Strategic Analysis?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click the button above to let StartupOS analyze your current metrics, challenges, and goals to provide actionable growth steps.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
