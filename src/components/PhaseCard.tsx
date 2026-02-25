interface PhaseCardProps {
    name: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
}

const PhaseCard = ({ name, totalTasks, completedTasks, progress }: PhaseCardProps) => {
    return (
        <div className="glass-card p-4 md:p-6">
            <div className="flex justify-between items-center mb-3 md:mb-4 gap-2">
                <h4 className="text-base md:text-lg font-semibold text-white truncate">{name}</h4>
                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400 shrink-0">
                    {Math.round(progress)}%
                </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 md:mb-4 overflow-hidden">
                <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-medium">
                <span>{completedTasks} Actions Completed</span>
                <span>{totalTasks} Total</span>
            </div>
        </div>
    );
};

export default PhaseCard;
