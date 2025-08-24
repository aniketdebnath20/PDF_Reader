'use server';

/**
 * @fileOverview Implements the AI-powered chat interface flow.
 *
 * - aiChatInterface - A function that handles the chat interface with the AI.
 * - AIChatInterfaceInput - The input type for the aiChatInterface function.
 * - AIChatInterfaceOutput - The return type for the aiChatInterface function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatInterfaceInputSchema = z.object({
  pdfContent: z.string().describe('The extracted content of the uploaded PDF file.'),
  userQuestion: z.string().describe('The user question about the PDF content.'),
});
export type AIChatInterfaceInput = z.infer<typeof AIChatInterfaceInputSchema>;

const AIChatInterfaceOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user question based on the PDF content.'),
});
export type AIChatInterfaceOutput = z.infer<typeof AIChatInterfaceOutputSchema>;

export async function aiChatInterface(input: AIChatInterfaceInput): Promise<AIChatInterfaceOutput> {
  return aiChatInterfaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatInterfacePrompt',
  input: {schema: AIChatInterfaceInputSchema},
  output: {schema: AIChatInterfaceOutputSchema},
  prompt: `You are an AI assistant that answers questions based on the content of a PDF document.
  Your answers should be concise and directly related to the information provided in the PDF content.
  Do not provide information that is not present in the PDF content.

  PDF Content: {{{pdfContent}}}

  User Question: {{{userQuestion}}}

  Answer:`,
});

const aiChatInterfaceFlow = ai.defineFlow(
  {
    name: 'aiChatInterfaceFlow',
    inputSchema: AIChatInterfaceInputSchema,
    outputSchema: AIChatInterfaceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
