'use client';

import * as React from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
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
import { Plus, ReceiptText, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
  categories: any[];
}

export function AddExpenseModal({ categories }: AddExpenseModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "projects");
  }, [firestore, user]);
  const { data: projects } = useCollection(projectsQuery);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const categoryId = formData.get("categoryId") as string;
    const projectId = formData.get("projectId") as string;
    const date = formData.get("date") as string;
    const description = formData.get("description") as string;
    
    const monthId = date.substring(0, 7);

    try {
      // 1. Log Expense
      await addDoc(collection(firestore, "users", user.uid, "expenses"), {
        amount,
        categoryId,
        projectId: projectId || null,
        date,
        monthId: monthId,
        description,
        createdAt: serverTimestamp(),
      });
      
      // 2. If linked to a project, update project's budgetUsed
      if (projectId) {
        const projectRef = doc(firestore, "users", user.uid, "projects", projectId);
        await updateDoc(projectRef, {
          budgetUsed: increment(amount)
        });
      }

      toast({
        title: "Expense Logged",
        description: `Successfully added ₹${amount} expense record.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Log Failed",
        description: "Could not save expense record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
          <Plus className="h-4 w-4 mr-2" /> Log Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-accent" />
            New Operational Expense
          </DialogTitle>
          <DialogDescription>
            Records will influence EBITDA, Runway, and Project Health.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" placeholder="Enter amount in INR" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectId" className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" /> Linked Project (Optional)
            </Label>
            <Select name="projectId">
              <SelectTrigger>
                <SelectValue placeholder="No Project Link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project Link</SelectItem>
                {projects?.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief details" />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? "Saving..." : "Confirm Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
