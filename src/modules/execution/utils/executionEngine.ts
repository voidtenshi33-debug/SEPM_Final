'use client';

/**
 * @fileOverview FINAL Strategic execution engine for UdyamRakshak.
 * Handles complex project health scoring, risk detection, performance tracking,
 * and rule-based strategic recommendations.
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
 * Weights: Budget (25%), Deadline (25%), Task Rate (25%), Weekly Consistency (25%)
 */
export const calculateProjectHealth = (
  project: any,
  tasks: any[],
  expenses: any[]
): ProjectHealthResult => {
  const today = new Date();
  const deadline = new Date(project.targetEndDate);
  
  if (!tasks || tasks.length === 0) {
    return {
      score: 0,
      status: 'No Execution Started',
      onTrack: true,
      progressPct: 0,
      budgetUtilization: 0,
      riskReason: "No tactical tasks defined for this initiative."
    };
  }

  // 1. Task Completion Rate (25%)
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = (completedTasks / tasks.length) * 100;
  const taskScore = progressPct;

  // 2. Budget Control (25%)
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const budgetUsed = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budgetUtilization = project.budgetAllocated > 0 ? (budgetUsed / project.budgetAllocated) * 100 : 0;
  
  let budgetScore = 100;
  if (budgetUtilization > 100) budgetScore = 0;
  else if (budgetUtilization > progressPct + 20) budgetScore = 50; 

  // 3. Deadline Compliance (25%)
  const isOverdue = today > deadline && progressPct < 100;
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const deadlineScore = isOverdue ? 0 : (daysLeft < 7 && progressPct < 80 ? 50 : 100);

  // 4. Weekly Consistency (25%)
  const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
  const tasksWithRecentUpdates = tasks.filter(t => {
    const lastActive = t.lastUpdateAt || t.createdAt;
    const date = lastActive?.toDate ? lastActive.toDate() : new Date(lastActive);
    return date > tenDaysAgo;
  }).length;
  const consistencyScore = tasks.length > 0 ? (tasksWithRecentUpdates / tasks.length) * 100 : 100;

  // Weighted Total
  const totalHealth = (taskScore * 0.25) + (budgetScore * 0.25) + (deadlineScore * 0.25) + (consistencyScore * 0.25);

  let status: 'Active' | 'Delayed' | 'At Risk' | 'Completed' | 'No Execution Started' = 'Active';
  let riskReason = "";

  if (progressPct === 100) status = 'Completed';
  else if (isOverdue) {
    status = 'Delayed';
    riskReason = "Deadline exceeded";
  }
  else if (totalHealth < 50 || (progressPct < 50 && daysLeft < 15)) {
    status = 'At Risk';
    riskReason = "Execution velocity insufficient for deadline";
  }
  else if (budgetUtilization > 90 && progressPct < 70) {
    status = 'At Risk';
    riskReason = "Capital depletion ahead of work progress";
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
 * Calculates a team member's performance score (0-100)
 * Formula: (Completion Rate × 40%) + (On-Time × 30%) + (Consistency × 20%) + (Overdue Penalty × 10%)
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
    const completedDate = t.completedAt?.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
    return completedDate <= new Date(t.deadline);
  });
  const onTimeRate = completedTasks.length > 0 ? (onTimeCompleted.length / completedTasks.length) * 100 : 100;

  // 3. Consistency (20%) - Based on updates in last 10 days
  const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
  const updatedTasks = tasks.filter(t => {
    const lastActive = t.lastUpdateAt || t.createdAt;
    const date = lastActive?.toDate ? lastActive.toDate() : new Date(lastActive);
    return date > tenDaysAgo;
  });
  const consistencyRate = (updatedTasks.length / tasks.length) * 100;

  // 4. Overdue Penalty (10%)
  const overduePenalty = overdueTasks.length > 0 ? Math.max(0, 100 - (overdueTasks.length * 20)) : 100;

  const totalScore = Math.round(
    (completionRate * 0.4) + 
    (onTimeRate * 0.3) + 
    (consistencyRate * 0.2) + 
    (overduePenalty * 0.1)
  );

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

/**
 * Rule-Based AI Strategic Recommendations
 */
export const getStrategicRecommendations = (profile: any, financials: any[], runway: number) => {
  const suggestions = [];
  const businessType = profile?.businessType || 'Hybrid';
  
  const latest = financials?.[0];
  const prev = financials?.[1];
  const netRevenue = latest?.netRevenue || 0;
  const isRevenueFlat = prev && Math.abs((netRevenue - prev.netRevenue) / prev.netRevenue) < 0.05;

  if (runway < 6 && runway > 0) {
    suggestions.push({
      id: 'FUNDRAISING_STRAT',
      title: "Aggressive Runway Extension",
      why: `Critical liquidity stress. Current cash only covers ${runway} months of burn.`,
      action: "Initiate Strategic Funding Round",
      impact: "Critical",
      type: "Fundraising",
      template: "FUNDRAISING"
    });
  }

  if (businessType === 'Product' && isRevenueFlat) {
    suggestions.push({
      id: 'SUB_MODEL',
      title: "Subscription Model Pivot",
      why: "Revenue stagnation detected in transactional sales. Recurring revenue would stabilize the cash cycle.",
      action: "Launch Subscription Strategy",
      impact: "High",
      type: "Product",
      template: "PRODUCT_LAUNCH"
    });
  }

  if (businessType === 'Service' && netRevenue > 0 && latest?.recurringRevenue < (netRevenue * 0.3)) {
    suggestions.push({
      id: 'RETAINER_GTM',
      title: "Retainer-Based Transition",
      why: "High dependence on one-time deals. Retainers improve valuation and runway predictability.",
      action: "Execute Retainer GTM",
      impact: "Medium",
      type: "Growth",
      template: "MARKETING"
    });
  }
  
  return suggestions;
};

/**
 * Predefined task templates
 */
export const TASK_TEMPLATES = {
  FUNDRAISING: [
    { title: 'Pitch Deck Preparation', priority: 'High', impactType: 'Fundraising' },
    { title: 'Investor CRM Setup', priority: 'Medium', impactType: 'Fundraising' },
    { title: 'Data Room Organization', priority: 'High', impactType: 'Finance' },
    { title: 'Founder Pitch Rehearsal', priority: 'High', impactType: 'Growth' }
  ],
  PRODUCT_LAUNCH: [
    { title: 'Beta Testing Group', priority: 'High', impactType: 'Product' },
    { title: 'Marketing Landing Page', priority: 'Medium', impactType: 'Growth' },
    { title: 'Final QA Sprint', priority: 'High', impactType: 'Product' }
  ],
  MARKETING: [
    { title: 'Segment Strategy Planning', priority: 'High', impactType: 'Growth' },
    { title: 'Campaign Content Production', priority: 'Medium', impactType: 'Growth' },
    { title: 'Multi-Channel Launch', priority: 'High', impactType: 'Growth' }
  ]
};

export const generateTaskTemplate = (type: string) => {
  return (TASK_TEMPLATES as any)[type] || [];
};
