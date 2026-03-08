'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, where } from "firebase/firestore";

/**
 * Custom hook to provide real-time financial data to the entire module.
 */
export function useFinancials(startupId: string = "demo-startup") {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // 1. Monthly Financials (Last 12 months)
  const financialsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "financials"), 
      where("startupId", "==", startupId),
      orderBy("month", "desc"), 
      limit(12)
    );
  }, [firestore, user, isUserLoading, startupId]);
  
  // 2. Funding Rounds
  const roundsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "rounds"), 
      where("startupId", "==", startupId),
      orderBy("roundDate", "desc")
    );
  }, [firestore, user, isUserLoading, startupId]);

  // 3. Investors
  const investorsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "investors"),
      where("startupId", "==", startupId)
    );
  }, [firestore, user, isUserLoading, startupId]);

  // 4. Leadership Team
  const leadershipQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(
      collection(firestore, "leadership"),
      where("startupId", "==", startupId)
    );
  }, [firestore, user, isUserLoading, startupId]);

  // 5. Cap Table Singleton
  const capTableRef = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return doc(firestore, "capitalStructure", startupId);
  }, [firestore, startupId, user, isUserLoading]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);

  return {
    financials: financials || [],
    rounds: rounds || [],
    investors: investors || [],
    leadership: leadership || [],
    capTable,
    isLoading: loadingFin || loadingRounds || loadingInv || loadingCap || loadingLead || isUserLoading,
    latestMonth: financials && financials.length > 0 ? financials[0] : null,
    prevMonth: financials && financials.length > 1 ? financials[1] : null,
  };
}