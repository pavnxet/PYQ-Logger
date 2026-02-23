import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ExportBucket from "@/components/ExportBucket";
import { BucketProvider } from "@/context/BucketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Prep Dashboard",
  description: "Manage your exam questions efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex`}
      >
        <BucketProvider>
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="pt-20 px-6 pb-6 min-h-screen">
              {children}
            </main>
          </div>
          <ExportBucket />
        </BucketProvider>
      </body>
    </html>
  );
}
