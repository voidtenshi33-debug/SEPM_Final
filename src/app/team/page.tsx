
'use client';

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Shield, 
  Copy, 
  Activity, 
  Trophy, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Zap,
  ListTodo,
  ExternalLink,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { calculateVestingProgress } from "@/modules/financial/utils/financialEngine";
import { calculateMemberPerformance } from "@/modules/execution/utils/executionEngine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const COLORS = ["bg-slate-900", "bg-blue-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"];

export default function TeamManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const leadershipQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'leadership'), orderBy('name', 'asc'));
  }, [db, user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [db, user]);

  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: tasks } = useCollection(tasksQuery);

  if (loadingLead || !user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  const memberPerformances = leadership?.map(m => {
    const memberTasks = tasks?.filter(t => t.assignedTo === m.name) || [];
    return { ...m, performance: calculateMemberPerformance(memberTasks) };
  }) || [];

  const avgTeamScore = memberPerformances.length > 0 
    ? Math.round(memberPerformances.reduce((acc, curr) => acc + curr.performance.score, 0) / memberPerformances.length)
    : 0;

  const topPerformer = memberPerformances.length > 0 
    ? [...memberPerformances].sort((a, b) => b.performance.score - a.performance.score)[0]
    : null;
  const totalActiveTasks = tasks?.filter(t => t.status !== 'Completed').length || 0;
  const totalOverdueTasks = tasks?.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length || 0;

  const copyInviteLink = (memberId: string) => {
    const link = `${window.location.origin}/accept-invite?id=${memberId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Invite Link Copied!" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Team Intelligence" 
        description="Data-driven leadership oversight, accountability indexing, and execution load monitoring."
        actions={<AddLeadershipModal />}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-[#0F172A] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Team Score</p>
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{avgTeamScore}%</p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Aggregate execution velocity</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active load</p>
            <p className="text-3xl font-bold text-slate-900">{totalActiveTasks}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-bold uppercase">
              <ListTodo className="h-3 w-3" /> Across {leadership?.length || 0} leaders
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Risk</p>
            <p className={`text-3xl font-bold ${totalOverdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{totalOverdueTasks}</p>
            <div className="flex items-center gap-1 text-[10px] text-rose-500 mt-2 font-bold uppercase">
              <ShieldAlert className="h-3 w-3" /> Bottlenecks
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/50 border border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Top Performer</p>
              <Trophy className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-900 truncate">{topPerformer?.name || 'Calculating...'}</p>
            <p className="text-[10px] text-emerald-600 mt-1 font-bold">{topPerformer?.performance.score || 0}% MERIT SCORE</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberPerformances.map((member, idx) => {
          const isTop = member.name === topPerformer?.name && member.performance.score > 85;
          const vestProgress = calculateVestingProgress(member.vestingStartDate, member.vestingYears);
          
          return (
            <Sheet key={member.id}>
              <SheetTrigger asChild>
                <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                  {isTop && (
                    <div className="absolute top-0 right-0 p-3">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <CardHeader className="pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className={`${COLORS[idx % COLORS.length]} text-white font-bold`}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate flex items-center gap-2">
                          {member.name}
                          {member.performance.risk !== 'NORMAL' && (
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{member.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Merit Score</p>
                        <p className={`text-2xl font-bold ${member.performance.score > 80 ? 'text-emerald-600' : member.performance.score > 50 ? 'text-blue-600' : 'text-rose-600'}`}>
                          {member.performance.score}%
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Load</p>
                        <p className="text-lg font-bold text-slate-700">{member.performance.active} Tasks</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Reliability</p>
                        <p className="text-xs font-bold text-slate-700">{member.performance.reliability}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Consistency</p>
                        <p className="text-xs font-bold text-slate-700">{member.performance.consistency}%</p>
                      </div>
                    </div>

                    {member.performance.risk !== 'NORMAL' && (
                      <Badge variant="destructive" className="w-full justify-center py-1 text-[8px] font-bold uppercase tracking-widest animate-pulse">
                        RISK: {member.performance.risk.replace('_', ' ')}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Vesting: {vestProgress}%</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold uppercase text-blue-600 hover:bg-blue-50">
                        View Audit <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              
              <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                <SheetHeader className="pb-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={`${COLORS[idx % COLORS.length]} text-white text-xl font-bold`}>
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-2xl font-bold">{member.name}</SheetTitle>
                      <SheetDescription className="font-bold text-blue-600 uppercase text-xs tracking-widest">
                        {member.title} • {member.performance.score}% MERIT SCORE
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="py-8 space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Performance Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">On-Time Completion</p>
                        <p className="text-2xl font-bold text-slate-900">{member.performance.reliability}%</p>
                        <Progress value={member.performance.reliability} className="h-1 mt-2" />
                      </Card>
                      <Card className="p-4 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Update Consistency</p>
                        <p className="text-2xl font-bold text-slate-900">{member.performance.consistency}%</p>
                        <Progress value={member.performance.consistency} className="h-1 mt-2" />
                      </Card>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                      <ListTodo className="h-4 w-4" /> Tactical Audit
                    </h4>
                    <div className="space-y-3">
                      {(tasks?.filter(t => t.assignedTo === member.name) || []).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 transition-all group">
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[8px] font-bold uppercase">{task.status}</Badge>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {task.deadline}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4 text-slate-300" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="pt-6 border-t space-y-4">
                    <div className="flex gap-3">
                      {member.inviteStatus === "Pending" ? (
                        <Button onClick={() => copyInviteLink(member.id)} className="flex-1 bg-amber-600 text-white text-xs font-bold uppercase h-10">
                          <Copy className="h-4 w-4 mr-2" /> Re-copy Invite
                        </Button>
                      ) : (
                        <Button className="flex-1 bg-blue-600 text-white text-xs font-bold uppercase h-10">
                          <Mail className="h-4 w-4 mr-2" /> Message Leader
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 text-xs font-bold uppercase h-10 border-slate-200">
                        <Shield className="h-4 w-4 mr-2 text-slate-400" /> Adjust Shares
                      </Button>
                    </div>
                  </section>
                </div>
              </SheetContent>
            </Sheet>
          );
        })}
      </div>

      <div className="p-8 bg-[#0F172A] text-white rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Shield className="h-40 w-40" />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold font-headline">Meritocracy Protocol</h3>
          <p className="text-slate-400 text-base leading-relaxed max-w-3xl">
            StartupOS automatically enforces a performance-based equity culture.
          </p>
        </div>
      </div>
    </div>
  );
}
