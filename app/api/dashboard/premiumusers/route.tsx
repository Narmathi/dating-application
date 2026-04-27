import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const serverRes = await fetch(`${process.env.USERS}crm/api/premium-users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${verifyToken}`,
      },
    });

    const data = await serverRes.json();

    return NextResponse.json(
      {
        success: true,
        data: data.count,
        message: "Data fetched successfully!",
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
