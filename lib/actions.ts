"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const USERS = [
  { email: "admin@webrev.ai", password: "admin123" },
  { email: "user1@webrev.ai", password: "user123" },
  { email: "user2@webrev.ai", password: "user2123" },
];

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = USERS.find((u) => u.email === email && u.password === password);

  if (user) {
    // Set a simple session cookie
    (await cookies()).set("webrev_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    redirect("/dashboard");
  } else {
    return "Invalid email or password.";
  }
}
