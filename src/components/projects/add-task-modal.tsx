
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AddTaskModalProps {
  projects: any[];
}

export function AddTaskModal({ projects }: AddTaskModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const db = useFirestore();
  const { toast } = useToast();

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
        assignedTo: "Founder",
        bonusEligible: false,
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
          <Plus className="h-4 w-4 mr-2" /> Add Tactical Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <div className="space-y-2">
              <Label htmlFor="projectId">Parent Strategic Project</Label>
              <Select name="projectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Target Completion Date</Label>
              <Input id="deadline" name="deadline" type="date" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent hover:bg-accent/90 w-full font-bold" disabled={loading}>
              {loading ? "Adding..." : "Confirm Tactical Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
