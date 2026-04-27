import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const body = await req.json();
    const { userId } = body;


    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(`${process.env.USERS}crm/api/un-suspend`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${verifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
