'use client';

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase";
import { doc, collection, query, where, addDoc, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Zap,
  ListTodo,
  ArrowLeft,
  Clock,
  MessageSquare,
  Award,
  Loader2,
  Trophy,
  UserPlus,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { calculateProjectHealth } from "@/modules/execution/utils/executionEngine";
import { formatINR } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function ProjectDetailsPage() {
  const { projectId } = useParams() as { projectId: string };
  const db = useFirestore();
  const { user } = useUser();
  
  const [newUpdate, setNewUpdate] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const projectRef = useMemoFirebase(() => doc(db, 'projects', projectId), [db, projectId]);
  const { data: project, isLoading: loadingProject } = useDoc(projectRef);

  const tasksQuery = useMemoFirebase(() => query(collection(db, 'tasks'), where('projectId', '==', projectId)), [db, projectId]);
  const { data: tasks } = useCollection(tasksQuery);

  const leadershipQuery = useMemoFirebase(() => collection(db, 'leadership'), [db]);
  const { data: team } = useCollection(leadershipQuery);

  const expensesQuery = useMemoFirebase(() => collection(db, 'expenses'), [db]);
  const { data: allExpenses } = useCollection(expensesQuery);

  const handleAssignTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const taskData = {
      projectId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedTo: formData.get('assignedTo') as string,
      deadline: formData.get('deadline') as string,
      priority: formData.get('priority') as string,
      impactType: formData.get('impact') as string,
      estimatedHours: Number(formData.get('hours')),
      status: 'Todo',
      bonusEligible: false,
      createdAt: new Date().toISOString()
    };

    addDoc(collection(db, 'tasks'), taskData);
    setAssignModalOpen(false);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate || !selectedTask) return;

    const updateRef = collection(db, 'tasks', selectedTask, 'weeklyUpdates');
    addDoc(updateRef, {
      content: newUpdate,
      authorId: user?.email || 'Anonymous',
      createdAt: new Date().toISOString(),
      taskId: selectedTask
    });

    const taskRef = doc(db, 'tasks', selectedTask);
    updateDoc(taskRef, { lastUpdateAt: new Date().toISOString() });

    setNewUpdate("");
    setSelectedTask(null);
  };

  if (loadingProject) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (!project) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-slate-500 font-bold">Strategic initiative not found.</p>
      <Link href="/projects"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Strategy Map</Button></Link>
    </div>
  );

  const health = calculateProjectHealth(project, tasks || [], allExpenses || []);

  const todoTasks = tasks?.filter(t => t.status === 'Todo') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'In Progress') || [];
  const completedTasks = tasks?.filter(t => t.status === 'Completed') || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200">
          Strategy / {project.type}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title={project.name} 
          description={project.description}
        />
        <div className="flex items-center gap-3">
           <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
             <DialogTrigger asChild>
               <Button className="bg-[#3B82F6] text-white">
                 <UserPlus className="h-4 w-4 mr-2" /> Distribute Work
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[500px]">
               <form onSubmit={handleAssignTask}>
                 <DialogHeader>
                   <DialogTitle>Assign Strategic Task</DialogTitle>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                     <Label htmlFor="title">Task Title</Label>
                     <Input id="title" name="title" placeholder="e.g. Q4 Growth Roadmap" required />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                       <Label htmlFor="assignedTo">Assign To</Label>
                       <Select name="assignedTo" required>
                         <SelectTrigger>
                           <SelectValue placeholder="Select leader" />
                         </SelectTrigger>
                         <SelectContent>
                           {team?.map(member => (
                             <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="grid gap-2">
                       <Label htmlFor="deadline">Deadline</Label>
                       <Input id="deadline" name="deadline" type="date" required />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                       <Label htmlFor="priority">Priority</Label>
                       <Select name="priority" defaultValue="Medium">
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="High">P0 - Critical</SelectItem>
                           <SelectItem value="Medium">P1 - Strategic</SelectItem>
                           <SelectItem value="Low">P2 - Operational</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="grid gap-2">
                       <Label htmlFor="impact">Impact Area</Label>
                       <Select name="impact" defaultValue="Growth">
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Revenue">Revenue</SelectItem>
                           <SelectItem value="Cost">Cost Cut</SelectItem>
                           <SelectItem value="Growth">Growth</SelectItem>
                           <SelectItem value="Product">Product</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="hours">Estimated Hours</Label>
                     <Input id="hours" name="hours" type="number" placeholder="10" />
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="description">Objective</Label>
                     <Textarea id="description" name="description" placeholder="Outcome expected..." />
                   </div>
                 </div>
                 <DialogFooter>
                   <Button type="submit" className="bg-[#3B82F6] w-full">Assign & Notify</Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>
           <Badge className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full ${
             health.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
             health.status === 'At Risk' ? 'bg-amber-100 text-amber-700' :
             health.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
             health.status === 'No Execution Started' ? 'bg-slate-100 text-slate-700' :
             'bg-blue-100 text-blue-700'
           }`}>
             {health.status} ({health.score}/100)
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  Work Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold text-[#0F172A]">{health.progressPct.toFixed(0)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">COMPLETED</p>
                </div>
                <Progress value={health.progressPct} className="h-2 bg-slate-50" />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>{completedTasks.length} Tasks Done</span>
                  <span>{tasks?.length || 0} Total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  Capital Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold text-[#0F172A]">{health.budgetUtilization.toFixed(0)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">CONSUMED</p>
                </div>
                <Progress value={Math.min(health.budgetUtilization, 100)} className={`h-2 ${health.budgetUtilization > 100 ? 'bg-rose-100' : 'bg-slate-50'}`} />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Allocated: {formatINR(project.budgetAllocated)}</span>
                  <span className={health.onTrack ? 'text-emerald-600' : 'text-rose-600'}>
                    {health.onTrack ? 'On Target' : 'Overspending'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="bg-slate-100 p-1 h-12 rounded-xl mb-6">
              <TabsTrigger value="tasks" className="rounded-lg px-8 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600">
                <ListTodo className="h-4 w-4 mr-2" /> Task Pipeline
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-lg px-8 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600">
                <Trophy className="h-4 w-4 mr-2" /> Performance Guard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tactical Queue (Todo) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tactical Queue</span>
                    <Badge variant="secondary" className="text-[8px]">{todoTasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {todoTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={() => setSelectedTask(task.id)} onStatusToggle={() => updateDoc(doc(db, 'tasks', task.id), { status: 'In Progress' })} />
                    ))}
                  </div>
                </div>

                {/* Active Execution (In Progress) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Execution</span>
                    <Badge variant="secondary" className="text-[8px] bg-blue-50 text-blue-600">{inProgressTasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {inProgressTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={() => setSelectedTask(task.id)} onStatusToggle={() => updateDoc(doc(db, 'tasks', task.id), { status: 'Completed', completedAt: new Date().toISOString(), bonusEligible: new Date() <= new Date(task.deadline) })} isProgress />
                    ))}
                  </div>
                </div>

                {/* Milestone Achieved (Completed) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Milestone Achieved</span>
                    <Badge variant="secondary" className="text-[8px] bg-emerald-50 text-emerald-600">{completedTasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={() => setSelectedTask(task.id)} onStatusToggle={() => updateDoc(doc(db, 'tasks', task.id), { status: 'Todo' })} isCompleted />
                    ))}
                  </div>
                </div>
              </div>

              {tasks?.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                  <Target className="h-10 w-10 opacity-20" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-600">No tactical execution started.</p>
                    <p className="text-xs">Distribute your first task to activate the pipeline monitor.</p>
                  </div>
                  <Button size="sm" onClick={() => setAssignModalOpen(true)} className="bg-blue-600 h-8 rounded-lg text-[10px] font-bold uppercase">Assign First Task</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Project Accountability Metrics
                  </CardTitle>
                  <CardDescription>Weighted evaluation of initiative health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Compliance Vectors</h6>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Deadline Adherence</span>
                            <span className={new Date() > new Date(project.targetEndDate) ? 'text-rose-600' : 'text-emerald-600'}>
                              {new Date() > new Date(project.targetEndDate) ? 'Overdue' : 'On Track'}
                            </span>
                          </div>
                          <Progress value={new Date() > new Date(project.targetEndDate) ? 0 : 100} className="h-1.5" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Execution Velocity</span>
                            <span>{health.progressPct.toFixed(0)}%</span>
                          </div>
                          <Progress value={health.progressPct} className="h-1.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 border-4 ${
                        health.score > 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                        health.score > 50 ? 'border-amber-500 text-amber-600 bg-amber-50' :
                        'border-rose-500 text-rose-600 bg-rose-50'
                      }`}>
                        <span className="text-2xl font-bold">{health.score}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">Health Index</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[180px]">Reconciled performance across timeline, budget, and task rate.</p>
                    </div>
                  </div>

                  {health.riskReason && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-rose-900">Strategic Risk Detected</p>
                        <p className="text-xs text-rose-700">{health.riskReason}. Immediate Lead attention required.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-[#F8FAFC] border border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Weekly Initiative Pulse
              </CardTitle>
              <CardDescription className="text-[10px]">What did you achieve this week?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedTask ? (
                <form onSubmit={handleSubmitUpdate} className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Logging for: {tasks?.find(t => t.id === selectedTask)?.title}</Label>
                    <Textarea 
                      placeholder="One sentence progress report..." 
                      className="min-h-[100px] rounded-xl text-sm"
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => setSelectedTask(null)}>Cancel</Button>
                    <Button type="submit" size="sm" className="flex-1 bg-[#3B82F6] rounded-lg text-xs font-bold">Post Update</Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center space-y-2">
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tighter">Founder Mode Pulse</p>
                  <p className="text-xs text-blue-600 italic leading-relaxed">"Strategic access requires task selection to log weekly consistency score."</p>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Strategic History</p>
                <div className="space-y-4">
                  {tasks?.filter(t => t.lastUpdateAt).length === 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600">System</span>
                        <span className="text-[8px] text-slate-400">Project History</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">Strategic tracking active. Selection required for task updates.</p>
                    </div>
                  ) : (
                    tasks?.filter(t => t.lastUpdateAt).map(t => (
                      <div key={t.id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm space-y-2 animate-in slide-in-from-right-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600">{t.assignedTo}</span>
                          <span className="text-[8px] text-slate-400">{new Date(t.lastUpdateAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-900 truncate">RE: {t.title}</p>
                        <p className="text-[10px] text-slate-500 italic">Progress logged.</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F172A] text-white border-none p-6">
            <div className="flex items-start gap-4">
              <Award className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Performance Bonus</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tasks?.filter(t => t.bonusEligible).length || 0} tasks currently qualify for early-completion bonus recognition.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdate, onStatusToggle, isProgress, isCompleted }: { task: any, onUpdate: () => void, onStatusToggle: () => void, isProgress?: boolean, isCompleted?: boolean }) {
  const isOverdue = !isCompleted && new Date() > new Date(task.deadline);

  return (
    <Card className={`border-none shadow-sm hover:shadow-md transition-all group border-l-4 ${
      isCompleted ? 'border-l-emerald-500' : isProgress ? 'border-l-blue-500' : 'border-l-slate-300'
    }`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-bold text-slate-900 text-xs leading-snug">{task.title}</h5>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0" onClick={onStatusToggle}>
            {isCompleted ? <ArrowLeft className="h-3 w-3 text-slate-400" /> : <ArrowRight className="h-3 w-3 text-blue-600" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[8px] h-4 uppercase border-slate-200">{task.assignedTo}</Badge>
          <span className={`text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
            <Clock className="h-2.5 w-2.5" /> {task.deadline}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          <Badge className={`text-[7px] font-bold uppercase h-4 ${task.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'}`}>{task.priority}</Badge>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[8px] font-bold uppercase text-blue-600 hover:bg-blue-50" onClick={onUpdate}>Pulse Update</Button>
        </div>
      </CardContent>
    </Card>
  );
}
