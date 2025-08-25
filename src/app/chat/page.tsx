'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/chat-interface';
import UploadForm from '@/components/upload-form';
import { Loader2, FileText, Plus, Trash2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchDocs(currentUser.uid);
      } else {
        await signInAnonymously(auth);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchDocs = async (userId: string) => {
    try {
      const docsCollectionRef = collection(db, 'users', userId, 'docs');
      const querySnapshot = await getDocs(docsCollectionRef);
      const allDocs: PDFDoc[] = querySnapshot.docs.map(docSnap => docSnap.data() as PDFDoc);
      setDocs(allDocs);

      if (allDocs.length > 0) {
        const storedActiveId = localStorage.getItem('activePdfId');
        if (storedActiveId && allDocs.some(d => d.id === storedActiveId)) {
          setActiveDocId(storedActiveId);
        } else {
          setActiveDocId(allDocs[0].id);
          localStorage.setItem('activePdfId', allDocs[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch docs from Firestore", error);
    }
  };
  
  const handleUploadSuccess = async (newDoc: PDFDoc) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'docs', newDoc.id);
    await setDoc(docRef, newDoc);

    const updatedDocs = [...docs, newDoc];
    setDocs(updatedDocs);
    setActiveDocId(newDoc.id);
    localStorage.setItem('activePdfId', newDoc.id);
  };
  
  const handleSelectDoc = (docId: string) => {
    setActiveDocId(docId);
    localStorage.setItem('activePdfId', docId);
  };
  
  const updateMessages = async (docId: string, messages: Message[]) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'docs', docId);
    await setDoc(docRef, { messages }, { merge: true });
    
    const newDocs = docs.map(d => 
      d.id === docId ? { ...d, messages } : d
    );
    setDocs(newDocs);
  };

  const handleClearAllData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
        const docsCollectionRef = collection(db, 'users', user.uid, 'docs');
        const querySnapshot = await getDocs(docsCollectionRef);
        
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        setDocs([]);
        setActiveDocId(null);
        localStorage.removeItem('activePdfId');
    } catch (error) {
        console.error("Error clearing all data: ", error);
    }
    setIsLoading(false);
  };

  const activeDoc = docs.find(d => d.id === activeDocId);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (docs.length === 0) {
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
  
  if (!activeDoc) {
    // This can happen briefly when docs are loaded but activeDocId is not yet set.
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="mt-auto space-y-2 border-t pt-4">
         <UploadForm onUploadSuccess={handleUploadSuccess} existingDocs={docs}>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" /> Upload New PDF
            </Button>
         </UploadForm>
          <Button variant="destructive" onClick={handleClearAllData} className="w-full justify-start">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
          </Button>
        </div>
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
              onNewMessages={(messages) => {
                 updateMessages(activeDoc.id, messages);
              }}
              onClearAllData={handleClearAllData}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
