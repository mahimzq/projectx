"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle, Trash2, Info, CheckCircle, XCircle, X } from "lucide-react";

type AlertVariant = "danger" | "warning" | "info" | "success";

interface AlertDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    variant?: AlertVariant;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    showCancel?: boolean;
}

const variantConfig = {
    danger: {
        icon: Trash2,
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-400",
        ringColor: "ring-rose-500/20",
        buttonBg: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20",
        accentBorder: "border-rose-500/20",
        glow: "from-rose-600/5 to-transparent",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
        ringColor: "ring-amber-500/20",
        buttonBg: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20",
        accentBorder: "border-amber-500/20",
        glow: "from-amber-600/5 to-transparent",
    },
    info: {
        icon: Info,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-400",
        ringColor: "ring-blue-500/20",
        buttonBg: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
        accentBorder: "border-blue-500/20",
        glow: "from-blue-600/5 to-transparent",
    },
    success: {
        icon: CheckCircle,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
        ringColor: "ring-emerald-500/20",
        buttonBg: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
        accentBorder: "border-emerald-500/20",
        glow: "from-emerald-600/5 to-transparent",
    },
};

export default function AlertDialog({
    isOpen,
    title,
    message,
    variant = "danger",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    showCancel = true,
}: AlertDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        },
        [onCancel]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="alert-title"
                aria-describedby="alert-message"
                className={`
          relative w-full max-w-[min(420px,calc(100vw-2rem))]
          bg-[#0f172a]/95 backdrop-blur-xl
          border ${config.accentBorder}
          rounded-2xl shadow-2xl shadow-black/40
          animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300
          overflow-hidden
        `}
            >
                {/* Top accent glow */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${config.glow} pointer-events-none`} />

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all z-10"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                {/* Content */}
                <div className="relative p-6 sm:p-8 text-center">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl ${config.iconBg} ring-1 ${config.ringColor} mb-5`}>
                        <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${config.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3
                        id="alert-title"
                        className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2"
                    >
                        {title}
                    </h3>

                    {/* Message */}
                    <p
                        id="alert-message"
                        className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-[300px] mx-auto"
                    >
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className={`px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 ${showCancel ? '' : 'justify-center'}`}>
                    {showCancel && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-[0.97]"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        autoFocus
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white ${config.buttonBg} shadow-lg transition-all active:scale-[0.97]`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ───── Hook for easy imperative usage ───── */

interface AlertState {
    isOpen: boolean;
    title: string;
    message: string;
    variant: AlertVariant;
    confirmLabel: string;
    cancelLabel: string;
    showCancel: boolean;
    resolve: ((value: boolean) => void) | null;
}

import { useState } from "react";

export function useAlertDialog() {
    const [state, setState] = useState<AlertState>({
        isOpen: false,
        title: "",
        message: "",
        variant: "danger",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        showCancel: true,
        resolve: null,
    });

    const confirm = useCallback(
        (options: {
            title: string;
            message: string;
            variant?: AlertVariant;
            confirmLabel?: string;
            cancelLabel?: string;
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    title: options.title,
                    message: options.message,
                    variant: options.variant || "danger",
                    confirmLabel: options.confirmLabel || "Delete",
                    cancelLabel: options.cancelLabel || "Cancel",
                    showCancel: true,
                    resolve,
                });
            });
        },
        []
    );

    const alert = useCallback(
        (options: {
            title: string;
            message: string;
            variant?: AlertVariant;
            confirmLabel?: string;
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    title: options.title,
                    message: options.message,
                    variant: options.variant || "info",
                    confirmLabel: options.confirmLabel || "OK",
                    cancelLabel: "Cancel",
                    showCancel: false,
                    resolve,
                });
            });
        },
        []
    );

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState((s) => ({ ...s, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const DialogComponent = (
        <AlertDialog
            isOpen={state.isOpen}
            title={state.title}
            message={state.message}
            variant={state.variant}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            showCancel={state.showCancel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, alert, DialogComponent };
}
