'use server';

/**
 * @fileOverview A flow to generate the winning percentage for each team in a cricket match using AI.
 *
 * - generateWinningPercentage - A function that generates the winning percentage for each team.
 * - GenerateWinningPercentageInput - The input type for the generateWinningPercentage function.
 * - GenerateWinningPercentageOutput - The return type for the generateWinningPercentage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWinningPercentageInputSchema = z.object({
  team1Name: z.string().describe('The name of the first team.'),
  team2Name: z.string().describe('The name of the second team.'),
  matchConditions: z.string().describe('The current conditions of the match.'),
  playerStatistics: z.string().describe('Aggregated statistics of all players participating in the match.'),
});
export type GenerateWinningPercentageInput = z.infer<
  typeof GenerateWinningPercentageInputSchema
>;

const GenerateWinningPercentageOutputSchema = z.object({
  team1WinPercentage: z
    .number()
    .describe('The AI-generated winning percentage for the first team.'),
  team2WinPercentage: z
    .number()
    .describe('The AI-generated winning percentage for the second team.'),
  rationale: z
    .string()
    .describe('The rationale behind the predicted winning percentages.'),
});
export type GenerateWinningPercentageOutput = z.infer<
  typeof GenerateWinningPercentageOutputSchema
>;

export async function generateWinningPercentage(
  input: GenerateWinningPercentageInput
): Promise<GenerateWinningPercentageOutput> {
  return generateWinningPercentageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWinningPercentagePrompt',
  input: {schema: GenerateWinningPercentageInputSchema},
  output: {schema: GenerateWinningPercentageOutputSchema},
  prompt: `You are an expert cricket match forecaster. Given the following information about a cricket match, determine the winning percentage for each team.

Team 1: {{{team1Name}}}
Team 2: {{{team2Name}}}
Match Conditions: {{{matchConditions}}}
Player Statistics: {{{playerStatistics}}}

Consider all factors and provide a rationale for your prediction. The winning percentages must add up to 100. Respond in JSON format.`,
});

const generateWinningPercentageFlow = ai.defineFlow(
  {
    name: 'generateWinningPercentageFlow',
    inputSchema: GenerateWinningPercentageInputSchema,
    outputSchema: GenerateWinningPercentageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
