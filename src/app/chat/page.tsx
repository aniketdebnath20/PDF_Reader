'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/chat-interface';
import UploadForm from '@/components/upload-form';
import { Loader2, FileText, Plus } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface PDFDoc {
  id: string;
  name: string;
  dataUri: string;
  text: string;
  messages: Message[];
}

export interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
}

export default function ChatPage() {
  const [docs, setDocs] = useState<PDFDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('pdfDocs');
      const allDocs: PDFDoc[] = storedDocs ? JSON.parse(storedDocs) : [];
      setDocs(allDocs);

      const storedActiveId = localStorage.getItem('activePdfId');
      if (storedActiveId && allDocs.some(d => d.id === storedActiveId)) {
        setActiveDocId(storedActiveId);
      } else if (allDocs.length > 0) {
        const newActiveId = allDocs[0].id;
        setActiveDocId(newActiveId);
        localStorage.setItem('activePdfId', newActiveId);
      }
    } catch (error) {
        console.error("Failed to parse docs from localStorage", error);
        localStorage.removeItem('pdfDocs');
        localStorage.removeItem('activePdfId');
    }
    setIsLoading(false);
  }, []);

  const handleUploadSuccess = (newDoc: PDFDoc) => {
    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);
    setActiveDocId(newDoc.id);
    localStorage.setItem('pdfDocs', JSON.stringify(updatedDocs));
    localStorage.setItem('activePdfId', newDoc.id);
  };
  
  const handleSelectDoc = (docId: string) => {
    setActiveDocId(docId);
    localStorage.setItem('activePdfId', docId);
  };

  const updateMessages = (docId: string, updater: (messages: Message[]) => Message[]) => {
    const newDocs = docs.map(d => 
      d.id === docId ? { ...d, messages: updater(d.messages) } : d
    );
    setDocs(newDocs);
    localStorage.setItem('pdfDocs', JSON.stringify(newDocs));
  }
  
  const activeDoc = docs.find(d => d.id === activeDocId);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (docs.length === 0 || !activeDoc) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
           <div className="rounded-xl border bg-card p-8 shadow-lg">
              <h1 className="mb-4 text-center font-headline text-3xl font-bold">
                Upload Your PDF
              </h1>
              <p className="mb-8 text-center text-muted-foreground">
                First, upload the document you want to chat with.
              </p>
              <UploadForm onUploadSuccess={handleUploadSuccess} existingDocs={docs} />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full bg-card">
      <aside className="hidden md:flex flex-col w-80 border-r bg-background p-4 space-y-4">
         <Link href="/" className="flex items-center gap-2 p-2">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-xl">PDF Query</h2>
          </Link>
        <div className='flex-1 space-y-2 overflow-y-auto'>
           {docs.map(doc => (
            <Button
              key={doc.id}
              variant={doc.id === activeDocId ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => handleSelectDoc(doc.id)}
            >
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className='truncate break-all'>{doc.name}</span>
            </Button>
          ))}
        </div>
         <UploadForm onUploadSuccess={handleUploadSuccess} existingDocs={docs}>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" /> Upload New PDF
            </Button>
         </UploadForm>
      </aside>

      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="h-dvh w-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full w-full overflow-hidden">
              <embed
                src={activeDoc.dataUri}
                type="application/pdf"
                className="h-full w-full"
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatInterface 
              doc={activeDoc} 
              allDocs={docs}
              onSelectDoc={handleSelectDoc}
              onUploadSuccess={handleUploadSuccess}
              onNewMessage={(message) => {
                updateMessages(activeDoc.id, (messages) => [...messages, message]);
              }}
              onAIMessageComplete={(messages) => {
                 updateMessages(activeDoc.id, () => messages);
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
