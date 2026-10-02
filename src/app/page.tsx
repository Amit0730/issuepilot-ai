import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code2 as Github, LayoutDashboard, Brain, GitPullRequestDraft, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            <span className="text-xl font-bold">IssuePilot AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#features" className="text-sm font-medium hover:underline">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">How it Works</Link>
            <Link href="/app">
              <Button size="sm">Go to App</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">Open Source & Free</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Turn messy GitHub issues into <br className="hidden md:block" />
              <span className="text-primary">actionable tickets.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              AI-assisted triage for developers and open-source maintainers. Automatically categorize, summarize, and prioritize issues in seconds.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="gap-2">
                  Analyze an Issue <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/Amit0730/issuepilot-ai" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <Github className="h-4 w-4" /> View on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Supercharge your triage workflow</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AI Classification</CardTitle>
                  <CardDescription>Automatically determine issue type, priority, and severity using advanced LLMs.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Sparkles className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Smart Summaries</CardTitle>
                  <CardDescription>Get a concise summary of the problem, expected behavior, and impact.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <GitPullRequestDraft className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Maintainer Drafts</CardTitle>
                  <CardDescription>Generate polite, professional responses to request missing info from reporters.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-3xl font-bold mb-4">Secure & Privacy-Focused</h2>
            <p className="text-lg text-muted-foreground mb-4">
              IssuePilot AI operates strictly in a read-only manner. We never modify your issues, post comments automatically, or require invasive permissions.
            </p>
            <p className="text-lg text-muted-foreground">
              Your API keys are processed on the server and never exposed to the client.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} IssuePilot AI. Open source developer tool.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="https://github.com/Amit0730/issuepilot-ai" className="hover:text-foreground">GitHub</Link>
            <Link href="/app" className="hover:text-foreground">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className} ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {children}
    </span>
  );
}
