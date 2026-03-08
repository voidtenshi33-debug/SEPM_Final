
'use client';

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Loader2, 
  Trash2, 
  Coffee, 
  Users, 
  Monitor,
  CheckCircle2
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_COLORS: Record<string, string> = {
  'Deep Work': 'border-l-indigo-500 bg-indigo-50/50',
  'Meeting': 'border-l-emerald-500 bg-emerald-50/50',
  'Routine': 'border-l-slate-500 bg-slate-50/50'
};

const TYPE_ICONS: Record<string, any> = {
  'Deep Work': Monitor,
  'Meeting': Users,
  'Routine': Coffee
};

export default function SchedulePage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const scheduleQuery = useMemoFirebase(() => 
    query(collection(db, 'schedule'), where('date', '==', today), orderBy('startTime', 'asc')),
  [db, today]);
  
  const { data: blocks, isLoading } = useCollection(scheduleQuery);

  const handleAddBlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'schedule'), {
        title: formData.get('title'),
        startTime: formData.get('start'),
        endTime: formData.get('end'),
        type: formData.get('type'),
        date: today,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      toast({ title: "Time Block Reserved" });
    } catch (e) {
      toast({ title: "Failed to reserve block", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'schedule', id));
    toast({ title: "Block Cleared" });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Founder Daily Schedule" 
        description={`Tactical agenda for ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`}
        actions={
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-[#3B82F6] text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> Plan Time Block
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddBlock}>
                <DialogHeader>
                  <DialogTitle>Add Schedule Block</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Activity Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Series A Deck Iteration" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start">Start Time</Label>
                      <Input id="start" name="start" type="time" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end">End Time</Label>
                      <Input id="end" name="end" type="time" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Block Type</Label>
                    <Select name="type" required defaultValue="Deep Work">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deep Work">Deep Work (Strategic)</SelectItem>
                        <SelectItem value="Meeting">Meeting (Operational)</SelectItem>
                        <SelectItem value="Routine">Routine (Personal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-[#3B82F6]">Confirm Block</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="relative p-8">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[47px] top-8 bottom-8 w-px bg-slate-100 hidden md:block" />

            <div className="space-y-8 relative">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
              ) : blocks?.length === 0 ? (
                <div className="text-center py-20 text-slate-400 italic">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  No tactical blocks defined for today.
                </div>
              ) : (
                blocks?.map((block) => {
                  const Icon = TYPE_ICONS[block.type] || Clock;
                  return (
                    <div key={block.id} className="flex flex-col md:flex-row gap-6 group">
                      <div className="w-20 pt-1 hidden md:block text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{block.startTime}</span>
                      </div>
                      <div className="relative flex-1">
                        <div className={`absolute -left-[41px] top-1 h-6 w-6 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center z-10 group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-colors hidden md:flex`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <Card className={`border-none shadow-sm border-l-4 transition-all hover:shadow-md ${TYPE_COLORS[block.type]}`}>
                          <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900">{block.title}</h4>
                                <Badge variant="outline" className="text-[8px] font-bold uppercase h-4 border-slate-200">{block.type}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                <Clock className="h-3 w-3" />
                                {block.startTime} — {block.endTime}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(block.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-[#0F172A] p-8 rounded-3xl text-white flex items-start gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="h-32 w-32" />
        </div>
        <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2 relative z-10">
          <h4 className="text-xl font-bold font-headline">Time Blocking Protocol</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Founder energy is your scarcest resource. UdyamRakshak enforces tactical focus by syncing your schedule with the Strategy Map. Ensure at least 4 hours of <strong>Deep Work</strong> daily to maintain execution velocity.
          </p>
        </div>
      </div>
    </div>
  );
}
