'use client';

import * as React from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { addYears, format } from "date-fns";

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
    
    // Calculate vesting end date using date-fns for precision
    const start = new Date(vestingStartDate);
    const endDate = format(addYears(start, vestingYears), 'yyyy-MM-dd');

    const memberData = {
      name,
      email,
      roleTitle,
      responsibility,
      equityPct,
      vestingYears,
      vestingStartDate,
      vestingEndDate: endDate,
      inviteStatus: "Pending",
      userUid: null,
      addedBy: user?.uid || "system",
      createdAt: new Date().toISOString(),
    };

    try {
      const ref = collection(firestore, "leadership");
      // Use the standard non-blocking pattern for immediate UI response
      addDocumentNonBlocking(ref, memberData);
      
      toast({
        title: "Invitation Created",
        description: `${name} has been added as ${roleTitle}. Copy the invite link from the team page.`,
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
          <UserPlus className="h-4 w-4 mr-2" /> Add Leader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
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
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="jane@startup.com" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role Title</Label>
            <Input id="roleTitle" name="roleTitle" placeholder="e.g. CTO & Co-founder" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibility">Primary Responsibility</Label>
            <Textarea id="responsibility" name="responsibility" placeholder="e.g. Technology Roadmap and infrastructure scaling." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="equityPct">Equity Stake (%)</Label>
              <Input id="equityPct" name="equityPct" type="number" step="0.1" placeholder="10.0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vestingYears">Vesting Period (Y)</Label>
              <Input id="vestingYears" name="vestingYears" type="number" defaultValue="4" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vestingStartDate">Vesting Start Date</Label>
            <Input 
              id="vestingStartDate" 
              name="vestingStartDate" 
              type="date" 
              required 
              defaultValue={format(new Date(), 'yyyy-MM-dd')} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finalize & Issue Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
