'use client';

/**
 * @fileOverview Strategic execution engine for UdyamRakshak.
 * Handles project health scoring and individual performance accountability.
 */

export interface ProjectHealthResult {
  score: number;
  status: 'Active' | 'Delayed' | 'At Risk' | 'Completed' | 'No Execution Started';
  onTrack: boolean;
  progressPct: number;
  budgetUtilization: number;
  riskReason?: string;
}

/**
 * Calculates weighted health score for a project (0-100)
 */
export const calculateProjectHealth = (
  project: any,
  tasks: any[],
  expenses: any[]
): ProjectHealthResult => {
  const today = new Date();
  const deadline = new Date(project.targetEndDate);
  
  if (tasks.length === 0 && project.status === 'Active') {
    return {
      score: 0,
      status: 'No Execution Started',
      onTrack: false,
      progressPct: 0,
      budgetUtilization: 0,
      riskReason: "No strategic tasks initialized"
    };
  }

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const budgetUsed = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budgetUtilization = project.budgetAllocated > 0 ? (budgetUsed / project.budgetAllocated) * 100 : 0;
  
  let budgetScore = 100;
  if (budgetUtilization > 100) budgetScore = 0;
  else if (budgetUtilization > progressPct + 20) budgetScore = 50;

  const isOverdue = today > deadline && progressPct < 100;
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const deadlineScore = isOverdue ? 0 : (daysLeft < 7 && progressPct < 80 ? 50 : 100);

  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const tasksWithRecentUpdates = tasks.filter(t => {
    const lastActive = t.lastUpdateAt || t.createdAt;
    const date = lastActive?.toDate ? lastActive.toDate() : new Date(lastActive);
    return date > sevenDaysAgo;
  }).length;
  const consistencyScore = tasks.length > 0 ? (tasksWithRecentUpdates / tasks.length) * 100 : 100;

  const totalHealth = (progressPct * 0.25) + (budgetScore * 0.25) + (deadlineScore * 0.25) + (consistencyScore * 0.25);

  let status: 'Active' | 'Delayed' | 'At Risk' | 'Completed' | 'No Execution Started' = 'Active';
  let riskReason = "";

  if (progressPct === 100) status = 'Completed';
  else if (isOverdue) {
    status = 'Delayed';
    riskReason = "Deadline exceeded";
  }
  else if (totalHealth < 50) {
    status = 'At Risk';
    riskReason = "Low composite health score";
  }

  return {
    score: Math.round(totalHealth),
    status,
    onTrack: progressPct >= budgetUtilization,
    progressPct,
    budgetUtilization,
    riskReason
  };
};

/**
 * TEAM INTELLIGENCE: Performance Engine (FINAL)
 * Score Formula: (Completion × 40%) + (On-Time × 30%) + (Consistency × 20%) + (Overdue Penalty × 10%)
 */
export const calculateMemberPerformance = (tasks: any[]) => {
  if (!tasks || tasks.length === 0) return { score: 0, risk: "INACTIVE", active: 0, overdue: 0, reliability: 0, consistency: 0 };

  const today = new Date();
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueTasks = activeTasks.filter(t => new Date(t.deadline) < today);

  // 1. Completion Rate (40%)
  const completionRate = (completedTasks.length / tasks.length) * 100;

  // 2. On-Time Rate (30%)
  const onTimeCompleted = completedTasks.filter(t => {
    if (!t.completedAt) return true;
    return new Date(t.completedAt) <= new Date(t.deadline);
  });
  const onTimeRate = completedTasks.length > 0 ? (onTimeCompleted.length / completedTasks.length) * 100 : 100;

  // 3. Consistency (20%) - Based on weekly updates in last 10 days
  const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
  const updatedTasks = tasks.filter(t => {
    const lastActive = t.lastUpdateAt || t.createdAt;
    const date = lastActive?.toDate ? lastActive.toDate() : new Date(lastActive);
    return date > tenDaysAgo;
  });
  const consistencyRate = (updatedTasks.length / tasks.length) * 100;

  // 4. Overdue Penalty (10%) - Inverted
  const overduePenalty = overdueTasks.length > 0 ? Math.max(0, 100 - (overdueTasks.length * 20)) : 100;

  const totalScore = Math.round(
    (completionRate * 0.4) + 
    (onTimeRate * 0.3) + 
    (consistencyRate * 0.2) + 
    (overduePenalty * 0.1)
  );

  // Risk Detection
  let risk: "NORMAL" | "DEADLINE_RISK" | "OVERLOAD" | "INACTIVE" = "NORMAL";
  if (overdueTasks.length > 2) risk = "DEADLINE_RISK";
  else if (activeTasks.length > 7) risk = "OVERLOAD";
  else if (updatedTasks.length === 0 && tasks.length > 0) risk = "INACTIVE";

  return {
    score: totalScore,
    risk,
    active: activeTasks.length,
    overdue: overdueTasks.length,
    reliability: Math.round(onTimeRate),
    consistency: Math.round(consistencyRate)
  };
};

export const getStrategicRecommendations = (profile: any, financials: any[]) => {
  const suggestions = [];
  const businessType = profile?.businessType || 'Hybrid';
  const runway = 14; 
  
  const netRevenue = financials?.[0]?.netRevenue || 0;
  const prevRevenue = financials?.[1]?.netRevenue || 0;
  const isRevenueFlat = prevRevenue > 0 && Math.abs((netRevenue - prevRevenue) / prevRevenue) < 0.05;

  if (runway < 6) {
    suggestions.push({
      id: 'FUNDRAISING_STRAT',
      title: "Aggressive Runway Extension",
      why: "Liquidity risk detected. Current burn will deplete cash in < 6 months.",
      action: "Start Series A/Seed Round",
      impact: "Critical",
      type: "Fundraising",
      template: "FUNDRAISING"
    });
  }

  if (businessType === 'Product' && isRevenueFlat) {
    suggestions.push({
      id: 'SUB_MODEL',
      title: "Subscription Model Pivot",
      why: "Stagnant transactional revenue detected over last period.",
      action: "Launch Subscription Project",
      impact: "High",
      type: "Product",
      template: "PRODUCT_LAUNCH"
    });
  }

  return suggestions;
};

export const TASK_TEMPLATES = {
  FUNDRAISING: [
    { title: 'Pitch Deck Preparation', priority: 'High', impactType: 'Fundraising' },
    { title: 'Investor CRM Setup', priority: 'Medium', impactType: 'Fundraising' },
    { title: 'Data Room Organization', priority: 'High', impactType: 'Finance' }
  ],
  PRODUCT_LAUNCH: [
    { title: 'Beta Testing Group', priority: 'High', impactType: 'Product' },
    { title: 'Marketing Landing Page', priority: 'Medium', impactType: 'Growth' }
  ]
};

export const generateTaskTemplate = (type: string) => {
  const key = type.toUpperCase().replace(/\s+/g, '_');
  return (TASK_TEMPLATES as any)[key] || [];
};
