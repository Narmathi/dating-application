import { NextResponse, NextRequest } from "next/server";


export async function GET() {
  const CDN = process.env.CDN;

  let verifyToken = process.env.VERIFY_JWT;


  try {
    const serverRes = await fetch(
      `${process.env.USERS}crm/api/daily-active-users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifyToken}`,
        },
      },
    );

    const data = await serverRes.json();

    const response = NextResponse.json(
      {
        success: true,
        data: data.count,
        message: "Data fetched successfully!",
      },
      { status: 200 },
    );
    return response;

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
