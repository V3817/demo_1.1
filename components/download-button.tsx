"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export function DownloadReportButton({ targetId }: { targetId: string, fileName?: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);

        try {
            // Native Browser Print (Reliable)
            setTimeout(() => {
                window.print();
                setIsGenerating(false);
            }, 100);
        } catch (err) {
            // This catch block is kept for robustness, though window.print() rarely throws.
            console.error("Print Fail:", err);
            alert("Failed to initiate print. Please try your browser's print function directly.");
            setIsGenerating(false); // Ensure state is reset even if catch is hit
        }
    };

    return (
        <Button onClick={handleDownload} disabled={isGenerating} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Preparing..." : "Print / Save PDF"}
        </Button>
    );
}
