import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;


  // accessToken valid → continue
  if (accessToken) return NextResponse.next();

  // No refreshToken → force login
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // accessToken missing → refresh
  try {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );



    if (!refreshRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }


    const text = await refreshRes.text();


    let newToken: string | null = null;
    try {
      const data = JSON.parse(text);
      newToken = data.accessToken ?? null;
    } catch (e) {
      console.log("PARSE ERROR — not JSON");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!newToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const response = NextResponse.next();
    response.cookies.set({
      name: "accessToken",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    });

    return response;

  } catch (err) {
    console.log("MIDDLEWARE FETCH ERROR:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/aggrid/:path*",
    "/content/:path*",
    "/content-management/:path*",
    "/dashboard/:path*",
    "/moyo-users/:path*",
    "/payment/:path*",
    "/plans/:path*",
    "/reports/:path*",
    "/service-health/:path*",
    "/sidebar/:path*",
    "/users/:path*",

    // api's 
    "/api/content/:path*",
    "/api/dashboard/:path*",
    "/api/payment/:path*",
    "/api/payment-details/:path*",
    "/api/plans/:path*",
    "/api/reports/:path*",
    "/api/users/:path*",
  ],
};