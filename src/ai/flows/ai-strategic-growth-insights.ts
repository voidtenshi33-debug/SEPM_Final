'use server';
/**
 * @fileOverview AI Strategic Growth Intelligence flow.
 * Synthesizes platform-wide data (finance, execution, team) into growth roadmaps.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiStrategicGrowthInsightsInputSchema = z.object({
  financialHealthSummary: z.string().describe("A summary of MRR, burn rate, and runway."),
  projectProgressSummary: z.string().describe("A summary of current project statuses and delays."),
  teamCapacitySummary: z.string().describe("A summary of team bandwidth and resource gaps."),
});
export type AiStrategicGrowthInsightsInput = z.infer<typeof AiStrategicGrowthInsightsInputSchema>;

const AiStrategicGrowthInsightsOutputSchema = z.object({
  strategicInsights: z.array(z.string()).describe("A list of 3-5 core observations about the current state."),
  growthRecommendations: z.array(z.string()).describe("Actionable expansion steps to scale the business."),
  riskAssessment: z.string().describe("Assessment of potential threats to the growth roadmap."),
});
export type AiStrategicGrowthInsightsOutput = z.infer<typeof AiStrategicGrowthInsightsOutputSchema>;

export async function aiStrategicGrowthInsights(input: AiStrategicGrowthInsightsInput): Promise<AiStrategicGrowthInsightsOutput> {
  return aiStrategicGrowthInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStrategicGrowthInsightsPrompt',
  input: { schema: AiStrategicGrowthInsightsInputSchema },
  output: { schema: AiStrategicGrowthInsightsOutputSchema },
  prompt: `You are a high-level startup growth consultant. Your job is to analyze the following startup data and provide a strategic roadmap.

Financial Context:
{{{financialHealthSummary}}}

Execution Context:
{{{projectProgressSummary}}}

Team Context:
{{{teamCapacitySummary}}}

Provide:
1. Core Observations: 3-5 high-impact insights based on the intersections of these data points.
2. Expansion Steps: Clear, actionable steps to accelerate growth or stabilize operations.
3. Risk Assessment: A brief summary of the primary threats to success.

Be concise, professional, and data-driven.`,
});

const aiStrategicGrowthInsightsFlow = ai.defineFlow(
  {
    name: 'aiStrategicGrowthInsightsFlow',
    inputSchema: AiStrategicGrowthInsightsInputSchema,
    outputSchema: AiStrategicGrowthInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
