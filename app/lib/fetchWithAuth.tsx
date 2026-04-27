// app/lib/fetchWithAuth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) redirect("/login");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}