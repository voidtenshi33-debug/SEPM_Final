
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { 
  validateEquity, 
  formatINR, 
  calculatePostMoney,
  calculateVestingProgress,
  calcRemainingTenure
} from "@/modules/financial/utils/financialEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  ShieldCheck, 
  Users, 
  Rocket, 
  Briefcase, 
  ArrowRight, 
  AlertTriangle,
  FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function CapitalDashboard() {
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
    doc.text("Investor Relations: Governance Brief", 14, 22);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 45,
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
          <p className="text-muted-foreground">Unified tracking for equity, funding rounds, and leadership.</p>
        </div>
        <Button onClick={handleExportInvestorReport} variant="outline" className="border-accent text-accent">
          <FileDown className="h-4 w-4 mr-2" /> Download Investor Brief
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              Cap Table DNA
              {!validation.isValid && (
                <Badge variant="destructive" className="animate-pulse text-[10px]">
                  OVERFLOW: {validation.total}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={capData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {capData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-slate-200 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/financial/capital/leadership">
              <Card className="hover:bg-slate-50 transition-colors border-none shadow-md group">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Leadership</h3>
                  <p className="text-xs text-muted-foreground mb-4">Manage team equity and vesting schedules.</p>
                  <div className="flex items-center text-xs font-bold text-blue-600">
                    GO TO MODULE <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/financial/capital/rounds">
              <Card className="hover:bg-slate-50 transition-colors border-none shadow-md group">
                <CardContent className="p-6">
                  <Rocket className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Rounds</h3>
                  <p className="text-xs text-muted-foreground mb-4">Track target vs. actual capital raised.</p>
                  <div className="flex items-center text-xs font-bold text-indigo-600">
                    GO TO MODULE <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/financial/capital/investors">
              <Card className="hover:bg-slate-50 transition-colors border-none shadow-md group">
                <CardContent className="p-6">
                  <Briefcase className="h-8 w-8 text-emerald-600 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Investors</h3>
                  <p className="text-xs text-muted-foreground mb-4">View strategic shareholders and ledger.</p>
                  <div className="flex items-center text-xs font-bold text-emerald-600">
                    GO TO MODULE <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Relational Summary</CardTitle>
              <CardDescription>Consolidated view of active governance state.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <span className="font-medium">Cap Table Compliance</span>
                  </div>
                  <Badge variant={validation.isValid ? "outline" : "destructive"}>
                    {validation.isValid ? "Secure" : "Equity Overflow"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-accent" />
                    <span className="font-medium">Active Stakeholders</span>
                  </div>
                  <span className="font-bold">{(investors?.length || 0) + (leadership?.length || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
