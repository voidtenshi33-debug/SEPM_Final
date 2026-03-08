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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddLeadershipModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleTitle = formData.get("roleTitle") as string;
    const responsibility = formData.get("responsibility") as string;
    const equityPct = Number(formData.get("equityPct"));
    const vestingYears = Number(formData.get("vestingYears"));
    const vestingStartDate = formData.get("vestingStartDate") as string;
    
    // Calculate vesting end date
    const start = new Date(vestingStartDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + vestingYears);

    try {
      await addDoc(collection(firestore, "leadership"), {
        name,
        email,
        roleTitle,
        responsibility,
        equityPct,
        vestingYears,
        vestingStartDate: new Date(vestingStartDate).toISOString(),
        vestingEndDate: end.toISOString(),
        inviteStatus: "Pending",
        userUid: null,
        addedBy: user?.uid,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Invitation Created",
        description: `${name} has been added as ${roleTitle} with Pending status.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add team member. Please verify permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 shadow-md px-6">
          <UserPlus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Add Leadership Member
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
            <Label htmlFor="roleTitle">Role Title</Label>
            <Select name="roleTitle" required>
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
                <SelectItem value="Head of Growth">Head of Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibility">Key Responsibility</Label>
            <Textarea id="responsibility" name="responsibility" placeholder="e.g., Owning technical roadmap and architectural scaling." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity %</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vestingYears">Vesting Years</Label>
              <Input id="vestingYears" name="vestingYears" type="number" defaultValue="4" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vestingStartDate">Vesting Start Date</Label>
            <Input id="vestingStartDate" name="vestingStartDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
