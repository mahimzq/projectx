"use client";

import { useEffect, useState, useRef } from "react";

interface PhaseCardProps {
    name: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    delay?: number;
}

function useCountUp(target: number, duration: number = 1000, delay: number = 0) {
    const [count, setCount] = useState(0);
    const startRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const animate = (timestamp: number) => {
                if (!startRef.current) startRef.current = timestamp;
                const elapsed = timestamp - startRef.current;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(Math.round(eased * target));
                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                }
            };
            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [target, duration, delay]);

    return count;
}

const PhaseCard = ({ name, totalTasks, completedTasks, progress, delay = 0 }: PhaseCardProps) => {
    const [showProgress, setShowProgress] = useState(false);
    const animatedProgress = useCountUp(Math.round(progress), 1200, delay + 300);

    useEffect(() => {
        const timer = setTimeout(() => setShowProgress(true), delay + 100);
        return () => clearTimeout(timer);
    }, [delay]);

    // Determine color based on progress
    const getProgressColor = () => {
        if (progress >= 80) return 'from-emerald-500 to-emerald-400';
        if (progress >= 50) return 'from-blue-500 to-blue-400';
        if (progress >= 25) return 'from-amber-500 to-amber-400';
        return 'from-rose-500 to-rose-400';
    };

    const getBadgeColor = () => {
        if (progress >= 80) return 'bg-emerald-500/20 text-emerald-400';
        if (progress >= 50) return 'bg-blue-500/20 text-blue-400';
        if (progress >= 25) return 'bg-amber-500/20 text-amber-400';
        return 'bg-rose-500/20 text-rose-400';
    };

    return (
        <div
            className="glass-card p-4 md:p-6 card-3d-in relative overflow-hidden group"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Subtle background gradient glow */}
            <div
                className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${getProgressColor()} opacity-5 blur-2xl transition-opacity duration-500 group-hover:opacity-10`}
            />

            <div className="flex justify-between items-center mb-3 md:mb-4 gap-2 relative z-10">
                <h4 className="text-base md:text-lg font-semibold text-white truncate">{name}</h4>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getBadgeColor()} shrink-0 number-pop transition-transform duration-300 group-hover:scale-110`} style={{ animationDelay: `${delay + 400}ms` }}>
                    {animatedProgress}%
                </span>
            </div>

            {/* Animated progress bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-3 md:mb-4 overflow-hidden relative z-10">
                <div
                    className={`bg-gradient-to-r ${getProgressColor()} h-full rounded-full transition-all duration-300 relative`}
                    style={{ width: showProgress ? `${progress}%` : '0%', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                    {/* Shimmer overlay on progress bar */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{
                            animation: 'shimmer 2s linear infinite',
                            backgroundSize: '200% auto',
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-medium relative z-10">
                <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getProgressColor()} breathe`} />
                    {completedTasks} Completed
                </span>
                <span>{totalTasks} Total</span>
            </div>
        </div>
    );
};

export default PhaseCard;
