import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serverRes = await fetch(
      `${process.env.OPERATIONS}crm/internal/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await serverRes.json();

    if (!serverRes.ok || !data.accessToken) {
      return NextResponse.json(
        { success: false, error: data.error || "Login failed" },
        { status: serverRes.status },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "accessToken",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30 minutes
    });

    response.cookies.set({
      name: "refreshToken",
      value: data.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,    // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
