'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Shield, Award, Copy, CheckCircle2, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { calculateVestingProgress } from "@/modules/financial/utils/financialEngine";
import { calculateMemberPerformance } from "@/modules/execution/utils/executionEngine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["bg-slate-900", "bg-blue-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"];

export default function TeamPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const leadershipQuery = useMemoFirebase(() => query(collection(db, 'leadership'), orderBy('name', 'asc')), [db]);
  const tasksQuery = useMemoFirebase(() => collection(db, 'tasks'), [db]);

  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: tasks } = useCollection(tasksQuery);

  const copyInviteLink = (memberId: string) => {
    const link = `${window.location.origin}/accept-invite?id=${memberId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Invite Link Copied!",
      description: "Send this to the leader to finalize access.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Performance & Governance" 
        description="Unified oversight of team accountability, equity vesting, and execution throughput."
        actions={<AddLeadershipModal />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leadership?.map((member, idx) => {
          const progress = calculateVestingProgress(member.vestingStartDate, member.vestingYears);
          const isPending = member.inviteStatus === "Pending";
          
          const memberTasks = tasks?.filter(t => t.assignedTo === member.name) || [];
          const performanceScore = calculateMemberPerformance(memberTasks);
          const activeTasks = memberTasks.filter(t => t.status !== 'Completed').length;
          const overdueTasks = memberTasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;

          return (
            <Card key={member.id} className="border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden border-l-4" style={{ borderLeftColor: isPending ? '#F59E0B' : '#10B981' }}>
              <CardHeader className="pb-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarFallback className={`${COLORS[idx % COLORS.length]} text-white font-bold text-lg`}>
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 truncate text-lg">{member.name}</h3>
                      <Badge className={performanceScore > 80 ? "bg-emerald-500" : performanceScore > 50 ? "bg-amber-500" : "bg-rose-500"}>
                        {performanceScore}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{member.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Tasks</p>
                    <p className="text-xl font-bold text-slate-900">{activeTasks}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
                    <p className={`text-xl font-bold ${overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{overdueTasks}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Equity Vested</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={parseFloat(progress)} className="h-1.5" />
                </div>

                <div className="flex gap-2 pt-2">
                  {isPending ? (
                    <Button 
                      variant="default" 
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase h-9"
                      onClick={() => copyInviteLink(member.id)}
                    >
                      <Copy className="h-3 w-3 mr-2" /> Invite Link
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 text-[10px] font-bold uppercase h-9 border-slate-200">
                      <Mail className="h-3 w-3 mr-2 text-slate-400" /> Send Message
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t">
        <Card className="border-none shadow-xl bg-[#0F172A] text-white p-8">
          <div className="flex items-start gap-6">
             <div className="p-3 rounded-2xl bg-blue-500/20">
                <Shield className="h-8 w-8 text-blue-400" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2 font-headline">Accountability Layer</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Performance scores are dynamically calculated using on-time task completion and milestone throughput. This data is confidential and visible only to the founding leadership.
                </p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{leadership?.length || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Leaders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{tasks?.filter(t => t.status === 'Completed').length || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Tasks Shipped</p>
                  </div>
                </div>
             </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-emerald-50/30 border border-emerald-100 p-8">
          <div className="flex items-start gap-6">
             <div className="p-3 rounded-2xl bg-emerald-500/20">
                <Award className="h-8 w-8 text-emerald-600" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 font-headline">Bonus & Equity</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Members with performance scores > 90% are automatically flagged for **Bonus Eligibility** in the tactical task board. Use the access audit log to track individual contributions.
                </p>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold uppercase tracking-widest h-9">
                   <Clock className="h-4 w-4 mr-2" /> Performance Audit
                </Button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
