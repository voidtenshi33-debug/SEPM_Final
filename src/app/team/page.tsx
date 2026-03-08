"use client";

import * as React from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Mail, Linkedin, Clock, Loader2, Copy, Check, ShieldCheck } from "lucide-react";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { calculateVestingProgress } from "@/modules/financial/utils/capitalEngine";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const teamQuery = React.useMemo(() => query(collection(db, "leadership"), orderBy("name", "asc")), [db]);
  const { data: team, isLoading } = useCollection(teamQuery);

  const handleCopyLink = (id: string) => {
    // In a real app, this would be a full URL to the acceptance page
    const url = `${window.location.origin}/accept-invite/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({
      title: "Invite Link Copied",
      description: "Send this URL to your team member to complete the handshake.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Syncing human capital data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent" />
            Leadership & Governance
          </h1>
          <p className="text-muted-foreground">Manage roles, equity grants, and real-time vesting progress.</p>
        </div>
        <AddLeadershipModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team?.map((member) => {
          const progress = calculateVestingProgress(member.vestingStartDate, member.vestingYears);
          const initials = member.name.split(' ').map((n: string) => n[0]).join('');

          return (
            <Card key={member.id} className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all group bg-white">
              <CardHeader className="text-center pb-2">
                <div className="relative mx-auto h-24 w-24 mb-4">
                   <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                    <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${member.inviteStatus === 'Accepted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                <CardDescription className="font-bold text-accent uppercase text-[10px] tracking-widest">{member.roleTitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className={member.inviteStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold' : 'bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-bold'}>
                    {member.inviteStatus || 'Pending'}
                  </Badge>
                  <Badge className="bg-primary text-white text-[10px] font-bold">{member.equityPct}% Equity</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Vesting Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={parseFloat(progress)} className="h-1.5" />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                    <span>Start: {new Date(member.vestingStartDate).toLocaleDateString()}</span>
                    <span>End: {new Date(member.vestingEndDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs italic text-muted-foreground border border-slate-100">
                  {member.responsibility}
                </div>

                <div className="flex border-t pt-4 justify-center gap-4">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  {member.inviteStatus !== 'Accepted' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-slate-400 hover:text-accent transition-colors"
                      onClick={() => handleCopyLink(member.id)}
                    >
                      {copiedId === member.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {team?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
            <Plus className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No team members recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
