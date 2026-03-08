'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";

/**
 * Custom hook to provide real-time financial and governance data.
 * Adheres strictly to the refined backend schema.
 */
export function useFinancials() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // 1. Monthly Financials
  const financialsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(collection(firestore, "financials"), orderBy("id", "desc"), limit(12));
  }, [firestore, user, isUserLoading]);
  
  // 2. Funding Rounds
  const roundsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(collection(firestore, "rounds"), orderBy("roundDate", "desc"));
  }, [firestore, user, isUserLoading]);

  // 3. Investors
  const investorsQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return collection(firestore, "investors");
  }, [firestore, user, isUserLoading]);

  // 4. Leadership Team
  const leadershipQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return collection(firestore, "leadership");
  }, [firestore, user, isUserLoading]);

  // 5. Cap Table Singleton
  const capTableRef = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return doc(firestore, "capitalStructure", "main");
  }, [firestore, user, isUserLoading]);

  // 6. Expense Categories
  const categoriesQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return query(collection(firestore, "expenseCategories"), orderBy("name", "asc"));
  }, [firestore, user, isUserLoading]);

  // 7. Expenses
  const expensesQuery = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return collection(firestore, "expenses");
  }, [firestore, user, isUserLoading]);

  // 8. Startup Profile
  const profileRef = useMemoFirebase(() => {
    if (!user || isUserLoading) return null;
    return doc(firestore, "startupProfile", "main");
  }, [firestore, user, isUserLoading]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);
  const { data: categories, isLoading: loadingCats } = useCollection(categoriesQuery);
  const { data: expenses, isLoading: loadingExps } = useCollection(expensesQuery);
  const { data: profile, isLoading: loadingProfile } = useDoc(profileRef);

  const isLoading = isUserLoading || loadingFin || loadingRounds || loadingInv || loadingLead || loadingCap || loadingCats || loadingExps || loadingProfile;

  return {
    financials: financials || [],
    rounds: rounds || [],
    investors: investors || [],
    leadership: leadership || [],
    capTable: capTable || null,
    categories: categories || [],
    expenses: expenses || [],
    profile: profile || null,
    isLoading,
    latestMonth: financials && financials.length > 0 ? financials[0] : null,
    prevMonth: financials && financials.length > 1 ? financials[1] : null,
  };
}
