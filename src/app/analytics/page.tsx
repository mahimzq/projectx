"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useSpace } from "@/components/SpaceContext";

const AnalyticsPage = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { activeSpaceId } = useSpace();

    useEffect(() => {
        setLoading(true);
        const spaceQuery = activeSpaceId ? `?spaceId=${activeSpaceId}` : '';
        fetch(`/api/summary${spaceQuery}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch analytics:", err);
                setLoading(false);
            });
    }, [activeSpaceId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in">
            <div>
                <h2 className="text-xl md:text-3xl font-bold text-white">Mobilisation Analytics</h2>
                <p className="text-slate-400 mt-1 text-sm md:text-base">Visual data breakdown of project progress and costs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Progress by Phase */}
                <div className="glass-card p-4 md:p-8 bg-slate-800/20">
                    <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6">Progress by Phase (%)</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.phaseStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickFormatter={(val) => val.split(":")[0]}
                                    interval={0}
                                    angle={-35}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} width={30} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Status Distribution */}
                <div className="glass-card p-4 md:p-8 bg-slate-800/20">
                    <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6">Action Item Status</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Completed', value: data.completedTasks },
                                        { name: 'Remaining', value: data.totalTasks - data.completedTasks },
                                    ]}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#334155" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-3 md:mt-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-400">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                            <span className="text-xs text-slate-400">Remaining</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
