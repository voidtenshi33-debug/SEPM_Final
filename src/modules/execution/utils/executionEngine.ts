'use client';

/**
 * @fileOverview Strategic Execution Brain for StartupOS.
 * Reconciles work progress, budget usage, and performance accountability.
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

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const budgetUtilization = project.budgetAllocated > 0 
    ? (project.budgetUsed / project.budgetAllocated) * 100 
    : 0;
  
  const budgetScore = budgetUtilization <= 100 
    ? 100 - Math.max(0, (budgetUtilization - progressPct) * 0.5) 
    : 0;

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
 * Calculates a Performance Score for a team member based on task completion.
 */
export function calculateMemberPerformance(tasks: any[]): number {
  if (tasks.length === 0) return 100;
  
  const completed = tasks.filter(t => t.status === 'Completed');
  const onTime = completed.filter(t => {
    if (!t.completedAt || !t.deadline) return true;
    return new Date(t.completedAt) <= new Date(t.deadline);
  });

  const completionRate = (completed.length / tasks.length) * 100;
  const onTimeRate = completed.length > 0 ? (onTime.length / completed.length) * 100 : 100;

  return Math.round((completionRate * 0.4) + (onTimeRate * 0.6));
}

/**
 * Generates AI-driven strategic initiatives based on financial and model signals.
 */
export function getStrategicSuggestions(data: {
  businessType: string;
  revenueTrend: 'up' | 'down' | 'flat';
  runway: number;
  utilization?: number;
}) {
  const suggestions = [];

  if (data.businessType === 'Product' && data.revenueTrend === 'flat') {
    suggestions.push({
      title: "Subscription Tier Launch",
      reason: "Revenue has flattened. Recurring billing stabilizes cash flow.",
      impact: "High",
      risk: "Medium",
      type: "Product"
    });
  }

  if (data.businessType === 'Service' && (data.utilization || 0) < 60) {
    suggestions.push({
      title: "Outbound Sales Blitz",
      reason: "Team utilization is below 60%. Excess capacity detected.",
      impact: "High",
      risk: "Low",
      type: "Growth"
    });
  }

  if (data.runway < 6) {
    suggestions.push({
      title: "Series A Data Room Prep",
      reason: "Runway is under 6 months. Milestone readiness is critical for survival.",
      impact: "Critical",
      risk: "High",
      type: "Fundraising"
    });
  }

  return suggestions;
}

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
