"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextUrl = formData.get("next") as string || "/command-center";

  if (password !== "demo1234") {
    throw new Error("Invalid credentials. Try demo1234");
  }

  // Create simple session payload
  const sessionData = {
    email,
    name: email.split("@")[0].replace(".", " ").replace(/^./, (c) => c.toUpperCase()),
  };

  const cookieStore = await cookies();
  cookieStore.set("procureiq_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect(nextUrl);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("procureiq_session");
  redirect("/login");
}
