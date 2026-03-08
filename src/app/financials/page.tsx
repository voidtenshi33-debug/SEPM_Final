
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FinancialsPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline">Financial Health</h1>
        <p className="text-muted-foreground">Monitor your burn rate, revenue, and runway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Monthly Burn" 
          value="$12,000" 
          icon={TrendingDown} 
          description="Last month: $11,500"
          className="bg-rose-50/50"
        />
        <KPICard 
          title="Current Cash" 
          value="$168,000" 
          icon={DollarSign} 
          description="In primary bank account"
        />
        <KPICard 
          title="Runway" 
          value="14.0 Months" 
          icon={Activity} 
          description="Healthy status"
          className="bg-emerald-50/50"
        />
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Cash Management</CardTitle>
          <CardDescription>Visualizing your financial sustainability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-semibold">Runway Depletion</h4>
                <p className="text-xs text-muted-foreground">Estimated date of zero cash: January 2025</p>
              </div>
              <span className="text-sm font-bold">14/24 Months Target</span>
            </div>
            <Progress value={58} className="h-3" />
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              <span>Critical (3m)</span>
              <span>Warning (6m)</span>
              <span>Healthy (12m+)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Revenue Streams
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>SaaS Subscriptions</span> <span className="font-mono font-bold">$18,200</span></li>
                <li className="flex justify-between"><span>Professional Services</span> <span className="font-mono font-bold">$6,300</span></li>
                <li className="flex justify-between border-t pt-2 font-bold uppercase text-xs"><span>Total MRR</span> <span>$24,500</span></li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                Major Expenses
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Payroll</span> <span className="font-mono font-bold">$8,500</span></li>
                <li className="flex justify-between"><span>Infrastructure</span> <span className="font-mono font-bold">$1,200</span></li>
                <li className="flex justify-between border-t pt-2 font-bold uppercase text-xs"><span>Total OPEX</span> <span>$12,000</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
