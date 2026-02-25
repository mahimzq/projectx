"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PhaseCard from "@/components/PhaseCard";

interface SummaryData {
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalEstimatedCost: number;
  phaseStats: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch summary");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch summary:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || (data as any).error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 px-4">
        <AlertCircle className="text-red-500" size={48} />
        <div className="text-white text-lg md:text-xl font-bold text-center">Error loading dashboard data.</div>
        <p className="text-slate-400 text-center text-sm">Please check your database connection or try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Project Overview</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Real-time mobilisation status for Mindset Childrens Home</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs md:text-sm font-medium text-slate-400">Current Progress</p>
          <p className="text-xl md:text-2xl font-bold text-blue-400">{Math.round(data.overallProgress)}%</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 stagger-in">
        <StatsCard
          title="Total Actions"
          value={data.totalTasks}
          icon={CheckCircle2}
          subValue={`${data.completedTasks} completed`}
          colorClass="text-green-500"
        />
        <StatsCard
          title="Overdue"
          value={data.overdueTasks}
          icon={AlertCircle}
          subValue="Actions needing attention"
          colorClass="text-red-500"
        />
        <StatsCard
          title="Est. Total Cost"
          value={`£${data.totalEstimatedCost.toLocaleString()}`}
          icon={DollarSign}
          subValue="Mobilisation budget"
          colorClass="text-blue-500"
        />
        <StatsCard
          title="Project Timeline"
          value="Feb - Aug"
          icon={Calendar}
          subValue="2026 Scheduled"
          colorClass="text-purple-500"
        />
      </div>

      {/* Goal Section */}
      <div className="glass-card p-5 md:p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
        <div className="flex items-center space-x-3 mb-3 md:mb-4">
          <TrendingUp className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
          <h3 className="text-base md:text-xl font-bold text-white">Mobilisation Goal</h3>
        </div>
        <p className="text-sm md:text-lg text-slate-300 leading-relaxed italic">
          "To launch and mobilize Mindset Childrens Home as a compassionate, self-sustaining model that delivers exceptional care, education, and opportunity to vulnerable children through dedicated resources, partnerships, and community support."
        </p>
      </div>

      {/* Phases Grid */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Mobilisation Phases</h3>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View All Phases →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 stagger-in">
          {data.phaseStats.map((phase) => (
            <PhaseCard
              key={phase.id}
              name={phase.name}
              totalTasks={phase.totalTasks}
              completedTasks={phase.completedTasks}
              progress={phase.progress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
