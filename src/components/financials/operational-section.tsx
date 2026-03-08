"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  calcEBITDA, 
  calcEBITDAMargin, 
  formatINR 
} from "@/modules/financial/utils/financialEngine";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";

interface OperationalSectionProps {
  history: any[];
}

export function OperationalSection({ history }: OperationalSectionProps) {
  const latest = history[0];
  const ebitda = latest ? calcEBITDA(latest.netRevenue, latest.operatingExpenses) : 0;
  const margin = latest ? calcEBITDAMargin(ebitda, latest.netRevenue) : 0;

  const chartData = [...history].reverse().map(h => ({
    name: h.month,
    revenue: h.netRevenue,
    expenses: h.operatingExpenses,
    ebitda: calcEBITDA(h.netRevenue, h.operatingExpenses)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader>
            <CardTitle>Revenue vs Expenses (INR)</CardTitle>
            <CardDescription>Trailing growth performance.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatINR(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Net Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#94A3B8" strokeWidth={2} name="OpEx" />
                <Line type="monotone" dataKey="ebitda" stroke="#10B981" strokeWidth={2} name="EBITDA" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Performance Context</CardTitle>
            <CardDescription>Operational Efficiency Metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-sm text-muted-foreground font-medium">Monthly EBITDA</span>
              <div className="text-right">
                <div className="text-lg font-bold">{formatINR(ebitda)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-sm text-muted-foreground font-medium">EBITDA Margin</span>
              <div className="text-right">
                <div className="text-lg font-bold">{margin.toFixed(1)}%</div>
                {margin < 15 && (
                  <Badge variant="destructive" className="text-[10px] h-4 flex items-center gap-1">
                    <AlertTriangle className="h-2 w-2" />
                    Efficiency Alert
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-sm text-muted-foreground font-medium">Net Revenue</span>
              <div className="text-right font-bold text-lg">
                {formatINR(latest?.netRevenue || 0)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary text-primary-foreground space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70">
                <Info className="h-3 w-3" />
                Operational Strategy
              </div>
              <p className="text-xs italic leading-relaxed">
                {margin < 15 
                  ? "Operational efficiency needs improvement. High OpEx is suppressing your EBITDA margin."
                  : "Business model is showing strong operational sustainability with positive unit economics."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
