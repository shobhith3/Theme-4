import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ message: "Password recovery is disabled in the demo environment." }, { status: 403 });
}
