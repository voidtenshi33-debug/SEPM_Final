'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tags, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Expense Categorization</h3>
          <p className="text-sm text-muted-foreground">Manage Fixed vs. Variable cost structures.</p>
        </div>
        <Button className="bg-accent">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-accent" />
            Cost Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground italic">Category management logic coming in Phase 2...</p>
        </CardContent>
      </Card>
    </div>
  );
}
