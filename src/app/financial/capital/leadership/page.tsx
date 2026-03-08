
'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Shield, Award, Copy, CheckCircle2, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { calculateVestingProgress } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["bg-slate-900", "bg-blue-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"];

export default function LeadershipPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const leadershipQuery = useMemoFirebase(() => query(collection(db, 'leadership'), orderBy('createdAt', 'desc')), [db]);
  const { data: leadership, isLoading } = useCollection(leadershipQuery);

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
        title="Leadership & Governance" 
        description="Strategic team oversight, equity vesting enforcement, and invitation management."
        actions={<AddLeadershipModal />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leadership?.map((member, idx) => {
          const progress = calculateVestingProgress(member.vestingStartDate, member.vestingYears);
          const isPending = member.inviteStatus === "Pending";

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
                      <Badge variant={isPending ? "outline" : "default"} className={isPending ? "bg-amber-50 text-amber-600 border-amber-100 uppercase text-[8px] font-bold" : "bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[8px] font-bold"}>
                        {member.inviteStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{member.roleTitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Equity Stake</p>
                    <p className="text-2xl font-bold text-[#0F172A]">{member.equityPct}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vesting Status</p>
                    <p className="text-sm font-bold text-blue-600">{progress}% Vested</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={parseFloat(progress)} className="h-2" />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    <span>Term: {member.vestingYears}Y</span>
                    <span>Ends: {member.vestingEndDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 min-h-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsibility</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{member.responsibility || "Core operational strategy"}</p>
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
        {leadership?.length === 0 && !isLoading && (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-16 text-center text-slate-400">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Shield className="h-10 w-10 opacity-20" />
            </div>
            <h4 className="font-bold text-slate-600 font-headline text-lg">No Leadership DNA Detected</h4>
            <p className="text-sm mt-1 mb-6 max-w-xs">Add your core team to begin tracking equity distribution and vesting schedules.</p>
            <AddLeadershipModal />
          </Card>
        )}
      </div>
    </div>
  );
}
