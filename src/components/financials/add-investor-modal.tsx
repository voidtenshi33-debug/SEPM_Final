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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase } from "lucide-react";
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
    const roundId = formData.get("roundId") as string;
    const investmentAmount = Number(formData.get("investmentAmount"));
    const equityPct = Number(formData.get("equityPct"));
    const dealEndDate = formData.get("dealEndDate") as string;

    try {
      await addDoc(collection(firestore, "investors"), {
        name,
        email,
        roundId,
        investmentAmount,
        equityPct,
        dealEndDate: new Date(dealEndDate).toISOString(),
        loyalty: true,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Investor Added",
        description: `Successfully added ${name} to the cap table.`,
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
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-2" /> Add Investor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            New Strategic Investor
          </DialogTitle>
          <DialogDescription>
            Links an investor to a specific funding round and tracks their equity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="roundId">Funding Round</Label>
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
          <div className="space-y-2">
            <Label htmlFor="name">Investor Name</Label>
            <Input id="name" name="name" placeholder="Individual or VC name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="investor@example.com" required />
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
            <Label htmlFor="dealEndDate">Deal End Date (Lock-in)</Label>
            <Input id="dealEndDate" name="dealEndDate" type="date" required />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
