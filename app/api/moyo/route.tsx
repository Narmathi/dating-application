import { NextRequest, NextResponse } from "next/server";


type MoyoUsers = {
  sNo: number;
  age: number;
  gender: string;
  relationShip: string;
  area: string;
  count: number;
};
export async function GET(req: NextRequest) {
  try {
    let verifyToken = process.env.VERIFY_JWT;
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

    const backendRes = await fetch(
      `${process.env.USERS
      }crm/api/moyo?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
        search,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${verifyToken}`,
        },
      },
    );

    const data = await backendRes.json();

    const totalCount = data.count;

    const mappedResponse: MoyoUsers[] = data.data.map(
      (users: any, index: number) => ({
        sNo: Number(offset) == 0 ? index + 1 : Number(offset) + (index + 1),
        age: users.age,
        gender: users.gender == 1 ? "Male" : "Female",
        relationShip: users.relationship == 1 ? "Dating" : "Friendship",
        area: users.loc_locality,
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: mappedResponse,
        count: totalCount,
        message: "Data fetched success",
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
