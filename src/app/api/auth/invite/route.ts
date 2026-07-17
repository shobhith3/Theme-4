import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ message: "Invites are disabled in the demo environment." }, { status: 403 });
}
