
"use client";

import * as React from "react";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import { MetricCards } from "@/components/financials/metric-cards";
import { OperationalSection } from "@/components/financials/operational-section";
import { CapitalSection } from "@/components/financials/capital-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ShieldCheck, Activity, Loader2 } from "lucide-react";

export default function FinancialDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Firestore Subscriptions (Multi-tenant)
  const financialsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "users", user.uid, "financials"), orderBy("id", "asc"), limit(12));
  }, [firestore, user]);
  
  const roundsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "users", user.uid, "rounds"), orderBy("roundDate", "desc"));
  }, [firestore, user]);

  const investorsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "investors");
  }, [firestore, user]);

  const leadershipQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "leadership");
  }, [firestore, user]);

  const capTableRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid, "capitalStructure", "main");
  }, [firestore, user]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);

  if (loadingFin || loadingRounds || loadingInv || loadingLead || loadingCap || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

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
        currentCash={42000000} // This would be fetched from a dedicated cash entity in production
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
            leadership={leadership || []}
            capTable={capTable}
            onAddRound={() => {}} // Modals are now standalone triggers in subpages
            onAddInvestor={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
