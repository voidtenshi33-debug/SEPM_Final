
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      // Small delay to allow the auth listener to pick up the state change
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
              <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Access Key</Label>
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
