
'use client';

import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { MetricCards } from "@/components/financials/metric-cards";
import { OperationalSection } from "@/components/financials/operational-section";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import { Loader2 } from "lucide-react";

export default function OperationalPage() {
  const { financials, latestMonth, prevMonth, categories, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end">
        <AddExpenseModal categories={categories} />
      </div>
      <MetricCards 
        currentFinancials={latestMonth} 
        prevFinancials={prevMonth} 
        currentCash={168000} 
      />
      <OperationalSection history={financials} />
    </div>
  );
}
