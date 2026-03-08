'use client';

import * as React from "react";
import { useFirestore } from "@/firebase";
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
import { Plus, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddRoundModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const amountRaised = Number(formData.get("amountRaised"));
    const preMoneyValuation = Number(formData.get("preMoneyValuation"));
    const postMoneyValuation = preMoneyValuation + amountRaised;
    const equityDilutedPct = Number(formData.get("equityDilutedPct"));
    const roundDate = formData.get("roundDate") as string;

    try {
      await addDoc(collection(firestore, "rounds"), {
        name,
        amountRaised,
        preMoneyValuation,
        postMoneyValuation,
        equityDilutedPct,
        roundDate: new Date(roundDate).toISOString(),
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Funding Round Added",
        description: `Successfully logged the ${name} round.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save the funding round.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-2" /> Add Round
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            New Funding Round
          </DialogTitle>
          <DialogDescription>
            Records the valuation and dilution impact of a new capital event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Round Name</Label>
            <Input id="name" name="name" placeholder="e.g., Seed, Series A" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountRaised">Amount Raised (₹)</Label>
              <Input id="amountRaised" name="amountRaised" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preMoneyValuation">Pre-Money Val. (₹)</Label>
              <Input id="preMoneyValuation" name="preMoneyValuation" type="number" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equityDilutedPct">Equity Diluted %</Label>
              <Input id="equityDilutedPct" name="equityDilutedPct" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundDate">Round Date</Label>
              <Input id="roundDate" name="roundDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? "Processing..." : "Create Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
