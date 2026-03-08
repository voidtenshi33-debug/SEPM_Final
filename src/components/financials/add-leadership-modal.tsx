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
import { UserPlus, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddLeadershipModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const equityPct = Number(formData.get("equityPct"));
    const vestingStartDate = formData.get("vestingStartDate") as string;
    const vestingYears = Number(formData.get("vestingYears"));
    
    // Auto-calculate vesting end date
    const start = new Date(vestingStartDate);
    const end = new Date(start.setFullYear(start.getFullYear() + vestingYears));

    try {
      await addDoc(collection(firestore, "leadership"), {
        name,
        title,
        equityPct,
        vestingStartDate: new Date(vestingStartDate).toISOString(),
        vestingEndDate: end.toISOString(),
        vestingYears,
        inviteStatus: "Accepted",
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Member Added",
        description: `Successfully added ${name} to the leadership team.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
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
        <Button variant="outline" size="sm" className="h-8">
          <UserPlus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Add Leadership Member
          </DialogTitle>
          <DialogDescription>
            Grant equity and set vesting schedules for core team members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Full Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Select name="title" required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEO">CEO & Founder</SelectItem>
                <SelectItem value="CTO">CTO</SelectItem>
                <SelectItem value="CFO">CFO</SelectItem>
                <SelectItem value="COO">COO</SelectItem>
                <SelectItem value="VP Engineering">VP Engineering</SelectItem>
                <SelectItem value="Head of Product">Head of Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity %</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vestingYears">Vesting (Years)</Label>
              <Input id="vestingYears" name="vestingYears" type="number" defaultValue="4" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vestingStartDate">Vesting Start Date</Label>
            <Input id="vestingStartDate" name="vestingStartDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? "Adding..." : "Grant Equity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
