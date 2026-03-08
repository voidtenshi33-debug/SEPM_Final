"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ShieldCheck, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CapitalSectionProps {
  rounds: any[];
  investors: any[];
  capTable: any;
  onAddRound: () => void;
  onAddInvestor: () => void;
}

export function CapitalSection({ rounds, investors, capTable, onAddRound, onAddInvestor }: CapitalSectionProps) {
  const pieData = [
    { name: "Founders", value: capTable?.founderEquityPct || 60, color: "#0F172A" },
    { name: "CEO", value: capTable?.ceoEquityPct || 10, color: "#3B82F6" },
    { name: "Investors", value: capTable?.totalInvestorEquityPct || 25, color: "#94A3B8" },
    { name: "ESOP", value: capTable?.esopEquityPct || 5, color: "#10B981" },
  ];

  const totalEquity = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const isCapTableError = totalEquity > 100.01 || totalEquity < 99.99;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Cap Table Visualization
            </CardTitle>
            <CardDescription>Ownership distribution & validation.</CardDescription>
          </div>
          {isCapTableError && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Equity mismatch: {totalEquity.toFixed(2)}%
            </Badge>
          )}
        </CardHeader>
        <CardContent className="h-[300px]">
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
              <CardTitle>Funding Rounds</CardTitle>
              <CardDescription>Recent capital events.</CardDescription>
            </div>
            <Button size="sm" onClick={onAddRound} className="bg-accent">
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
                    <TableCell>${round.amountRaised?.toLocaleString()}</TableCell>
                    <TableCell>{round.equityDilutedPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Key Investors</CardTitle>
              <CardDescription>Partners in your growth journey.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onAddInvestor}>
              <Plus className="h-4 w-4 mr-1" /> Add Investor
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Equity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.slice(0, 3).map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-medium">{investor.name}</TableCell>
                    <TableCell>{rounds.find(r => r.id === investor.roundId)?.name || 'Unknown'}</TableCell>
                    <TableCell>{investor.equityPct}%</TableCell>
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
