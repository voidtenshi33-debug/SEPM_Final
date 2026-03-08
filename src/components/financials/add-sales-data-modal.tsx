'use client';

import * as React from "react";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
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
import { Plus, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddSalesDataModalProps {
  businessType: string;
}

export function AddSalesDataModal({ businessType }: AddSalesDataModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const month = formData.get("month") as string;
    
    // Base data
    const data: any = {
      month,
      netRevenue: Number(formData.get("netRevenue")),
      pipelineValue: Number(formData.get("pipelineValue") || 0),
    };

    // Conditional data
    if (businessType === "Product" || businessType === "Hybrid") {
      data.unitsSold = Number(formData.get("unitsSold") || 0);
      data.ordersCount = Number(formData.get("ordersCount") || 0);
    }

    if (businessType === "Service" || businessType === "Hybrid") {
      data.activeClients = Number(formData.get("activeClients") || 0);
      data.billableHours = Number(formData.get("billableHours") || 0);
      data.retainedClients = Number(formData.get("retainedClients") || 0);
    }

    try {
      const financialsRef = collection(firestore, "financials");
      const q = query(financialsRef, where("month", "==", month));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(firestore, "financials", docId), data);
      } else {
        // If not found, use month as ID for prototype consistency
        await setDoc(doc(firestore, "financials", month), {
          ...data,
          operatingExpenses: 0,
          cogs: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      toast({
        title: "Sales Metrics Updated",
        description: `Successfully logged data for ${month}.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save sales metrics. Please check network connectivity.",
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
          <Plus className="h-4 w-4 mr-2" /> Log Monthly Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Adaptive Intelligence Log ({businessType})
          </DialogTitle>
          <DialogDescription>
            Update your monthly sales and pipeline metrics to calibrate the growth engine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input id="month" name="month" type="month" required defaultValue={new Date().toISOString().substring(0, 7)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netRevenue">Net Revenue (₹)</Label>
              <Input id="netRevenue" name="netRevenue" type="number" required placeholder="Enter total revenue" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pipelineValue">Pipeline Value (₹)</Label>
            <Input id="pipelineValue" name="pipelineValue" type="number" placeholder="Value of leads/potential deals" />
          </div>

          {(businessType === "Product" || businessType === "Hybrid") && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="unitsSold">Units Sold</Label>
                <Input id="unitsSold" name="unitsSold" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ordersCount">Orders Count</Label>
                <Input id="ordersCount" name="ordersCount" type="number" placeholder="0" />
              </div>
            </div>
          )}

          {(businessType === "Service" || businessType === "Hybrid") && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activeClients">Active Clients</Label>
                  <Input id="activeClients" name="activeClients" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retainedClients">Retained Clients</Label>
                  <Input id="retainedClients" name="retainedClients" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billableHours">Total Billable Hours</Label>
                <Input id="billableHours" name="billableHours" type="number" placeholder="0" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm & Calibrate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}