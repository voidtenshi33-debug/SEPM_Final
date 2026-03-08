
"use client"

import React, { useState } from "react"
import { ShieldCheck, BrainCircuit, Activity, Target, Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden flex flex-col md:flex-row relative">
      {/* Background Visuals */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse delay-700 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://picsum.photos/seed/startup-bg/1920/1080')] opacity-[0.02] grayscale mix-blend-overlay pointer-events-none" />

      {/* Left Side: Content & Brand */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-20 space-y-12 relative z-10">
        <header className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-blue-400/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tighter font-headline leading-none">Startup<span className="text-blue-500">OS</span></h1>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">Growth Guard v1.0</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1] bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              Guarding Growth. <br />
              <span className="text-blue-500">Preventing Failure.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
              The command center for early-stage founders. Transform raw operational signals into strategic survival intelligence.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <WelcomeFeatureItem 
            icon={BrainCircuit}
            title="Expansion Modeling"
            description="AI-driven growth roadmaps linked to capital."
          />
          <WelcomeFeatureItem 
            icon={Activity}
            title="Operational Pulse"
            description="Real-time monitoring of burn and EBITDA."
          />
          <WelcomeFeatureItem 
            icon={Target}
            title="Execution Integrity"
            description="Performance-based merit scoring for leaders."
          />
        </div>

        <div className="flex items-center gap-8 text-slate-600 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest">AI Enabled</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Vault Secured</span>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Portal */}
      <div className="md:w-[500px] bg-white/[0.02] border-l border-white/5 backdrop-blur-xl flex flex-col justify-center p-8 md:p-12 relative z-10">
        <div className="animate-in fade-in zoom-in duration-700 delay-200">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">
              {user ? `Welcome back, ${user.displayName || 'Founder'}` : "Initialize Session"}
            </h3>
            <p className="text-slate-400 text-sm">
              {user ? "Your Command Center session is ready." : "Access your startup's strategic DNA."}
            </p>
          </div>
          
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                    {(user.displayName || user.email || 'F')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.displayName || 'Strategic Founder'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleLaunch} 
                  disabled={isLaunching}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 group"
                >
                  {isLaunching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <><CheckCircle2 className="h-5 w-5 mr-2" /> Enter Command Center <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" /></>
                  )}
                </Button>
              </div>
            ) : (
              <AuthForm />
            )}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 className="h-3 w-3" /> System Status: Operational
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 left-8 md:left-20 text-slate-700 text-[9px] font-bold uppercase tracking-[0.4em] pointer-events-none">
        © 2024 StartupOS Global • Tactical Intelligence
      </footer>
    </div>
  )
}

function WelcomeFeatureItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-blue-600/20">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      </div>
    </div>
  )
}
