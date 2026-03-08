
'use client';

import * as React from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
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
  Sparkles,
  PieChart as PieChartIcon,
  ReceiptText,
  Calendar
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
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { formatINR, getMonthlyDistribution } from "@/modules/financial/utils/financialEngine";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  { name: "Salaries & Payroll", type: "Fixed", color: "#3B82F6" },
  { name: "Cloud (AWS/Azure/GCP)", type: "Fixed", color: "#3B82F6" },
  { name: "SaaS Subscriptions", type: "Fixed", color: "#3B82F6" },
  { name: "Office Rent & Utilities", type: "Fixed", color: "#3B82F6" },
  { name: "Insurance", type: "Fixed", color: "#3B82F6" },
  { name: "Legal & Compliance", type: "Fixed", color: "#3B82F6" },
  { name: "Utilities", type: "Fixed", color: "#3B82F6" },
  { name: "Marketing & Ads", type: "Variable", color: "#F59E0B" },
  { name: "Sales Commissions", type: "Variable", color: "#F59E0B" },
  { name: "Freelance/Contractors", type: "Variable", color: "#F59E0B" },
  { name: "Travel", type: "Variable", color: "#F59E0B" },
  { name: "Logistics & Shipping", type: "Variable", color: "#F59E0B" },
  { name: "Customer Support", type: "Variable", color: "#F59E0B" },
  { name: "Miscellaneous", type: "Variable", color: "#F59E0B" },
  { name: "Product Testing", type: "R&D", color: "#10B981" },
  { name: "Prototype Hardware", type: "R&D", color: "#10B981" },
  { name: "R&D Salaries", type: "R&D", color: "#10B981" },
];

export default function CategoryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().substring(0, 7));

  // Firestore Queries
  const categoriesQuery = useMemoFirebase(() => 
    query(collection(firestore, "expenseCategories"), orderBy("name", "asc")),
  [firestore]);
  
  const expensesQuery = useMemoFirebase(() => 
    collection(firestore, "expenses"),
  [firestore]);

  const financialsQuery = useMemoFirebase(() => 
    query(collection(firestore, "financials"), orderBy("month", "desc")),
  [firestore]);

  const { data: categories, isLoading: loadingCats } = useCollection(categoriesQuery);
  const { data: expenses, isLoading: loadingExps } = useCollection(expensesQuery);
  const { data: financials } = useCollection(financialsQuery);

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

  // Distribution Logic for Selected Month
  const monthlyExpenses = expenses?.filter(e => e.month === selectedMonth) || [];
  const distributionData = getMonthlyDistribution(monthlyExpenses, categories || []);
  
  const fixedTotal = distributionData.filter(d => d.type === 'Fixed').reduce((s, d) => s + d.amount, 0);
  const variableTotal = distributionData.filter(d => d.type === 'Variable').reduce((s, d) => s + d.amount, 0);
  const grandTotal = fixedTotal + variableTotal;

  const fixedPct = grandTotal > 0 ? (fixedTotal / grandTotal) * 100 : 0;
  const variablePct = grandTotal > 0 ? (variableTotal / grandTotal) * 100 : 0;

  if (loadingCats || isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Initializing category engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* 1. Category Manager Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Tags className="h-6 w-6 text-accent" />
              Dynamic Category Engine
            </h3>
            <p className="text-sm text-muted-foreground">Structural mapping for mathematical precision.</p>
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
              <Card key={cat.id} className="border-none shadow-md hover:shadow-lg transition-all group relative bg-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Tags className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cat.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn(
                          "text-[10px] h-4 uppercase font-bold",
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2. Expense Distribution Intelligence Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <PieChartIcon className="h-6 w-6 text-accent" />
              Burn Distribution Intelligence
            </h3>
            <p className="text-sm text-muted-foreground">Categorical analysis and cost rigidity auditing.</p>
          </div>
          <div className="flex items-center gap-3">
             <Calendar className="h-4 w-4 text-muted-foreground" />
             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] bg-white">
                   <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                   {financials?.map(f => (
                     <SelectItem key={f.month} value={f.month}>{f.month}</SelectItem>
                   ))}
                   {(!financials || financials.length === 0) && (
                     <SelectItem value={selectedMonth}>{selectedMonth}</SelectItem>
                   )}
                </SelectContent>
             </Select>
          </div>
        </div>

        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {distributionData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 border-r border-slate-100 flex flex-col items-center justify-center">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={4}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${formatINR(value)} (${props.payload.percentage}%)`,
                            name
                          ]}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full mt-6">
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                       <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Fixed Rigidity</p>
                       <p className="text-2xl font-bold text-blue-900">{fixedPct.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                       <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Variable Elasticity</p>
                       <p className="text-2xl font-bold text-amber-900">{variablePct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-accent" />
                    Categorical Breakdown (₹)
                  </h4>
                  <div className="relative overflow-auto max-h-[400px]">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] uppercase text-slate-500 font-bold border-b sticky top-0 bg-white">
                        <tr>
                          <th className="pb-3 px-2">Category</th>
                          <th className="pb-3 px-2">Type</th>
                          <th className="pb-3 px-2 text-right">Amount</th>
                          <th className="pb-3 px-2 text-right">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {distributionData.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className={cn(
                                "text-[9px] h-4 uppercase font-bold",
                                item.type === 'Fixed' ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"
                              )}>
                                {item.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-medium">{formatINR(item.amount)}</td>
                            <td className="py-3 px-2 text-right font-bold text-accent">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                  <ReceiptText className="h-10 w-10 text-slate-200" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">No Data Recorded for {selectedMonth}</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                    Start logging categorical expenses in the Operational tab to unlock distribution insights.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-8 bg-primary text-primary-foreground rounded-3xl flex items-start gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <PieChartIcon className="h-32 w-32" />
        </div>
        <Sparkles className="h-8 w-8 text-accent shrink-0 mt-1" />
        <div className="space-y-2 relative z-10">
          <h4 className="text-xl font-bold font-headline">The Rakshak Advantage</h4>
          <p className="text-base opacity-80 leading-relaxed max-w-2xl">
            By forcing every expense into a classification bucket, we provide mathematical certainty. Your <strong>Fixed Cost Rigidity</strong> tells you how much of your burn is immovable, while <strong>Variable Elasticity</strong> identifies exactly where you can cut to extend runway in a crisis.
          </p>
        </div>
      </div>
    </div>
  );
}
