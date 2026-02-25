import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { NextAuthProvider } from "@/components/NextAuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Mindset Mobilisation SaaS",
  description: "Automated mobilisation planning for Children's Homes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased flex min-h-screen`}>
        <NextAuthProvider>
          <Sidebar />
          <main className="flex-1 pt-16 px-4 pb-20 md:pt-8 md:px-8 md:pb-8 overflow-y-auto pb-safe">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
