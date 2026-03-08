
'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ScheduleWidget() {
  const db = useFirestore();
  const { user } = useUser();
  const today = new Date().toISOString().split('T')[0];

  const scheduleQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'schedule'), 
      where('date', '==', today), 
      orderBy('startTime', 'asc'), 
      limit(3)
    );
  }, [db, user, today]);
  
  const { data: blocks, isLoading } = useCollection(scheduleQuery);

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          Today's Agenda
        </CardTitle>
        <Link href="/schedule" className="text-[10px] font-bold text-accent hover:underline flex items-center">
          Full Timeline <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {isLoading || !user ? (
          <div className="h-20 animate-pulse bg-slate-50 rounded-xl" />
        ) : blocks?.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No blocks planned for today.</p>
        ) : (
          blocks?.map((block) => (
            <div key={block.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-accent transition-colors">
              <div className={`h-2 w-2 rounded-full ${
                block.type === 'Deep Work' ? 'bg-indigo-500' :
                block.type === 'Meeting' ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{block.title}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{block.startTime} — {block.endTime}</p>
              </div>
              <Badge variant="outline" className="text-[8px] h-4 font-bold border-slate-200 group-hover:border-accent group-hover:text-accent transition-colors">
                {block.type.split(' ')[0]}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
