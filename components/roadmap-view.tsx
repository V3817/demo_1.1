"use client";

import { Card } from "@/components/ui/card";
import { z } from "zod";
import { RoadmapSchema } from "@/lib/schemas";

type RoadmapResult = z.infer<typeof RoadmapSchema>;

interface RoadmapViewProps {
    roadmap: RoadmapResult | null;
}

export function RoadmapView({ roadmap }: RoadmapViewProps) {
    if (!roadmap) return null;

    return (
        <Card>
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Technical Roadmap</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
                <div>
                    <h4 className="font-medium mb-2">Migration Steps</h4>
                    <ol className="list-decimal pl-4 space-y-1">
                        {roadmap.migration_steps?.map((step: string, i: number) => (
                            <li key={i} className="text-sm">{step}</li>
                        ))}
                    </ol>
                </div>
                <div>
                    <h4 className="font-medium mb-2">New Tech Stack</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Frontend */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="font-semibold text-blue-900 text-sm mb-1">Frontend</div>
                            <div className="text-sm font-medium">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(roadmap.tech_stack_recommendation as any)?.frontend || "Next.js"}
                            </div>
                        </div>
                        {/* Backend */}
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="font-semibold text-green-900 text-sm mb-1">Backend</div>
                            <div className="text-sm font-medium">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(roadmap.tech_stack_recommendation as any)?.backend || "Node.js"}
                            </div>
                        </div>
                        {/* Tools */}
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="font-semibold text-purple-900 text-sm mb-1">Tools</div>
                            <div className="text-sm">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(() => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const tools = (roadmap.tech_stack_recommendation as any)?.tools;
                                    if (Array.isArray(tools) && tools.length > 0) {
                                        return tools.join(", ");
                                    }
                                    return "Standard Web Tools";
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
