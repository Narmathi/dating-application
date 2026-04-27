"use client";

import { useLoader } from "@/app/store/useLoader";

export default function GlobalLoader() {
  const loading = useLoader((state: any) => state.loading);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
    </div>
  );
}
