import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '@/app/actions/engine-actions';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (password !== "demo1234") {
      return NextResponse.json({ error: "Invalid credentials. Try demo1234" }, { status: 401 });
    }

    const prisma = await getPrisma();
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { role: true }
        },
        branchAccess: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in system." }, { status: 404 });
    }

    // Create session payload
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.memberships[0]?.role?.name || user.role,
    };

    const cookieStore = await cookies();
    cookieStore.set("procureiq_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
