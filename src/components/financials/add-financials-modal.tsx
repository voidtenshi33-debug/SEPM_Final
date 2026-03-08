'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Wallet } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * AddFinancialsModal - The Monthly Master Log for StartupOS.
 * Adapts its UI based on the businessType (Product, Service, Hybrid) 
 * defined in the StartupProfile.
 */
export function AddFinancialsModal() {
  const [open, setOpen] = React.useState(false);
  const db = useFirestore();
  
  // Reference the startup profile to determine which metrics to show
  const profileRef = useMemoFirebase(() => doc(db, 'startupProfile', 'main'), [db]);
  const { data: profile } = useDoc(profileRef);

  const businessType = profile?.businessType || "Hybrid";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const monthId = formData.get('month') as string; // Expected format: YYYY-MM
    
    const netRevenue = Number(formData.get('revenue'));
    const opEx = Number(formData.get('opex'));
    const recurring = Number(formData.get('recurring') || 0);

    const financialData = {
      id: monthId,
      grossRevenue: netRevenue,
      discounts: 0,
      netRevenue: netRevenue,
      operatingExpenses: opEx,
      cogs: Number(formData.get('cogs') || 0),
      unitsSold: Number(formData.get('units') || 0),
      ordersCount: Number(formData.get('orders') || 0),
      activeClients: Number(formData.get('clients') || 0),
      totalClients: Number(formData.get('totalClients') || 0),
      retainedClients: Number(formData.get('retainedClients') || 0),
      billableHours: Number(formData.get('hours') || 0),
      recurringRevenue: recurring,
      oneTimeRevenue: netRevenue - recurring,
      dateRecorded: new Date().toISOString(),
    };

    const finRef = doc(db, 'financials', monthId);
    // Use non-blocking update for optimistic UI
    setDocumentNonBlocking(finRef, financialData, { merge: true });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white font-bold shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> Log Monthly Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              Record Monthly Performance
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="month">Month (YYYY-MM)</Label>
              <Input 
                id="month" 
                name="month" 
                placeholder="2024-03" 
                required 
                defaultValue={new Date().toISOString().substring(0, 7)} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="revenue">Net Revenue (₹)</Label>
                <Input id="revenue" name="revenue" type="number" required placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="opex">Op. Expenses (₹)</Label>
                <Input id="opex" name="opex" type="number" required placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="recurring">Recurring Rev (₹)</Label>
                <Input id="recurring" name="recurring" type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cogs">COGS (₹)</Label>
                <Input id="cogs" name="cogs" type="number" required placeholder="0" />
              </div>
            </div>

            {(businessType === "Product" || businessType === "Hybrid") && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Metrics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="units">Units Sold</Label>
                    <Input id="units" name="units" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orders">Orders Count</Label>
                    <Input id="orders" name="orders" type="number" placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {(businessType === "Service" || businessType === "Hybrid") && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Metrics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clients">Active Clients</Label>
                    <Input id="clients" name="clients" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Billable Hours</Label>
                    <Input id="hours" name="hours" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="totalClients">Total Clients</Label>
                    <Input id="totalClients" name="totalClients" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="retainedClients">Retained Clients</Label>
                    <Input id="retainedClients" name="retainedClients" type="number" placeholder="0" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" className="bg-accent hover:bg-accent/90 w-full font-bold">
              Save Monthly Records
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
