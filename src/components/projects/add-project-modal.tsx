
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Sparkles } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateTaskTemplate } from '@/modules/execution/utils/executionEngine';

export function AddProjectModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const projectType = formData.get('type') as any;
    const projectName = formData.get('name') as string;

    try {
      // 1. Create Project
      const projectRef = await addDoc(collection(db, 'projects'), {
        name: projectName,
        type: projectType,
        budgetAllocated: Number(formData.get('budget')),
        budgetUsed: 0,
        targetEndDate: formData.get('endDate') as string,
        description: formData.get('description') as string,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      // 2. Auto-generate Task Template
      const templateTasks = generateTaskTemplate(projectType);
      const batchPromises = templateTasks.map(task => 
        addDoc(collection(db, 'tasks'), {
          ...task,
          projectId: projectRef.id,
          deadline: formData.get('endDate') as string,
          assignedTo: "Founder",
          createdAt: serverTimestamp(),
        })
      );
      await Promise.all(batchPromises);

      toast({
        title: "Strategy Initiated",
        description: `${projectName} created with ${templateTasks.length} baseline milestones.`,
      });
      setOpen(false);
    } catch (e) {
      toast({ title: "Failed to create project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white font-bold shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> New Strategic Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Define Strategic Project
            </DialogTitle>
            <DialogDescription>
              UdyamRakshak will auto-populate execution templates based on the type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" placeholder="e.g., Series A Prep" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select name="type" required defaultValue="Product">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fundraising">Fundraising</SelectItem>
                    <SelectItem value="Product">Product Dev</SelectItem>
                    <SelectItem value="Growth">Growth/Sales</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Allocated Budget (₹)</Label>
                <Input id="budget" name="budget" type="number" placeholder="0" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Target Deadline</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Strategic Goal</Label>
              <Input id="description" name="description" placeholder="Brief objective of this project" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent hover:bg-accent/90 w-full font-bold" disabled={loading}>
              {loading ? "Generating Strategy..." : "Confirm & Populate Milestones"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
