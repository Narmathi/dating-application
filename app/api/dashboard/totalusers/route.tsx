import { NextResponse, NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const serverRes = await fetch(`${process.env.USERS}crm/api/total-users`, {
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

export async function POST(req: NextRequest) {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const { searchParams } = new URL(req.url);

    const period = searchParams.get("period");

    const serverRes = await fetch(`${process.env.USERS}crm/api/chart-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${verifyToken}`,
      },
      body: JSON.stringify({ period }),
    });

    const data = await serverRes.json();

    return NextResponse.json(
      {
        success: true,
        data: data.data,
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
