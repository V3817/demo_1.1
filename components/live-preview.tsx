"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Shield, Zap, Layout, Globe, Users, LucideIcon } from "lucide-react";
import { RedesignSchema } from "@/lib/schemas";
import { z } from "zod";

type RedesignResult = z.infer<typeof RedesignSchema>;

const Icons: Record<string, LucideIcon> = { Star, Shield, Zap, Layout, Globe, Users };

interface LivePreviewProps {
    data: RedesignResult | null;
    logoUrl?: string | null;
}

export function LivePreview({ data, logoUrl }: LivePreviewProps) {
    if (!data || !data.visual_preview) return null;

    const {
        color_palette,
        typography_recommendation,
        visual_preview
    } = data;

    // Helper to resolve color from palette (e.g. "Primary" -> hex code)
    const getColor = (name: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const palette = color_palette as any;
        const color = palette[name.toLowerCase()] || palette[name];
        return color || '#000000'; // Default to black if not found
    };

    return (
        <div className="border rounded-xl overflow-hidden shadow-2xl bg-white">
            {/* MOCK BROWSER CHROME */}
            <div className="bg-zinc-100 border-b p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-center text-zinc-500 shadow-sm mx-8">
                    AI Generated Redesign Preview
                </div>
            </div>

            {/* PREVIEW CONTENT */}
            <div className="font-sans min-h-[500px]" style={{ fontFamily: typography_recommendation?.body || 'sans-serif' }}>

                {/* NAV BAR */}
                <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ backgroundColor: getColor('background'), borderColor: getColor('accent') + '20' }}>
                    <div className="font-bold text-xl flex items-center gap-2" style={{ color: getColor('primary') }}>
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                            <div className="w-8 h-8 bg-zinc-200 rounded-full animate-pulse"></div>
                        )}
                        <span>Brand</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium" style={{ color: getColor('text') }}>
                        <a href="#" className="hover:opacity-75">Product</a>
                        <a href="#" className="hover:opacity-75">Solutions</a>
                        <a href="#" className="hover:opacity-75">Pricing</a>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: getColor('primary'), color: '#fff' }}>
                        Get Started
                    </button>
                </nav>

                {/* Hero Section */}
                <div className="py-20 px-6 text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: getColor('primary') }}>
                        {visual_preview?.hero?.headline || "Welcome"}
                    </h1>
                    <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto" style={{ color: getColor('text') }}>
                        {visual_preview?.hero?.subheadline || "Discover amazing features"}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" style={{ backgroundColor: getColor('primary'), color: '#fff' }}>{visual_preview?.hero?.cta_text || "Get Started"}</Button>
                        <Button size="lg" variant="outline">Learn More</Button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 px-6 bg-black/5">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {(visual_preview?.features || []).map((feat, i) => {
                            const Icon = Icons[feat.icon || "Star"] || Icons.Star;
                            return (
                                <div key={i} className="p-6 bg-white rounded-xl shadow-sm space-y-3">
                                    <div className="p-3 w-fit rounded-lg bg-gray-100" style={{ color: getColor('accent') }}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-xl">{feat.title}</h3>
                                    <p className="text-sm opacity-70">{feat.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Testimonials */}
                <div className="py-16 px-6">
                    <h2 className="text-2xl font-bold text-center mb-10">Trusted by Experts</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {(visual_preview?.testimonials || []).map((test, i) => (
                            <Card key={i} className="p-6 bg-muted/20 border-none">
                                <p className="italic text-lg mb-4">&quot;{test.quote}&quot;</p>
                                <p className="font-bold text-sm text-right">- {test.author}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="py-8 text-center text-sm opacity-50 border-t">
                    © {new Date().getFullYear()} Redesign Concept. AI Generated.
                </div>
            </div>
        </div>
    );
}
