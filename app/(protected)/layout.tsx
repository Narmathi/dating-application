// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import type { User } from "@/app/types/auth.d";
import AuthProvider from "@/app/context/AuthProvider";
import "react-datepicker/dist/react-datepicker.css";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

// ------------------- Helper -------------------
async function fetchUser(): Promise<User | null> {
  const res = await fetchWithAuth(
    `${process.env.OPERATIONS}crm/internal/decodeuser`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  return res.json();
}
// ------------------- Layout -------------------
export default async function ProtectedLayout({ children, }: { children: ReactNode; }) {
  const user = await fetchUser();

  if (!user) redirect("/login");

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen flex">
        <aside className="w-64">
          <Sidebar user={user} />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}