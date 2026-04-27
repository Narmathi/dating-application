import { NextResponse, NextRequest } from "next/server";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

type MoyoUsers = {
  sNo: number;
  age: number;
  gender: string;
  relationShip: string;
  area: string;
  count: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.formData();

    const serverRes = await fetchWithAuth(
      `${process.env.OPERATIONS}crm/internal/user`,
      {
        method: "POST",
        body: body,
      },
    );

    const data = await serverRes.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const search = searchParams.get("search") ?? "";

    if (!limit || !offset) {
      return NextResponse.json(
        { success: false, message: "limit or offset is required" },
        { status: 400 },
      );
    }

    const backendRes = await fetchWithAuth(
      `${
        process.env.OPERATIONS
      }crm/internal/users?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
        search,
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await backendRes.json();

    const totalCount = data.count;

    const mappedResponse: MoyoUsers[] = data.data.map(
      (users: any, index: number) => ({
        sNo: Number(offset) == 0 ? index + 1 : Number(offset) + (index + 1),
        name: users.name,
        gender: users.gender == 1 ? "Male" : "Female",
        dateOfBirth: users.dob,
        email: users.email,
        mobile: users.mobile,
        role: users.role == "super_admin" ? "Super Admin" : "Admin",
        roleName: users.role_name,
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: mappedResponse,
        count: totalCount,
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
