'use client';

import * as React from "react";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Package, 
  Users, 
  Clock, 
  Sparkles, 
  Activity, 
  Target, 
  BarChart3, 
  LineChart as LineChartIcon,
  Loader2,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { 
  formatINR, 
  calculateProductMetrics, 
  calculateServiceMetrics 
} from "@/modules/financial/utils/financialEngine";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { AddSalesDataModal } from "@/components/financials/add-sales-data-modal";

export default function SalesPage() {
  const [mounted, setMounted] = React.useState(false);
  const firestore = useFirestore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => doc(firestore, "startupProfile", "main"), [firestore]);
  const financialsQuery = useMemoFirebase(() => query(collection(firestore, "financials"), orderBy("month", "desc"), limit(12)), [firestore]);
  const leadershipQuery = useMemoFirebase(() => collection(firestore, "leadership"), [firestore]);

  const { data: profile, isLoading: loadingProfile } = useDoc(profileRef);
  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: leadership } = useCollection(leadershipQuery);

  if (loadingProfile || loadingFin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Synchronizing sales intelligence...</p>
      </div>
    );
  }

  const businessType = profile?.businessType || "Hybrid";
  const latestMonth = financials?.[0];
  const teamSize = leadership?.length || 1;

  const productMetrics = latestMonth ? calculateProductMetrics(latestMonth) : { aov: 0, revenuePerUnit: 0, dailyOrderAvg: 0 };
  const serviceMetrics = latestMonth ? calculateServiceMetrics(latestMonth, teamSize) : { revenuePerClient: 0, utilizationRate: 0, clientRetention: 0 };

  const chartData = [...(financials || [])].reverse().map(f => ({
    month: f.month,
    revenue: f.netRevenue,
    pipeline: f.pipelineValue || 0,
    orders: f.ordersCount || 0
  }));

  const getAISuggestion = () => {
    if (!latestMonth) return "Log your first month of sales to generate intelligence.";
    
    if (businessType === "Product") {
      if (productMetrics.aov < 1000 && productMetrics.aov > 0) return "Average Order Value (AOV) is low. Suggest bundling high-margin items to improve unit economics.";
      if (latestMonth.unitsSold < 100) return "Inventory velocity is slow. Prioritize growth marketing for your flagship SKU.";
    } else if (businessType === "Service") {
      if (serviceMetrics.utilizationRate < 60) return "Team utilization is critical (< 60%). Significant capacity is currently 'benched'. Seek short-term consulting contracts.";
      if (serviceMetrics.clientRetention < 80) return "Client churn alert. Implement a feedback loop to identify post-delivery friction.";
    }
    return "Sales velocity is stable. Current performance aligns with efficiency benchmarks.";
  };

  const renderProductMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Order Value (AOV)</p>
          <p className="text-2xl font-bold font-headline">{formatINR(productMetrics.aov)}</p>
          <div className="flex items-center gap-1 text-[10px] text-accent mt-2 font-bold uppercase">
            <Package className="h-3 w-3" /> {latestMonth?.ordersCount || 0} Orders
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Revenue Per Unit</p>
          <p className="text-2xl font-bold font-headline">{formatINR(productMetrics.revenuePerUnit)}</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">{latestMonth?.unitsSold || 0} Units Sold</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Orders / Day</p>
          <p className="text-2xl font-bold font-headline">{productMetrics.dailyOrderAvg.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">30-Day Velocity</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderServiceMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Utilization Rate</p>
          <p className="text-2xl font-bold font-headline">{serviceMetrics.utilizationRate.toFixed(1)}%</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-bold uppercase">
            <Clock className="h-3 w-3" /> {latestMonth?.billableHours || 0} Billed Hrs
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Revenue / Client</p>
          <p className="text-2xl font-bold font-headline">{formatINR(serviceMetrics.revenuePerClient)}</p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-2 font-bold uppercase">
            <Users className="h-3 w-3" /> {latestMonth?.activeClients || 0} Clients
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Retention Rate</p>
          <p className="text-2xl font-bold font-headline">{serviceMetrics.clientRetention.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">Active Consistency</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            Sales Intelligence: {businessType} Analysis
          </h2>
          <p className="text-sm text-muted-foreground">Unified tracking for {businessType.toLowerCase()} unit economics (INR).</p>
        </div>
        <AddSalesDataModal businessType={businessType} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Monthly Revenue</p>
            <p className="text-3xl font-bold font-headline">{formatINR(latestMonth?.netRevenue || 0)}</p>
            <Badge variant="outline" className="mt-2 text-[8px] uppercase border-white/20 text-white">{latestMonth?.month || "---"}</Badge>
          </CardContent>
        </Card>
        <div className="md:col-span-3">
          {(businessType === "Product" || businessType === "Hybrid") && renderProductMetrics()}
          {(businessType === "Service") && renderServiceMetrics()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {businessType === "Product" ? <LineChartIcon className="h-5 w-5 text-accent" /> : <BarChart3 className="h-5 w-5 text-accent" />}
              {businessType === "Product" ? "Monthly Order Velocity" : "Pipeline vs. Closed Revenue"}
            </CardTitle>
            <CardDescription>Historical {businessType.toLowerCase()} performance trend.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {businessType === "Product" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                    <Tooltip formatter={(v: number) => [v, "Orders"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36} align="right" />
                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} name="Total Orders" />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36} align="right" />
                    <Bar dataKey="revenue" fill="#0F172A" name="Closed Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pipeline" fill="#3B82F6" name="Pipeline Value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-50 border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Sales-AI Strategic Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Growth Diagnosis</p>
                <p className="text-sm font-medium leading-relaxed italic text-slate-700">
                  "{getAISuggestion()}"
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Strategic Focus Points
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><Briefcase className="h-3 w-3 text-slate-400" /> Revenue Stability</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">OPTIMAL</Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><Target className="h-3 w-3 text-slate-400" /> CAC Payback</span>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">7.4 Months</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}