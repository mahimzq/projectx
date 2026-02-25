"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  Sparkles
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

const MOTIVATIONAL_QUOTES = [
  "To launch and mobilize Mindset Childrens Home as a compassionate, self-sustaining model that delivers exceptional care, education, and opportunity to vulnerable children through dedicated resources, partnerships, and community support.",
  "Every child deserves a safe haven where they are nurtured, valued, and empowered to reach their full potential. Through unified action, we transform that vision into reality — one milestone at a time.",
  "Building a children's home is not just about bricks and mortar — it's about creating a sanctuary of hope, trust, and belonging where every young life can flourish beyond their circumstances.",
  "Our mission extends beyond shelter: we are cultivating resilience, igniting curiosity, and planting seeds of self-belief in children who will one day lead their communities with compassion and strength.",
  "True mobilisation means aligning hearts, minds, and resources towards a singular purpose — ensuring no child is left behind, and every door of opportunity swings wide open for them.",
  "Together we are laying the foundation for something extraordinary: a home that heals, educates, and inspires — a launchpad for the next generation of changemakers and dreamers.",
  "Progress is not just measured in percentages and timelines, but in the smiles we'll see, the futures we'll unlock, and the lives forever changed by our collective commitment.",
  "From strategic planning to boots-on-the-ground action, every task completed brings us closer to the day when Mindset Childrens Home opens its doors and transforms vulnerable lives.",
  "We believe that when passionate people come together with a clear purpose, the impossible becomes inevitable. This mobilisation is proof of that unwavering belief in action.",
  "A child's potential knows no bounds when met with love, stability, and opportunity. Every phase of this plan is a step towards giving that gift to those who need it most.",
];

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  // Rotate quotes every 5 minutes with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setIsFading(false);
      }, 500);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
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

      {/* Goal Section — Rotating Quotes */}
      <div className="glass-card p-5 md:p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-base md:text-xl font-bold text-white">Mobilisation Goal</h3>
          </div>
          <Sparkles className="text-blue-500/30 w-4 h-4 md:w-5 md:h-5" />
        </div>
        <p
          className={`text-sm md:text-lg text-slate-300 leading-relaxed italic transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
          &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
        </p>
        {/* Subtle progress dots */}
        <div className="flex items-center gap-1 mt-4 justify-center">
          {MOTIVATIONAL_QUOTES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${i === quoteIndex ? 'w-4 h-1.5 bg-blue-400' : 'w-1.5 h-1.5 bg-slate-600'}`}
            />
          ))}
        </div>
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
