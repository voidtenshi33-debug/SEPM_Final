"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, BrainCircuit, Activity, ArrowRight, Target, Sparkles, Loader2 } from "lucide-react"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthForm } from "@/components/auth/auth-form"

export default function WelcomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      setIsRedirecting(true);
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isRedirecting || (user && !isUserLoading)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden flex flex-col items-center justify-center relative p-6">
      {/* Background Visuals */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://picsum.photos/seed/startup-bg/1920/1080')] opacity-[0.03] grayscale mix-blend-overlay pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-5xl w-full space-y-16 relative z-10 text-center">
        <header className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-400/20">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black tracking-tighter font-headline leading-none">Startup<span className="text-blue-500">OS</span></h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">Growth Guard v1.0</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              Guarding Growth. <br />
              <span className="text-blue-500">Preventing Failure.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Transform raw operational signals into strategic survival intelligence. The world's first data-driven integrated management system for early-stage founders.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <WelcomeFeatureCard 
            icon={BrainCircuit}
            title="Expansion Modeling"
            description="AI-driven growth roadmaps that bridge the gap between capital and execution."
            accent="blue"
          />
          <WelcomeFeatureCard 
            icon={Activity}
            title="Operational Pulse"
            description="Real-time monitoring of burn rates, EBITDA, and liquidity thresholds."
            accent="emerald"
          />
          <WelcomeFeatureCard 
            icon={Target}
            title="Execution Integrity"
            description="Performance-based merit scoring that links tactical work to valuation."
            accent="amber"
          />
        </div>

        <div className="pt-12 space-y-8 animate-in fade-in zoom-in duration-1000 delay-500">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 px-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.3)] group border border-blue-400/20">
                Initialize Command Center <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#020617] border-white/10 text-white sm:max-w-[450px] p-8 rounded-3xl backdrop-blur-xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Founder Portal</DialogTitle>
              </DialogHeader>
              <AuthForm />
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Enabled</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Vault Secured</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 w-full text-center text-slate-700 text-[10px] font-bold uppercase tracking-[0.4em]">
        © 2024 StartupOS Global Systems • Tactical Intelligence Division
      </footer>
    </div>
  )
}

function WelcomeFeatureCard({ icon: Icon, title, description, accent }: { icon: any, title: string, description: string, accent: 'blue' | 'emerald' | 'amber' }) {
  const colors = {
    blue: 'text-blue-400 group-hover:text-blue-300',
    emerald: 'text-emerald-400 group-hover:text-emerald-300',
    amber: 'text-amber-400 group-hover:text-amber-300'
  }

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/10 transition-all hover:-translate-y-2 group text-left">
      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className={`h-6 w-6 ${colors[accent]}`} />
      </div>
      <h4 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  )
}
