
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [pendingType, setPendingType] = React.useState<string | null>(null);
  
  const profileRef = React.useMemo(() => doc(firestore, "startupProfile", "main"), [firestore]);
  const { data: profile, isLoading } = useDoc(profileRef);

  const [formType, setFormType] = React.useState<string>("Hybrid");

  React.useEffect(() => {
    if (profile?.businessType) {
      setFormType(profile.businessType);
    }
  }, [profile]);

  const handleTypeChange = (newType: string) => {
    if (profile?.businessType && profile.businessType !== newType) {
      setPendingType(newType);
      setShowWarning(true);
    } else {
      setFormType(newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setFormType(pendingType);
      setPendingType(null);
    }
    setShowWarning(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      industry: formData.get("industry") as string,
      stage: formData.get("stage") as string,
      businessType: formType,
      mission: formData.get("mission") as string,
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(profileRef, data, { merge: true });
      toast({ 
        title: "Identity Synchronized", 
        description: `Startup calibrated as a ${formType} model.` 
      });
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2 text-slate-900">
          <ShieldCheck className="h-8 w-8 text-accent" />
          Startup Identity Engine
        </h1>
        <p className="text-muted-foreground">Define your core DNA to calibrate the growth intelligence layer.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-accent w-full" />
          <CardHeader>
            <CardTitle>Business Configuration</CardTitle>
            <CardDescription>This selection determines the metrics and AI analysis you see across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name</Label>
                <Input id="name" name="name" defaultValue={profile?.name || ""} placeholder="e.g., TechFlow AI" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Model (Core DNA)</Label>
                <Select value={formType} onValueChange={handleTypeChange}>
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">
                      <div className="flex flex-col text-left">
                        <span className="font-bold">Product-Based</span>
                        <span className="text-[10px] text-muted-foreground">Focus: Units, Orders, Inventory, AOV</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Service">
                      <div className="flex flex-col text-left">
                        <span className="font-bold">Service-Based</span>
                        <span className="text-[10px] text-muted-foreground">Focus: Clients, Billable Hours, Utilization</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Hybrid">
                      <div className="flex flex-col text-left">
                        <span className="font-bold">Hybrid Model</span>
                        <span className="text-[10px] text-muted-foreground">Mixed Stream: Products + Services</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry Vertical</Label>
                <Select name="industry" defaultValue={profile?.industry || "saas"}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS / Enterprise Software</SelectItem>
                    <SelectItem value="fintech">Fintech / Financial Services</SelectItem>
                    <SelectItem value="healthtech">Healthtech / Biotech</SelectItem>
                    <SelectItem value="e-commerce">E-commerce / D2C</SelectItem>
                    <SelectItem value="other">General Tech / Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Current Funding Stage</Label>
                <Select name="stage" defaultValue={profile?.stage || "seed"}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed (Ideation)</SelectItem>
                    <SelectItem value="seed">Seed (Validation)</SelectItem>
                    <SelectItem value="series-a">Series A (Scaling)</SelectItem>
                    <SelectItem value="growth">Growth (Expansion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">Mission / Problem Statement</Label>
              <Textarea 
                id="mission" 
                name="mission"
                rows={4}
                placeholder="Describe the problem you are solving..." 
                defaultValue={profile?.mission || ""}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-accent hover:bg-accent/90 shadow-lg px-8 h-11 font-bold" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Confirm Startup Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Strategic Shift Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing your business model from <span className="font-bold text-slate-900">{profile?.businessType}</span> to <span className="font-bold text-slate-900">{pendingType}</span> will pivot your entire Sales Intelligence dashboard. 
              <br /><br />
              Existing historical data for specific metrics (like "Units Sold" or "Billable Hours") may no longer be visible or relevant in the new view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingType(null)}>Cancel Shift</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeChange} className="bg-rose-600 hover:bg-rose-700">Confirm Strategic Pivot</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
