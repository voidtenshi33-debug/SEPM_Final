"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight, Zap, Target, TrendingUp, ShieldCheck, Activity } from "lucide-react"
import { aiStrategicGrowthInsights, type AiStrategicGrowthInsightsOutput } from "@/ai/flows/ai-strategic-growth-insights"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, collection, writeBatch, serverTimestamp } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/provider"
import { getStrategicRecommendations, generateTaskTemplate } from "@/modules/execution/utils/executionEngine"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateRunway, formatINR } from "@/modules/financial/utils/financialEngine"

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<AiStrategicGrowthInsightsOutput | null>(null)
  const [creatingProject, setCreatingProject] = useState<string | null>(null)
  
  const db = useFirestore()
  const { toast } = useToast()

  const profileRef = useMemoFirebase(() => doc(db, 'startupProfile', 'main'), [db])
  const { data: profile } = useDoc(profileRef)

  const financialsQuery = useMemoFirebase(() => collection(db, 'financials'), [db])
  const { data: financials } = useCollection(financialsQuery)

  const projectsQuery = useMemoFirebase(() => collection(db, 'projects'), [db])
  const { data: projects } = useCollection(projectsQuery)

  const tasksQuery = useMemoFirebase(() => collection(db, 'tasks'), [db])
  const { data: tasks } = useCollection(tasksQuery)

  const latestMonth = financials && financials.length > 0 ? financials[0] : null;
  const currentBurn = latestMonth ? Math.max(0, latestMonth.operatingExpenses - latestMonth.netRevenue) : 0;
  
  // Real Runway Calc (Using baseline if profile doesn't have it)
  const currentCash = 1000000; 
  const runway = currentBurn > 0 ? calculateRunway(currentCash, currentBurn) : 99;

  const recommendations = React.useMemo(() => {
    return getStrategicRecommendations(profile, financials || [], runway);
  }, [profile, financials, runway]);

  const executionIndex = React.useMemo(() => {
    if (!projects || projects.length === 0) return 0;
    const totalProgress = projects.reduce((acc, p) => {
      const pTasks = tasks?.filter(t => t.projectId === p.id) || [];
      const completed = pTasks.filter(t => t.status === 'Completed').length;
      const prog = pTasks.length > 0 ? (completed / pTasks.length) * 100 : 0;
      return acc + prog;
    }, 0);
    return totalProgress / projects.length;
  }, [projects, tasks]);

  const generateInsights = async () => {
    setLoading(true)
    try {
      const data = {
        financialHealthSummary: latestMonth 
          ? `Current monthly revenue is ${formatINR(latestMonth.netRevenue)} with ${formatINR(latestMonth.operatingExpenses)} expenses. Estimated runway is ${runway} months.`
          : "No financial records logged yet.",
        projectProgressSummary: projects && projects.length > 0
          ? `Executing ${projects.length} strategic projects. Execution velocity is ${executionIndex.toFixed(0)}%.`
          : "No strategic initiatives defined.",
        teamCapacitySummary: profile?.teamSize 
          ? `Leadership team size is ${profile.teamSize}. Tracking performance scores.`
          : "Team structure not yet defined in profile."
      }

      const result = await aiStrategicGrowthInsights(data)
      setInsights(result)
    } catch (error) {
      toast({
        title: "AI Engine Error",
        description: "Failed to synthesize platform data. Ensure financials are logged.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const convertToInitiative = async (rec: any) => {
    setCreatingProject(rec.id)
    try {
      const projectRef = doc(collection(db, 'projects'))
      const batch = writeBatch(db)

      batch.set(projectRef, {
        name: rec.title,
        description: rec.why,
        type: rec.type,
        status: 'Active',
        budgetAllocated: 500000,
        budgetUsed: 0,
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: serverTimestamp()
      })

      const templateTasks = generateTaskTemplate(rec.template)
      templateTasks.forEach(t => {
        const taskRef = doc(collection(db, 'tasks'))
        batch.set(taskRef, {
          ...t,
          projectId: projectRef.id,
          status: 'Todo',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: "Founder",
          createdAt: serverTimestamp()
        })
      })

      await batch.commit()
      toast({
        title: "Initiative Launched",
        description: `${rec.title} has been added to your Strategy Map.`,
      })
    } catch (err) {
      toast({ title: "Action Failed", description: "Could not create project record.", variant: "destructive" })
    } finally {
      setCreatingProject(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-20">
      <PageHeader 
        title="Expansion Modeling" 
        description="Rule-based strategic detection combined with generative growth modeling."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Strategic Recommendations - Rule Based */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Strategic Opportunities
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.length > 0 ? recommendations.map((rec) => (
                <Card key={rec.id} className="bg-[#0F172A] border-none text-white overflow-hidden group">
                  <CardContent className="p-6 flex items-start gap-6">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold">{rec.title}</h4>
                        <Badge className={`${rec.impact === 'Critical' ? 'bg-rose-500' : 'bg-blue-500'} text-white border-none text-[8px] uppercase font-bold`}>
                          {rec.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{rec.why}</p>
                      <div className="pt-2">
                        <Button 
                          onClick={() => convertToInitiative(rec)}
                          disabled={creatingProject === rec.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs font-bold"
                        >
                          {creatingProject === rec.id ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <Target className="h-3 w-3 mr-2" />
                          )}
                          Convert to Strategic Initiative
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card className="border-2 border-dashed p-12 text-center text-slate-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">Log performance signals to unlock expansion modeling.</p>
                </Card>
              )}
            </div>
          </section>

          {/* Generative Insights */}
          {!insights ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <BrainCircuit className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Generative Roadmap Ready</h3>
                <p className="text-slate-500 mb-8 max-w-md text-sm">
                  UdyamRakshak is ready to synthesize your platform signals into a deep-dive growth roadmap.
                </p>
                <Button 
                  size="lg" 
                  onClick={generateInsights} 
                  disabled={loading}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 h-12 rounded-xl"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Platform signals...</>
                  ) : (
                    <><Sparkles className="h-5 w-5 mr-2" /> Generate Roadmap</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="flex items-center text-sm font-bold text-slate-900 uppercase">
                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Core Observations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {insights.strategicInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                          <div className="mt-1 h-5 w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <span className="text-xs leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
                    <CardTitle className="flex items-center text-sm font-bold text-slate-900 uppercase">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                      Expansion Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {insights.growthRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-none shadow-lg bg-amber-50/20 border border-amber-100">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-amber-700 uppercase flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-slate-600 leading-relaxed">
                    {insights.riskAssessment}
                  </p>
                </CardContent>
              </Card>

              <Button variant="ghost" onClick={() => setInsights(null)} className="text-slate-400 hover:text-slate-600">
                Regenerate Roadmap
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-blue-50/50 p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase text-blue-600 tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4" /> Strategic Pulse
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Model Context</p>
                <p className="text-sm font-bold text-slate-900">{profile?.businessType || 'Hybrid'} Engine</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Execution Index</p>
                <Progress value={executionIndex} className="h-1.5" />
                <p className="text-[9px] text-slate-500 font-medium">Strategic initiatives are {executionIndex.toFixed(0)}% healthy.</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm p-6 bg-[#0F172A] text-white">
            <TrendingUp className="h-8 w-8 text-blue-400 mb-4" />
            <h4 className="font-bold text-sm mb-2">Growth Optimization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified intelligence detects gaps between your financial runway and execution speed. Use the "Convert to Initiative" feature to instantly pivot your team toward high-impact opportunities.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
