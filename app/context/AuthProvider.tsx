"use client";

import AuthContext from "./AuthContext";

export default function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const payload = user?.decoded?.payload;

  const value = {
    name: payload?.name || "User",
    role: payload?.role || "guest",
    user_id: payload?.user_id || "",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}