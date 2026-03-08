
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
  BrainCircuit, 
  ShieldCheck,
  Activity,
  Tags,
  Zap,
  Target,
  FolderLock,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

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
  { title: "Document Vault", icon: FolderLock, url: "/documents" },
  { title: "Startup Profile", icon: Building2, url: "/profile" },
];

const teamNavItems = [
  { title: "Leadership Team", icon: Users, url: "/team" },
];

const executionNavItems = [
  { title: "Projects & Tasks", icon: Target, url: "/projects" },
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
  { title: "AI Growth Engine", icon: BrainCircuit, url: "/ai-growth" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const userInitials = React.useMemo(() => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "JD";
  }, [user]);

  const userName = user?.displayName || "Founder";

  const handleLogout = async () => {
    // Clear session entry signal
    sessionStorage.removeItem('startupos_launched');
    await signOut(auth);
    router.push("/welcome");
  };

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
          <SidebarGroupLabel>Execution</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={executionNavItems} />
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
      <SidebarFooter className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden overflow-hidden">
            <div className="size-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">{userName}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Founder</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 rounded-lg"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
