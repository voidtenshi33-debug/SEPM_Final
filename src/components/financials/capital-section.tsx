"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ShieldCheck, Plus, AlertCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR, calcRemainingTenure, validateEquity } from "@/modules/financial/utils/financialEngine";

interface CapitalSectionProps {
  rounds: any[];
  investors: any[];
  leadership: any[];
  capTable: any;
  onAddRound: () => void;
  onAddInvestor: () => void;
}

export function CapitalSection({ rounds, investors, leadership = [], capTable, onAddRound, onAddInvestor }: CapitalSectionProps) {
  // Aggregate Leadership Equity per Blueprint
  const leadershipTotalEquity = (leadership || []).reduce((acc, curr) => acc + (curr.equityPct || 0), 0);
  
  const pieData = [
    { name: "Founders", value: capTable?.founderEquityPct || 0, color: "#0F172A" },
    { name: "Leadership", value: leadershipTotalEquity, color: "#3B82F6" },
    { name: "Investors", value: capTable?.totalInvestorEquityPct || 0, color: "#94A3B8" },
    { name: "ESOP", value: capTable?.esopEquityPct || 0, color: "#10B981" },
  ].filter(item => item.value > 0);

  const { isValid, total } = validateEquity(
    capTable?.founderEquityPct || 0,
    leadershipTotalEquity,
    capTable?.totalInvestorEquityPct || 0,
    capTable?.esopEquityPct || 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
      <div className="space-y-6">
        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Cap Table Visualization
              </CardTitle>
              <CardDescription>Consolidated equity distribution.</CardDescription>
            </div>
            {!isValid && (
              <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                Critical Error: {total}%
              </Badge>
            )}
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Leadership Equity
              </CardTitle>
              <CardDescription>Multi-role team tracking.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Equity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadership.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell><Badge variant="outline">{member.title}</Badge></TableCell>
                    <TableCell className="text-right font-bold">{member.equityPct}%</TableCell>
                  </TableRow>
                ))}
                {leadership.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4 italic">
                      No leadership members recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Investors & Deal Tenure</CardTitle>
              <CardDescription>Remaining years per Blueprint logic.</CardDescription>
            </div>
            <Button size="sm" onClick={onAddInvestor} className="bg-accent">
              <Plus className="h-4 w-4 mr-1" /> Add Investor
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Rem. Tenure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-medium">
                      {investor.name}
                      {investor.loyalty && <Badge className="ml-2 bg-emerald-500">Loyal</Badge>}
                    </TableCell>
                    <TableCell>{formatINR(investor.investmentAmount)}</TableCell>
                    <TableCell className="text-right font-bold flex items-center justify-end gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {calcRemainingTenure(investor.dealEndDate)} Yrs
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Funding Rounds (INR)</CardTitle>
              <CardDescription>Historical capital events.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onAddRound}>
              <Plus className="h-4 w-4 mr-1" /> Add Round
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Dilution %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => (
                  <TableRow key={round.id}>
                    <TableCell className="font-medium">{round.name}</TableCell>
                    <TableCell>{formatINR(round.amountRaised)}</TableCell>
                    <TableCell className="text-right">{round.equityDilutedPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
