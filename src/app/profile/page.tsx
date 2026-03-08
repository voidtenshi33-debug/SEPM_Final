"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Edit3, 
  Globe, 
  MapPin, 
  Building2, 
  Save, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
  Calendar,
  Briefcase,
  Users,
  Layers,
  Linkedin
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

const fundingStages = ["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B+"];
const revenueModels = ["Subscription", "Marketplace", "Transactional", "Ad-Based", "Enterprise"];

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
    legalName: "",
    foundingDate: "",
    businessType: "Hybrid",
    industry: "",
    fundingStage: "Seed",
    revenueModel: "Subscription",
    teamSize: 1,
    mission: "",
    vision: "",
    website: "",
    linkedInUrl: "",
    location: "",
    techStack: "",
    governancePin: ""
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        legalName: profile.legalName || "",
        foundingDate: profile.foundingDate || "",
        businessType: profile.businessType || "Hybrid",
        industry: profile.industry || "",
        fundingStage: profile.fundingStage || "Seed",
        revenueModel: profile.revenueModel || "Subscription",
        teamSize: profile.teamSize || 1,
        mission: profile.mission || "",
        vision: profile.vision || "",
        website: profile.website || "www.startup.os",
        linkedInUrl: profile.linkedInUrl || "",
        location: profile.location || "San Francisco, CA",
        techStack: profile.techStack || "",
        governancePin: profile.governancePin || ""
      })
    }
  }, [profile])

  const handleSave = () => {
    setDocumentNonBlocking(profileRef, formData, { merge: true })
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your startup's strategic DNA has been secured in the encrypted vault.",
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

  const SectionLabel = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-4 border-b pb-2">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </h3>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Startup Profile" 
        description="The strategic identity of your organization. This data drives all growth modeling and valuation intelligence."
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="border-accent text-accent">
              <Edit3 className="h-4 w-4 mr-2" /> Edit DNA
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Discard</Button>
              <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save DNA
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* Hero Identity */}
        <Card className="border-none shadow-lg overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-28 w-28 rounded-[2rem] bg-[#0F172A] flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                <span className="relative z-10">{formData.name ? formData.name.substring(0, 2).toUpperCase() : "OS"}</span>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Public Brand Name"
                      className="text-3xl font-bold h-14 bg-white border-slate-200"
                    />
                    <Input 
                      value={formData.legalName} 
                      onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                      placeholder="Registered Legal Entity Name"
                      className="text-sm font-medium h-10 border-slate-100"
                    />
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-4xl font-bold text-[#0F172A] mb-1">{formData.name || "Unnamed Startup"}</CardTitle>
                    <p className="text-slate-400 font-medium">{formData.legalName || "No legal entity registered"}</p>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    {formData.industry || "Unspecified Sector"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {formData.location}
                  </span>
                  {formData.foundingDate && (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Founded: {new Date(formData.foundingDate).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <div className="flex flex-col gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase rounded-xl">
                    {formData.fundingStage}
                  </Badge>
                  <Badge variant="outline" className="text-slate-500 border-slate-200 px-4 py-1.5 text-xs font-bold uppercase rounded-xl">
                    {formData.businessType} Model
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column: Core Identity & Model */}
              <div className="space-y-10">
                <section>
                  <SectionLabel icon={Layers}>Strategic Model</SectionLabel>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Business Model</Label>
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
                        <p className="text-sm font-bold text-slate-700">{formData.businessType}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Funding Stage</Label>
                        {isEditing ? (
                          <Select value={formData.fundingStage} onValueChange={(v) => setFormData({...formData, fundingStage: v})}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fundingStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-bold text-slate-700">{formData.fundingStage}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Revenue Model</Label>
                        {isEditing ? (
                          <Select value={formData.revenueModel} onValueChange={(v) => setFormData({...formData, revenueModel: v})}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {revenueModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-bold text-slate-700">{formData.revenueModel}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionLabel icon={Users}>Operational Capacity</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Founding Date</Label>
                      {isEditing ? (
                        <Input 
                          type="date"
                          value={formData.foundingDate} 
                          onChange={(e) => setFormData({...formData, foundingDate: e.target.value})}
                          className="h-11"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-700">{formData.foundingDate || "Not set"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Team Size</Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={formData.teamSize} 
                          onChange={(e) => setFormData({...formData, teamSize: Number(e.target.value)})}
                          className="h-11"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-700">{formData.teamSize} Members</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Core Tech Stack</Label>
                    {isEditing ? (
                      <Input 
                        value={formData.techStack} 
                        onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                        placeholder="e.g. Next.js, Firebase, OpenAI"
                        className="h-11"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-700">{formData.techStack || "Not documented"}</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Narrative & Reach */}
              <div className="space-y-10">
                <section>
                  <SectionLabel icon={Briefcase}>Mission & Vision</SectionLabel>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Mission Statement</Label>
                      {isEditing ? (
                        <Textarea 
                          value={formData.mission} 
                          onChange={(e) => setFormData({...formData, mission: e.target.value})}
                          placeholder="What do you do for whom?"
                          className="min-h-[80px] resize-none border-slate-200"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          "{formData.mission || "Our mission is to..."}"
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Vision Statement</Label>
                      {isEditing ? (
                        <Textarea 
                          value={formData.vision} 
                          onChange={(e) => setFormData({...formData, vision: e.target.value})}
                          placeholder="Where do you see the startup in 5 years?"
                          className="min-h-[80px] resize-none border-slate-200"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          "{formData.vision || "We envision a world where..."}"
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <SectionLabel icon={Globe}>External Presence</SectionLabel>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Official Website</Label>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <Input 
                            value={formData.website} 
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            placeholder="www.yourstartup.com"
                            className="h-11"
                          />
                        </div>
                      ) : (
                        <a href={`https://${formData.website}`} target="_blank" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {formData.website}
                        </a>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">LinkedIn Profile</Label>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-slate-400" />
                          <Input 
                            value={formData.linkedInUrl} 
                            onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})}
                            placeholder="linkedin.com/company/yourstartup"
                            className="h-11"
                          />
                        </div>
                      ) : (
                        <a href={formData.linkedInUrl.startsWith('http') ? formData.linkedInUrl : `https://${formData.linkedInUrl}`} target="_blank" className="text-sm font-bold text-[#0A66C2] hover:underline flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          Corporate Profile
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <SectionLabel icon={Lock}>Security & Governance</SectionLabel>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Governance Secret PIN
                    </Label>
                    {isEditing ? (
                      <Input 
                        type="password"
                        maxLength={4}
                        value={formData.governancePin} 
                        onChange={(e) => setFormData({...formData, governancePin: e.target.value})}
                        placeholder="4-digit PIN (e.g. 1234)"
                        className="h-11 border-emerald-100 focus:ring-emerald-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 italic">This PIN is required to authorize sensitive financial operations and deal reversals.</p>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Linkage Tip */}
        {!isEditing && (
          <div className="bg-[#0F172A] p-8 rounded-[2rem] flex items-start gap-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="h-40 w-40" />
            </div>
            <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30">
              <CheckCircle2 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold font-headline">Intelligence Linkage Active</h4>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                Your profile data is synchronized with the **Expansion Intelligence Engine**. Changes to your **Revenue Model** or **Funding Stage** will automatically recalibrate the risk-detection thresholds across your dashboards.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Business Type Change */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Recalibrate Model?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Switching your core business model will reset visual sales metrics and analytical dashboards. This action forces the Intelligence Engine to re-evaluate your unit economics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingType(null)} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeChange} className="bg-amber-600 hover:bg-amber-700 rounded-xl">
              Confirm Recalibration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
