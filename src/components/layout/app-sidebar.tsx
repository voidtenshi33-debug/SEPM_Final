
"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Users, 
  KanbanSquare, 
  Briefcase, 
  TrendingUp, 
  Megaphone, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck,
  ChevronRight
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
  { title: "Financial Health", icon: Wallet, url: "/financials" },
];

const operationsNavItems = [
  { title: "Team Management", icon: Users, url: "/team" },
  { title: "Projects & Tasks", icon: KanbanSquare, url: "/projects" },
  { title: "Execution Board", icon: ShieldCheck, url: "/execution" },
];

const growthNavItems = [
  { title: "Investor & Deals", icon: Briefcase, url: "/investors" },
  { title: "Sales & Revenue", icon: TrendingUp, url: "/sales" },
  { title: "Marketing", icon: Megaphone, url: "/marketing" },
  { title: "Market Analysis", icon: BarChart3, url: "/market" },
];

const aiNavItems = [
  { title: "AI Growth Engine", icon: BrainCircuit, url: "/ai-insights" },
];

export function AppSidebar() {
  const pathname = usePathname();

  const NavList = ({ items }: { items: typeof mainNavItems }) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
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
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <ShieldCheck className="size-6" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
          <span className="font-headline font-bold text-lg">StartupOS</span>
          <span className="text-xs text-sidebar-foreground/70">Guardians of Growth</span>
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
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={operationsNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Growth</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={growthNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={aiNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/30 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-sidebar-foreground/60">Founder</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
