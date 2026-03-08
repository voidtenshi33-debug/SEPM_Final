
'use client';

import * as React from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
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
import { Plus, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddInvestorModalProps {
  rounds: any[];
}

export function AddInvestorModal({ rounds }: AddInvestorModalProps) {
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
    const roundId = formData.get("roundId") as string;
    const amount = Number(formData.get("investmentAmount"));

    try {
      // 1. Log Investor under user tenant
      await addDoc(collection(firestore, "users", user.uid, "investors"), {
        roundId,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        investmentAmount: amount,
        equityPct: Number(formData.get("equityPct")),
        dealStartDate: formData.get("dealStartDate") as string,
        dealEndDate: formData.get("dealEndDate") as string,
        loyalty: true,
        createdAt: serverTimestamp(),
      });
      
      // 2. Atomic update to parent Round under user tenant
      const roundRef = doc(firestore, "users", user.uid, "rounds", roundId);
      await updateDoc(roundRef, {
        amountRaised: increment(amount),
      });

      toast({
        title: "Shareholder Added",
        description: `Successfully linked investment to the funding round.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not link investor record.",
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
          <Plus className="h-4 w-4 mr-2" /> Add Investor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Add Shareholder
          </DialogTitle>
          <DialogDescription>
            Link this investment to an active funding round.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="roundId">Funding Round Context</Label>
            <Select name="roundId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Investor Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="investor@fund.vc" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investmentAmount">Investment (₹)</Label>
              <Input id="investmentAmount" name="investmentAmount" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity %</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.01" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealStartDate">Start Date</Label>
              <Input id="dealStartDate" name="dealStartDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealEndDate">Lock-in End</Label>
              <Input id="dealEndDate" name="dealEndDate" type="date" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Shareholder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
