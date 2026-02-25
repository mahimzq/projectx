import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subValue?: string;
    colorClass?: string;
}

const StatsCard = ({ title, value, icon: Icon, subValue, colorClass = "text-blue-500" }: StatsCardProps) => {
    return (
        <div className="glass-card p-4 md:p-6 flex items-start justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-slate-400">{title}</p>
                <h3 className="text-xl md:text-3xl font-bold mt-1 text-white truncate">{value}</h3>
                {subValue && <p className="text-[10px] md:text-xs text-slate-500 mt-1.5 md:mt-2 font-medium truncate">{subValue}</p>}
            </div>
            <div className={`p-2 md:p-3 rounded-xl bg-slate-800/50 ${colorClass} shrink-0 ml-3`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
        </div>
    );
};

export default StatsCard;
