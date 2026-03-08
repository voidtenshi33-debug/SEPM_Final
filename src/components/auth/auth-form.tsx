'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
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

    try {
      initiateEmailSignUp(auth, email, password);
    } catch (err) {
      toast({ title: "Registration Request Failed", variant: "destructive" });
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <Card className="w-full border-none bg-transparent text-white">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-500 h-6 w-6" />
          Founder Portal
        </CardTitle>
        <CardDescription className="text-slate-400">
          Secure access to your startup's strategic intelligence.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Join</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 animate-in fade-in duration-300">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Corporate Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input id="login-email" name="email" type="email" placeholder="founder@startup.os" className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input id="login-password" name="password" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold rounded-xl shadow-lg shadow-blue-500/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogIn className="h-4 w-4 mr-2" /> Authenticate Session</>}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 animate-in fade-in duration-300">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Corporate Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input id="signup-email" name="email" type="email" placeholder="founder@startup.os" className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Secure Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input id="signup-password" name="password" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold rounded-xl shadow-lg shadow-blue-500/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" /> Initialize Account</>}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="px-0 flex flex-col gap-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#020617] px-2 text-slate-500">Or continue as</span></div>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => initiateAnonymousSignIn(auth)} 
          className="w-full text-slate-400 hover:text-white hover:bg-white/5 h-10 text-xs font-bold uppercase tracking-widest"
        >
          Temporary Guest Mode
        </Button>
      </CardFooter>
    </Card>
  );
}
