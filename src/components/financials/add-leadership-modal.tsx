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
import { UserPlus, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addYears, format } from "date-fns";

export function AddLeadershipModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get("vestingStartDate") as string;
    const years = Number(formData.get("vestingYears"));
    const endDate = format(addYears(new Date(startDate), years), 'yyyy-MM-dd');

    const memberData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      title: formData.get("title") as string,
      responsibility: formData.get("responsibility") as string,
      equityPct: Number(formData.get("equityPct")),
      vestingYears: years,
      vestingStartDate: startDate,
      vestingEndDate: endDate,
      inviteStatus: "Pending",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(firestore, "leadership"), memberData);
      toast({
        title: "Invitation Created",
        description: `${memberData.name} has been added as ${memberData.title}. Status: Pending.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Log Failed",
        description: "Could not add team member.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 shadow-md">
          <UserPlus className="h-4 w-4 mr-2" /> Add Leader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Issue Equity & Invite Leader
          </DialogTitle>
          <DialogDescription>
            Grant equity and set governance terms for core team members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Role Title</Label>
            <Input id="title" name="title" placeholder="e.g. CTO & Co-founder" required />
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity Stake (%)</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vestingYears">Vesting Period (Y)</Label>
              <Input id="vestingYears" name="vestingYears" type="number" defaultValue="4" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vestingStartDate">Vesting Start Date</Label>
            <Input id="vestingStartDate" name="vestingStartDate" type="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finalize & Issue Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
