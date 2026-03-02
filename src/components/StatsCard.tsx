"use client";

import { useEffect, useState, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subValue?: string;
    colorClass?: string;
    delay?: number;
}

// Animated counter hook
function useCountUp(target: number, duration: number = 1200, delay: number = 0) {
    const [count, setCount] = useState(0);
    const startRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const animate = (timestamp: number) => {
                if (!startRef.current) startRef.current = timestamp;
                const elapsed = timestamp - startRef.current;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
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

const StatsCard = ({ title, value, icon: Icon, subValue, colorClass = "text-blue-500", delay = 0 }: StatsCardProps) => {
    const isNumber = typeof value === 'number';
    const animatedValue = useCountUp(isNumber ? value : 0, 1200, delay);

    return (
        <div
            className="glass-card p-4 md:p-6 flex items-start justify-between group cursor-default card-3d-in pulse-glow"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-slate-400 tracking-wide">{title}</p>
                <h3 className="text-xl md:text-3xl font-bold mt-1 text-white truncate number-pop" style={{ animationDelay: `${delay + 200}ms` }}>
                    {isNumber ? animatedValue : value}
                </h3>
                {subValue && (
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1.5 md:mt-2 font-medium truncate">{subValue}</p>
                )}
            </div>
            <div className={`p-2 md:p-3 rounded-xl bg-slate-800/50 ${colorClass} shrink-0 ml-3 icon-wiggle transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 breathe`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
        </div>
    );
};

export default StatsCard;
