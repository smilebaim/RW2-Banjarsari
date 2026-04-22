'use server';
/**
 * @fileOverview A Genkit flow for summarizing news articles and announcements for residents.
 *
 * - summarizeNews - A function that summarizes a given news article or announcement.
 * - SummarizeNewsInput - The input type for the summarizeNews function.
 * - SummarizeNewsOutput - The return type for the summarizeNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeNewsInputSchema = z.object({
  newsArticle: z.string().describe('The full text of the news article or announcement to be summarized.'),
});
export type SummarizeNewsInput = z.infer<typeof SummarizeNewsInputSchema>;

const SummarizeNewsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided news article or announcement in Indonesian.'),
});
export type SummarizeNewsOutput = z.infer<typeof SummarizeNewsOutputSchema>;

const summarizeNewsPrompt = ai.definePrompt({
  name: 'summarizeNewsPrompt',
  input: { schema: SummarizeNewsInputSchema },
  output: { schema: SummarizeNewsOutputSchema },
  prompt: `You are an expert summarization AI. Your task is to provide a concise summary of the given news article or announcement.
Focus on the main points and key information, ensuring the summary is easy to understand for residents.

News Article:
{{{newsArticle}}}

Please provide a summary in Indonesian.`,
});

const summarizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeNewsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary.');
    }
    return output;
  }
);

export async function summarizeNews(input: SummarizeNewsInput): Promise<SummarizeNewsOutput> {
  return summarizeNewsFlow(input);
}
