import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { SpaceProvider } from "@/components/SpaceContext";
import AuthLayout from "@/components/AuthLayout";

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
          <SpaceProvider>
            <AuthLayout>
              {children}
            </AuthLayout>
          </SpaceProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
