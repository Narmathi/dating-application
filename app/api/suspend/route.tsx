import { NextRequest, NextResponse } from "next/server";

type Suspend = {
  id: number;
  userId: string;
  name: string;
  totalReports: number;
};

export async function GET(req: NextRequest) {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (!limit || !offset) {
      return NextResponse.json(
        { success: false, message: "limit or offset is required" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${process.env.USERS}crm/api/suspend?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${verifyToken}`,
        },
      },
    );

    const data = await backendRes.json();

    const totalCount = data.count;

    const base = Number(offset);

    const mappedResponse: Suspend[] = data.data.map(
      (reports: any, index: number) => ({
        id: base + index + 1,
        userId: reports.user_id,
        name: reports.name,
        totalReports: 2,
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: mappedResponse,
        count: totalCount,
        message: "Data fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
