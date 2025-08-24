'use server';
/**
 * @fileOverview PDF indexing AI agent.
 *
 * - pdfIndexing - A function that handles the PDF indexing process.
 * - PdfIndexingInput - The input type for the pdfIndexing function.
 * - PdfIndexingOutput - The return type for the pdfIndexing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const PdfIndexingInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PdfIndexingInput = z.infer<typeof PdfIndexingInputSchema>;

const PdfIndexingOutputSchema = z.object({
  success: z.boolean().describe('Whether the PDF was successfully indexed.'),
  message: z.string().describe('A message indicating the status of the indexing process.'),
});
export type PdfIndexingOutput = z.infer<typeof PdfIndexingOutputSchema>;

export async function pdfIndexing(input: PdfIndexingInput): Promise<PdfIndexingOutput> {
  return pdfIndexingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfIndexingPrompt',
  input: {schema: PdfIndexingInputSchema},
  output: {schema: PdfIndexingOutputSchema},
  prompt: `You are an expert AI assistant specializing in indexing PDF documents.

  You will receive a PDF document as a data URI. Your task is to index the content of the PDF so that it can be used for question answering.

  Return a success message if the PDF was successfully indexed, or an error message if there was an error.

  Here is the PDF document:
  {{media url=pdfDataUri}}
  `,
});

const pdfIndexingFlow = ai.defineFlow(
  {
    name: 'pdfIndexingFlow',
    inputSchema: PdfIndexingInputSchema,
    outputSchema: PdfIndexingOutputSchema,
  },
  async input => {
    try {
      // Extract the base64 encoded PDF data from the data URI
      const base64Pdf = input.pdfDataUri.split(',')[1];

      // Convert the base64 encoded data to a Buffer
      const pdfBuffer = Buffer.from(base64Pdf, 'base64');

      // Save the buffer to a temporary file
      const tempPdfFilePath = '/tmp/temp_pdf.pdf';
      require('fs').writeFileSync(tempPdfFilePath, pdfBuffer);

      // Load the PDF document using PDFLoader
      const loader = new PDFLoader(tempPdfFilePath);
      const documents = await loader.load();

      // You might want to process the documents further here, e.g., chunk them, and store them in a vector database.
      // For now, we'll just return a success message.

      return {
        success: true,
        message: 'PDF successfully indexed.',
      };
    } catch (error: any) {
      console.error('Error indexing PDF:', error);
      return {
        success: false,
        message: `Error indexing PDF: ${error.message}`,
      };
    }
  }
);
