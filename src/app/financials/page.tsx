"use client";

import * as React from "react";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import { MetricCards } from "@/components/financials/metric-cards";
import { OperationalSection } from "@/components/financials/operational-section";
import { CapitalSection } from "@/components/financials/capital-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ShieldCheck, Activity } from "lucide-react";

export default function FinancialDashboard() {
  // Constants for singleton & multi-tenant paths
  const startupId = "demo-startup"; // In production this would come from user context
  const firestore = useFirestore();

  // Firestore Subscriptions
  const financialsQuery = useMemoFirebase(() => 
    query(collection(firestore, "financials"), orderBy("month", "asc"), limit(12)), 
  [firestore]);
  
  const roundsQuery = useMemoFirebase(() => 
    query(collection(firestore, "rounds"), orderBy("roundDate", "desc")), 
  [firestore]);

  const investorsQuery = useMemoFirebase(() => 
    collection(firestore, "investors"), 
  [firestore]);

  const capTableRef = useMemoFirebase(() => 
    doc(firestore, "capitalStructure", startupId), 
  [firestore, startupId]);

  const { data: financials } = useCollection(financialsQuery);
  const { data: rounds } = useCollection(roundsQuery);
  const { data: investors } = useCollection(investorsQuery);
  const { data: capTable } = useDoc(capTableRef);

  const currentMonthData = financials && financials.length > 0 ? financials[financials.length - 1] : null;
  const prevMonthData = financials && financials.length > 1 ? financials[financials.length - 2] : null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Wallet className="h-8 w-8 text-accent" />
            Financial Command Center
          </h1>
          <p className="text-muted-foreground">Unified Operational & Capital Guard.</p>
        </div>
      </div>

      <MetricCards 
        currentFinancials={currentMonthData} 
        prevFinancials={prevMonthData} 
        currentCash={168000} // This would be fetched from a dedicated cash entity in production
      />

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Operational Performance
          </TabsTrigger>
          <TabsTrigger value="capital" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Capital & Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-8 animate-in fade-in duration-300">
          <OperationalSection history={financials || []} />
        </TabsContent>

        <TabsContent value="capital" className="space-y-8 animate-in fade-in duration-300">
          <CapitalSection 
            rounds={rounds || []} 
            investors={investors || []} 
            capTable={capTable}
            onAddRound={() => {}} // Modals would be linked here
            onAddInvestor={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
