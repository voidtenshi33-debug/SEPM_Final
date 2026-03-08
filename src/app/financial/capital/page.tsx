'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { validateEquity, formatINR, calcRemainingTenure, calculateVestingProgress, calcEBITDA } from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { AlertTriangle, ShieldCheck, UserPlus, Clock, FileDown, Rocket } from "lucide-react";
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
  const roundsQuery = useMemoFirebase(() => query(collection(db, 'rounds'), orderBy('roundDate', 'desc')), [db]);
  const investorsQuery = useMemoFirebase(() => collection(db, 'investors'), [db]);
  const leadershipQuery = useMemoFirebase(() => query(collection(db, 'leadership'), orderBy('name', 'asc')), [db]);
  const capRef = useMemoFirebase(() => doc(db, 'capitalStructure', 'main'), [db]);
  const financialsQuery = useMemoFirebase(() => query(collection(db, 'financials'), orderBy('month', 'desc')), [db]);

  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capRef);
  const { data: financials } = useCollection(financialsQuery);

  const isLoading = loadingRounds || loadingInv || loadingLead || loadingCap;

  // Aggregation Logic
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

  // PDF Export Logic (Investor Briefing)
  const handleExportInvestorReport = () => {
    const doc = new jsPDF();
    const latest = financials?.[0];
    const ebitda = latest ? calcEBITDA(latest.netRevenue, latest.operatingExpenses) : 0;
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Founder Blue
    doc.text("Investor Relations: Governance Brief", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Cap Table Integrity: ${isValidCap ? 'VALIDATED' : 'OVERFLOW ALERT'}`, 14, 36);

    autoTable(doc, {
      startY: 45,
      head: [['Category', 'Metric', 'Value (INR)']],
      body: [
        ['Capital', 'Total Raised', formatINR(rounds?.reduce((s, r) => s + r.amountRaised, 0) || 0)],
        ['Capital', 'Active Equity Dilution', `${total}%`],
        ['Operations', 'Active Monthly Revenue', formatINR(latest?.netRevenue || 0)],
        ['Operations', 'Monthly EBITDA', formatINR(ebitda)],
        ['Operations', 'Operating Expenses', formatINR(latest?.operatingExpenses || 0)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] } // Startup Electric
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Stakeholder', 'Role/Type', 'Equity %']],
      body: [
        ['Founders', 'Core Identity', `${capTable?.founderEquityPct || 0}%`],
        ['Leadership', 'Team Allocation', `${totalLeadershipEquity}%`],
        ['Investors', 'Total Participation', `${totalInvEquity}%`],
        ['ESOP Pool', 'Employee Option Pool', `${capTable?.esopEquityPct || 0}%`],
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
        <Button onClick={handleExportInvestorReport} variant="outline" className="border-accent text-accent shadow-sm hover:bg-accent/5">
          <FileDown className="h-4 w-4 mr-2" /> Download Investor Brief
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cap Table Chart */}
        <Card className="border-none shadow-xl lg:col-span-1 h-fit sticky top-24">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Cap Table Split</CardTitle>
            {!isValidCap && capData.length > 0 && (
              <div className="flex items-center text-rose-600 bg-rose-50 px-2 py-1 rounded text-[10px] font-bold border border-rose-100 animate-pulse">
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

        {/* Relational Governance Blocks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Leadership Section */}
          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Leadership Stake</CardTitle>
                <CardDescription>Core team equity & active vesting schedules</CardDescription>
              </div>
              <Link href="/team">
                <Button variant="ghost" size="sm" className="h-8 text-accent hover:bg-accent/10">
                  <UserPlus className="h-4 w-4 mr-2" /> Manage Team
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leadership?.slice(0, 4).map((member) => (
                    <div key={member.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{member.title}</p>
                        </div>
                        <Badge variant="outline" className="border-accent/20 text-accent bg-accent/5">{member.equityPct}% Stake</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                           <Clock className="h-3 w-3" /> 
                           {calculateVestingProgress(member.vestingStartDate, member.vestingYears)}% Vested
                         </div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase">
                            Term Ends: {new Date(member.vestingEndDate).toLocaleDateString()}
                         </div>
                      </div>
                    </div>
                  ))}
                  {leadership?.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400 italic text-sm border-2 border-dashed rounded-xl">
                      No leadership members recorded.
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Rounds Section */}
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
                    <div className="col-span-2 text-center py-12 text-slate-400 italic text-sm border-2 border-dashed rounded-xl">
                      <Rocket className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No funding rounds recorded.
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Investors Section */}
          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Strategic Investors</CardTitle>
                <CardDescription>Shareholders list & deal tenure auditing</CardDescription>
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
                         <td colSpan={5} className="text-center py-12 text-slate-400 italic text-sm">
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
