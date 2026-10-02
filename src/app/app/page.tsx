"use client";

import { useState } from "react";
import { parseGithubUrl, fetchGithubIssue, GithubIssue } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Code2 as Github, Loader2, AlertCircle, Copy, CheckCircle2, XCircle, FileText, Download } from "lucide-react";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loadingIssue, setLoadingIssue] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [issue, setIssue] = useState<GithubIssue | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const [otherIssuesText, setOtherIssuesText] = useState("");
  const [loadingDuplicate, setLoadingDuplicate] = useState(false);
  const [duplicates, setDuplicates] = useState<any>(null);

  const handleFetch = async () => {
    if (!url) {
      toast.error("Please enter a GitHub Issue URL");
      return;
    }

    const parsed = parseGithubUrl(url);
    if (!parsed) {
      toast.error("Invalid GitHub Issue URL. Must be like https://github.com/owner/repo/issues/123");
      return;
    }

    setLoadingIssue(true);
    setIssue(null);
    setAnalysis(null);
    setDuplicates(null);
    try {
      const data = await fetchGithubIssue(parsed.owner, parsed.repo, parsed.issueNumber);
      setIssue(data);
      toast.success("Issue fetched successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch issue.");
    } finally {
      setLoadingIssue(false);
    }
  };

  const handleAnalyze = async () => {
    if (!issue) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle: issue.title,
          issueBody: issue.body,
          issueLabels: issue.labels.map((l) => l.name),
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze");
      }

      const data = await res.json();
      setAnalysis(data);
      toast.success("AI Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to run AI analysis.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDuplicateCheck = async () => {
    if (!issue || !otherIssuesText) return;
    setLoadingDuplicate(true);
    try {
      const res = await fetch("/api/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle: issue.title,
          issueBody: issue.body,
          otherIssues: otherIssuesText,
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze duplicates");
      }

      const data = await res.json();
      setDuplicates(data.similarIssues);
      toast.success("Duplicate check complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to check duplicates.");
    } finally {
      setLoadingDuplicate(false);
    }
  };

  const exportMarkdown = () => {
    if (!issue || !analysis) return;
    const md = `# IssuePilot AI Analysis: ${issue.title} (#${issue.number})
**URL**: ${issue.html_url}
**Type**: ${analysis.type}
**Priority**: ${analysis.priority}
**Severity**: ${analysis.severity}
**Completeness Score**: ${analysis.completenessScore}/100

## Summary
**Problem**: ${analysis.summary?.problem}
**Expected**: ${analysis.summary?.expected}
**Impact**: ${analysis.summary?.impact}
**Evidence**: ${analysis.summary?.evidence}

## Suggested Labels
${analysis.labels?.map((l: any) => `- **${l.name}**: ${l.reason}`).join("\n")}

## Missing Information
- Steps to Reproduce: ${analysis.missingInfo?.stepsToReproduce ? "✅" : "❌"}
- Expected Behavior: ${analysis.missingInfo?.expectedBehavior ? "✅" : "❌"}
- Actual Behavior: ${analysis.missingInfo?.actualBehavior ? "✅" : "❌"}
- Environment: ${analysis.missingInfo?.environment ? "✅" : "❌"}
- Logs/Screenshots: ${analysis.missingInfo?.logsOrScreenshots ? "✅" : "❌"}

## Suggested Maintainer Response
${analysis.maintainerResponse}
`;
    navigator.clipboard.writeText(md);
    toast.success("Markdown copied to clipboard!");
  };

  const exportJson = () => {
    if (!analysis) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "issue-analysis.json");
    dlAnchorElem.click();
  };

  return (
    <div className="flex flex-col min-h-screen pb-10">
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Github className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">IssuePilot Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
           <Input 
             type="password" 
             placeholder="Gemini API Key (Optional)" 
             value={apiKey} 
             onChange={(e) => setApiKey(e.target.value)}
             className="w-64 text-sm h-8"
           />
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Input and Issue Details */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fetch Issue</CardTitle>
              <CardDescription>Enter a GitHub issue URL to begin triage.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input 
                placeholder="https://github.com/owner/repo/issues/123" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
              <Button onClick={handleFetch} disabled={loadingIssue} className="w-full">
                {loadingIssue ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Github className="h-4 w-4 mr-2" />}
                Fetch GitHub Issue
              </Button>
            </CardContent>
          </Card>

          {issue && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg leading-tight">{issue.title}</CardTitle>
                  <a href={issue.html_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">#{issue.number}</a>
                </div>
                <CardDescription>
                  Reported by <span className="font-semibold">{issue.user.login}</span> • {new Date(issue.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>{issue.state}</Badge>
                  <Badge variant="outline">{issue.comments} comments</Badge>
                  {issue.labels.map(l => (
                    <Badge key={l.name} style={{backgroundColor: `#${l.color}20`, color: `#${l.color}`, borderColor: `#${l.color}`}} variant="outline">
                      {l.name}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm bg-muted/50 p-4 rounded-md max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {issue.body || "No description provided."}
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={loadingAi} 
                  className="w-full mt-4" 
                  variant="default"
                >
                  {loadingAi ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate AI Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          {!issue && !loadingIssue && (
            <div className="h-full border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/10 p-12 text-center">
              <div>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fetch a GitHub issue to view triage details.</p>
              </div>
            </div>
          )}

          {loadingAi && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {analysis && !loadingAi && (
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">AI Analysis Results</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportMarkdown}>
                    <Copy className="h-4 w-4 mr-2" /> Markdown
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportJson}>
                    <Download className="h-4 w-4 mr-2" /> JSON
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Type</CardTitle></CardHeader>
                  <CardContent className="text-lg font-semibold">{analysis.type}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Priority</CardTitle></CardHeader>
                  <CardContent className="text-lg font-semibold">{analysis.priority}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Severity</CardTitle></CardHeader>
                  <CardContent className="text-lg font-semibold">{analysis.severity}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Health Score</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">{analysis.completenessScore}/100</span>
                    </div>
                    <Progress value={analysis.completenessScore} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="labels">Labels</TabsTrigger>
                  <TabsTrigger value="missing">Missing Info</TabsTrigger>
                  <TabsTrigger value="duplicate">Duplicate Check</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle>Issue Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div><strong className="text-foreground">Problem:</strong> <span className="text-muted-foreground">{analysis.summary?.problem}</span></div>
                      <div><strong className="text-foreground">Expected:</strong> <span className="text-muted-foreground">{analysis.summary?.expected}</span></div>
                      <div><strong className="text-foreground">Impact:</strong> <span className="text-muted-foreground">{analysis.summary?.impact}</span></div>
                      <div><strong className="text-foreground">Evidence:</strong> <span className="text-muted-foreground">{analysis.summary?.evidence}</span></div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-4">
                    <CardHeader><CardTitle>Suggested Response</CardTitle><CardDescription>Copy this to request more info politely.</CardDescription></CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                        {analysis.maintainerResponse}
                      </div>
                      <Button variant="secondary" size="sm" className="mt-4" onClick={() => {
                        navigator.clipboard.writeText(analysis.maintainerResponse);
                        toast.success("Copied to clipboard");
                      }}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Response
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="labels" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle>Suggested Labels</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.labels?.map((label: any, i: number) => (
                          <div key={i} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              <Badge>{label.name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{label.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="missing" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle>Missing Information Checklist</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <ChecklistItem label="Steps to Reproduce" checked={analysis.missingInfo?.stepsToReproduce} />
                        <ChecklistItem label="Expected Behavior" checked={analysis.missingInfo?.expectedBehavior} />
                        <ChecklistItem label="Actual Behavior" checked={analysis.missingInfo?.actualBehavior} />
                        <ChecklistItem label="Environment / Version" checked={analysis.missingInfo?.environment} />
                        <ChecklistItem label="Logs or Screenshots" checked={analysis.missingInfo?.logsOrScreenshots} />
                      </div>
                      <div className="mt-6 text-sm text-muted-foreground border-t pt-4">
                        <strong>Completeness Reasoning: </strong> {analysis.completenessReason}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="duplicate" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Duplicate Detection</CardTitle>
                      <CardDescription>Paste existing issue titles/bodies below to check for similarities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        placeholder="Paste existing issues here..." 
                        className="min-h-[150px]"
                        value={otherIssuesText}
                        onChange={(e) => setOtherIssuesText(e.target.value)}
                      />
                      <Button onClick={handleDuplicateCheck} disabled={loadingDuplicate || !otherIssuesText}>
                        {loadingDuplicate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Check Similarity
                      </Button>

                      {duplicates && (
                        <div className="mt-6 space-y-4">
                          <h3 className="font-semibold text-lg">Results</h3>
                          <Accordion className="w-full">
                            {duplicates.map((dup: any, i: number) => (
                              <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Badge variant={dup.possibleDuplicate ? "destructive" : "secondary"}>
                                      {dup.similarityEstimate} Match
                                    </Badge>
                                    <span className="font-medium text-sm">{dup.title}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm space-y-2 text-muted-foreground">
                                  <p><strong>Why similar:</strong> {dup.whySimilar}</p>
                                  <p><strong>Differences:</strong> {dup.differences}</p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                          <p className="text-xs text-muted-foreground">
                            * Similarity does not guarantee issues are duplicates. Human review required.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
