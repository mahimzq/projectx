"use client";

import { useEffect, useState, useRef } from "react";
import {
  TrendingUp, Users, Calendar, AlertCircle, Clock, CheckCircle2,
  DollarSign, Sparkles, Zap, Target, Activity, ArrowUpRight,
  Timer, AlertTriangle, Pause, BarChart3
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PhaseCard from "@/components/PhaseCard";
import { useSpace } from "@/components/SpaceContext";
import TaskAssignModal from "@/components/TaskAssignModal";

interface SummaryData {
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalEstimatedCost: number;
  phaseStats: any[];
  recentActivity: any[];
}

const MOTIVATIONAL_QUOTES = [
  "To launch and mobilize Mindset Childrens Home as a compassionate, self-sustaining model that delivers exceptional care, education, and opportunity to vulnerable children.",
  "Every child deserves a safe haven where they are nurtured, valued, and empowered to reach their full potential.",
  "Building a children's home is not just about bricks and mortar — it's about creating a sanctuary of hope, trust, and belonging.",
  "Our mission extends beyond shelter: we are cultivating resilience, igniting curiosity, and planting seeds of self-belief.",
  "True mobilisation means aligning hearts, minds, and resources towards a singular purpose — ensuring no child is left behind.",
  "Together we are laying the foundation for something extraordinary: a home that heals, educates, and inspires.",
  "Progress is not just measured in percentages and timelines, but in the smiles we'll see and the futures we'll unlock.",
  "From strategic planning to boots-on-the-ground action, every task completed brings us closer to opening day.",
  "We believe that when passionate people come together with a clear purpose, the impossible becomes inevitable.",
  "A child's potential knows no bounds when met with love, stability, and opportunity.",
];

/* ─── Animated Progress Ring ─── */
const ProgressRing = ({ progress, size = 130, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = progress / 60;
      const interval = setInterval(() => {
        current += step;
        if (current >= progress) { current = progress; clearInterval(interval); }
        setAnimatedProgress(current);
      }, 16);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative radial-pulse" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle className="text-slate-800" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className="transition-all duration-100" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          stroke="url(#progressGradient)" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl md:text-3xl font-black text-white gradient-text">{Math.round(animatedProgress)}%</span>
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Complete</span>
      </div>
    </div>
  );
};

/* ─── Aurora Background with Embers ─── */
const AuroraBackground = () => {
  const [embers, setEmbers] = useState<any[]>([]);

  useEffect(() => {
    // Generate random embers only on the client to avoid hydration mismatch
    const clientEmbers = Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 4 + 3; // 3px - 7px
      const left = Math.random() * 100; // 0% - 100%
      const animationDuration = Math.random() * 6 + 3; // 3s - 9s
      const animationDelay = Math.random() * 3; // 0s - 3s
      return (
        <div
          key={i}
          className="ember"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDuration: `${animationDuration}s, 2s`, // riseAndFade, pulseGlow
            animationDelay: `${animationDelay}s, ${animationDelay}s`,
          }}
        />
      );
    });
    setEmbers(clientEmbers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {/* Large morphing orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/[0.07] rounded-full blur-[100px] aurora-orb-1 morph-blob" />
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-purple-600/[0.06] rounded-full blur-[100px] aurora-orb-2 morph-blob" />
      <div className="absolute bottom-[-5%] left-[30%] w-[450px] h-[450px] bg-emerald-600/[0.05] rounded-full blur-[100px] aurora-orb-3 morph-blob" />

      {/* Fire / Sparkles */}
      {embers}
    </div>
  );
};

/* ─── Live Clock ─── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 glass-card px-3 py-2 sway">
      <Timer size={14} className="text-blue-400" />
      <span className="text-xs font-mono font-bold text-white tabular-nums">
        {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};

/* ─── Live Indicator ─── */
const LiveIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
    </div>
    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { activeSpaceId } = useSpace();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Fetch summary and users
  useEffect(() => {
    setLoading(true);
    setShowContent(false);
    const spaceQuery = activeSpaceId ? `?spaceId=${activeSpaceId}` : '';

    Promise.all([
      fetch(`/api/summary${spaceQuery}`).then(res => res.json()),
      fetch("/api/users").then(res => res.json())
    ]).then(([summaryData, usersData]) => {
      setData(summaryData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [activeSpaceId]);

  const handleAssignSave = async (taskId: string, updates: any) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerName: updates.ownerName,
        priority: updates.priority,
        dueDate: updates.dueDate,
        status: updates.status,
        notes: updates.notes,
        resources: updates.resources,
      }),
    });
    if (res.ok) {
      // Refresh summary
      const spaceQuery = activeSpaceId ? `?spaceId=${activeSpaceId}` : '';
      fetch(`/api/summary${spaceQuery}`)
        .then(res => res.json())
        .then(d => setData(d));
    }
  };

  // Quote rotation - 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => { setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length); setIsFading(false); }, 500);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Task breakdown for live cards
  const lateTasks = data?.phaseStats.flatMap(p => p.tasks?.filter((t: any) => {
    if (t.status === 'Complete') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).map((t: any) => ({ ...t, phase: { name: p.name } })) || []) || [];

  const inProgressTasks = data?.phaseStats.flatMap(p => p.tasks?.filter((t: any) => t.status === 'In Progress').map((t: any) => ({ ...t, phase: { name: p.name } })) || []) || [];

  const onHoldTasks = data?.phaseStats.flatMap(p => p.tasks?.filter((t: any) => t.status === 'On Hold').map((t: any) => ({ ...t, phase: { name: p.name } })) || []) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
          <div className="animate-spin rounded-full h-14 w-14 border-l-2 border-r-2 border-purple-500 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!data || (data as any).error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 px-4">
        <AlertCircle className="text-red-500" size={48} />
        <div className="text-white text-lg font-bold">Error loading dashboard.</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Retry</button>
      </div>
    );
  }

  const PHASE_COLORS = [
    { gradient: 'from-blue-500 to-cyan-400', bg: 'from-blue-600/10 to-cyan-600/5', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
    { gradient: 'from-purple-500 to-pink-400', bg: 'from-purple-600/10 to-pink-600/5', border: 'border-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400' },
    { gradient: 'from-emerald-500 to-teal-400', bg: 'from-emerald-600/10 to-teal-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  ];

  return (
    <div className="w-[95%] mx-auto space-y-6 md:space-y-8 relative z-10">
      <AuroraBackground />

      {/* ─── Header ─── */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white underline-sweep">Project Overview</h2>
            <LiveIndicator />
          </div>
          <p className="text-slate-400 mt-1 text-sm">Real-time mobilisation status</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <div className="float-slow">
            <ProgressRing progress={data.overallProgress} size={90} strokeWidth={6} />
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <StatsCard title="Total Actions" value={data.totalTasks} icon={CheckCircle2} subValue={`${data.completedTasks} completed`} colorClass="text-emerald-500" delay={100} />
        <StatsCard title="Overdue" value={data.overdueTasks} icon={AlertCircle} subValue="Need attention" colorClass="text-red-500" delay={200} />
        <StatsCard title="Est. Total Cost" value={`£${data.totalEstimatedCost.toLocaleString()}`} icon={DollarSign} subValue="Budget" colorClass="text-blue-500" delay={300} />
        <StatsCard title="Timeline" value="Feb - Aug" icon={Calendar} subValue="2026 Scheduled" colorClass="text-purple-500" delay={400} />
      </div>

      {/* ─── Live Activity Ticker ─── */}
      <div className={`glass-card overflow-hidden transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="flex items-center px-4 py-2.5 gap-3">
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10">
            <Activity size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-8 whitespace-nowrap ticker-scroll" style={{ width: 'max-content' }}>
              {[...Array(2)].map((_, rep) => (
                <div key={rep} className="flex items-center gap-8">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 size={12} /> {data.completedTasks} tasks completed
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                    <Clock size={12} /> {inProgressTasks.length} in progress
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <AlertTriangle size={12} /> {data.overdueTasks} overdue
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Pause size={12} /> {onHoldTasks.length} on hold
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                    <BarChart3 size={12} /> {data.phaseStats.length} phases tracked
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <DollarSign size={12} /> £{data.totalEstimatedCost.toLocaleString()} budget
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live Task Status Cards ─── */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Late / Overdue */}
        <div className="glass-card border-red-500/20 bg-gradient-to-br from-red-600/10 to-rose-600/5 p-5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-all aurora-orb-1" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/20 rounded-xl breathe">
                <AlertTriangle className="text-red-400 w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Late</h4>
            </div>
            <span className="text-2xl font-black text-red-400 number-pop">{lateTasks.length}</span>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {lateTasks.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">No overdue tasks ✓</p>
            ) : (
              lateTasks.slice(0, 5).map((task: any, i: number) => (
                <div key={i}
                  className="bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2 flex items-start gap-2 group/item hover:border-red-500/20 transition-all cursor-pointer"
                  onClick={() => setSelectedTask(task)}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover/item:text-white">{task.actionItem}</p>
                    <p className="text-[10px] text-red-400/70 mt-0.5">Due: {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all aurora-orb-2" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-xl breathe" style={{ animationDelay: '0.5s' }}>
                <Clock className="text-blue-400 w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">In Progress</h4>
            </div>
            <span className="text-2xl font-black text-blue-400 number-pop" style={{ animationDelay: '200ms' }}>{inProgressTasks.length}</span>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">No active tasks</p>
            ) : (
              inProgressTasks.slice(0, 5).map((task: any, i: number) => (
                <div key={i}
                  className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-3 py-2 flex items-start gap-2 group/item hover:border-blue-500/20 transition-all cursor-pointer"
                  onClick={() => setSelectedTask(task)}>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 breathe" style={{ animationDelay: `${i * 0.3}s` }} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover/item:text-white">{task.actionItem}</p>
                    {task.owner?.name && <p className="text-[10px] text-blue-400/70 mt-0.5">{task.owner.name}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* On Hold */}
        <div className="glass-card border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-yellow-600/5 p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all aurora-orb-3" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-xl breathe" style={{ animationDelay: '1s' }}>
                <Pause className="text-amber-400 w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">On Hold</h4>
            </div>
            <span className="text-2xl font-black text-amber-400 number-pop" style={{ animationDelay: '400ms' }}>{onHoldTasks.length}</span>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {onHoldTasks.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">No tasks on hold</p>
            ) : (
              onHoldTasks.slice(0, 5).map((task: any, i: number) => (
                <div key={i}
                  className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2 flex items-start gap-2 group/item hover:border-amber-500/20 transition-all cursor-pointer"
                  onClick={() => setSelectedTask(task)}>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover/item:text-white">{task.actionItem}</p>
                    {task.owner?.name && <p className="text-[10px] text-amber-400/70 mt-0.5">{task.owner.name}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Motivational Quote ─── */}
      <div className={`glass-card p-5 md:p-8 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 border-blue-500/20 relative overflow-hidden transition-all duration-700 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="absolute top-4 right-4 opacity-10"><Sparkles className="w-20 h-20 text-blue-400 float" /></div>
        <div className="absolute bottom-2 left-6 opacity-5"><Zap className="w-16 h-16 text-purple-400 float-slow float-delay-2" /></div>

        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="p-2 bg-blue-500/20 rounded-lg breathe"><TrendingUp className="text-blue-400 w-5 h-5" /></div>
          <h3 className="text-base md:text-lg font-bold text-white">Mobilisation Goal</h3>
        </div>

        <p className={`text-sm md:text-base text-slate-300 leading-relaxed italic transition-all duration-700 relative z-10 ${isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
        </p>

        <div className="flex items-center gap-1.5 mt-5 justify-center relative z-10">
          {MOTIVATIONAL_QUOTES.map((_, i) => (
            <button key={i} onClick={() => { setIsFading(true); setTimeout(() => { setQuoteIndex(i); setIsFading(false); }, 300); }}
              className={`rounded-full transition-all duration-500 cursor-pointer hover:opacity-80 ${i === quoteIndex ? 'w-6 h-2 bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-500/30' : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'}`} />
          ))}
        </div>
      </div>

      {/* ─── Phases Grid with 3 rotating colors ─── */}
      <div className={`space-y-5 transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base md:text-xl font-bold text-white">Mobilisation Phases</h3>
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold number-pop">{data.phaseStats.length} Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {data.phaseStats.map((phase, index) => {
            const color = PHASE_COLORS[index % 3];
            const phaseProgress = phase.totalTasks > 0 ? (phase.completedTasks / phase.totalTasks) * 100 : 0;
            return (
              <div key={phase.id}
                className={`glass-card p-5 card-3d-in relative overflow-hidden group border ${color.border} bg-gradient-to-br ${color.bg} hover:shadow-lg transition-all duration-500`}
                style={{ animationDelay: `${index * 80}ms` }}>
                {/* Animated glow */}
                <div className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-br ${color.gradient} opacity-[0.04] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.08] aurora-orb-${(index % 3) + 1}`} />

                <div className="relative z-10 flex justify-between items-center mb-3 gap-2">
                  <h4 className="text-sm md:text-base font-bold text-white truncate">{phase.name}</h4>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${color.badge} shrink-0 number-pop`} style={{ animationDelay: `${index * 80 + 300}ms` }}>
                    {Math.round(phaseProgress)}%
                  </span>
                </div>

                {/* Progress bar with phase color */}
                <div className="relative z-10 w-full bg-slate-800/80 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div className={`bg-gradient-to-r ${color.gradient} h-full rounded-full relative`}
                    style={{ width: `${phaseProgress}%`, transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 2s linear infinite', backgroundSize: '200% auto' }} />
                  </div>
                </div>

                <div className="relative z-10 flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color.gradient} breathe`} style={{ animationDelay: `${index * 0.3}s` }} />
                    {phase.completedTasks} Done
                  </span>
                  <span>{phase.totalTasks} Total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Latest Activity Feed ─── */}
      <div className={`space-y-4 transition-all duration-700 delay-[600ms] ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base md:text-xl font-bold text-white">Latest Activity</h3>
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Recent updates</span>
        </div>

        <div className="glass-card overflow-hidden divide-y divide-white/[0.03]">
          {(data.recentActivity || []).length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto text-slate-700 mb-3" size={28} />
              <p className="text-slate-600 text-sm font-medium">No recent activity</p>
            </div>
          ) : (
            (data.recentActivity || []).map((item: any, i: number) => {
              const statusColor = item.status === 'Complete' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-blue-500' : item.status === 'On Hold' ? 'bg-amber-500' : 'bg-slate-500';
              const statusBg = item.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : item.status === 'On Hold' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400';

              const updated = new Date(item.updatedAt);
              const diffMs = new Date().getTime() - updated.getTime();
              const diffMin = Math.floor(diffMs / 60000);
              const diffHr = Math.floor(diffMin / 60);
              const diffDay = Math.floor(diffHr / 24);
              let timeAgo = 'just now';
              if (diffDay > 0) timeAgo = `${diffDay}d ago`;
              else if (diffHr > 0) timeAgo = `${diffHr}h ago`;
              else if (diffMin > 0) timeAgo = `${diffMin}m ago`;

              return (
                <div key={item.id}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 hover:bg-white/[0.04] transition-all group card-3d-in cursor-pointer"
                  style={{ animationDelay: `${600 + i * 60}ms` }}
                  onClick={() => setSelectedTask(item)}>
                  <div className="shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${item.status === 'In Progress' ? 'breathe' : ''}`}
                      style={item.status === 'In Progress' ? { animationDelay: `${i * 0.4}s` } : {}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">{item.actionItem}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusBg}`}>{item.status.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500 font-medium truncate">{item.phase?.name}</span>
                    </div>
                  </div>
                  {item.owner?.name && (
                    <div className="shrink-0 hidden sm:flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 text-[9px] font-bold ring-1 ring-blue-500/10">
                        {item.owner.name.charAt(0)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium max-w-[60px] truncate">{item.owner.name}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-600 font-medium shrink-0 tabular-nums">{timeAgo}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
      {selectedTask && (
        <TaskAssignModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onSave={handleAssignSave}
        />
      )}
    </div>
  );
}
