import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BrainCircuit, Search, ArrowRight, Zap, Lightbulb, Users, Rocket, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">PDF Query</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-primary">
              How It Works
            </Link>
          </nav>
          <Button asChild className="md:hidden" variant="outline" size="sm">
             <Link href="/chat">
              Get Started
             </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Unlock Insights from Your Documents Instantly
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                  Simply upload your PDF and start asking questions. Our AI-powered tool extracts information and gives you immediate, accurate answers.
                </p>
                <div className="w-full max-w-md mx-auto lg:mx-0">
                   <div className="flex justify-center lg:justify-start pt-4">
                     <Button asChild size="lg" className="w-full sm:w-auto shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-shadow duration-300 hover:shadow-2xl">
                       <Link href="/chat">
                         Get Started for Free
                         <ArrowRight className="ml-2 h-5 w-5" />
                       </Link>
                     </Button>
                   </div>
              </div>
              </div>
              <div className="hidden lg:flex items-center justify-center relative">
                 <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <img
                  src="https://placehold.co/600x400.png"
                  alt="Abstract representation of document analysis"
                  width="600"
                  height="400"
                  className="rounded-xl shadow-2xl z-10"
                  data-ai-hint="document analysis abstract"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="w-full py-12 md:py-20 bg-primary/5">
           <div className="container px-4 md:px-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">99.7%</div>
                <p className="text-muted-foreground mt-2">Accuracy Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">&lt;3s</div>
                <p className="text-muted-foreground mt-2">Processing Time</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">50+</div>
                <p className="text-muted-foreground mt-2">Languages Supported</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">20MB</div>
                <p className="text-muted-foreground mt-2">Max File Size</p>
              </div>
            </div>
          </div>
        </section>


        <section id="features" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">
              How it Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">1. Upload PDF</h3>
                  <p className="text-muted-foreground">
                    Simply drag and drop or select your PDF file. We support files up to 20MB.
                  </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                  <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">2. AI Analysis</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI processes and understands your document's content in seconds.
                  </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                   <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                    <MessageSquareText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">3. Ask Questions</h3>
                  <p className="text-muted-foreground">
                    Chat with your document! Ask any question and get accurate answers instantly.
                  </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-2xl text-center space-y-6 px-4 md:px-6">
            <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-full w-fit mx-auto">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Ready to get started?</h2>
            <p className="text-muted-foreground text-lg">
              Upload your first PDF and experience the power of AI-driven document analysis.
            </p>
            <Button 
              size="lg" 
              asChild
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg px-8 py-3 transform transition-transform duration-300 hover:scale-105"
            >
              <Link href="/chat">
                Upload PDF Now
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border/50 py-8 px-4 bg-primary/5">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 PDF Query. Powered by advanced AI technology.</p>
        </div>
      </footer>
    </div>
  );
}
