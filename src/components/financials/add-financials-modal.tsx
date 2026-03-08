'use client';

import * as React from "react";
import { useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
import { Wallet, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddFinancialsModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const monthId = formData.get("month") as string;
    
    const data = {
      id: monthId,
      grossRevenue: Number(formData.get("grossRevenue")),
      discounts: Number(formData.get("discounts") || 0),
      netRevenue: Number(formData.get("netRevenue")),
      operatingExpenses: Number(formData.get("operatingExpenses")),
      cogs: Number(formData.get("cogs") || 0),
      recurringRevenue: Number(formData.get("recurringRevenue") || 0),
      oneTimeRevenue: Number(formData.get("oneTimeRevenue") || 0),
      dateRecorded: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(firestore, "financials", monthId), data, { merge: true });
      toast({
        title: "Financials Synchronized",
        description: `Monthly snapshot for ${monthId} updated.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save monthly metrics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Log Monthly Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#3B82F6]" />
            Monthly Financial Summary
          </DialogTitle>
          <DialogDescription>
            Update core performance metrics for the reporting period.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="month">Reporting Month</Label>
            <Input id="month" name="month" type="month" required defaultValue={new Date().toISOString().substring(0, 7)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossRevenue">Gross Revenue (₹)</Label>
              <Input id="grossRevenue" name="grossRevenue" type="number" required placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netRevenue">Net Revenue (₹)</Label>
              <Input id="netRevenue" name="netRevenue" type="number" required placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operatingExpenses">Monthly Burn / OpEx (₹)</Label>
              <Input id="operatingExpenses" name="operatingExpenses" type="number" required placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cogs">COGS (₹)</Label>
              <Input id="cogs" name="cogs" type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Monthly Snapshot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
