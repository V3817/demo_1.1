"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UrlInput } from "@/components/url-input";
import { Badge } from "@/components/ui/badge";
import { DownloadReportButton } from "@/components/download-button";
import { ArrowRight, Globe, History, Sparkles, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocalHistory } from "@/hooks/use-local-history";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { ScrapeDataSchema, AnalyzeSchema, RedesignSchema, RoadmapSchema } from "@/lib/schemas";

// Derive types from Zod schemas
type ScrapeData = z.infer<typeof ScrapeDataSchema>;
type AnalysisResult = z.infer<typeof AnalyzeSchema>;
type RedesignResult = z.infer<typeof RedesignSchema>;
type RoadmapResult = z.infer<typeof RoadmapSchema>;
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AuditResults } from "@/components/audit-results";
import { RedesignView } from "@/components/redesign-view";
import { RoadmapView } from "@/components/roadmap-view";
import { motion } from "framer-motion";
// import specific components if needed, or stick to basic UI for MVP

export function DashboardContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");

    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SCRAPING" | "ANALYZING" | "GENERATING" | "COMPLETE">("IDLE");
    const [data, setData] = useState<ScrapeData | null>(null); // Scraped Data
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [redesign, setRedesign] = useState<RedesignResult | null>(null);
    const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleRetryWithKey = () => {
        if (apiKey) {
            localStorage.setItem("webrev_groq_key", apiKey);
            setStatus("IDLE");
            setRetryCount(prev => prev + 1);
        }
    };

    // API KEY Handling
    const [apiKey, setApiKey] = useState<string | null>(null);
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("webrev_groq_key");
        if (stored) setApiKey(stored);
    }, []);

    useEffect(() => {
        if (!mounted || !url) return;

        const fetchData = async () => {
            setStatus("SCRAPING");
            setError(null);

            try {
                // 1. Scrape
                const scrapeRes = await fetch('/api/scrape', {
                    method: 'POST',
                    body: JSON.stringify({ url }),
                });
                if (!scrapeRes.ok) throw new Error('Scraping failed');
                const scrapeData = await scrapeRes.json();
                setData(scrapeData);

                // 2. Analyze & Generate (Parallel)
                setStatus("ANALYZING");

                // Prepare Headers (API Key Override)
                // Use the key from local storage to ensure fresh read or use state if preferred
                const localApiKey = localStorage.getItem("webrev_groq_key");
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (localApiKey) headers['x-groq-api-key'] = localApiKey;

                const results = await Promise.allSettled([
                    fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ data: scrapeData }), headers }),
                    fetch('/api/redesign', { method: 'POST', body: JSON.stringify({ data: scrapeData }), headers }),
                    fetch('/api/roadmap', { method: 'POST', body: JSON.stringify({ data: scrapeData }), headers })
                ]);

                const analyzeResult = results[0];
                const redesignResult = results[1];
                const roadmapResult = results[2];

                let analyzeData: AnalysisResult | null = null;

                // Handle Analyze Result
                if (analyzeResult.status === 'fulfilled' && analyzeResult.value.ok) {
                    analyzeData = await analyzeResult.value.json();
                    setAnalysis(analyzeData);
                } else {
                    const status = analyzeResult.status === 'fulfilled' ? analyzeResult.value.status : 500;
                    if (status === 429) {
                        throw new Error("AI Quota Exceeded. Please wait a few minutes and try again.");
                    }
                    if (status === 401) {
                        // Do not clear key automatically, let user retry
                        throw new Error("Invalid API Key. Please check your key and try again.");
                    }
                    const msg = analyzeResult.status === 'fulfilled' ? await analyzeResult.value.text() : analyzeResult.reason;
                    throw new Error(`Analysis failed: ${msg}`);
                }

                // Handle Redesign Result
                if (redesignResult.status === 'fulfilled' && redesignResult.value.ok) {
                    setRedesign(await redesignResult.value.json());
                }

                // Handle Roadmap Result
                if (roadmapResult.status === 'fulfilled' && roadmapResult.value.ok) {
                    setRoadmap(await roadmapResult.value.json());
                }

                // Save to History (LocalStorage)
                if (analyzeData) {
                    const historyItem = {
                        url,
                        timestamp: Date.now(),
                        scores: {
                            ui: analyzeData.ui_ux_audit?.score || 0,
                            seo: analyzeData.seo_audit?.score || 0,
                            perf: analyzeData.performance_audit?.score_estimation || 0
                        }
                    };
                    const stored = localStorage.getItem("webrev_history");
                    const currentHistory = stored ? JSON.parse(stored) : [];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newHistory = [historyItem, ...currentHistory.filter((h: any) => h.url !== url)].slice(0, 10);
                    localStorage.setItem("webrev_history", JSON.stringify(newHistory));
                }

                setStatus("COMPLETE");

            } catch (err: unknown) {
                console.error(err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
                setStatus("IDLE");
            }
        };

        fetchData();
    }, [url, mounted, retryCount]); // Depend on retryCount


    const { history } = useLocalHistory();

    if (!mounted) return <div className="p-8 text-center bg-gray-50 min-h-screen pt-40">Loading Report...</div>;
    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-4">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Ready to Audit?</h2>
                    <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                        Enter any website URL to instantly generate an AI-powered UI/UX redesign and technical roadmap.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="w-full max-w-lg bg-card p-6 rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm"
                >
                    <UrlInput />
                </motion.div>

                {/* Recent History Mini-View could go here */}
            </div>
        );
    }
    // Helper to get logo
    const getLogoUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
        } catch {
            return null;
        }
    };
    const logoUrl = url ? getLogoUrl(url) : null;

    if (!data && status !== "IDLE") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">{status === "SCRAPING" ? "Scraping content..." : "Initializing..."}</p>
                {error && <p className="text-red-500">{error}</p>}

                {/* Retry Input during initialization/loading error if specifically needed, usually error shows below in main view, but if it fails early: */}
                {error && (
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                        <input
                            type="password"
                            placeholder="Enter your Groq API Key"
                            className="border p-2 rounded"
                            value={apiKey || ""}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <Button onClick={handleRetryWithKey}>Retry with Key</Button>
                    </div>
                )}
            </div>
        );
    }

    if (!data) return null; // Should not happen given logic above, unless IDLE and url present which handles gracefully

    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 bg-card/50 p-6 -mx-8 -mt-8 mb-8 backdrop-blur-md sticky top-0 z-10"
            >
                <div className="flex items-center gap-4">
                    {/* Website Logo */}
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain bg-white shadow-sm p-1" />
                    ) : (
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Globe className="w-8 h-8 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Report for {data.title}</h1>
                        <a href={data.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                            {data.url} <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DownloadReportButton targetId="dashboard-report-content" fileName={`webrev-${new URL(data.url).hostname}`} />
                    <Badge variant={status === "COMPLETE" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                </div>
            </motion.div>
            {/* History Sheet */}
            {history.length > 0 && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <History className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Recent Audits</SheetTitle>
                            <SheetDescription>
                                Your locally saved reports.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8 space-y-4">
                            {history.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 border rounded hover:bg-muted cursor-pointer"
                                    onClick={() => window.location.href = `?url=${encodeURIComponent(item.url)}`}>
                                    <div className="font-semibold truncate">{item.url}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2 text-xs mt-1">
                                        <span className="text-green-600">UI: {item.scores.ui}</span>
                                        <span className="text-blue-600">SEO: {item.scores.seo}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            )}
            {/* Error Message */}
            {/* Error Message & Retry */}
            {error && (
                <div className="p-6 text-red-500 bg-red-50 rounded-md mb-8 border border-red-100 flex flex-col gap-4">
                    <div className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Analysis Failed
                    </div>
                    <p>{error}</p>

                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center bg-white p-4 rounded-lg border border-red-100">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                Add/Update Your Groq API Key to Bypass Limits
                            </label>
                            <Input
                                type="password"
                                placeholder="gsk_..."
                                value={apiKey || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value.trim())}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={handleRetryWithKey}
                            disabled={!apiKey}
                        >
                            Retry Analysis
                        </Button>
                    </div>
                </div>
            )}

            <div id="dashboard-report-content" className="space-y-8 p-4 bg-background">
                {/* 1. Audit Results */}
                <AuditResults analysis={analysis} />

                {/* 2. Redesign & Live Preview */}
                {(status === "COMPLETE" || redesign) && (
                    <RedesignView
                        data={redesign}
                        scrapeData={data}
                        logoUrl={logoUrl}
                        onRefine={async (val) => {
                            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                            if (apiKey) headers['x-groq-api-key'] = apiKey;

                            const res = await fetch('/api/redesign', {
                                method: 'POST',
                                body: JSON.stringify({ data: data, customPrompt: val }),
                                headers
                            });
                            const newRedesign = await res.json();
                            setRedesign(newRedesign);
                            return newRedesign;
                        }}
                    />
                )}

                {/* 3. Roadmap */}
                {(status === "COMPLETE" || roadmap) && (
                    <RoadmapView roadmap={roadmap} />
                )}
            </div>
        </div >
    );
}
