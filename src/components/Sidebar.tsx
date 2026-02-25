"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, CheckSquare, Settings, LogOut, BarChart3, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Task Management", href: "/tasks", icon: CheckSquare },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const sidebarContent = (isMobile: boolean = false) => {
        const collapsed = !isMobile && isCollapsed;

        return (
            <>
                <div className={`mb-8 md:mb-10 px-2 transition-all duration-300 ${collapsed ? "opacity-0 invisible h-0 mb-0" : "opacity-100 visible"}`}>
                    <a href="https://mindsetchildrenshome.co.uk/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MINDSET Logo" className="h-10 md:h-12 w-auto object-contain" />
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">Mobilisation SaaS</p>
                    </a>
                </div>

                {collapsed && (
                    <div className="mb-10 flex justify-center">
                        <img src="/logo.png" alt="M Logo" className="h-8 w-8 object-contain" />
                    </div>
                )}

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ""}
                                className={`flex items-center rounded-xl transition-all duration-200 group ${collapsed ? "justify-center p-2.5" : "space-x-3 px-4 py-3 md:py-2.5"} ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
                                    }`}
                            >
                                <Icon size={20} className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} transition-colors shrink-0 md:w-[18px] md:h-[18px]`} />
                                {!collapsed && <span className="text-sm">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`pt-6 border-t border-white/5 space-y-3 ${collapsed ? "items-center" : ""}`}>
                    <a
                        href="https://mindsetchildrenshome.co.uk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={collapsed ? "Visit Website" : ""}
                        className={`flex items-center justify-center bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-all duration-200 font-bold text-sm mb-2 ${collapsed ? "p-2.5" : "px-4 py-3 w-full space-x-2"}`}
                    >
                        {collapsed ? <BarChart3 size={18} /> : <span>Visit Mindsetchildren Home</span>}
                    </a>

                    {session?.user && (
                        <div className={`bg-white/5 rounded-2xl border border-white/5 transition-all duration-300 ${collapsed ? "p-2" : "px-4 py-3"}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs ring-2 ring-blue-500/10 shrink-0">
                                    {session.user.name?.charAt(0)}
                                </div>
                                {!collapsed && (
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">{(session.user as any).role}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => signOut()}
                        title={collapsed ? "Sign Out" : ""}
                        className={`flex items-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all duration-200 font-bold text-sm ${collapsed ? "justify-center p-2.5" : "space-x-3 px-4 py-3 w-full"}`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>

                    {!isMobile && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`hidden md:flex items-center justify-center w-full mt-4 text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5`}
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                            {!isCollapsed && <span className="ml-2 text-xs font-bold uppercase tracking-wider">Collapse</span>}
                        </button>
                    )}
                </div>
            </>
        );
    };

    return (
        <>
            {/* Mobile hamburger button - larger touch target */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-3 left-3 z-50 bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-white shadow-xl shadow-black/20 hover:bg-slate-700 transition-all active:scale-95"
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            {/* Mobile overlay backdrop */}
            <div
                className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile sidebar (slide-in drawer) */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-[280px] sm:w-80 bg-[#0f172a] border-r border-white/5 flex flex-col p-5 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 active:scale-95"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
                {sidebarContent(true)}
            </aside>

            {/* Desktop sidebar (always visible) */}
            <aside className={`hidden md:flex transition-all duration-300 ease-in-out bg-[#0f172a] border-r border-white/5 flex-col p-6 shadow-2xl ${isCollapsed ? "w-20" : "w-64"}`}>
                {sidebarContent(false)}
            </aside>
        </>
    );
};

export default Sidebar;
