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
  Zap 
} from "lucide-react";
import { AddFinancialsModal } from "@/components/financials/add-financials-modal";

const subNavItems = [
  { name: "Operational Performance", href: "/financial/operational", icon: Activity },
  { name: "Sales Intelligence", href: "/financial/sales", icon: TrendingUp },
  { name: "Cost Categories", href: "/financial/categories", icon: PieChart },
  { name: "Capital & Governance", href: "/financial/capital", icon: ShieldCheck },
  { name: "Strategic Insights", href: "/financial/insights", icon: Zap },
];

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <PageHeader 
          title="Financial War Room" 
          description="Strategic oversight of operational performance, sales growth, and capital structure."
        />
        <div className="flex items-center gap-2">
           <AddFinancialsModal />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar">
        {subNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
                isActive 
                  ? "bg-white text-accent shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[600px]">
        {children}
      </div>
    </div>
  );
}