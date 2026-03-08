
'use client';

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { formatINR, calculatePostMoney } from "@/modules/financial/utils/financialEngine";
import { Badge } from "@/components/ui/badge";
import { AddRoundModal } from "@/components/financials/add-round-modal";
import { Target, Calendar, Users, Loader2 } from "lucide-react";

export default function RoundsPage() {
  const db = useFirestore();
  const { user } = useUser();

  const roundsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rounds'), orderBy('roundDate', 'desc'));
  }, [db, user]);

  const investorsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'investors');
  }, [db, user]);

  const { data: rounds, isLoading: loadingRounds } = useCollection(roundsQuery);
  const { data: investors, isLoading: loadingInv } = useCollection(investorsQuery);

  if (loadingRounds || loadingInv || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Funding Rounds" 
        description="Strategic capital history, valuations, and target milestones."
        actions={<AddRoundModal />}
      />

      <div className="grid grid-cols-1 gap-6">
        {rounds?.map((round) => {
          const roundInvestors = investors?.filter(i => i.roundId === round.id) || [];
          const actualRaised = roundInvestors.reduce((sum, i) => sum + (i.investmentAmount || 0), 0);
          const postMoney = calculatePostMoney(round.preMoneyValuation || 0, actualRaised);
          const target = round.amountRaised || 1; // Used as target in UI for progress
          const progress = Math.min((actualRaised / target) * 100, 100);

          return (
            <Card key={round.id} className="border-none shadow-xl overflow-hidden group">
              <div className="h-2 bg-indigo-600 w-full" />
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  <div className="p-6 space-y-4">
                    <div>
                      <Badge variant={round.status === 'Open' ? 'default' : 'secondary'} className="mb-2">
                        {round.status || 'Active'}
                      </Badge>
                      <h3 className="text-2xl font-bold text-slate-900">{round.name}</h3>
                      <p className="text-sm text-muted-foreground">{round.roundType || 'Equity'} Round</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" /> Date: {round.roundDate ? new Date(round.roundDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 bg-slate-50/30">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Capital Raised</p>
                      <p className="text-2xl font-bold text-slate-900">{formatINR(actualRaised)}</p>
                      <p className="text-xs text-slate-500 italic">Target: {formatINR(target)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-indigo-600">{progress.toFixed(1)}% ACHIEVED</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valuation Engine</p>
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Pre-Money:</span>
                          <span className="font-bold">{formatINR(round.preMoneyValuation)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-2 border-t">
                          <span className="text-slate-500 font-bold">Post-Money:</span>
                          <span className="font-bold text-indigo-600">{formatINR(postMoney)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{roundInvestors.length}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Strategic Investors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rounds?.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-3xl">
            <Target className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No Funding Records</h3>
            <p className="text-muted-foreground mt-2">Initiate your first round to begin tracking capital distribution.</p>
          </div>
        )}
      </div>
    </div>
  );
}
