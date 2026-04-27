import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/app/components/Toast";
import Loader from "@/app/components/Loader";
import { Roboto } from "next/font/google";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const roboto = Roboto({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moyo Moja",
  description: "Manage Connection Empower Experiences",
};

const notosans = Noto_Sans({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <body className="m-0 p-0">
        <ToastProvider />
        <Loader />
        {children}
      </body>
    </html>
  );
}
