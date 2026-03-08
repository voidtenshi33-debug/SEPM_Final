
'use client';

import React from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, User, Plus, MessageSquare, ArrowRight } from 'lucide-react';
import { AddTaskModal } from './add-task-modal';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  projects: any[];
  tasks: any[];
}

const COLUMNS = [
  { id: 'Todo', label: 'Tactical Queue', color: 'bg-slate-500' },
  { id: 'In Progress', label: 'Active Execution', color: 'bg-accent' },
  { id: 'Completed', label: 'Milestone Achieved', color: 'bg-emerald-500' },
];

export function TaskBoard({ projects, tasks }: TaskBoardProps) {
  const db = useFirestore();

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      'Todo': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Todo'
    };
    const nextStatus = statusFlow[currentStatus];
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Layout className="h-5 w-5 text-accent" />
          Tactical Flow
        </h3>
        <AddTaskModal projects={projects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", col.color)} />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  {col.label}
                </span>
              </div>
              <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 border-none font-bold">
                {tasks.filter(t => t.status === col.id).length}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
              {tasks.filter(t => t.status === col.id).map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <Card 
                    key={task.id} 
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-default group"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-tighter text-accent bg-accent/5 border-accent/20">
                            {project?.name || "Unlinked"}
                          </Badge>
                          {task.bonusEligible && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[8px] font-bold">Bonus Eligible</Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 leading-snug">{task.title}</h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-bold">{task.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-[10px] font-bold">Founder</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-300 hover:text-accent group-hover:bg-slate-50"
                          onClick={() => handleStatusChange(task.id, task.status)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl text-slate-300">
                  <p className="text-xs font-medium italic">Empty Lane</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
