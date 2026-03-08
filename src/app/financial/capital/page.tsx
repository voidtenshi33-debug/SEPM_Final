'use client';

import { useFinancials } from "@/modules/financial/hooks/useFinancials";
import { CapitalSection } from "@/components/financials/capital-section";
import { Loader2 } from "lucide-react";

export default function CapitalPage() {
  const { rounds, investors, leadership, capTable, isLoading } = useFinancials();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <CapitalSection 
        rounds={rounds} 
        investors={investors} 
        leadership={leadership}
        capTable={capTable}
        onAddRound={() => {}}
        onAddInvestor={() => {}}
      />
    </div>
  );
}
