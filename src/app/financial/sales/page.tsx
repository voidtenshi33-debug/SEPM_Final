'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Sparkles } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Monthly Sales Intelligence
            </CardTitle>
            <CardDescription>Advanced tracking of unit economics and recurring velocity.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl m-6">
            <p className="text-muted-foreground italic">Sales Intelligence visualizations coming in Phase 2...</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Sales-AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-xl border shadow-sm">
              <p className="text-sm font-medium">No alerts today.</p>
              <p className="text-xs text-muted-foreground mt-1">Growth velocity is within expected range.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
