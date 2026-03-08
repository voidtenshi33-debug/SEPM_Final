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
import { Target, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SetBudgetModalProps {
  categories: any[];
  monthId: string;
  existingBudget?: any;
}

export function SetBudgetModal({ categories, monthId, existingBudget }: SetBudgetModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [budgetValues, setBudgetValues] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (existingBudget?.categoryBudgets) {
      const vals = existingBudget.categoryBudgets.reduce((acc: any, curr: any) => {
        acc[curr.categoryId] = curr.budgetAmount;
        return acc;
      }, {});
      setBudgetValues(vals);
    } else {
      setBudgetValues({});
    }
  }, [existingBudget, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoryBudgets = Object.entries(budgetValues).map(([categoryId, budgetAmount]) => ({
      categoryId,
      budgetAmount
    }));

    try {
      const budgetRef = doc(firestore, "budgets", monthId);
      await setDoc(budgetRef, {
        id: monthId,
        month: monthId,
        categoryBudgets,
        updatedAt: serverTimestamp(),
        createdAt: existingBudget?.createdAt || serverTimestamp(),
      });
      
      toast({
        title: "Budget Sealed",
        description: `Operational targets for ${monthId} have been recorded.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Seal Failed",
        description: "Could not save operational targets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white font-bold h-9">
          <Target className="h-4 w-4 mr-2" /> {existingBudget ? 'Adjust Budget' : 'Set Targets'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Operational Budgeting ({monthId})
          </DialogTitle>
          <DialogDescription>
            Define categorical spending limits to enable variance intelligence.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 py-4">
              {categories.map((cat) => (
                <div key={cat.id} className="grid grid-cols-2 items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-700">{cat.name}</Label>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{cat.type}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <Input 
                      type="number" 
                      className="pl-7 h-9 text-right font-bold"
                      placeholder="0"
                      value={budgetValues[cat.id] || ""}
                      onChange={(e) => setBudgetValues({ ...budgetValues, [cat.id]: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Authorize Operational Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
