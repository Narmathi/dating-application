import { fetchWithAuth } from "@/app/lib/fetchWithAuth";
import { NextResponse, NextRequest } from "next/server";

const CDN = process.env.CDN;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userID = searchParams.get("id");

    const backendUrl = `${process.env.OPERATIONS}crm/internal/users/${userID}`;

    const backendRes = await fetchWithAuth(backendUrl, {
      method: "GET",
    });

    const data = await backendRes.json();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Data fetched failed!",
        },
        { status: 400 },
      );
    }

    const mappedResponse = {
      name: data.data.name,
      gender: data.data.gender,
      dateOfBirth: data.data.dob,
      email: data.data.email,

      mobileNumber: data.data.mobile,
      role: data.data.role,
      roleName: data.data.role_name,
      isMobileValid: true,
      countryCode: data.data.country_code,
    };

    return NextResponse.json(
      {
        success: true,
        data: mappedResponse,
        file: `${CDN}${data.data.dp}`,
        message: "Data fetched successfully!",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
