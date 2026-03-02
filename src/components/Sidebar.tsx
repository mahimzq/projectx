"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, CheckSquare, Settings, LogOut, BarChart3, Menu, X, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSpace } from "@/components/SpaceContext";

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { spaces, activeSpaceId, setActiveSpaceId } = useSpace();

    // Hide sidebar entirely when not authenticated
    if (status === "unauthenticated" || !session) {
        return null;
    }

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

    const role = (session?.user as any)?.role || 'STAFF';
    const canSeeSettings = ['DIRECTOR', 'ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'CAREHOME_MANAGER'].includes(role);

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Task Management", href: "/tasks", icon: CheckSquare },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ];

    if (canSeeSettings) {
        navItems.push({ name: "Settings", href: "/settings", icon: Settings });
    }

    const sidebarContent = (isMobile: boolean = false) => {
        const collapsed = !isMobile && isCollapsed;

        return (
            <div className="flex flex-col h-full bg-[#0f172a]/40 backdrop-blur-xl">
                {/* Logo Section */}
                <div className={`transition-all duration-500 ease-in-out ${collapsed ? "mb-6 py-6" : "mb-8 md:mb-10 p-6 pb-0"}`}>
                    {collapsed ? (
                        <div className="flex justify-center group cursor-pointer" onClick={() => setIsCollapsed(false)} title="Expand Menu">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center border border-white/5 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                                <img src="/logo.png" alt="M" className="w-6 h-6 object-contain" />
                            </div>
                        </div>
                    ) : (
                        <a href="https://mindsetchildrenshome.co.uk/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-all group">
                            <img src="/logo.png" alt="MINDSET Logo" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]" />
                            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.25em] font-black">Mobilisation SaaS</p>
                        </a>
                    )}
                </div>

                {/* Space Selector */}
                {spaces.length > 0 && (
                    <div className={`transition-all duration-300 ${collapsed ? "px-3 mb-6" : "px-6 mb-8"}`}>
                        {collapsed ? (
                            <div className="group relative flex justify-center">
                                <button
                                    onClick={() => setIsCollapsed(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg shadow-black/20"
                                    title="Switch Space"
                                >
                                    <Building2 size={20} />
                                </button>
                                {/* Active space indicator dot */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-[#0f172a] rounded-full shadow-lg" />
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-white/5 rounded-xl border border-white/10 p-3 flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Building2 size={12} className="text-blue-400" />
                                        Active Space
                                    </label>
                                    <select
                                        value={activeSpaceId || ''}
                                        onChange={(e) => setActiveSpaceId(e.target.value || null)}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
                                    >
                                        {spaces.map((space) => (
                                            <option key={space.id} value={space.id} className="bg-slate-900">{space.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 bottom-5 pointer-events-none opacity-50">
                                        <ChevronRight size={14} className="rotate-90 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Navigation */}
                <nav className={`flex-1 ${collapsed ? "px-3" : "px-6"} space-y-2`}>
                    {!collapsed && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</p>}
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ""}
                                className={`flex items-center rounded-xl transition-all duration-300 group ${collapsed ? "justify-center w-10 h-10 mx-auto" : "space-x-3 px-4 py-3"} ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 font-bold scale-[1.02]"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100 font-medium hover:scale-[1.02]"
                                    }`}
                            >
                                <Icon size={isActive ? 20 : 18} className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} transition-all shrink-0`} />
                                {!collapsed && <span className="text-sm tracking-wide">{item.name}</span>}
                                {isActive && !collapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className={`mt-auto border-t border-white/5 bg-black/10 transition-all duration-300 ${collapsed ? "p-3 pb-6 pt-6" : "p-6 pt-8"} space-y-4`}>
                    {/* External Link */}
                    <a
                        href="https://mindsetchildrenshome.co.uk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={collapsed ? "Visit Website" : ""}
                        className={`group flex items-center rounded-xl transition-all duration-300 ${collapsed ? "justify-center w-10 h-10 mx-auto bg-white/5 border border-white/10" : "px-4 py-3 space-x-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10"}`}
                    >
                        <BarChart3 size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span className="text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white">Visit Website</span>}
                    </a>

                    {/* User Profile Card */}
                    {session?.user && (
                        <div className={`relative group transition-all duration-500 ${collapsed ? "w-10 h-10 mx-auto" : "rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-3"}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/40 shrink-0 group-hover:scale-110 transition-transform">
                                    {session.user.name?.charAt(0)}
                                </div>
                                {!collapsed && (
                                    <div className="overflow-hidden flex-1">
                                        <p className="text-xs font-black text-white truncate leading-tight tracking-tight">{session.user.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate">{(session.user as any).role}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sign Out Button */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        title={collapsed ? "Sign Out" : ""}
                        className={`group flex items-center transition-all duration-300 rounded-xl ${collapsed ? "justify-center w-10 h-10 mx-auto hover:bg-rose-500/10 text-slate-500 hover:text-rose-400" : "px-4 py-3 space-x-3 w-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-400 border border-rose-500/10"}`}
                    >
                        <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                        {!collapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
                    </button>

                    {/* Collapse Toggle */}
                    {!isMobile && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`flex items-center justify-center w-full pt-2 text-slate-600 hover:text-white transition-all group rounded-xl p-2 hover:bg-white/5`}
                        >
                            {isCollapsed ? (
                                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Minimize</span>
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Mobile hamburger button - larger touch target */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-2xl shadow-black/40 hover:bg-slate-800 transition-all active:scale-90"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile overlay backdrop */}
            <div
                className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity duration-500 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile sidebar (slide-in drawer) */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-[300px] bg-[#0f172a] flex flex-col shadow-2xl z-[101] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 z-20"
                    aria-label="Close menu"
                >
                    <X size={24} />
                </button>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sidebarContent(true)}
                </div>
            </aside>

            {/* Desktop sidebar (sticky and fixed) */}
            <aside className={`hidden md:flex sticky top-0 h-screen transition-all duration-500 ease-in-out bg-[#0f172a] border-r border-white/10 flex-col shadow-2xl z-40 ${isCollapsed ? "w-20" : "w-72"}`}>
                <div className="flex-1 h-full overflow-hidden">
                    {sidebarContent(false)}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
