"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to process request");
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("A network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 z-50">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" />

            <div className="w-full max-w-[min(400px,calc(100vw-2rem))] animate-in fade-in zoom-in duration-300 relative">
                <div className="glass-card p-6 sm:p-8 space-y-6 sm:space-y-8 border-white/10 shadow-2xl">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-blue-500/10 rounded-2xl mb-3 sm:mb-4">
                            <Mail className="text-blue-500 w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Recover Password</h1>
                        <p className="text-slate-400 text-sm sm:text-base">We'll send a reset link to your email</p>
                    </div>

                    {success ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
                                <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                                <div className="space-y-1">
                                    <h3 className="text-emerald-400 font-bold">Email Sent!</h3>
                                    <p className="text-slate-400 text-sm">
                                        If {email} is registered, you will receive a reset link shortly.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/auth/signin"
                                className="w-full flex justify-center py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-all"
                            >
                                Return to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Account Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="you@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Send Link</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="text-center">
                            <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
