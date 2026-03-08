
'use client';

/**
 * @fileOverview Strategic Execution Brain for StartupOS.
 * Reconciles work progress, budget usage, and timeline to calculate accountability health.
 */

export interface ProjectHealthResult {
  score: number;
  status: 'Active' | 'Delayed' | 'At Risk' | 'Completed';
  onTrack: boolean;
  progressPct: number;
  budgetUtilization: number;
}

/**
 * Calculates Project Health Score (0-100).
 * Weighted: 33% Progress, 33% Budget Discipline, 34% Timeline Compliance.
 */
export function calculateProjectHealth(
  project: { budgetAllocated: number; budgetUsed: number; targetEndDate: string; status: string },
  tasks: any[]
): ProjectHealthResult {
  const today = new Date();
  const deadline = new Date(project.targetEndDate);

  // 1. Progress Component (33%)
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // 2. Budget Component (33%)
  const budgetUtilization = project.budgetAllocated > 0 
    ? (project.budgetUsed / project.budgetAllocated) * 100 
    : 0;
  
  // High utilization reduces score if it outpaces progress
  const budgetScore = budgetUtilization <= 100 
    ? 100 - Math.max(0, (budgetUtilization - progressPct) * 0.5) 
    : 0;

  // 3. Time Component (34%)
  const isOverdue = today > deadline && progressPct < 100;
  const timeScore = isOverdue ? 0 : 100;

  const totalHealth = (progressPct * 0.33) + (budgetScore * 0.33) + (timeScore * 0.34);

  return {
    score: Math.round(totalHealth),
    status: project.status === 'Completed' ? 'Completed' : (isOverdue ? 'Delayed' : (totalHealth < 50 ? 'At Risk' : 'Active')),
    onTrack: progressPct >= budgetUtilization,
    progressPct,
    budgetUtilization
  };
}

/**
 * Rule-based task templates for quick project setup.
 */
export function generateTaskTemplate(type: 'Fundraising' | 'Product' | 'Growth' | 'Infrastructure'): Partial<{ title: string; status: string }[]> {
  const templates = {
    Fundraising: [
      { title: "Draft Pitch Deck", status: "Todo" },
      { title: "Identify Target Investors", status: "Todo" },
      { title: "Schedule Intro Calls", status: "Todo" },
      { title: "Prepare Data Room", status: "Todo" }
    ],
    Product: [
      { title: "Define MVP Features", status: "Todo" },
      { title: "Initial UI/UX Mockups", status: "Todo" },
      { title: "Setup Backend Architecture", status: "Todo" },
      { title: "User Testing Phase 1", status: "Todo" }
    ],
    Growth: [
      { title: "Launch SEO Campaign", status: "Todo" },
      { title: "A/B Test Landing Pages", status: "Todo" },
      { title: "Setup CRM Workflow", status: "Todo" }
    ],
    Infrastructure: [
      { title: "Configure Cloud Instances", status: "Todo" },
      { title: "Setup CI/CD Pipeline", status: "Todo" },
      { title: "Implement Security Audit", status: "Todo" }
    ]
  };

  return templates[type] || [];
}
