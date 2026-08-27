"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UrlInput() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(false);

    // Load saved key on mount
    useEffect(() => {

        const savedKey = localStorage.getItem("webrev_groq_key");

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (savedKey) setApiKey(savedKey);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);

        // Save Key to LocalStorage
        if (apiKey) {
            localStorage.setItem("webrev_groq_key", apiKey);
        }

        // Force a clean navigation to the dashboard with the new URL
        const target = `/dashboard?url=${encodeURIComponent(url)}`;
        router.push(target);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-lg gap-3">
            <div className="flex w-full space-x-2">
                <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1"
                    disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Site"}
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    type="password"
                    placeholder="Enter Groq API Key (Recommended to avoid Rate Limits)"
                    className="text-xs h-8 bg-zinc-50 dark:bg-zinc-900 border-dashed"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
        </form>
    );
}

