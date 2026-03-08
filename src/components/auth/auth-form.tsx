'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiatePasswordReset } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, UserPlus, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (password.length < 6) {
      toast({
        title: "Weak Access Key",
        description: "Password should be at least 6 characters.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      initiateEmailSignIn(auth, email, password);
    } catch (err) {
      toast({ title: "Authentication Request Failed", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (password.length < 6) {
      toast({
        title: "Weak Access Key",
        description: "Password should be at least 6 characters.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      initiateEmailSignUp(auth, email, password);
    } catch (err) {
      toast({ title: "Registration Request Failed", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    try {
      await initiatePasswordReset(auth, resetEmail);
      toast({
        title: "Recovery Signal Sent",
        description: "Check your corporate email for recovery instructions.",
      });
      setShowReset(false);
    } catch (err: any) {
      toast({
        title: "Recovery Failed",
        description: "Could not send reset email. Ensure the address is correct.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowReset(false)}
            className="p-0 h-auto text-slate-500 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3 mr-1" /> Back to Login
          </Button>
          <h4 className="text-lg font-bold">Account Recovery</h4>
          <p className="text-xs text-slate-500">Enter your email to receive a secure recovery link.</p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Corporate Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="founder@startup.os" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-12 pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-slate-600" 
                required 
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !resetEmail} className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 group">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><KeyRound className="h-5 w-5 mr-2" /> Send Recovery Link</>}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <Tabs defaultValue="login" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <TabsTrigger value="login" className="rounded-lg py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-slate-400">Login</TabsTrigger>
          <TabsTrigger value="signup" className="rounded-lg py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-slate-400">Join</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="space-y-6 animate-in fade-in duration-300">
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Corporate Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input id="login-email" name="email" type="email" placeholder="founder@startup.os" className="h-12 pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-slate-600" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Access Key</Label>
                <Button 
                  type="button"
                  variant="link" 
                  onClick={() => setShowReset(true)}
                  className="p-0 h-auto text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 tracking-tighter"
                >
                  Forgot Access Key?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input id="login-password" name="password" type="password" placeholder="••••••••" className="h-12 pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 group">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogIn className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" /> Authenticate</>}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-6 animate-in fade-in duration-300">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Corporate Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input id="signup-email" name="email" type="email" placeholder="founder@startup.os" className="h-12 pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-slate-600" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Access Key</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input id="signup-password" name="password" type="password" placeholder="••••••••" className="h-12 pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 group">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserPlus className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" /> Create Account</>}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-10 border-t border-white/5 pt-6 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed">
          Authorized Founder Access Only. <br /> All strategic signals are encrypted and audited.
        </p>
      </div>
    </div>
  );
}
