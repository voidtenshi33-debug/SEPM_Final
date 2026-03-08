
'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { formatINR, calculateRemainingDealYears } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { AddInvestorModal } from "@/components/financials/add-investor-modal";
import { Briefcase, Handshake, Mail, Loader2 } from "lucide-react";

export default function InvestorsPage() {
  const db = useFirestore();
  const { user } = useUser();

  const investorsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'investors');
  }, [db, user]);

  const roundsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rounds'), orderBy('roundDate', 'desc'));
  }, [db, user]);

  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);
  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);

  if (loadingInv || loadingRounds || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Investor Ledger" 
        description="Comprehensive list of strategic shareholders and deal compliance terms."
        actions={<AddInvestorModal rounds={rounds || []} />}
      />

      <Card className="border-none shadow-xl">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-bold tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Investor Details</th>
                  <th className="px-6 py-4">Funding Round</th>
                  <th className="px-6 py-4 text-right">Investment (₹)</th>
                  <th className="px-6 py-4 text-right">Equity %</th>
                  <th className="px-6 py-4 text-center">Rem. Tenure</th>
                  <th className="px-6 py-4 text-center">Loyalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investors?.map((investor) => {
                  const round = rounds?.find(r => r.id === investor.roundId);
                  return (
                    <tr key={investor.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 flex items-center gap-2">
                            {investor.name}
                            <Badge variant="outline" className="text-[8px] h-4 font-bold">{investor.type || 'Angel'}</Badge>
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" /> {investor.email || 'No email registered'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 text-[10px]">
                          {round?.name || 'Direct Allotment'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatINR(investor.investmentAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-indigo-600">{investor.equityPct}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-slate-600">
                          {calculateRemainingDealYears(investor.dealEndDate)} <span className="text-[10px] text-slate-400">Y</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {investor.loyalty ? (
                          <Handshake className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300">---</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {investors?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-slate-400 italic">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
                      No investor records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
