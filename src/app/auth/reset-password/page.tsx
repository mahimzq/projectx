"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div className="glass-card p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold text-white">Invalid Link</h2>
                <p className="text-slate-400 text-sm">No reset token found in the URL. Please request a new link.</p>
                <Link href="/auth/forgot-password" className="inline-block mt-4 bg-white/5 border border-white/10 px-6 py-2 rounded-lg text-white hover:bg-white/10">
                    Request New Link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("A network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-card p-8 space-y-6 text-center shadow-2xl animate-in zoom-in">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-2xl mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Password Reset</h1>
                <p className="text-slate-400 text-sm">Your password has been successfully updated. You can now securely log in with your new credentials.</p>
                <Link
                    href="/auth/signin"
                    className="w-full flex justify-center py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-all shadow-lg"
                >
                    Go to Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 sm:p-8 space-y-6 sm:space-y-8 border-white/10 shadow-2xl">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-blue-500/10 rounded-2xl mb-3 sm:mb-4">
                    <Lock className="text-blue-500 w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">New Password</h1>
                <p className="text-slate-400 text-sm sm:text-base">Enter a strong, secure password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Reset Password</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" />

            <div className="w-full max-w-[min(400px,calc(100vw-2rem))] animate-in fade-in zoom-in duration-300 relative">
                <Suspense fallback={<div className="glass-card p-12 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
