import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ message: "Signup is disabled in the demo environment." }, { status: 403 });
}
