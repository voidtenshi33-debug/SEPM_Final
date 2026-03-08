
'use client';

import * as React from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Rocket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddRoundModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const roundName = formData.get("roundName") as string;
    const roundType = formData.get("roundType") as string;
    const preMoneyValuation = Number(formData.get("preMoneyValuation"));
    const targetRaise = Number(formData.get("targetRaise"));
    const equityDilutedPct = Number(formData.get("equityDilutedPct"));
    const roundDate = formData.get("roundDate") as string;

    try {
      await addDoc(collection(firestore, "users", user.uid, "rounds"), {
        name: roundName,
        roundType,
        preMoneyValuation,
        amountRaised: 0, 
        targetRaise,
        equityDilutedPct,
        roundDate: new Date(roundDate).toISOString(),
        status: "Open",
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Round Initiated",
        description: `Successfully opened the ${roundName} funding round.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not initiate the funding round.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> New Round
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Initiate Funding Round
          </DialogTitle>
          <DialogDescription>
            Establish the valuation and target capital for a new round.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="roundName">Round Name</Label>
            <Input id="roundName" name="roundName" placeholder="e.g., Seed, Series A" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roundType">Round Type</Label>
            <Select name="roundType" required defaultValue="Equity">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Equity">Equity (Preferred)</SelectItem>
                <SelectItem value="Debt">Venture Debt</SelectItem>
                <SelectItem value="Convertible">Convertible Note</SelectItem>
                <SelectItem value="SAFE">SAFE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preMoneyValuation">Pre-Money (₹)</Label>
              <Input id="preMoneyValuation" name="preMoneyValuation" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRaise">Target Raise (₹)</Label>
              <Input id="targetRaise" name="targetRaise" type="number" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equityDilutedPct">Dilution %</Label>
              <Input id="equityDilutedPct" name="equityDilutedPct" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundDate">Round Date</Label>
              <Input id="roundDate" name="roundDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Open Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
