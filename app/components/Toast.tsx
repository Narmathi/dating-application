"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,

        // Default styles
        style: {
          background: "#333",
          color: "#fff",
        },

        // Success toast
        success: {
          style: {
            background: "#0f9d58",
            color: "#fff",
          },
        },

        // Error toast
        error: {
          style: {
            background: "#d93025",
            color: "#fff",
          },
        },

        // Loading toast
        loading: {
          style: {
            background: "#1a73e8",
            color: "#fff",
          },
        },
      }}
    />
  );
}
