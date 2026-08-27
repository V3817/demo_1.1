import { UrlInput } from "@/components/url-input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          WebRev AI
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          AI-Powered Website Auditor & Redesign Platform
        </p>
      </div>

      <div className="mt-16 w-full max-w-xl flex justify-center">
        <UrlInput />
      </div>
    </main>
  );
}
