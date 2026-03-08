
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Linkedin } from "lucide-react";

const team = [
  { name: "John Doe", role: "CEO & Founder", status: "Active", initials: "JD" },
  { name: "Jane Smith", role: "CTO", status: "Active", initials: "JS" },
  { name: "Michael Chen", role: "Product Manager", status: "On Vacation", initials: "MC" },
  { name: "Sarah Williams", role: "Full Stack Engineer", status: "Active", initials: "SW" },
];

export default function TeamPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Team Management</h1>
          <p className="text-muted-foreground">Manage your human capital and coordination.</p>
        </div>
        <Button className="bg-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <Avatar className="h-20 w-20 mx-auto border-4 border-white shadow-sm">
                <AvatarImage src={`https://picsum.photos/seed/${member.initials}/100/100`} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2 mb-4">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="flex border-t pt-4 justify-around">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
