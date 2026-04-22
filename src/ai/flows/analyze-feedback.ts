'use server';
/**
 * @fileOverview A Genkit flow for analyzing resident feedback and reports.
 *
 * - analyzeFeedback - A function that handles the analysis of resident feedback.
 * - AnalyzeFeedbackInput - The input type for the analyzeFeedback function.
 * - AnalyzeFeedbackOutput - The return type for the analyzeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFeedbackInputSchema = z.object({
  feedbackText: z
    .string()
    .describe('The resident feedback or report text to be analyzed.'),
});
export type AnalyzeFeedbackInput = z.infer<typeof AnalyzeFeedbackInputSchema>;

const AnalyzeFeedbackOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the resident feedback.'),
  themes: z
    .array(z.string())
    .describe('An array of common themes identified in the feedback.'),
  sentiment: z
    .enum(['positive', 'negative', 'neutral', 'mixed'])
    .describe('The overall sentiment of the feedback (positive, negative, neutral, or mixed).'),
  urgentIssues: z
    .array(z.string())
    .describe('An array of urgent issues identified in the feedback that require immediate attention.'),
});
export type AnalyzeFeedbackOutput = z.infer<typeof AnalyzeFeedbackOutputSchema>;

export async function analyzeFeedback(
  input: AnalyzeFeedbackInput
): Promise<AnalyzeFeedbackOutput> {
  return analyzeFeedbackFlow(input);
}

const analyzeFeedbackPrompt = ai.definePrompt({
  name: 'analyzeFeedbackPrompt',
  input: {schema: AnalyzeFeedbackInputSchema},
  output: {schema: AnalyzeFeedbackOutputSchema},
  prompt: `You are an AI assistant designed to help RW management analyze resident feedback. Your task is to review the provided feedback, identify its core themes, determine the overall sentiment, and highlight any urgent issues that require immediate attention. Provide a concise summary of the feedback.

Resident Feedback:
{{{feedbackText}}}`,
});

const analyzeFeedbackFlow = ai.defineFlow(
  {
    name: 'analyzeFeedbackFlow',
    inputSchema: AnalyzeFeedbackInputSchema,
    outputSchema: AnalyzeFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeFeedbackPrompt(input);
    return output!;
  }
);
