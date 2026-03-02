"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname?.startsWith("/auth");

    // Redirect to sign-in if not authenticated and not on auth page
    useEffect(() => {
        if (status === "unauthenticated" && !isAuthPage) {
            router.push("/auth/signin");
        }
    }, [status, isAuthPage, router]);

    // Loading state
    if (status === "loading") {
        return (
            <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-l-2 border-r-2 border-purple-500 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    // Not authenticated: show loading while redirecting to sign-in
    if (!session && !isAuthPage) {
        return (
            <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-l-2 border-r-2 border-purple-500 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    // Auth page (sign-in): render full screen without sidebar
    if (!session && isAuthPage) {
        return <>{children}</>;
    }

    // Authenticated: show sidebar + main wrapper
    return (
        <>
            <Sidebar />
            <main className="flex-1 pt-16 px-4 pb-20 md:pt-8 md:px-8 md:pb-8 overflow-y-auto pb-safe">
                {children}
            </main>
        </>
    );
}
