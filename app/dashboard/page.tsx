import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading Dashboard...</div>}>
                <DashboardContent />
            </Suspense>
        </ErrorBoundary>
    );
}
