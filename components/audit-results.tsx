"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyzeSchema, ScrapeDataSchema } from "@/lib/schemas";
import { z } from "zod";

type AnalysisResult = z.infer<typeof AnalyzeSchema>;
type ScrapeData = z.infer<typeof ScrapeDataSchema>;

interface AuditResultsProps {
    analysis: AnalysisResult | null;
}

export function AuditResults({ analysis }: AuditResultsProps) {
    return (
        <div className="space-y-8">
            {/* 1. Overview / Audit */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <div className="p-6">
                        <div className="text-sm font-medium text-muted-foreground">UI/UX Score</div>
                        <div className="text-3xl font-bold text-primary text-green-600">
                            {analysis ? analysis.ui_ux_audit?.score : <Skeleton className="h-8 w-10" />}
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-6">
                        <div className="text-sm font-medium text-muted-foreground">SEO Score</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {analysis ? analysis.seo_audit?.score : <Skeleton className="h-8 w-10" />}
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-6">
                        <div className="text-sm font-medium text-muted-foreground">Performance</div>
                        <div className="text-3xl font-bold text-yellow-600">
                            {analysis ? analysis.performance_audit?.score_estimation : <Skeleton className="h-8 w-10" />}
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-6">
                        <div className="text-sm font-medium text-muted-foreground">Accessibility</div>
                        <div className="text-3xl font-bold text-purple-600">
                            {analysis ? analysis.accessibility_audit?.score : <Skeleton className="h-8 w-10" />}
                        </div>
                    </div>
                </Card>
            </div>

            {/* 2. Key Issues & Priorities */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="h-full">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-xl">Top Improvements</h3>
                        <p className="text-sm text-muted-foreground">High impact changes for maximum conversion.</p>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        {analysis ? (
                            analysis.recommendation_engine?.priority_actions?.map((act, i) => (
                                <div key={i} className="border-l-4 border-primary pl-4 py-1">
                                    <div className="font-semibold text-lg">{act.action}</div>
                                    <div className="flex gap-2 text-xs mt-1 mb-2">
                                        <span className={`px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold`}>{act.impact} Impact</span>
                                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">{act.difficulty} Effort</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{act.description}</div>
                                    <div className="text-xs text-muted-foreground italic mt-1">&quot;Why: {act.why_it_matters}&quot;</div>
                                </div>
                            ))
                        ) : <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>}
                    </div>
                </Card>

                {/* Innovation Section */}
                <Card className="h-full border-indigo-100 bg-indigo-50/30">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-xl text-indigo-900">Innovation Ideas</h3>
                        <p className="text-sm text-indigo-600">Modernize your user experience.</p>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        {analysis ? (
                            analysis.innovation_suggestions?.map((idea, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-indigo-900">{idea.name}</div>
                                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{idea.category}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">{idea.description}</div>
                                </div>
                            ))
                        ) : <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>}
                    </div>
                </Card>
            </div>
        </div>
    );
}
