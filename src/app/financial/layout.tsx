'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  Zap,
  Target
} from "lucide-react";
import { AddFinancialsModal } from "@/components/financials/add-financials-modal";
import { AddExpenseModal } from "@/components/financials/add-expense-modal";
import { useFinancials } from "@/modules/financial/hooks/useFinancials";

const subNavItems = [
  { name: "Operational Performance", href: "/financial/operational", icon: Activity },
  { name: "Budget vs Actual", href: "/financial/operational/budget", icon: Target },
  { name: "Sales Intelligence", href: "/financial/sales", icon: TrendingUp },
  { name: "Cost Categories", href: "/financial/categories", icon: PieChart },
  { name: "Capital & Governance", href: "/financial/capital", icon: ShieldCheck },
  { name: "Strategic Insights", href: "/financial/insights", icon: Zap },
];

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { categories } = useFinancials();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <PageHeader 
          title="Financial War Room" 
          description="Strategic oversight of operational performance, sales growth, and capital structure."
        />
        <div className="flex items-center gap-2">
           <AddExpenseModal categories={categories} />
           <AddFinancialsModal />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {subNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap",
                isActive 
                  ? "border-accent text-accent bg-accent/5" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[600px] pt-4">
        {children}
      </div>
    </div>
  );
}
