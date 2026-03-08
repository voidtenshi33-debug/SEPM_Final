'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { validateEquity, formatINR } from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { AlertTriangle, ShieldCheck, Handshake, Target, Rocket, Users, Loader2 } from "lucide-react";
import { AddRoundModal } from "@/components/financials/add-round-modal";
import { AddInvestorModal } from "@/components/financials/add-investor-modal";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function CapitalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Firestore Subscriptions
  const roundsQuery = useMemoFirebase(() => query(collection(db, 'rounds'), orderBy('startDate', 'desc')), [db]);
  const investorsQuery = useMemoFirebase(() => collection(db, 'investors'), [db]);
  const leadershipQuery = useMemoFirebase(() => collection(db, 'leadership'), [db]);
  const capRef = useMemoFirebase(() => doc(db, 'capitalStructure', 'main'), [db]);

  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capRef);

  if (loadingRounds || loadingInv || loadingLead || loadingCap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground font-medium italic">Synchronizing Governance Ledger...</p>
      </div>
    );
  }

  // Aggregate Equity Metrics
  const totalInvEquity = investors?.reduce((sum, inv) => sum + (inv.equityPct || 0), 0) || 0;
  const totalLeadershipEquity = leadership?.reduce((sum, member) => sum + (member.equityPct || 0), 0) || 0;
  
  const capData = [
    { name: 'Founders', value: capTable?.founderPct || 0 },
    { name: 'Leadership', value: totalLeadershipEquity },
    { name: 'Investors', value: totalInvEquity },
    { name: 'ESOP Pool', value: capTable?.esopPct || 0 },
  ].filter(d => d.value > 0);

  const validation = validateEquity(
    capTable?.founderPct || 0,
    totalLeadershipEquity,
    totalInvEquity,
    capTable?.esopPct || 0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Cap Table DNA Visualization */}
        <Card className="border-none shadow-xl lg:col-span-1 h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-accent" />
                Cap Table DNA
              </CardTitle>
              <CardDescription>Consolidated Equity Split</CardDescription>
            </div>
            {!validation.isValid && (
              <Badge variant="destructive" className="animate-pulse text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" /> Equity Overflow
              </Badge>
            )}
          </CardHeader>
          <CardContent className="h-[380px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {capData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
              </div>
            )}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Allocated</p>
              <p className="text-2xl font-bold text-slate-900">{validation.total}%</p>
              <p className="text-[9px] text-accent font-bold uppercase mt-1">Available for Dilution: {validation.remaining}%</p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Funding Rounds & Governance Ledger */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  Funding Rounds
                </CardTitle>
                <CardDescription>Capital history and dilution stages (INR)</CardDescription>
              </div>
              <AddRoundModal />
            </CardHeader>
            <CardContent className="pt-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rounds?.map((round) => {
                    const roundInvestors = investors?.filter(i => i.roundId === round.id) || [];
                    const actualRaised = roundInvestors.reduce((sum, i) => sum + (i.investmentAmount || 0), 0);
                    // Handle targetRaise from doc structure (if missing fallback to round.amountRaised)
                    const target = round.targetRaise || round.amountRaised || 1;
                    const progress = Math.min((actualRaised / target) * 100, 100);
                    const isOverSubscribed = actualRaised > target;

                    return (
                      <div key={round.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-bold text-slate-900 text-xl font-headline">{round.roundName || round.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{round.roundType || 'Equity'} Round</p>
                          </div>
                          {isOverSubscribed ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold">Over-subscribed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter">{round.status || 'Active'}</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-tighter">Raised: {formatINR(actualRaised)}</span>
                            <span className="text-indigo-600">{progress.toFixed(0)}% ACHIEVED</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 transition-all duration-1000 ease-out" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" /> Target: {formatINR(target)}
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Users className="h-3 w-3" /> {roundInvestors.length} Investors
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {rounds?.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed rounded-3xl">
                      <Rocket className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No Funding Rounds Detected</p>
                      <p className="text-[10px] mt-1">Initiate a round to begin tracking capital distribution.</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-emerald-600" />
                  Stakeholder Ledger
                </CardTitle>
                <CardDescription>Strategic shareholder repository</CardDescription>
              </div>
              <AddInvestorModal rounds={rounds || []} />
            </CardHeader>
            <CardContent className="p-0">
               <div className="relative w-full overflow-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-[10px] uppercase bg-slate-50/50 text-slate-500 font-bold tracking-widest border-b">
                     <tr>
                       <th className="px-6 py-4">Investor Details</th>
                       <th className="px-6 py-4">Round Context</th>
                       <th className="px-6 py-4 text-right">Investment (₹)</th>
                       <th className="px-6 py-4 text-right">Equity %</th>
                       <th className="px-6 py-4 text-center">Loyalty</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {investors?.map((investor) => {
                       const round = rounds?.find(r => r.id === investor.roundId);
                       return (
                         <tr key={investor.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-4">
                             <p className="font-bold text-slate-900">{investor.name}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{investor.id.substring(0, 8)}</p>
                           </td>
                           <td className="px-6 py-4">
                             <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 text-[9px] font-bold">
                               {round?.roundName || round?.name || 'Direct Allotment'}
                             </Badge>
                           </td>
                           <td className="px-6 py-4 text-right font-bold text-slate-700">
                             {formatINR(investor.investmentAmount)}
                           </td>
                           <td className="px-6 py-4 text-right">
                             <span className="font-bold text-accent">{investor.equityPct}%</span>
                           </td>
                           <td className="px-6 py-4 text-center">
                             {investor.loyalty ? (
                               <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                                 <Handshake className="h-3.5 w-3.5" />
                               </div>
                             ) : (
                               <span className="text-slate-300">---</span>
                             )}
                           </td>
                         </tr>
                       );
                     })}
                     {investors?.length === 0 && (
                       <tr>
                         <td colSpan={5} className="text-center py-20 text-slate-400 italic">
                           <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                           No shareholder records identified.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
