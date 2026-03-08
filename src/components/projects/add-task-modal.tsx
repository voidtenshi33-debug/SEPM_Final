'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo, User, Zap } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface AddTaskModalProps {
  projects: any[];
}

export function AddTaskModal({ projects }: AddTaskModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [bonus, setBonus] = React.useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const leadershipQuery = useMemoFirebase(() => query(collection(db, 'leadership'), orderBy('name', 'asc')), [db]);
  const { data: leadership } = useCollection(leadershipQuery);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await addDoc(collection(db, 'tasks'), {
        title: formData.get('title') as string,
        projectId: formData.get('projectId') as string,
        status: "Todo",
        deadline: formData.get('deadline') as string,
        assignedTo: formData.get('assignedTo') as string,
        impactType: formData.get('impactType') as string,
        estimatedHours: Number(formData.get('hours')),
        bonusEligible: bonus,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Task Assigned", description: "Successfully added to tactical queue." });
      setOpen(false);
    } catch (e) {
      toast({ title: "Failed to add task", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-accent text-accent font-bold">
          <Plus className="h-4 w-4 mr-2" /> Assign Strategic Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-accent" />
              New Tactical Task
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Objective</Label>
              <Input id="title" name="title" placeholder="e.g., Finalize Pitch V3" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Parent Project</Label>
                <Select name="projectId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select name="assignedTo" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadership?.map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impactType">Impact Type</Label>
                <Select name="impactType" defaultValue="Product">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Revenue">Revenue Growth</SelectItem>
                    <SelectItem value="Cost">Cost Reduction</SelectItem>
                    <SelectItem value="Product">Product Roadmap</SelectItem>
                    <SelectItem value="Fundraising">Fundraising</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Est. Hours</Label>
                <Input id="hours" name="hours" type="number" defaultValue={4} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input id="deadline" name="deadline" type="date" required />
              </div>
              <div className="flex items-center gap-3 pt-8">
                <Switch checked={bonus} onCheckedChange={setBonus} id="bonus" />
                <Label htmlFor="bonus" className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Bonus Eligible
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent hover:bg-accent/90 w-full font-bold" disabled={loading}>
              {loading ? "Assigning..." : "Authorize Tactical Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
