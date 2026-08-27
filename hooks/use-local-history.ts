"use client";

import { useState, useEffect } from "react";

export interface HistoryItem {
    url: string;
    timestamp: number;
    scores: {
        ui: number;
        seo: number;
        perf: number;
    };
}

export function useLocalHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("webrev_history");
        if (stored) {
            // eslint-disable-next-line 
            setHistory(JSON.parse(stored));
        }
    }, []);

    const addToHistory = (item: HistoryItem) => {
        const newHistory = [item, ...history.filter(h => h.url !== item.url)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("webrev_history", JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("webrev_history");
    };

    return { history, addToHistory, clearHistory };
}
