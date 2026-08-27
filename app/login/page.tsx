"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const DEMO_USERS = [
  { email: "admin@webrev.ai", label: "Admin" },
  { email: "user1@webrev.ai", label: "User 1" },
  { email: "user2@webrev.ai", label: "User 2" },
];

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">WebRev AI Login</CardTitle>
          <CardDescription className="text-center">Restricted Access (MVP)</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" name="email" placeholder="user@webrev.ai" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" name="password" required placeholder="******" />
            </div>
            <Button className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
            {errorMessage && (
              <div className="text-red-500 text-sm text-center">{errorMessage}</div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-md text-xs space-y-2">
              <p className="font-semibold text-center mb-2">Available Demo Users:</p>
              <ul className="space-y-1">
                {DEMO_USERS.map(u => (
                  <li key={u.email} className="flex justify-between">
                    <span>{u.email}</span>
                    <span className="font-mono text-muted-foreground">Pass: {u.email.split('@')[0]}123</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-center text-muted-foreground pt-2">(Passwords are username + &apos;123&apos; / &apos;123&apos; / &apos;2123&apos;)</p>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
