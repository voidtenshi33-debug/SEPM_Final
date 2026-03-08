
'use client';

import * as React from "react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, deleteDoc, query, orderBy, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tags, 
  Plus, 
  Trash2, 
  Search, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

const DEFAULT_CATEGORIES = [
  // Fixed
  { name: "Salaries & Payroll", type: "Fixed", color: "#3B82F6" },
  { name: "Cloud (AWS/Azure/GCP)", type: "Fixed", color: "#3B82F6" },
  { name: "SaaS Subscriptions", type: "Fixed", color: "#3B82F6" },
  { name: "Office Rent & Utilities", type: "Fixed", color: "#3B82F6" },
  { name: "Insurance", type: "Fixed", color: "#3B82F6" },
  { name: "Legal & Compliance", type: "Fixed", color: "#3B82F6" },
  { name: "Utilities", type: "Fixed", color: "#3B82F6" },
  // Variable
  { name: "Marketing & Ads", type: "Variable", color: "#F59E0B" },
  { name: "Sales Commissions", type: "Variable", color: "#F59E0B" },
  { name: "Freelance/Contractors", type: "Variable", color: "#F59E0B" },
  { name: "Travel", type: "Variable", color: "#F59E0B" },
  { name: "Logistics & Shipping", type: "Variable", color: "#F59E0B" },
  { name: "Customer Support", type: "Variable", color: "#F59E0B" },
  { name: "Miscellaneous", type: "Variable", color: "#F59E0B" },
  // R&D
  { name: "Product Testing", type: "R&D", color: "#10B981" },
  { name: "Prototype Hardware", type: "R&D", color: "#10B981" },
  { name: "R&D Salaries", type: "R&D", color: "#10B981" },
];

export default function CategoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);

  // Firestore Queries
  const categoriesQuery = useMemoFirebase(() => 
    query(collection(firestore, "expenseCategories"), orderBy("name", "asc")),
  [firestore]);
  
  const expensesQuery = useMemoFirebase(() => 
    collection(firestore, "expenses"),
  [firestore]);

  const { data: categories, isLoading } = useCollection(categoriesQuery);
  const { data: expenses } = useCollection(expensesQuery);

  // Auto-seeding logic
  React.useEffect(() => {
    if (categories && categories.length === 0 && !isSeeding) {
      handleSeedCategories();
    }
  }, [categories]);

  const handleSeedCategories = async () => {
    setIsSeeding(true);
    try {
      const batchPromises = DEFAULT_CATEGORIES.map(cat => 
        addDoc(collection(firestore, "expenseCategories"), cat)
      );
      await Promise.all(batchPromises);
      toast({
        title: "System Seeded",
        description: "17 professional categories have been initialized.",
      });
    } catch (e) {
      console.error("Seeding failed", e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isUsed = expenses?.some(exp => exp.categoryId === id);
    if (isUsed) {
      toast({
        title: "Delete Protected",
        description: "This category is linked to existing expenses and cannot be removed.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteDoc(doc(firestore, "expenseCategories", id));
      toast({ title: "Category deleted" });
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const color = type === "Fixed" ? "#3B82F6" : type === "Variable" ? "#F59E0B" : "#10B981";

    if (!name || !type) return;

    try {
      await addDoc(collection(firestore, "expenseCategories"), { name, type, color });
      setIsAdding(false);
      toast({ title: "Category added successfully" });
    } catch (e) {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  };

  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Initializing category engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="h-6 w-6 text-accent" />
            Dynamic Category Engine
          </h3>
          <p className="text-sm text-muted-foreground">Pro-Seed structural mapping for mathematical precision.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Define a new segment for your operational cost structure.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" placeholder="e.g., Marketing Tools" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Classification</Label>
                <Select name="type" required defaultValue="Variable">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed (Structural)</SelectItem>
                    <SelectItem value="Variable">Variable (Growth/Ops)</SelectItem>
                    <SelectItem value="R&D">R&D (Innovation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Create Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search categories..." 
          className="pl-10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories?.map((cat) => {
          const isUsed = expenses?.some(exp => exp.categoryId === cat.id);
          return (
            <Card key={cat.id} className="border-none shadow-md hover:shadow-lg transition-all group relative">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Tags className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-4",
                        cat.type === "Fixed" ? "border-blue-200 text-blue-700 bg-blue-50" :
                        cat.type === "Variable" ? "border-amber-200 text-amber-700 bg-amber-50" :
                        "border-emerald-200 text-emerald-700 bg-emerald-50"
                      )}>
                        {cat.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-rose-600 transition-opacity",
                    isUsed ? "opacity-30 cursor-not-allowed" : "group-hover:opacity-100"
                  )}
                  onClick={() => handleDelete(cat.id)}
                  disabled={isUsed}
                  title={isUsed ? "Category is in use" : "Delete category"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-bold">No categories found</h4>
          <p className="text-muted-foreground">Try a different search or add a new category.</p>
        </div>
      )}
      
      <div className="p-6 bg-primary text-primary-foreground rounded-2xl flex items-start gap-4 shadow-xl">
        <Sparkles className="h-6 w-6 text-accent shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold">The Rakshak Advantage</h4>
          <p className="text-sm opacity-80 leading-relaxed">
            Every expense is forced into a classification bucket. This ensures your EBITDA margin and Fixed vs. Variable cost ratios are 100% accurate, providing investor-grade financial visibility.
          </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
