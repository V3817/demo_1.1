"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/live-preview";
import { useState } from "react";
import { z } from "zod";
import { RedesignSchema } from "@/lib/schemas";

import { Eye, Columns, AlertCircle } from "lucide-react";

type RedesignResult = z.infer<typeof RedesignSchema>;

interface RedesignViewProps {
    data: RedesignResult | null;
    scrapeData?: unknown; // Kept but optional/unknown if not used directly
    onRefine: (customPrompt: string) => Promise<RedesignResult>;
    logoUrl?: string | null;
}

export function RedesignView({ data, scrapeData, onRefine, logoUrl }: RedesignViewProps) {
    const [refining, setRefining] = useState(false);
    const [viewMode, setViewMode] = useState<"single" | "split">("single");

    if (!data?.visual_preview) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center border-t pt-8 gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Proposed Redesign</h2>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === "single" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("single")}
                        className="gap-2"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </Button>
                    <Button
                        variant={viewMode === "split" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("split")}
                        className="gap-2"
                    >
                        <Columns className="w-4 h-4" /> Comparison
                    </Button>
                </div>
            </div>

            {/* VISUAL PREVIEW & REFINEMENT */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        {viewMode === "split" ? "Original vs. Redesign" : "AI-Generated Live Preview"}
                    </h3>
                </div>

                <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                    {/* LEFT: ORIGINAL (Only in Split Mode) */}
                    {viewMode === "split" && (
                        <Card className="overflow-hidden border-2 border-dashed h-[800px] flex flex-col relative group">
                            <div className="p-3 bg-muted text-center text-sm font-semibold border-b flex justify-between items-center px-4">
                                <span>Original Website (Live)</span>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(scrapeData as any)?.url && (
                                    <a
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        href={(scrapeData as any).url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Open in New Tab ↗
                                    </a>
                                )}
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(scrapeData as any)?.url ? (
                                <>
                                    <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50 text-muted-foreground text-xs p-8 pointer-events-none">
                                        <div className="text-center">
                                            <p className="font-semibold mb-1">If this area is blank:</p>
                                            <p>The website blocks embedded views (e.g. YouTube, Google).</p>
                                            <p className="mt-2 text-blue-500">Click &quot;Open in New Tab&quot; above.</p>
                                        </div>
                                    </div>
                                    <iframe
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        src={(scrapeData as any).url}
                                        className="w-full h-full bg-white relative z-10"
                                        title="Original Website"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </>
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-muted-foreground p-8 text-center">
                                    <AlertCircle className="w-8 h-8 mb-2 block mx-auto" />
                                    Original URL not available for comparison.
                                </div>
                            )}
                        </Card>
                    )}

                    {/* RIGHT: REDESIGN */}
                    <div className={viewMode === "split" ? "h-[800px] overflow-y-auto border rounded-xl" : ""}>
                        {viewMode === "split" && (
                            <div className="p-3 bg-primary text-primary-foreground text-center text-sm font-semibold sticky top-0 z-10">
                                AI Redesign
                            </div>
                        )}
                        <LivePreview data={data} logoUrl={logoUrl} />
                    </div>
                </div>

                {/* Interactive Refinement */}
                <div className="flex gap-2 p-4 bg-muted/50 rounded-lg border items-center">
                    <span className="text-sm font-medium whitespace-nowrap">Customize:</span>
                    <input
                        type="text"
                        placeholder="e.g. 'Make it dark mode', 'Add a chatbot feature', 'Use blue tones'"
                        className="flex-1 text-sm bg-background border rounded px-3 py-2"
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value;
                                if (!val || refining) return;

                                setRefining(true);
                                try {
                                    await onRefine(val);
                                    (e.target as HTMLInputElement).value = "";
                                } finally {
                                    setRefining(false);
                                }
                            }
                        }}
                    />
                    <Button size="sm" variant="secondary" disabled={refining} onClick={() => {
                        const inputProp = document.querySelector('input[placeholder^="e.g."]') as HTMLInputElement;
                        if (inputProp) inputProp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                    }}>
                        {refining ? "Refining..." : "Update"}
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Design System</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Color Palette</h4>
                            <div className="flex gap-2">
                                {Object.entries(data.color_palette || {}).map(([res, color]) => (
                                    <div key={res} title={`${res}: ${color}`} className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: color as string }}></div>
                                ))}
                            </div>
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                                {JSON.stringify(data.color_palette, null, 2)}
                            </pre>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Concept & Wireframe</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                            {(() => {
                                try {
                                    let content = data.wireframe_description?.trim() || "";
                                    // Remove markdown code fences if present
                                    content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

                                    // Attempt to parse if it looks like JSON object
                                    if (content.startsWith("{")) {
                                        const parsed = JSON.parse(content);
                                        return (
                                            <div className="space-y-4">
                                                {Object.entries(parsed).map(([key, val]) => (
                                                    <div key={key}>
                                                        <span className="font-semibold capitalize text-foreground">
                                                            {key.replace(/_/g, " ")}:
                                                        </span>{" "}
                                                        {Array.isArray(val) ? (
                                                            <ul className="list-disc list-inside pl-2 mt-1">
                                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                {val.map((item: any, i: number) => (
                                                                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            typeof val === 'string' ? val : JSON.stringify(val)
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                } catch (e) {
                                    // Fallback to text
                                }
                                return data.wireframe_description;
                            })()}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
