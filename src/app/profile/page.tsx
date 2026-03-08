"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Edit3, 
  Globe, 
  MapPin, 
  Building2, 
  Save, 
  AlertTriangle,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const businessOptions = [
  { id: 'Product', label: 'Product-Based', desc: 'Focus on Units, Inventory & Orders' },
  { id: 'Service', label: 'Service-Based', desc: 'Focus on Clients, Hours & Retention' },
  { id: 'Hybrid', label: 'Hybrid Model', desc: 'Mix of both goods and expertise' }
];

export default function ProfilePage() {
  const db = useFirestore()
  const profileRef = useMemoFirebase(() => doc(db, 'startupProfile', 'main'), [db])
  const { data: profile, isLoading } = useDoc(profileRef)
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    businessType: "Hybrid",
    industry: "",
    teamSize: 1,
    mission: "",
    website: "",
    location: ""
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        businessType: profile.businessType || "Hybrid",
        industry: profile.industry || "",
        teamSize: profile.teamSize || 1,
        mission: profile.mission || "",
        website: profile.website || "www.startup.os",
        location: profile.location || "San Francisco, CA"
      })
    }
  }, [profile])

  const handleSave = () => {
    setDocumentNonBlocking(profileRef, formData, { merge: true })
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your startup's core identity has been secured.",
    })
  }

  const handleTypeChange = (value: string) => {
    if (value !== formData.businessType && profile?.businessType) {
      setPendingType(value)
      setShowConfirm(true)
    } else {
      setFormData({ ...formData, businessType: value })
    }
  }

  const confirmTypeChange = () => {
    if (pendingType) {
      setFormData({ ...formData, businessType: pendingType })
    }
    setShowConfirm(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Startup Profile" 
        description="The strategic DNA of your organization. This configuration drives all financial intelligence."
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" /> Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button className="bg-[#3B82F6] hover:bg-blue-700 text-white" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* Identity Card */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {formData.name ? formData.name.substring(0, 2).toUpperCase() : "OS"}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                {isEditing ? (
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Startup Name"
                    className="text-2xl font-bold h-12"
                  />
                ) : (
                  <CardTitle className="text-3xl font-bold text-[#0F172A]">{formData.name || "Unnamed Startup"}</CardTitle>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Building2 className="h-4 w-4 text-[#3B82F6]" />
                    {formData.industry || "Unspecified Industry"}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-[#3B82F6]" />
                    {formData.location}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Model</p>
                  <p className="text-sm font-bold text-blue-700">{formData.businessType}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Business Type</Label>
                  {isEditing ? (
                    <Select value={formData.businessType} onValueChange={handleTypeChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessOptions.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>
                            <div className="flex flex-col text-left py-1">
                              <span className="font-bold">{opt.label}</span>
                              <span className="text-[10px] text-slate-400">{opt.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <p className="font-bold text-slate-700">{formData.businessType} Model</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {businessOptions.find(o => o.id === formData.businessType)?.desc}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Industry & Domain</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.industry} 
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g. B2B SaaS"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-700">{formData.industry || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Global Team Size</Label>
                  {isEditing ? (
                    <Input 
                      type="number"
                      value={formData.teamSize} 
                      onChange={(e) => setFormData({...formData, teamSize: Number(e.target.value)})}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-700">{formData.teamSize} Personnel</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Mission Statement</Label>
                  {isEditing ? (
                    <Textarea 
                      value={formData.mission} 
                      onChange={(e) => setFormData({...formData, mission: e.target.value})}
                      placeholder="Empowering founders through..."
                      className="min-h-[120px] resize-none"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{formData.mission || "No mission statement defined yet."}"
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Digital Presence</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <Input 
                        value={formData.website} 
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="www.startup.os"
                      />
                    </div>
                  ) : (
                    <a href={`https://${formData.website}`} target="_blank" className="text-sm font-bold text-[#3B82F6] hover:underline flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {formData.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Linkage Tip */}
        {!isEditing && (
          <div className="bg-[#0F172A] p-6 rounded-2xl flex items-center gap-4 text-white">
            <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Adaptive Configuration Active</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Your <span className="text-blue-400 font-bold uppercase">{formData.businessType}</span> model is currently driving the layouts in the Sales Intelligence and Operational Performance modules.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Business Type Change */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Change Business Model?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Switching your business type will reset the visual display of your sales metrics and analytical dashboards. Historical data will remain, but visualizations may appear inconsistent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingType(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeChange} className="bg-amber-600 hover:bg-amber-700">
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}