import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting
const ipRequests = new Map<string, { count: number; startTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute

export default function proxy(req: NextRequest) {
    const { nextUrl } = req;
    const hasSession = req.cookies.has("webrev_session");
    const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

    // 1. Auth Check (Simple Cookie)
    if (isOnDashboard && !hasSession) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // 2. Rate Limiting (API Routes only)
    if (nextUrl.pathname.startsWith("/api/")) {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_WINDOW;

        const requestLog = ipRequests.get(ip) || { count: 0, startTime: now };

        if (requestLog.startTime < windowStart) {
            requestLog.count = 1;
            requestLog.startTime = now;
        } else {
            requestLog.count++;
        }

        ipRequests.set(ip, requestLog);

        if (requestLog.count > MAX_REQUESTS) {
            return new NextResponse(
                JSON.stringify({ error: "Too Many Requests", retryAfter: 60 }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
