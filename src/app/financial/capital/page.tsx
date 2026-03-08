'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { 
  validateEquity, 
  formatINR, 
  calcRemainingTenure, 
  calculatePostMoney,
  calculateVestingProgress
} from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { AlertTriangle, ShieldCheck, Handshake, Target, Clock, FileDown, Rocket, Briefcase } from "lucide-react";
import { AddRoundModal } from "@/components/financials/add-round-modal";
import { AddInvestorModal } from "@/components/financials/add-investor-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function CapitalPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roundsQuery = useMemoFirebase(() => query(collection(db, 'rounds'), orderBy('startDate', 'desc')), [db]);
  const investorsQuery = useMemoFirebase(() => collection(db, 'investors'), [db]);
  const leadershipQuery = useMemoFirebase(() => collection(db, 'leadership'), [db]);
  const capRef = useMemoFirebase(() => doc(db, 'capitalStructure', 'main'), [db]);

  const { data: rounds } = useCollection(roundsQuery);
  const { data: investors } = useCollection(investorsQuery);
  const { data: leadership } = useCollection(leadershipQuery);
  const { data: capTable } = useDoc(capRef);

  const totalInvEquity = investors?.reduce((sum, inv) => sum + (inv.equityPct || 0), 0) || 0;
  const totalLeadershipEquity = leadership?.reduce((sum, member) => sum + (member.equityPct || 0), 0) || 0;
  
  const capData = [
    { name: 'Founders', value: capTable?.founderEquityPct || 0 },
    { name: 'Leadership', value: totalLeadershipEquity },
    { name: 'Investors', value: totalInvEquity },
    { name: 'ESOP Pool', value: capTable?.esopEquityPct || 0 },
  ].filter(d => d.value > 0);

  const validation = validateEquity(
    capTable?.founderEquityPct || 0,
    totalLeadershipEquity,
    totalInvEquity,
    capTable?.esopEquityPct || 0
  );

  const handleExportInvestorReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Investor Relations: Governance Brief", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Rounds', rounds?.length || 0],
        ['Active Investors', investors?.length || 0],
        ['Total Dilution', `${validation.total}%`],
        ['Unallocated Equity', `${validation.remaining}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Stakeholder', 'Equity %']],
      body: [
        ['Founders', `${capTable?.founderEquityPct || 0}%`],
        ['Leadership', `${totalLeadershipEquity}%`],
        ['Investors', `${totalInvEquity}%`],
        ['ESOP Pool', `${capTable?.esopEquityPct || 0}%`],
      ],
    });

    doc.save("UdyamRakshak_Governance_Brief.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent" />
            Capital & Governance
          </h1>
          <p className="text-muted-foreground">Unified tracking for equity, rounds, and legal structure.</p>
        </div>
        <Button onClick={handleExportInvestorReport} variant="outline" className="border-accent text-accent">
          <FileDown className="h-4 w-4 mr-2" /> Download Investor Brief
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl lg:col-span-1 h-fit sticky top-24">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Cap Table DNA</CardTitle>
            {!validation.isValid && capData.length > 0 && (
              <Badge variant="destructive" className="mt-2 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> EQUITY OVERFLOW: {validation.total}%
              </Badge>
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
              <div className="h-full w-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-slate-200 animate-pulse" />
              </div>
            )}
            <div className="text-center mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Allocated: {validation.total}% | Remaining: {validation.remaining}%
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Funding Rounds</CardTitle>
                <CardDescription>Capital history and dilution stages</CardDescription>
              </div>
              <AddRoundModal />
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rounds?.map((round) => {
                    const roundInvestors = investors?.filter(i => i.roundId === round.id) || [];
                    const actualRaised = roundInvestors.reduce((sum, i) => sum + (i.investmentAmount || 0), 0);
                    const progress = Math.min((actualRaised / (round.targetRaise || 1)) * 100, 100);

                    return (
                      <div key={round.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{round.roundName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Target: {formatINR(round.targetRaise)}</p>
                          </div>
                          <Badge variant={round.status === 'Open' ? 'default' : 'secondary'} className="text-[8px] uppercase">
                            {round.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500 uppercase">Raised: {formatINR(actualRaised)}</span>
                            <span className="text-accent">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase border-t pt-2">
                          <span>Inst: {round.roundType}</span>
                          <span>Equity: {round.equityOfferedPct}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {rounds?.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400 italic text-sm border-2 border-dashed rounded-xl">
                      <Rocket className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No funding rounds recorded.
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Investor Ledger</CardTitle>
                <CardDescription>Strategic shareholders linked to rounds</CardDescription>
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
                       <th className="px-4 py-3 text-center">Loyalty</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {investors?.map((investor) => {
                       const round = rounds?.find(r => r.id === investor.roundId);
                       return (
                         <tr key={investor.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-4 py-3 font-bold text-slate-700">
                             <div className="flex items-center gap-2">
                               {investor.name}
                               <Badge variant="outline" className="text-[8px] h-3 px-1">{investor.type || 'Angel'}</Badge>
                             </div>
                           </td>
                           <td className="px-4 py-3 text-slate-500">{round?.roundName || '---'}</td>
                           <td className="px-4 py-3 text-right font-medium">{formatINR(investor.investmentAmount)}</td>
                           <td className="px-4 py-3 text-right font-bold text-accent">{investor.equityPct}%</td>
                           <td className="px-4 py-3 text-center">
                             {investor.loyalty ? <Handshake className="h-4 w-4 text-emerald-500 mx-auto" /> : '---'}
                           </td>
                         </tr>
                       );
                     })}
                     {investors?.length === 0 && (
                       <tr>
                         <td colSpan={5} className="text-center py-12 text-slate-400 italic text-sm">
                           <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-20" />
                           No investor records found.
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