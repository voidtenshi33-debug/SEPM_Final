
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useDoc, useUser } from "@/firebase";
import { collection, query, orderBy, where, doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { 
  formatINR, 
  calculateBudgetVariance,
  getMonthlyDistribution 
} from "@/modules/financial/utils/financialEngine";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Sparkles,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SetBudgetModal } from "@/components/financials/set-budget-modal";
import { Progress } from "@/components/ui/progress";

export default function BudgetingPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const financialsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'financials'), orderBy('id', 'desc'));
  }, [db, user]);
  const { data: financials } = useCollection(financialsQuery);

  useEffect(() => {
    if (financials && financials.length > 0 && !selectedMonth) {
      setSelectedMonth(financials[0].id);
    }
  }, [financials, selectedMonth]);

  const budgetRef = useMemoFirebase(() => {
    if (!user || !selectedMonth) return null;
    return doc(db, 'users', user.uid, 'budgets', selectedMonth);
  }, [db, user, selectedMonth]);
  const { data: budgetData } = useDoc(budgetRef);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'expenseCategories');
  }, [db, user]);
  const { data: categories } = useCollection(categoriesQuery);

  const expensesQuery = useMemoFirebase(() => {
    if (!user || !selectedMonth) return null;
    return query(collection(db, 'users', user.uid, 'expenses'), where('monthId', '==', selectedMonth));
  }, [db, user, selectedMonth]);
  const { data: expenses } = useCollection(expensesQuery);

  const distribution = React.useMemo(() => {
    return getMonthlyDistribution(expenses, categories || []);
  }, [expenses, categories]);

  const budgetItems = React.useMemo(() => {
    if (!categories || !budgetData) return [];
    
    return categories.map(cat => {
      const budgetAmount = budgetData.categoryBudgets?.find((b: any) => b.categoryId === cat.id)?.budgetAmount || 0;
      const actualAmount = distribution.find(d => d.id === cat.id)?.amount || 0;
      const variance = calculateBudgetVariance(actualAmount, budgetAmount);
      
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        budgetAmount,
        actualAmount,
        ...variance
      };
    }).sort((a, b) => b.budgetAmount - a.budgetAmount);
  }, [categories, budgetData, distribution]);

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const totalVariance = calculateBudgetVariance(totalActual, totalBudget);

  if (!mounted || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Budget vs Actual</h3>
          <p className="text-sm text-slate-500">Monitor spending precision and operational variance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] h-10 border-slate-200">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {financials?.map((fin) => (
                  <SelectItem key={fin.id} value={fin.id}>{fin.id}</SelectItem>
                ))}
                {(!financials || financials.length === 0) && selectedMonth && (
                  <SelectItem value={selectedMonth}>{selectedMonth}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <SetBudgetModal 
            categories={categories || []} 
            monthId={selectedMonth} 
            existingBudget={budgetData} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Allocated</p>
            <p className="text-3xl font-bold">{formatINR(totalBudget)}</p>
            <p className="text-[10px] text-slate-500 mt-2">Planned operational ceiling</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Actual Spend</p>
            <p className="text-3xl font-bold">{formatINR(totalActual)}</p>
            <div className={`flex items-center text-[10px] mt-2 font-bold ${totalVariance.status === 'UNDER' ? 'text-emerald-600' : 'text-rose-600'}`}>
               {totalVariance.status === 'UNDER' ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
               {totalVariance.variancePct}% vs budget
            </div>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm text-white ${totalVariance.status === 'UNDER' ? 'bg-[#0F172A]' : 'bg-rose-900'}`}>
          <CardContent className="p-6">
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Variance Status</p>
            <p className="text-3xl font-bold">
              {totalVariance.status === 'UNDER' ? 'Capital Efficient' : totalVariance.status === 'ON_TRACK' ? 'On Target' : 'Over Budget'}
            </p>
            <p className="text-[10px] opacity-60 mt-2 font-medium">
              {totalVariance.status === 'OVER' ? `${formatINR(totalVariance.variance)} Overspend` : 'Spending within parameters'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-[#3B82F6]" />
            Category Variance Ledger
          </CardTitle>
          <CardDescription>Breakdown of planned vs actual consumption</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase bg-slate-50/50 text-slate-500 font-bold tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Budget (₹)</th>
                  <th className="px-6 py-4 text-right">Actual (₹)</th>
                  <th className="px-6 py-4 text-right">Variance (₹)</th>
                  <th className="px-6 py-4 text-center">Utilization</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetItems.map((item) => {
                  const utilization = item.budgetAmount > 0 ? (item.actualAmount / item.budgetAmount) * 100 : 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{formatINR(item.budgetAmount)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatINR(item.actualAmount)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${item.status === 'OVER' ? 'text-rose-600' : item.status === 'UNDER' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {item.status === 'OVER' ? '+' : ''}{formatINR(item.variance)}
                        <span className="text-[9px] block opacity-60">{item.variancePct}%</span>
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="space-y-1 max-w-[120px] ml-auto">
                          <div className="flex justify-between text-[8px] font-bold">
                             <span className="text-slate-400">0%</span>
                             <span className={utilization > 100 ? 'text-rose-600' : 'text-slate-400'}>{utilization.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={Math.min(utilization, 100)} 
                            className={`h-1.5 ${utilization > 100 ? '[&>div]:bg-rose-500' : '[&>div]:bg-[#3B82F6]'}`}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          variant="outline" 
                          className={`text-[8px] font-bold uppercase h-5 ${
                            item.status === 'UNDER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            item.status === 'OVER' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.status === 'OVER' ? 'Over Budget' : item.status === 'UNDER' ? 'Under Budget' : 'On Track'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {budgetItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      No budget records found for {selectedMonth}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100 p-6">
          <div className="flex items-start gap-3">
             <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
             <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Rakshak Budget Insights</h4>
                <div className="space-y-3">
                  {totalVariance.status === 'OVER' && Math.abs(parseFloat(totalVariance.variancePct)) > 20 ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      ⚠️ <span className="font-bold">Aggressive Overspend:</span> Operating expenses are exceeding budget by <span className="text-rose-600 font-bold">{totalVariance.variancePct}%</span>.
                    </p>
                  ) : totalVariance.status === 'UNDER' ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      ✅ <span className="font-bold">Efficiency Alert:</span> Your spending is <span className="text-emerald-600 font-bold">{Math.abs(parseFloat(totalVariance.variancePct))}%</span> below budget.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Business consumption is trending exactly as planned.
                    </p>
                  )}
                </div>
             </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm p-6 bg-slate-50">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-400 mt-1" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Guardian Note</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Budgeting is a living process. UdyamRakshak handles real-time reconciliation as you log expenses.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
