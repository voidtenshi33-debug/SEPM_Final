'use server';
/**
 * @fileOverview This file implements a Genkit flow for the AI Growth Intelligence Engine.
 * It provides AI-generated strategic recommendations and insights based on startup operational and financial data.
 *
 * - generateStrategicInsights - A function that handles the generation of strategic insights.
 * - GenerateStrategicInsightsInput - The input type for the generateStrategicInsights function.
 * - GenerateStrategicInsightsOutput - The return type for the generateStrategicInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStrategicInsightsInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  industry: z.string().describe("The industry the startup operates in."),
  stage: z.string().describe("The current funding stage of the startup (e.g., 'Seed', 'Series A', 'Growth')."),
  cashRunwayMonths: z.number().describe("The number of months the startup has cash left before running out."),
  currentRevenueMonthly: z.number().describe("The startup's current monthly recurring revenue in USD."),
  teamSize: z.number().describe("The total number of employees or team members."),
  activeProjectsCount: z.number().describe("The number of projects currently active."),
  recentChallenges: z.string().describe("A summary of recent challenges faced by the startup."),
  currentGoals: z.string().describe("A summary of the startup's current strategic goals."),
});
export type GenerateStrategicInsightsInput = z.infer<typeof GenerateStrategicInsightsInputSchema>;

const GenerateStrategicInsightsOutputSchema = z.object({
  strategicInsights: z.string().describe("A comprehensive summary of the startup's current position, strengths, weaknesses, and potential opportunities."),
  keyRecommendations: z.array(z.string()).describe("Specific, actionable steps the founder can take to address challenges, achieve goals, and improve overall health."),
  criticalAreasToFocus: z.array(z.string()).describe("2-3 most critical areas that require immediate attention and focus."),
  sentimentAnalysis: z.string().describe("An overall assessment of the startup's current sentiment (e.g., 'Positive', 'Neutral', 'Needs Improvement', 'Urgent Action Required')."),
});
export type GenerateStrategicInsightsOutput = z.infer<typeof GenerateStrategicInsightsOutputSchema>;

export async function generateStrategicInsights(input: GenerateStrategicInsightsInput): Promise<GenerateStrategicInsightsOutput> {
  return aiStrategicInsightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicInsightGeneratorPrompt',
  input: { schema: GenerateStrategicInsightsInputSchema },
  output: { schema: GenerateStrategicInsightsOutputSchema },
  prompt: `You are an expert startup advisor and strategic consultant. Your goal is to analyze the provided startup data and offer actionable strategic insights and recommendations to help the founder make informed decisions and focus on critical areas for growth and stability.

Here is the current data for the startup:
Startup Name: {{{startupName}}}
Industry: {{{industry}}}
Stage: {{{stage}}}
Cash Runway: {{{cashRunwayMonths}}} months
Current Monthly Revenue: {{{currentRevenueMonthly}}} USD
Team Size: {{{teamSize}}} people
Active Projects: {{{activeProjectsCount}}}

Recent Challenges:
{{{recentChallenges}}}

Current Goals:
{{{currentGoals}}}

Based on this information, provide:
1.  **Strategic Insights**: A concise summary of the startup's current position, strengths, weaknesses, and potential opportunities.
2.  **Key Recommendations**: Specific, actionable steps the founder can take to address challenges, achieve goals, and improve overall health.
3.  **Critical Areas to Focus**: Identify 2-3 most critical areas that require immediate attention.
4.  **Overall Sentiment Analysis**: A brief assessment of the startup's current sentiment (e.g., 'Positive', 'Neutral', 'Needs Improvement', 'Urgent Action Required').

Ensure your response is structured clearly and directly addresses the output schema requirements.`,
});

const aiStrategicInsightGeneratorFlow = ai.defineFlow(
  {
    name: 'aiStrategicInsightGeneratorFlow',
    inputSchema: GenerateStrategicInsightsInputSchema,
    outputSchema: GenerateStrategicInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
