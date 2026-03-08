"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Users, 
  Rocket, 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck,
  Activity,
  Tags,
  Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Startup Profile", icon: Building2, url: "/profile" },
];

const teamNavItems = [
  { title: "Leadership Team", icon: Users, url: "/team" },
];

const capitalNavItems = [
  { title: "War Room", icon: Wallet, url: "/financial" },
  { title: "Cap Table DNA", icon: ShieldCheck, url: "/financial/capital" },
  { title: "Funding Rounds", icon: Rocket, url: "/financial/capital/rounds" },
  { title: "Investor Ledger", icon: Briefcase, url: "/financial/capital/investors" },
];

const operationsNavItems = [
  { title: "Operational Profit", icon: Activity, url: "/financial/operational" },
  { title: "Sales Intelligence", icon: TrendingUp, url: "/financial/sales" },
  { title: "Cost Categories", icon: Tags, url: "/financial/categories" },
];

const aiNavItems = [
  { title: "Strategic Insights", icon: Zap, url: "/financial/insights" },
  { title: "AI Growth Engine", icon: BrainCircuit, url: "/ai-insights" },
];

export function AppSidebar() {
  const pathname = usePathname();

  const NavList = ({ items }: { items: any[] }) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname.startsWith(item.url) && (item.url !== '/' || pathname === '/')} tooltip={item.title}>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#0F172A] text-white">
          <ShieldCheck className="size-6" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
          <span className="font-headline font-bold text-lg text-slate-900">StartupOS</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Growth Guard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={mainNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={teamNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Capital & Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={capitalNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={operationsNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={aiNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">John Doe</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Founder</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}