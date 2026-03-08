'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { validateEquity, formatINR } from "@/modules/financial/utils/financialEngine";
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
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const COLORS = ['#0F172A', '#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function CapitalMasterDashboard() {
  const [mounted, setMounted] = useState(false);
  const { capTable, leadership, investors, isLoading } = useFinancials();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) return null;

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
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
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/financial/capital/leadership">
              <Card className="hover:bg-slate-50 transition-colors border-none shadow-md group">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Leadership</h3>
                  <p className="text-xs text-muted-foreground mb-4">Equity vesting & team access.</p>
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
                  <p className="text-xs text-muted-foreground mb-4">Funding targets vs. actuals.</p>
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
                  <p className="text-xs text-muted-foreground mb-4">Relational stakeholder ledger.</p>
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
              <CardDescription>Consolidated state of active governance.</CardDescription>
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
