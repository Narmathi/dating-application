
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const refreshToken = body.refreshToken;

  if (!refreshToken) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const serverRes = await fetch(
    `${process.env.OPERATIONS}crm/internal/refresh`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  if (!serverRes.ok) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const data = await serverRes.json();


  return NextResponse.json({
    success: true,
    accessToken: data.accessToken,
  });
}