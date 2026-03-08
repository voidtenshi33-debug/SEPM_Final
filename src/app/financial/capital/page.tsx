'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { validateCapTable, calculateRemainingDealYears } from "@/modules/financial/utils/capitalEngine";
import { formatINR, calcEBITDA } from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { AlertTriangle, ShieldCheck, UserPlus, Clock, FileDown, Rocket, Briefcase } from "lucide-react";
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

  // Data Subscriptions
  const roundsQuery = useMemoFirebase(() => query(collection(db, 'rounds'), orderBy('startDate', 'desc')), [db]);
  const investorsQuery = useMemoFirebase(() => collection(db, 'investors'), [db]);
  const leadershipQuery = useMemoFirebase(() => collection(db, 'leadership'), [db]);
  const capRef = useMemoFirebase(() => doc(db, 'capitalStructure', 'main'), [db]);
  const financialsQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('month', 'desc')), [db]);

  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capRef);
  const { data: financials } = useCollection(financialsQuery);

  const isLoading = loadingRounds || loadingInv || loadingLead || loadingCap;

  // Aggregation Logic
  const totalLeadershipEquity = leadership?.reduce((sum, member) => sum + (member.equityPct || 0), 0) || 0;
  const totalInvestorEquity = investors?.reduce((sum, inv) => sum + (inv.equityPct || 0), 0) || 0;
  
  const capData = [
    { name: 'Founders', value: capTable?.founderPct || 0 },
    { name: 'Leadership', value: totalLeadershipEquity },
    { name: 'Investors', value: totalInvestorEquity },
    { name: 'ESOP Pool', value: capTable?.esopPct || 0 },
  ].filter(d => d.value > 0);

  const { isValid: isValidCap, total } = validateCapTable({
    Founders: capTable?.founderPct || 0,
    Leadership: totalLeadershipEquity,
    Investors: totalInvestorEquity,
    ESOP: capTable?.esopPct || 0
  });

  const handleExportInvestorReport = () => {
    const doc = new jsPDF();
    const latest = financials?.[0];
    const ebitda = latest ? calcEBITDA(latest.netRevenue, latest.operatingExpenses) : 0;
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Investor Relations: Governance Brief", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 45,
      head: [['Category', 'Metric', 'Value (INR)']],
      body: [
        ['Capital', 'Total Raised', formatINR(rounds?.reduce((s, r) => s + (r.totalRaised || 0), 0) || 0)],
        ['Capital', 'Active Equity Dilution', `${total}%`],
        ['Operations', 'Active Monthly Revenue', formatINR(latest?.netRevenue || 0)],
        ['Operations', 'Monthly EBITDA', formatINR(ebitda)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Stakeholder', 'Role/Type', 'Equity %']],
      body: [
        ['Founders', 'Core Identity', `${capTable?.founderPct || 0}%`],
        ['Leadership', 'Team Allocation', `${totalLeadershipEquity}%`],
        ['Investors', 'Total Participation', `${totalInvestorEquity}%`],
        ['ESOP Pool', 'Employee Option Pool', `${capTable?.esopPct || 0}%`],
      ],
    });

    doc.save("UdyamRakshak_Governance_Brief.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ShieldCheck className="h-10 w-10 text-accent animate-pulse" />
        <p className="text-sm text-muted-foreground font-medium">Syncing Governance DNA...</p>
      </div>
    );
  }

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
            <CardTitle className="text-lg font-bold">Cap Table Split</CardTitle>
            {!isValidCap && capData.length > 0 && (
              <div className="flex items-center text-rose-600 bg-rose-50 px-2 py-1 rounded text-[10px] font-bold border border-rose-100 animate-pulse mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" /> EQUITY OVERFLOW: {total}%
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
              <div className="h-full w-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-slate-200 animate-pulse" />
              </div>
            )}
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
                  {rounds?.map((round) => (
                    <div key={round.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-900">{round.roundName}</p>
                        <Badge variant={round.status === 'Open' ? 'default' : 'secondary'}>
                          {round.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raised: {formatINR(round.totalRaised || 0)} / {formatINR(round.targetRaise)}</p>
                        <p className="text-sm font-bold text-accent">{round.equityOfferedPct}% Dilution</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Type: {round.roundType}</p>
                      </div>
                    </div>
                  ))}
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
                <CardTitle className="text-lg font-bold">Strategic Investors</CardTitle>
                <CardDescription>Shareholders linked to funding rounds</CardDescription>
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
                           <td className="px-4 py-3 font-bold text-slate-700">
                             <div className="flex items-center gap-2">
                               {investor.name}
                               {investor.loyalty && <Badge className="bg-emerald-500 text-[8px] h-3 px-1">LOYAL</Badge>}
                             </div>
                           </td>
                           <td className="px-4 py-3 text-slate-500">{round?.roundName || '---'}</td>
                           <td className="px-4 py-3 text-right font-medium">{formatINR(investor.investmentAmount)}</td>
                           <td className="px-4 py-3 text-right font-bold text-accent">{investor.equityPct}%</td>
                           <td className="px-4 py-3 text-right font-medium text-slate-500">{calculateRemainingDealYears(investor.dealEndDate)}Y</td>
                         </tr>
                       );
                     })}
                     {investors?.length === 0 && (
                       <tr>
                         <td colSpan={5} className="text-center py-12 text-slate-400 italic text-sm">
                           <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-20" />
                           No strategic investors recorded.
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
