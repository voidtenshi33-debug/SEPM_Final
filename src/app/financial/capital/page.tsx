'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { validateEquity, formatINR, calcRemainingTenure } from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { AlertTriangle, ShieldCheck, UserPlus, Clock, Loader2 } from "lucide-react";
import { AddRoundModal } from "@/components/financials/add-round-modal";
import { AddInvestorModal } from "@/components/financials/add-investor-modal";
import { AddLeadershipModal } from "@/components/financials/add-leadership-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function CapitalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roundsQuery = useMemoFirebase(() => query(collection(db, 'rounds'), orderBy('roundDate', 'desc')), [db]);
  const investorsQuery = useMemoFirebase(() => collection(db, 'investors'), [db]);
  const leadershipQuery = useMemoFirebase(() => collection(db, 'leadership'), [db]);
  const capRef = useMemoFirebase(() => doc(db, 'capitalStructure', 'main'), [db]);

  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInvestors } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLeadership } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capRef);

  const isLoading = loadingRounds || loadingInvestors || loadingLeadership || loadingCap;

  const totalInvEquity = investors?.reduce((sum, inv) => sum + (inv.equityPct || 0), 0) || 0;
  const totalLeadershipEquity = leadership?.reduce((sum, member) => sum + (member.equityPct || 0), 0) || 0;
  
  const capData = [
    { name: 'Founders', value: capTable?.founderEquityPct || 0 },
    { name: 'Leadership', value: totalLeadershipEquity },
    { name: 'Investors', value: totalInvEquity },
    { name: 'ESOP Pool', value: capTable?.esopEquityPct || 0 },
  ].filter(d => d.value > 0);

  const { isValid: isValidCap, total } = validateEquity(
    capTable?.founderEquityPct || 0,
    totalLeadershipEquity,
    totalInvEquity,
    capTable?.esopEquityPct || 0
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Synchronizing governance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cap Table Chart */}
        <Card className="border-none shadow-xl lg:col-span-1 h-fit sticky top-24">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-accent" />
              Cap Table Split
            </CardTitle>
            {!isValidCap && (
              <div className="flex items-center text-rose-600 bg-rose-50 px-2 py-1 rounded text-[10px] font-bold border border-rose-100 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> ERROR: {total}%
              </div>
            )}
          </CardHeader>
          <CardContent className="h-[350px]">
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
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-lg">
                <ShieldCheck className="h-8 w-8 text-slate-200 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leadership & Rounds */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Key Leadership</CardTitle>
                <CardDescription>Core team equity & vesting schedules</CardDescription>
              </div>
              <AddLeadershipModal />
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leadership?.map((member) => (
                    <div key={member.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{member.title}</p>
                        </div>
                        <Badge variant="outline" className="border-accent/20 text-accent bg-accent/5">{member.equityPct}% Stake</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <Clock className="h-3 w-3" /> 
                        VESTING ENDS IN {calcRemainingTenure(member.vestingEndDate)} YEARS
                      </div>
                    </div>
                  ))}
                  {leadership?.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl">
                      <p className="text-sm text-muted-foreground">No leadership members recorded.</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Funding Rounds</CardTitle>
                <CardDescription>Capital history and dilution stages (INR)</CardDescription>
              </div>
              <AddRoundModal />
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rounds?.map((round) => (
                    <div key={round.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between bg-slate-50/30">
                      <div>
                        <p className="font-bold text-slate-900">{round.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raised: {formatINR(round.amountRaised)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-accent">{round.equityDilutedPct}% Dilution</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Post-Val: {formatINR(round.postMoneyValuation)}</p>
                      </div>
                    </div>
                  ))}
                  {rounds?.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl">
                      <p className="text-sm text-muted-foreground">No funding rounds recorded.</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Investors</CardTitle>
                <CardDescription>Strategic shareholders list & deal tenure</CardDescription>
              </div>
              <AddInvestorModal rounds={rounds || []} />
            </CardHeader>
            <CardContent>
               <div className="relative w-full overflow-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-bold tracking-widest">
                     <tr>
                       <th className="px-4 py-3">Investor</th>
                       <th className="px-4 py-3">Round</th>
                       <th className="px-4 py-3 text-right">Investment</th>
                       <th className="px-4 py-3 text-right">Equity %</th>
                       <th className="px-4 py-3 text-right">Rem. Tenure</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {investors?.map((investor) => {
                       const round = rounds?.find(r => r.id === investor.roundId);
                       return (
                         <tr key={investor.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-4 py-3 font-bold text-slate-700">{investor.name}</td>
                           <td className="px-4 py-3 text-slate-500">{round?.name || '---'}</td>
                           <td className="px-4 py-3 text-right font-medium">{formatINR(investor.investmentAmount)}</td>
                           <td className="px-4 py-3 text-right font-bold text-accent">{investor.equityPct}%</td>
                           <td className="px-4 py-3 text-right font-medium text-slate-500">{calcRemainingTenure(investor.dealEndDate)}Y</td>
                         </tr>
                       );
                     })}
                     {investors?.length === 0 && (
                       <tr>
                         <td colSpan={5} className="py-8 text-center text-muted-foreground italic">No investors recorded.</td>
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
