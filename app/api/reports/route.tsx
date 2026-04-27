import { NextRequest, NextResponse } from "next/server";

type Report = {
  id: number;
  userId: string;
  name: string;
  totalReports: number;
  reportDetails: ReportDetail[];
};

interface ReportDetail {
  reportBy: string;
  reportOn: string;
  reportType: string;
}

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
      `${process.env.USERS}crm/api/reports?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${verifyToken}`,
        },
      },
    );

    const data = await backendRes.json();

    console.log("Backend Response:", data);

    const totalCount = data.count;

    const base = Number(offset);

    const mappedResponse: Report[] = data.data.map(
      (reports: any, index: number) => ({
        id: base + index + 1,
        userId: reports.user_id,
        name: reports.name,
        totalReports: reports.total_report,
        reportDetails: reports.report_details.map((detail: any) => ({
          reportBy: detail.report_by,
          reportOn: detail.report_on,
          reportType: detail.report_type,
        })),
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

export async function PUT(req: NextRequest) {
  let verifyToken = process.env.VERIFY_JWT;
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("id");

    if (!userID) {
      return NextResponse.json(
        { success: false, message: "UserID is required!" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${process.env.USERS}crm/api/suspend/${userID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${verifyToken}`,
        },
      },
    );

    if (!backendRes.ok) {
      const errorData = await backendRes.json();

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to suspend user",
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User Suspended successfully",
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
