'use client';

/**
 * @fileOverview FINAL Strategic execution engine for UdyamRakshak.
 * Handles complex project health scoring, risk detection, performance tracking,
 * and rule-based strategic recommendations.
 */

export interface ProjectHealthResult {
  score: number;
  status: 'Active' | 'Delayed' | 'At Risk' | 'Completed';
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
  
  // 1. Task Completion Rate (25%)
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const taskScore = progressPct;

  // 2. Budget Control (25%)
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const budgetUsed = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budgetUtilization = project.budgetAllocated > 0 ? (budgetUsed / project.budgetAllocated) * 100 : 0;
  
  let budgetScore = 100;
  if (budgetUtilization > 100) budgetScore = 0;
  else if (budgetUtilization > progressPct + 20) budgetScore = 50; // Spending faster than working

  // 3. Deadline Compliance (25%)
  const isOverdue = today > deadline && progressPct < 100;
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const deadlineScore = isOverdue ? 0 : (daysLeft < 7 && progressPct < 80 ? 50 : 100);

  // 4. Weekly Consistency (25%)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Using createdAt as a proxy for last activity in this prototype
  const tasksWithRecentUpdates = tasks.filter(t => {
    const lastActive = t.updatedAt || t.createdAt;
    return lastActive && new Date(lastActive.seconds ? lastActive.seconds * 1000 : lastActive) > sevenDaysAgo;
  }).length;
  const consistencyScore = tasks.length > 0 ? (tasksWithRecentUpdates / tasks.length) * 100 : 100;

  // Weighted Total
  const totalHealth = (taskScore * 0.25) + (budgetScore * 0.25) + (deadlineScore * 0.25) + (consistencyScore * 0.25);

  let status: 'Active' | 'Delayed' | 'At Risk' | 'Completed' = 'Active';
  let riskReason = "";

  if (progressPct === 100) status = 'Completed';
  else if (isOverdue) {
    status = 'Delayed';
    riskReason = "Deadline exceeded";
  }
  else if (totalHealth < 50 || (progressPct < 50 && daysLeft < 15)) {
    status = 'At Risk';
    riskReason = "Low progress relative to deadline";
  }
  else if (budgetUtilization > 90 && progressPct < 70) {
    status = 'At Risk';
    riskReason = "Budget near depletion";
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
 * Weights: Completion Rate (60%), Reliability/On-Time (40%)
 */
export const calculateMemberPerformance = (tasks: any[]) => {
  if (tasks.length === 0) return { score: 0, active: 0, overdue: 0, reliability: 0 };

  const completed = tasks.filter(t => t.status === 'Completed');
  const onTime = completed.filter(t => {
    if (!t.completedAt || !t.deadline) return true; // Assume on-time if no data
    return new Date(t.completedAt) <= new Date(t.deadline);
  });
  
  const completionRate = (completed.length / tasks.length) * 100;
  const reliabilityScore = completed.length > 0 ? (onTime.length / completed.length) * 100 : 100;
  
  const totalScore = Math.round((completionRate * 0.6) + (reliabilityScore * 0.4));
  
  return {
    score: totalScore,
    active: tasks.filter(t => t.status !== 'Completed').length,
    overdue: tasks.filter(t => t.status !== 'Completed' && new Date() > new Date(t.deadline)).length,
    reliability: Math.round(reliabilityScore)
  };
};

/**
 * Rule-Based AI Strategic Recommendations
 */
export const getStrategicRecommendations = (profile: any, financials: any[]) => {
  const suggestions = [];
  const businessType = profile?.businessType || 'Hybrid';
  const runway = 14; // Mock value for prototype logic
  
  const netRevenue = financials?.[0]?.netRevenue || 0;
  const prevRevenue = financials?.[1]?.netRevenue || 0;
  const isRevenueFlat = prevRevenue > 0 && Math.abs((netRevenue - prevRevenue) / prevRevenue) < 0.05;

  if (runway < 6) {
    suggestions.push({
      id: 'FUNDRAISING_STRAT',
      title: "Aggressive Runway Extension",
      reason: "Liquidity risk detected. Current burn will deplete cash in < 6 months.",
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
      reason: "Stagnant transactional revenue detected over last period.",
      action: "Launch Subscription Project",
      impact: "High",
      type: "Product",
      template: "PRODUCT_LAUNCH"
    });
  }

  if (businessType === 'Service' && netRevenue > 0) {
    suggestions.push({
      id: 'RETAINER_GTM',
      title: "Retainer-Based Transition",
      reason: "High dependence on one-time service deals detected.",
      action: "Launch Retainer GTM",
      impact: "Medium",
      type: "Marketing",
      template: "MARKETING"
    });
  }
  
  return suggestions;
};

/**
 * Predefined task templates for common startup projects
 */
export const TASK_TEMPLATES = {
  FUNDRAISING: [
    { title: 'Pitch Deck Preparation', priority: 'High', impactType: 'Fundraising', status: 'Todo' },
    { title: 'Investor CRM Setup', priority: 'Medium', impactType: 'Fundraising', status: 'Todo' },
    { title: 'Data Room Organization', priority: 'High', impactType: 'Finance', status: 'Todo' },
    { title: 'Founder Pitch Rehearsal', priority: 'High', impactType: 'Operations', status: 'Todo' },
    { title: 'Investor Outreach Phase 1', priority: 'Medium', impactType: 'Growth', status: 'Todo' }
  ],
  PRODUCT_LAUNCH: [
    { title: 'Beta Testing Group', priority: 'High', impactType: 'Product', status: 'Todo' },
    { title: 'Marketing Landing Page', priority: 'Medium', impactType: 'Growth', status: 'Todo' },
    { title: 'Architecture Review', priority: 'High', impactType: 'Product', status: 'Todo' },
    { title: 'Final QA Sprint', priority: 'High', impactType: 'Product', status: 'Todo' },
    { title: 'Launch Press Release', priority: 'Medium', impactType: 'Growth', status: 'Todo' }
  ],
  MARKETING: [
    { title: 'Strategy Planning', priority: 'High', impactType: 'Growth', status: 'Todo' },
    { title: 'Ad Creative Design', priority: 'Medium', impactType: 'Growth', status: 'Todo' },
    { title: 'Campaign Launch', priority: 'High', impactType: 'Growth', status: 'Todo' },
    { title: 'ROI Analysis', priority: 'Medium', impactType: 'Finance', status: 'Todo' }
  ]
};

export const generateTaskTemplate = (type: string) => {
  const key = type.toUpperCase().replace(/\s+/g, '_');
  if (key === 'PRODUCT') return TASK_TEMPLATES.PRODUCT_LAUNCH;
  if (key === 'GROWTH') return TASK_TEMPLATES.MARKETING;
  return (TASK_TEMPLATES as any)[key] || [];
};
