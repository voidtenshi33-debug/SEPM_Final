
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  
  const profileRef = React.useMemo(() => doc(firestore, "startupProfile", "main"), [firestore]);
  const { data: profile, isLoading } = useDoc(profileRef);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      industry: formData.get("industry") as string,
      stage: formData.get("stage") as string,
      businessType: formData.get("businessType") as string,
      foundedDate: formData.get("foundedDate") as string,
      mission: formData.get("mission") as string,
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(profileRef, data, { merge: true });
      toast({ title: "Profile Updated", description: "Foundational business data saved." });
    } catch (error) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-accent" />
          Startup Profile
        </h1>
        <p className="text-muted-foreground">The foundational data for your growth intelligence.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Business Identity</CardTitle>
            <CardDescription>Define your model to calibrate the intelligence engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name</Label>
                <Input id="name" name="name" placeholder="e.g., TechFlow AI" defaultValue={profile?.name || "StartupOS Demo"} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Model</Label>
                <Select name="businessType" defaultValue={profile?.businessType || "Hybrid"}>
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product (SKU/Order focus)</SelectItem>
                    <SelectItem value="Service">Service (Client/Hours focus)</SelectItem>
                    <SelectItem value="Hybrid">Hybrid (Mixed model)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select name="industry" defaultValue={profile?.industry || "saas"}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="healthtech">Healthtech</SelectItem>
                    <SelectItem value="e-commerce">E-commerce</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Funding Stage</Label>
                <Select name="stage" defaultValue={profile?.stage || "seed"}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea 
                id="mission" 
                name="mission"
                placeholder="What problem are you solving?" 
                defaultValue={profile?.mission || "Empowering startups with intelligent management tools to prevent failure and foster sustainable growth."}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Identity Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
