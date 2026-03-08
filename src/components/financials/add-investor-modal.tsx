'use client';

import * as React from "react";
import { useFirestore } from "@/firebase";
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const type = formData.get("type") as string;
    const roundId = formData.get("roundId") as string;
    const investmentAmount = Number(formData.get("investmentAmount"));
    const equityPct = Number(formData.get("equityPct"));
    const dealEndDate = formData.get("dealEndDate") as string;

    try {
      // 1. Create Investor
      await addDoc(collection(firestore, "investors"), {
        name,
        email,
        type,
        roundId,
        investmentAmount,
        equityPct,
        tenureYears: 5, // Default
        lockInYears: 3, // Default
        dealStartDate: new Date().toISOString(),
        dealEndDate: new Date(dealEndDate).toISOString(),
        loyalty: true,
        reportingFrequency: "Monthly",
        status: "Active",
        createdAt: serverTimestamp(),
      });
      
      // 2. Update Round Totals (Relational Integrity)
      const roundRef = doc(firestore, "rounds", roundId);
      await updateDoc(roundRef, {
        totalRaised: increment(investmentAmount),
        totalInvestors: increment(1)
      });

      toast({
        title: "Investment Logged",
        description: `Successfully added ${name} to the round.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save investor record.",
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
            Add Strategic Investor
          </DialogTitle>
          <DialogDescription>
            Every investment must be linked to an active funding round.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="roundId">Funding Round Context</Label>
            <Select name="roundId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select active round" />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.roundName} ({round.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Investor Name</Label>
              <Input id="name" name="name" placeholder="Individual or VC" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Investor Type</Label>
            <Select name="type" required defaultValue="Angel">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Angel">Angel Investor</SelectItem>
                <SelectItem value="VC">Venture Capital</SelectItem>
                <SelectItem value="Corporate">Corporate VC</SelectItem>
                <SelectItem value="Incubator">Incubator / Accelerator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investmentAmount">Amount (₹)</Label>
              <Input id="investmentAmount" name="investmentAmount" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity %</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.01" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealEndDate">Lock-in End Date</Label>
            <Input id="dealEndDate" name="dealEndDate" type="date" required />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
