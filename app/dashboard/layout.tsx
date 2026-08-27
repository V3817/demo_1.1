export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r bg-muted/40 hidden md:block">
                <div className="flex h-14 items-center border-b px-4 font-semibold">
                    WebRev AI
                </div>
                <div className="p-4 space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">Report Sections</div>
                    <nav className="flex flex-col space-y-1">
                        <a href="#" className="block px-2 py-1.5 text-sm font-medium rounded-md bg-accent text-accent-foreground">
                            Overview
                        </a>
                        <a href="#" className="block px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                            UI/UX Audit
                        </a>
                        <a href="#" className="block px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                            SEO Analysis
                        </a>
                        <a href="#" className="block px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                            Redesign
                        </a>
                        <a href="#" className="block px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                            Roadmap
                        </a>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
                    <h1 className="font-semibold text-lg">Analysis Dashboard</h1>
                </header>
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
