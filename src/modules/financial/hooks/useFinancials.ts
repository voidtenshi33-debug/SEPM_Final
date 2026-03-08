'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit, DocumentData, CollectionReference, Query } from "firebase/firestore";

/**
 * Custom hook to provide real-time financial data to the entire module.
 */
export function useFinancials(startupId: string = "demo-startup") {
  const firestore = useFirestore();

  // 1. Monthly Financials (Last 12 months)
  const financialsQuery = useMemoFirebase(() => 
    query(collection(firestore, "financials"), orderBy("month", "desc"), limit(12)), 
  [firestore]);
  
  // 2. Funding Rounds
  const roundsQuery = useMemoFirebase(() => 
    query(collection(firestore, "rounds"), orderBy("roundDate", "desc")), 
  [firestore]);

  // 3. Investors
  const investorsQuery = useMemoFirebase(() => 
    collection(firestore, "investors"), 
  [firestore]);

  // 4. Cap Table Singleton
  const capTableRef = useMemoFirebase(() => 
    doc(firestore, "capitalStructure", startupId), 
  [firestore, startupId]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);

  return {
    financials: financials || [],
    rounds: rounds || [],
    investors: investors || [],
    capTable,
    isLoading: loadingFin || loadingRounds || loadingInv || loadingCap,
    latestMonth: financials && financials.length > 0 ? financials[0] : null,
    prevMonth: financials && financials.length > 1 ? financials[1] : null,
  };
}
