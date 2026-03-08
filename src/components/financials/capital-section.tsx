"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ShieldCheck, Plus, AlertCircle, Clock } from "lucide-react";
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

export function CapitalSection({ rounds, investors, leadership, capTable, onAddRound, onAddInvestor }: CapitalSectionProps) {
  const leadershipEquity = leadership.reduce((acc, curr) => acc + (curr.equityPct || 0), 0);
  
  const pieData = [
    { name: "Founders", value: capTable?.founderEquityPct || 0, color: "#0F172A" },
    { name: "Leadership", value: leadershipEquity, color: "#3B82F6" },
    { name: "Investors", value: capTable?.totalInvestorEquityPct || 0, color: "#94A3B8" },
    { name: "ESOP", value: capTable?.esopEquityPct || 0, color: "#10B981" },
  ];

  const { isValid, total } = validateEquity(
    capTable?.founderEquityPct || 0,
    leadershipEquity,
    capTable?.totalInvestorEquityPct || 0,
    capTable?.esopEquityPct || 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Cap Table Visualization
            </CardTitle>
            <CardDescription>Equity distribution (All Roles).</CardDescription>
          </div>
          {!isValid && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Cap Table Error: {total}%
            </Badge>
          )}
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
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

      <div className="space-y-6">
        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Investors & Deal Tenure</CardTitle>
              <CardDescription>Capital and time management.</CardDescription>
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
                  <TableHead>Equity</TableHead>
                  <TableHead>Rem. Tenure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-medium">{investor.name}</TableCell>
                    <TableCell>{investor.equityPct}%</TableCell>
                    <TableCell className="flex items-center gap-2">
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
              <CardDescription>Recent capital events.</CardDescription>
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
                  <TableHead>Dilution %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => (
                  <TableRow key={round.id}>
                    <TableCell className="font-medium">{round.name}</TableCell>
                    <TableCell>{formatINR(round.amountRaised)}</TableCell>
                    <TableCell>{round.equityDilutedPct}%</TableCell>
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
