
'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";

/**
 * Custom hook to provide real-time financial and governance data.
 * Multi-tenant aware: fetches data from /users/{userId}/...
 */
export function useFinancials(selectedMonth?: string) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const userId = user?.uid;

  const currentMonthId = selectedMonth || new Date().toISOString().substring(0, 7);

  // 1. Monthly Financials
  const financialsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, "users", userId, "financials"), orderBy("id", "desc"), limit(12));
  }, [firestore, userId]);
  
  // 2. Funding Rounds
  const roundsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, "users", userId, "rounds"), orderBy("roundDate", "desc"));
  }, [firestore, userId]);

  // 3. Investors
  const investorsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return collection(firestore, "users", userId, "investors");
  }, [firestore, userId]);

  // 4. Leadership Team
  const leadershipQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return collection(firestore, "users", userId, "leadership");
  }, [firestore, userId]);

  // 5. Cap Table Singleton
  const capTableRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, "users", userId, "capitalStructure", "main");
  }, [firestore, userId]);

  // 6. Expense Categories
  const categoriesQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, "users", userId, "expenseCategories"), orderBy("name", "asc"));
  }, [firestore, userId]);

  // 7. All Expenses
  const expensesQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return collection(firestore, "users", userId, "expenses");
  }, [firestore, userId]);

  // 8. Startup Profile
  const profileRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, "users", userId, "startupProfile", "main");
  }, [firestore, userId]);

  // 9. Budget for selected month
  const budgetRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, "users", userId, "budgets", currentMonthId);
  }, [firestore, userId, currentMonthId]);

  const { data: financials, isLoading: loadingFin } = useCollection(financialsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: leadership, isLoading: loadingLead } = useCollection(leadershipQuery);
  const { data: capTable, isLoading: loadingCap } = useDoc(capTableRef);
  const { data: categories, isLoading: loadingCats } = useCollection(categoriesQuery);
  const { data: expenses, isLoading: loadingExps } = useCollection(expensesQuery);
  const { data: profile, isLoading: loadingProfile } = useDoc(profileRef);
  const { data: budget, isLoading: loadingBudget } = useDoc(budgetRef);

  const isLoading = isUserLoading || loadingFin || loadingRounds || loadingInv || loadingLead || loadingCap || loadingCats || loadingExps || loadingProfile || loadingBudget;

  return {
    financials: financials || [],
    rounds: rounds || [],
    investors: investors || [],
    leadership: leadership || [],
    capTable: capTable || null,
    categories: categories || [],
    expenses: expenses || [],
    profile: profile || null,
    budget: budget || null,
    isLoading,
    latestMonth: financials && financials.length > 0 ? financials[0] : null,
    prevMonth: financials && financials.length > 1 ? financials[1] : null,
  };
}
