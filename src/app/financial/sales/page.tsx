
'use client';

import * as React from "react";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertCircle
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
  const { user } = useUser();

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
      if (productMetrics.aov < 1000) return "AOV is below benchmark. Suggest bundling products or implementing a 'Free shipping over ₹2000' threshold.";
      if (latestMonth.unitsSold < 100) return "Volume is low. Prioritize performance marketing on high-margin SKUs.";
    } else if (businessType === "Service") {
      if (serviceMetrics.utilizationRate < 70) return "Team utilization is low. Significant capacity is 'benched'. Seek short-term consulting gigs.";
      if (serviceMetrics.clientRetention < 80) return "Churn detected. Implement a post-service feedback loop to improve retention.";
    }
    return "Sales velocity is stable. Maintain current acquisition spend.";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            Sales Intelligence: {businessType} Mode
          </h2>
          <p className="text-sm text-muted-foreground">Adaptive tracking for {businessType.toLowerCase()} unit economics.</p>
        </div>
        <AddSalesDataModal businessType={businessType} />
      </div>

      {/* Adaptive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold font-headline">{formatINR(latestMonth?.netRevenue || 0)}</p>
            <Badge variant="outline" className="mt-2 text-[8px] uppercase">{latestMonth?.month || "---"}</Badge>
          </CardContent>
        </Card>

        {(businessType === "Product" || businessType === "Hybrid") && (
          <>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Order Value (AOV)</p>
                <p className="text-2xl font-bold font-headline">{formatINR(productMetrics.aov)}</p>
                <div className="flex items-center gap-1 text-[10px] text-accent mt-2 font-bold">
                  <Package className="h-3 w-3" /> {latestMonth?.ordersCount || 0} ORDERS
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily Order Avg</p>
                <p className="text-2xl font-bold font-headline">{productMetrics.dailyOrderAvg.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">Last 30 Days</p>
              </CardContent>
            </Card>
          </>
        )}

        {(businessType === "Service" || businessType === "Hybrid") && (
          <>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Utilization Rate</p>
                <p className="text-2xl font-bold font-headline">{serviceMetrics.utilizationRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-bold">
                  <Clock className="h-3 w-3" /> {latestMonth?.billableHours || 0} HRS BILLED
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Revenue / Client</p>
                <p className="text-2xl font-bold font-headline">{formatINR(serviceMetrics.revenuePerClient)}</p>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-2 font-bold">
                  <Users className="h-3 w-3" /> {latestMonth?.activeClients || 0} CLIENTS
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              {businessType === "Product" ? "Monthly Order Velocity" : businessType === "Service" ? "Pipeline vs Closed" : "Sales Performance Trend"}
            </CardTitle>
            <CardDescription>Historical {businessType.toLowerCase()} metrics (₹)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {businessType === "Product" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => [v, "Orders"]} />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} name="Total Orders" />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatINR(v)} />
                    <Legend />
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
              Sales-AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Current Diagnosis</p>
                <p className="text-sm font-medium leading-relaxed italic text-slate-700">
                  "{getAISuggestion()}"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Strategic Focus
              </h4>
              <div className="space-y-2">
                {businessType === "Product" && (
                  <>
                    <div className="p-3 bg-white rounded-lg border text-sm flex items-center justify-between">
                      <span>Inventory Turnover</span>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">HEALTHY</Badge>
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-sm flex items-center justify-between">
                      <span>CAC Payback</span>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200">9.2 Months</Badge>
                    </div>
                  </>
                )}
                {businessType === "Service" && (
                  <>
                    <div className="p-3 bg-white rounded-lg border text-sm flex items-center justify-between">
                      <span>Retention Rate</span>
                      <Badge className={serviceMetrics.clientRetention > 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}>
                        {serviceMetrics.clientRetention.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-sm flex items-center justify-between">
                      <span>Lead Time</span>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">14 Days</Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
