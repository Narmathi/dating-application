import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ succes: true });
  res.cookies.set({ name: "accessToken", value: "", maxAge: 0, path: "/" });
  res.cookies.set({ name: "refreshToken", value: "", maxAge: 0, path: "/" });
  return res;
}
