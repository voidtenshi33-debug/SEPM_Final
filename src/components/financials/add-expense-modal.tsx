
'use client';

import * as React from "react";
import { useFirestore } from "@/firebase";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
  categories: any[];
}

export function AddExpenseModal({ categories }: AddExpenseModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const categoryId = formData.get("categoryId") as string;
    const date = formData.get("date") as string;
    const description = formData.get("description") as string;
    
    // Extract month YYYY-MM
    const monthId = date.substring(0, 7);

    try {
      await addDoc(collection(firestore, "expenses"), {
        amount,
        categoryId,
        date,
        month: monthId, // Standardized for logic
        monthId: monthId, // Redundant but consistent with backend.json
        description,
        createdAt: serverTimestamp(),
      });
      
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
            Records will dynamically influence your EBITDA and Runway calculations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" placeholder="Enter amount in INR" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief details of expense" />
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
