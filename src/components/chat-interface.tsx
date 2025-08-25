'use client';

import { aiChatInterface } from '@/ai/flows/ai-chat-interface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, FileText, Menu, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { PDFDoc, Message } from '@/app/chat/page';
import UploadForm from './upload-form';

interface ChatInterfaceProps {
  doc: PDFDoc;
  allDocs: PDFDoc[];
  onSelectDoc: (docId: string) => void;
  onUploadSuccess: (newDoc: PDFDoc) => void;
  onNewMessages: (messages: Message[]) => void;
  onClearAllData: () => void;
}

export default function ChatInterface({ 
  doc, 
  allDocs,
  onSelectDoc,
  onUploadSuccess,
  onNewMessages,
  onClearAllData
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(doc.messages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the document changes, update the messages
    setMessages(doc.messages);
  }, [doc]);

  useEffect(() => {
    // When a new document is selected, add initial AI message if chat is empty
    if (doc && doc.messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now(),
        type: 'ai',
        text: `Hello! I've finished reading "${doc.name}". What would you like to know?`,
      };
      const updatedMessages = [initialMessage];
      setMessages(updatedMessages);
      onNewMessages(updatedMessages); // Persist the initial message
    }
  }, [doc, onNewMessages]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !doc.text) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); // Optimistic update
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await aiChatInterface({
        pdfContent: doc.text,
        userQuestion: inputValue,
      });

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        text: result.answer,
      };
      
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      onNewMessages(finalMessages);

    } catch (error) {
      console.error('Error with AI chat interface:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Sorry, I encountered an error and could not process your request.',
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      onNewMessages(finalMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleMobileClearData = () => {
      onClearAllData();
      setIsSheetOpen(false);
  }

  const handleMobileUploadSuccess = (newDoc: PDFDoc) => {
    onUploadSuccess(newDoc);
    setIsSheetOpen(false); // Close sheet after successful upload
  };

  const handleMobileSelectDoc = (docId: string) => {
    onSelectDoc(docId);
    setIsSheetOpen(false); // Close sheet after selection
  }

  const SidebarContent = () => (
     <div className="w-full flex-col bg-card flex h-full">
         <SheetHeader className="p-4 border-b">
           <SheetTitle className="sr-only">Documents</SheetTitle>
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">PDF Query</span>
            </Link>
         </SheetHeader>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
           {allDocs.map(d => (
            <Button
              key={d.id}
              variant={d.id === doc.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => handleMobileSelectDoc(d.id)}
            >
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className='truncate break-all'>{d.name}</span>
            </Button>
          ))}
        </div>
        <div className="mt-auto space-y-2 p-4 border-t">
          <UploadForm onUploadSuccess={handleMobileUploadSuccess} existingDocs={allDocs}>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Upload New PDF
              </Button>
          </UploadForm>
          <Button variant="destructive" onClick={handleMobileClearData} className="w-full justify-start">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
          </Button>
        </div>
      </div>
  )
  
  return (
    <div className="flex h-dvh bg-background text-foreground">
      <main className="flex flex-1 flex-col">
         <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
            <Link href="/" className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-bold">PDF Query</span>
            </Link>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm p-0">
                   <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
            <div className="p-4 md:p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarFallback className='bg-primary text-primary-foreground'>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs rounded-xl px-4 py-3 shadow-md md:max-w-md lg:max-w-2xl ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                   {message.type === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarFallback className='bg-primary text-primary-foreground'>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs rounded-xl px-4 py-3 bg-card border shadow-md flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
        </div>

        <div className="border-t border-border bg-background/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about the PDF..."
              className="pr-12 h-12 rounded-full shadow-sm"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4 text-primary-foreground" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
