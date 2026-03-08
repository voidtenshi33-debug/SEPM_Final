'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, where } from "firebase/firestore";

/**
 * Custom hook to provide real-time financial data to the entire module.
 * Adheres to the startup-level intelligence blueprint.
 */
export function useFinancials(startupId: string = "demo-startup") {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // 1. Monthly Financials (Last 12 months)
  // Blueprint: financials/{YYYY-MM} - We query by month descending.
  const financialsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "financials"), 
      orderBy("month", "desc"), 
      limit(12)
    );
  }, [firestore, user, isUserLoading]);
  
  // 2. Funding Rounds
  const roundsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "rounds"), 
      orderBy("roundDate", "desc")
    );
  }, [firestore, user, isUserLoading]);

  // 3. Investors
  const investorsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return collection(firestore, "investors");
  }, [firestore, user, isUserLoading]);

  // 4. Leadership Team (New Collection per Blueprint)
  const leadershipQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return collection(firestore, "leadership");
  }, [firestore, user, isUserLoading]);

  // 5. Cap Table Singleton (Blueprint: capitalStructure/main)
  const capTableRef = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return doc(firestore, "capitalStructure", "main");
  }, [firestore, user, isUserLoading]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);

  const isLoading = isUserLoading || loadingFin || loadingRounds || loadingInv || loadingLead || loadingCap;

  return {
    financials: financials || [],
    rounds: rounds || [],
    investors: investors || [],
    leadership: leadership || [],
    capTable: capTable || null,
    isLoading,
    latestMonth: financials && financials.length > 0 ? financials[0] : null,
    prevMonth: financials && financials.length > 1 ? financials[1] : null,
  };
}
