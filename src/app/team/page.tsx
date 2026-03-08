"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Shield, Award, Clock, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { calculateVestingProgress } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

export default function TeamPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const leadershipQuery = useMemoFirebase(() => query(collection(db, 'leadership'), orderBy('name', 'asc')), [db]);
  const { data: leadership, isLoading } = useCollection(leadershipQuery);

  const copyInviteLink = (memberId: string) => {
    const link = `${window.location.origin}/accept-invite?id=${memberId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Invite link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Leadership & Governance" 
        description="Monitor team equity, vesting schedules, and organizational roles."
        actions={<AddLeadershipModal />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leadership?.map((member, idx) => {
          const vestingProgress = calculateVestingProgress(member.vestingStartDate, member.vestingYears);
          const isPending = member.inviteStatus === "Pending";

          return (
            <Card key={member.id} className="border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden border-t-4 border-t-accent">
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
                      <Badge variant={isPending ? "outline" : "default"} className={isPending ? "text-[8px] h-4 uppercase bg-amber-50 text-amber-600 border-amber-100 font-bold" : "text-[8px] h-4 uppercase bg-emerald-50 text-emerald-600 border-emerald-100 font-bold"}>
                        {member.inviteStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{member.title}</p>
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
                    <p className="text-sm font-bold text-blue-600">{vestingProgress}% Vested</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={parseFloat(vestingProgress)} className="h-2" />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    <span>{member.vestingYears}Y Schedule</span>
                    <span>Ends: {member.vestingEndDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 min-h-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Responsibility</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{member.responsibility || "Strategic leadership and core operations."}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 text-[10px] font-bold uppercase h-9 border-slate-200">
                    <Mail className="h-3 w-3 mr-2 text-slate-400" /> Message
                  </Button>
                  {isPending && (
                    <Button 
                      variant="default" 
                      className="flex-1 bg-accent hover:bg-accent/90 text-white text-[10px] font-bold uppercase h-9"
                      onClick={() => copyInviteLink(member.id)}
                    >
                      <LinkIcon className="h-3 w-3 mr-2" /> Copy Invite
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {leadership?.length === 0 && !isLoading && (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-20 text-center text-slate-400">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Shield className="h-10 w-10 opacity-20" />
            </div>
            <h4 className="font-bold text-slate-600 font-headline text-lg">No Leadership DNA Detected</h4>
            <p className="text-sm mt-1 mb-6 max-w-xs">Add your core team members to begin tracking equity distribution and vesting schedules.</p>
            <AddLeadershipModal />
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 border-t border-slate-100">
        <Card className="border-none shadow-xl bg-[#0F172A] text-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award className="h-32 w-32" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
             <div className="p-3 rounded-2xl bg-blue-500/20">
                <Award className="h-8 w-8 text-blue-400" />
             </div>
             <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 font-headline text-white">Organizational Governance</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    UdyamRakshak automatically calculates equity release based on governance rules. Ensure all team members have valid vesting start dates to maintain compliance.
                  </p>
                </div>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-widest h-9 px-6">
                  Configure OKRs
                </Button>
             </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-emerald-50/30 border border-emerald-100 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CheckCircle2 className="h-32 w-32" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
             <div className="p-3 rounded-2xl bg-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
             </div>
             <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 font-headline text-slate-900">Vesting Enforcement</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                    Once a member accepts their invitation, their profile is automatically verified, granting them role-based access to the Command Center based on their equity level.
                  </p>
                </div>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold uppercase tracking-widest h-9 px-6">
                  View Equity Ledger
                </Button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
