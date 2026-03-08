'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { calculateProjectHealth } from "@/modules/execution/utils/executionEngine";
import { 
  Target, 
  Flag, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Loader2,
  Briefcase,
  Layout,
  AlertOctagon,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddProjectModal } from "@/components/projects/add-project-modal";
import { TaskBoard } from "@/components/projects/task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/modules/financial/utils/financialEngine";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const db = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'projects'), orderBy('targetEndDate', 'asc'));
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
  const { data: expenses, isLoading: loadingExpenses } = useCollection(expensesQuery);

  if (loadingProjects || loadingTasks || loadingExpenses || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Synchronizing Strategy Map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Execution Command Center" 
        description="Linking tactical task completion to strategic budget accountability."
        actions={<AddProjectModal />}
      />

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Strategy Map
          </TabsTrigger>
          <TabsTrigger value="board" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tactical Kanban
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => {
              const projectTasks = tasks?.filter(t => t.projectId === project.id) || [];
              const health = calculateProjectHealth(project, projectTasks, expenses || []);

              return (
                <Card key={project.id} className="border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    health.status === 'Delayed' ? 'bg-rose-500' : 
                    health.status === 'At Risk' ? 'bg-amber-500' : 
                    health.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-slate-50">
                        {project.type}
                      </Badge>
                      <Badge className={
                        health.score > 80 ? "bg-emerald-50 text-emerald-700" : 
                        health.score > 50 ? "bg-amber-50 text-amber-700" : 
                        "bg-rose-50 text-rose-700"
                      }>
                        Health: {health.score}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-accent transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {project.description || "No strategic description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1">
                    {/* Execution Bars */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-blue-600">Work Progress</span>
                          <span>{health.progressPct.toFixed(0)}%</span>
                        </div>
                        <Progress value={health.progressPct} className="h-1.5 [&>div]:bg-blue-500" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-rose-600">Budget Usage</span>
                          <span>{health.budgetUtilization.toFixed(0)}%</span>
                        </div>
                        <Progress value={health.budgetUtilization} className={`h-1.5 ${health.onTrack ? '[&>div]:bg-slate-300' : '[&>div]:bg-rose-500 animate-pulse'}`} />
                      </div>
                    </div>

                    {health.riskReason && (
                      <div className="p-2 rounded-lg bg-rose-50 flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase">
                        <AlertOctagon className="h-3 w-3" />
                        Risk: {health.riskReason}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Burn Indicator</span>
                        <span className={`text-xs font-bold ${health.onTrack ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {health.onTrack ? 'Efficiency High' : 'Cash Bleeding'}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Deadline</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" /> {new Date(project.targetEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button asChild variant="outline" className="w-full text-accent border-accent hover:bg-accent hover:text-white group">
                        <Link href={`/projects/${project.id}`}>
                          Project Hub <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {projects?.length === 0 && (
              <Card className="col-span-full border-2 border-dashed p-20 flex flex-col items-center text-center space-y-4 bg-slate-50">
                <Target className="h-12 w-12 text-slate-200" />
                <div>
                  <h4 className="font-bold text-slate-900">No Strategic Initiatives</h4>
                  <p className="text-sm text-muted-foreground">Define your first project to activate execution monitoring.</p>
                </div>
                <AddProjectModal />
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="board" className="animate-in fade-in duration-300">
          <TaskBoard projects={projects || []} tasks={tasks || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
