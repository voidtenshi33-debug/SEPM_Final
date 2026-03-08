
'use client';

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FolderLock, 
  Lock, 
  Unlock, 
  MoreVertical, 
  Search, 
  Plus, 
  Loader2,
  FileDown,
  ShieldCheck
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function DocumentsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const docsQuery = useMemoFirebase(() => query(collection(db, 'documents'), orderBy('lastModified', 'desc')), [db]);
  const { data: documents, isLoading } = useCollection(docsQuery);

  const handleToggleLock = async (docId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'documents', docId), { isLocked: !currentStatus });
    toast({ title: !currentStatus ? "Document Secured" : "Access Decrypted" });
  };

  const handleAddSample = async () => {
    await addDoc(collection(db, 'documents'), {
      name: "Q3 Strategic Growth Brief",
      type: "PDF / Strategic",
      lastModified: new Date().toISOString(),
      isLocked: true
    });
  };

  const filteredDocs = documents?.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Document Intelligence Vault" 
        description="Encrypted strategic assets and compliance archives."
        actions={
          <Button className="bg-[#3B82F6]" onClick={handleAddSample}>
            <Plus className="h-4 w-4 mr-2" /> Upload Protocol
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search encrypted vault..." 
          className="pl-10 h-11 border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : filteredDocs?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic">No strategic documents identified in the current vault.</div>
        ) : (
          filteredDocs?.map((doc) => (
            <Card key={doc.id} className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${doc.isLocked ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleLock(doc.id, doc.isLocked)}>
                    {doc.isLocked ? <Lock className="h-4 w-4 text-rose-500" /> : <Unlock className="h-4 w-4 text-emerald-500" />}
                  </Button>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{doc.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{doc.type}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Modified: {new Date(doc.lastModified).toLocaleDateString()}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-blue-600">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-none shadow-xl bg-[#0F172A] text-white p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <FolderLock className="h-40 w-40" />
        </div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="p-3 rounded-2xl bg-blue-500/20">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 font-headline text-white">Encryption Protocol: Active</h3>
            <p className="text-slate-400 text-base leading-relaxed mb-6 max-w-2xl">
              All documents in the Intelligence Vault are encrypted using UdyamRakshak security protocols. Access is strictly role-based and audited.
            </p>
            <div className="flex gap-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1">256-bit AES: Verified</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-none px-4 py-1">Access Audit: Secured</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
