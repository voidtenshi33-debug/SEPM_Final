'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  TrendingUp, 
  Tags, 
  ShieldCheck, 
  Wallet,
  LayoutDashboard
} from "lucide-react";

const subNavItems = [
  { title: "Overview", icon: LayoutDashboard, href: "/financial" },
  { title: "Operational", icon: Activity, href: "/financial/operational" },
  { title: "Sales Intelligence", icon: TrendingUp, href: "/financial/sales" },
  { title: "Categories", icon: Tags, href: "/financial/categories" },
  { title: "Capital & Governance", icon: ShieldCheck, href: "/financial/capital" },
];

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Wallet className="h-8 w-8 text-accent" />
            Financial Command Center
          </h1>
          <p className="text-muted-foreground">Unified Operational & Capital Intelligence Guard.</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl w-fit">
        {subNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-white text-accent shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-muted-foreground")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
