'use client';

import { useState, useRef, ReactNode } from 'react';
import { Loader2, UploadCloud, Terminal } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PDFDoc } from '@/app/chat/page';
import { cn } from '@/lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadFormProps {
  onUploadSuccess: (newDoc: PDFDoc) => void;
  existingDocs: PDFDoc[];
  children?: ReactNode;
}

export default function UploadForm({ onUploadSuccess, existingDocs, children }: UploadFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if(isUploading || children) return;
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input to allow uploading the same file again
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    

    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 20MB. Please upload a smaller file.');
      return;
    }
    
    if (existingDocs.some(doc => doc.name === file.name)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate File',
        description: `A file named "${file.name}" has already been uploaded.`,
      });
      return;
    }

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const dataUriReader = new FileReader();
      dataUriReader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
          const typedArray = new Uint8Array(arrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += pageText + '\n\n';
          }
          
          const newDoc: PDFDoc = {
            id: `${file.name}-${new Date().toISOString()}`,
            name: file.name,
            text: fullText,
            dataUri: dataUri,
            messages: [],
          };
          
          toast({
            title: "Upload Successful!",
            description: `Successfully processed "${file.name}".`,
          });
          
          onUploadSuccess(newDoc);

        } catch (parseError) {
          console.error('Error parsing PDF:', parseError);
          setError('Could not read the PDF file. It might be corrupted or protected.');
        } finally {
          setIsUploading(false);
        }
      };
      dataUriReader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during file processing.');
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (children) {
    return (
      <div onClick={handleButtonClick} className="w-full">
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="application/pdf"
          disabled={isUploading}
        />
        {isUploading ? (
          <Button variant="outline" className="w-full justify-start" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
          </Button>
        ) : (
          children
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4 text-center">
      <div 
        className={cn(
          "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg border-primary/50 transition-colors duration-300",
          !children && "cursor-pointer hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="application/pdf"
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
            <p className="font-semibold text-foreground">Processing PDF...</p>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-12 h-12 mb-4 text-primary" />
            <p className="mb-2 text-sm text-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF (MAX. 20MB)</p>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="w-full text-left">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
