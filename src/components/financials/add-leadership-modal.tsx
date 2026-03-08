'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { addYears, format } from 'date-fns';

/**
 * AddLeadershipModal - Handles the invitation of new leadership members.
 * Enforces governance by tracking equity distribution and vesting schedules.
 */
export function AddLeadershipModal() {
  const [open, setOpen] = React.useState(false);
  const db = useFirestore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const years = Number(formData.get('vestingYears'));
    const startDate = formData.get('vestingStartDate') as string;
    const endDate = format(addYears(new Date(startDate), years), 'yyyy-MM-dd');

    const memberData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      title: formData.get('title') as string,
      responsibility: formData.get('responsibility') as string,
      equityPct: Number(formData.get('equity')),
      vestingYears: years,
      vestingStartDate: startDate,
      vestingEndDate: endDate,
      inviteStatus: "Pending",
      createdAt: new Date().toISOString(),
    };

    const ref = collection(db, 'leadership');
    // Use non-blocking utility for optimistic UI and background sync
    addDocumentNonBlocking(ref, memberData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#3B82F6] text-white font-bold shadow-lg">
          <UserPlus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline font-bold">Invite Leadership Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-400">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase text-slate-400">Title</Label>
                <Input id="title" name="title" placeholder="e.g. CTO" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="john@startup.os" required />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
               <div className="grid gap-2">
                <Label htmlFor="equity" className="text-xs font-bold uppercase text-slate-400">Equity Stake (%)</Label>
                <Input id="equity" name="equity" type="number" step="0.1" placeholder="5.0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vestingYears" className="text-xs font-bold uppercase text-slate-400">Vesting Period (Y)</Label>
                <Input id="vestingYears" name="vestingYears" type="number" defaultValue={4} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vestingStartDate" className="text-xs font-bold uppercase text-slate-400">Vesting Start Date</Label>
              <Input id="vestingStartDate" name="vestingStartDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsibility" className="text-xs font-bold uppercase text-slate-400">Primary Responsibility</Label>
              <Input id="responsibility" name="responsibility" placeholder="e.g. Technology Roadmap" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-[#3B82F6] hover:bg-blue-700 w-full font-bold">Issue Shares & Invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
