import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 });
    }

    // Check if user already exists in DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { organization: true },
    });

    if (!dbUser) {
      // If user doesn't exist, we must create them. 
      // For the demo/hackathon flow, if there's no org, we'll assign them to the seeded "FreshEats Co." 
      // or create a new org for them.
      let org = await prisma.organization.findFirst({
        where: { name: "FreshEats Co." }
      });

      if (!org) {
        org = await prisma.organization.create({
          data: { name: "FreshEats Co." }
        });
      }

      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "New User",
          role: "OWNER",
          organizationId: org.id,
        },
        include: { organization: true },
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: dbUser 
    });

  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
