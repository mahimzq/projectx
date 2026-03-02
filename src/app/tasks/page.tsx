"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Search, Edit2, Trash2, Save, X, Plus, ChevronDown, ChevronUp,
    CheckCircle, Clock, AlertTriangle, Zap, Send, Filter, LayoutGrid,
    List, Calendar, User as UserIcon
} from "lucide-react";
import { useAlertDialog } from "@/components/AlertDialog";
import { useSpace } from "@/components/SpaceContext";
import TaskAssignModal from "@/components/TaskAssignModal";

interface Task {
    id: string;
    actionItem: string;
    priority: string;
    status: string;
    accepted: boolean;
    startDate: string | null;
    dueDate: string | null;
    durationDays: number;
    owner: { name: string } | null;
    submittedBy: { id: string; name: string } | null;
    phase: { name: string };
    resources: string;
    estimatedCost: number;
    notes: string;
}

const getTaskUrgency = (task: any): 'late' | 'urgent' | 'complete' | 'on_hold' | 'normal' => {
    if (task.status === 'Complete') return 'complete';
    if (task.status === 'On Hold') return 'on_hold';
    if (task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 'late';
        if (daysLeft <= 10) return 'urgent';
    }
    return 'normal';
};

const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
        case 'late':
            return {
                border: 'border-l-4 border-l-red-500',
                bg: 'bg-red-500/5',
                badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
                badgeText: 'LATE',
                dot: 'bg-red-500',
                glow: 'shadow-red-500/10',
            };
        case 'urgent':
            return {
                border: 'border-l-4 border-l-orange-500',
                bg: 'bg-orange-500/5',
                badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse',
                badgeText: 'URGENT',
                dot: 'bg-orange-500',
                glow: 'shadow-orange-500/10',
            };
        case 'complete':
            return {
                border: 'border-l-4 border-l-emerald-500',
                bg: 'bg-emerald-500/5',
                badge: '',
                badgeText: '',
                dot: 'bg-emerald-500',
                glow: 'shadow-emerald-500/10',
            };
        case 'on_hold':
            return {
                border: 'border-l-4 border-l-amber-500',
                bg: 'bg-amber-500/5',
                badge: '',
                badgeText: '',
                dot: 'bg-amber-500',
                glow: 'shadow-amber-500/10',
            };
        default:
            return {
                border: 'border-l-4 border-l-blue-500/30',
                bg: '',
                badge: '',
                badgeText: '',
                dot: 'bg-slate-500',
                glow: '',
            };
    }
};

const TasksPage = () => {
    const { data: session } = useSession();
    const { activeSpaceId } = useSpace();
    const [phases, setPhases] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const { confirm: confirmDialog, DialogComponent } = useAlertDialog();

    // Quick-add state
    const [quickAddPhaseId, setQuickAddPhaseId] = useState<string | null>(null);
    const [quickAddText, setQuickAddText] = useState("");
    const [quickAddPriority, setQuickAddPriority] = useState("Medium");

    // Modal state
    const [selectedTask, setSelectedTask] = useState<any>(null);

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
            fetchPhasesAndUsers();
        }
    };

    const userRole = (session?.user as any)?.role || 'STAFF';
    const canAcceptTasks = ['DIRECTOR', 'PROJECT_MANAGER', 'ADMIN'].includes(userRole);

    const fetchPhasesAndUsers = async () => {
        try {
            const spaceQuery = activeSpaceId ? `?spaceId=${activeSpaceId}` : '';
            const [phasesRes, usersRes] = await Promise.all([
                fetch(`/api/phases${spaceQuery}`),
                fetch("/api/users")
            ]);
            if (!phasesRes.ok || !usersRes.ok) throw new Error("Failed");
            const phasesData = await phasesRes.json();
            const usersData = await usersRes.json();
            setPhases(Array.isArray(phasesData) ? phasesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setPhases([]);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhasesAndUsers();
    }, [activeSpaceId]);

    const togglePhaseCollapse = (phaseId: string) => {
        setCollapsedPhases(prev => {
            const next = new Set(prev);
            if (next.has(phaseId)) next.delete(phaseId);
            else next.add(phaseId);
            return next;
        });
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setPhases(p =>
                    p.map(ph => ({
                        ...ph,
                        tasks: ph.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const acceptTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accepted: true }),
            });
            if (res.ok) {
                setPhases(p =>
                    p.map(ph => ({
                        ...ph,
                        tasks: ph.tasks.map((t: any) => t.id === taskId ? { ...t, accepted: true } : t)
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to accept task:", err);
        }
    };

    const handleQuickAdd = async (phaseId: string) => {
        if (!quickAddText.trim()) return;
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phaseId,
                    actionItem: quickAddText.trim(),
                    priority: quickAddPriority,
                    status: "Not Started",
                    spaceId: activeSpaceId || undefined,
                }),
            });
            if (res.ok) {
                setQuickAddText("");
                setQuickAddPhaseId(null);
                fetchPhasesAndUsers();
            }
        } catch (err) {
            console.error("Failed to create task:", err);
        }
    };

    const handleEditClick = (task: any) => {
        setEditingTaskId(task.id);
        setExpandedTaskId(task.id);
        setEditForm({
            ...task,
            ownerName: task.owner?.name || '',
            startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        });
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditForm({});
    };

    const handleSaveEdit = async () => {
        try {
            const payload = { ...editForm };
            payload.durationDays = payload.durationDays ? Number(payload.durationDays) : 0;
            payload.estimatedCost = payload.estimatedCost ? Number(payload.estimatedCost) : 0;
            payload.startDate = payload.startDate ? new Date(payload.startDate).toISOString() : null;
            payload.dueDate = payload.dueDate ? new Date(payload.dueDate).toISOString() : null;
            delete payload.owner;
            delete payload.phase;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.isCustomOwner;
            delete payload.isEditing;
            delete payload.id;
            delete payload.submittedBy;

            const res = await fetch(`/api/tasks/${editingTaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setEditingTaskId(null);
                setEditForm({});
                fetchPhasesAndUsers();
            }
        } catch (err) {
            console.error("Failed to save:", err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Task",
            message: "This action cannot be undone. Are you sure?",
            variant: "danger",
            confirmLabel: "Delete Task",
        });
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (res.ok) {
                setPhases(p =>
                    p.map(ph => ({ ...ph, tasks: ph.tasks.filter((t: any) => t.id !== taskId) }))
                );
            }
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const getPriorityClasses = (priority: string) => {
        if (priority === 'High') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
        if (priority === 'Medium') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    };

    const getStatusDot = (status: string) => {
        if (status === 'Complete') return 'bg-emerald-500';
        if (status === 'In Progress') return 'bg-blue-500';
        if (status === 'On Hold') return 'bg-amber-500';
        return 'bg-slate-500';
    };

    // Count stats
    const allTasks = phases.flatMap(p => p.tasks || []);
    const totalCount = allTasks.length;
    const completeCount = allTasks.filter((t: any) => t.status === 'Complete').length;
    const overdueCount = allTasks.filter((t: any) => getTaskUrgency(t) === 'late').length;
    const urgentCount = allTasks.filter((t: any) => getTaskUrgency(t) === 'urgent').length;

    /* ─── Mobile Card ─── */
    const renderMobileCard = (task: any, phaseName: string) => {
        const isEditing = editingTaskId === task.id;
        const isExpanded = expandedTaskId === task.id;
        const urgency = getTaskUrgency(task);
        const styles = getUrgencyStyles(urgency);

        return (
            <div key={task.id} className={`rounded-2xl p-4 space-y-3 transition-all duration-300 ${styles.border} ${styles.bg} ${isEditing ? 'ring-1 ring-blue-500/30 bg-blue-900/10' : 'bg-white/[0.03] hover:bg-white/[0.05]'} shadow-lg ${styles.glow}`}>
                {/* Top: badges + actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {isEditing ? (
                            <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                className="bg-slate-800 border-none rounded-lg text-xs text-white p-1.5">
                                <option>High</option><option>Medium</option><option>Low</option>
                            </select>
                        ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityClasses(task.priority)}`}>
                                {task.priority.toUpperCase()}
                            </span>
                        )}
                        {styles.badgeText && !isEditing && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles.badge}`}>{styles.badgeText}</span>
                        )}
                        {!task.accepted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">PENDING</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {!task.accepted && canAcceptTasks && !isEditing && (
                            <button onClick={() => acceptTask(task.id)} className="text-emerald-400 bg-emerald-500/10 p-2 rounded-xl active:scale-95" title="Accept">
                                <CheckCircle size={14} />
                            </button>
                        )}
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveEdit} className="text-emerald-400 bg-emerald-500/10 p-2 rounded-xl active:scale-95"><Save size={14} /></button>
                                <button onClick={handleCancelEdit} className="text-slate-400 bg-white/5 p-2 rounded-xl active:scale-95"><X size={14} /></button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEditClick(task)} className="text-blue-400 bg-blue-500/10 p-2 rounded-xl active:scale-95"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-rose-400 bg-rose-500/10 p-2 rounded-xl active:scale-95"><Trash2 size={14} /></button>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Item */}
                {isEditing ? (
                    <textarea value={editForm.actionItem} onChange={(e) => setEditForm({ ...editForm, actionItem: e.target.value })}
                        className="bg-slate-800 border border-white/10 rounded-xl text-sm text-white p-3 w-full min-h-[50px] resize-y" placeholder="Action item..." />
                ) : (
                    <p className="text-sm font-medium text-slate-200 leading-relaxed cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setSelectedTask({ ...task, phase: { name: phaseName } })}>{task.actionItem}</p>
                )}

                {/* Quick info */}
                {!isEditing && (
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                        {task.owner?.name && (
                            <span className="flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center text-blue-400 text-[8px] font-bold ring-1 ring-blue-500/20">
                                    {task.owner.name.charAt(0)}
                                </span>
                                {task.owner.name}
                            </span>
                        )}
                        <span className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(task.status)}`} />{task.status}</span>
                        {task.dueDate && (
                            <span className={urgency === 'late' ? 'text-red-400 font-bold' : urgency === 'urgent' ? 'text-orange-400 font-bold' : ''}>
                                <Calendar size={10} className="inline mr-0.5" />
                                {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                        )}
                        {task.dueDate && urgency === 'urgent' && (
                            <span className="text-orange-400 font-bold flex items-center gap-0.5">
                                <AlertTriangle size={10} />
                                {Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                            </span>
                        )}
                    </div>
                )}

                {/* Expand/Collapse */}
                {!isEditing && (
                    <button onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition w-full justify-center pt-1">
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? 'Less' : 'Details'}
                    </button>
                )}

                {/* Expanded / Edit form */}
                {(isExpanded || isEditing) && (
                    <div className="space-y-3 pt-3 border-t border-white/5">
                        {isEditing ? (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="task-card-label">Start Date</label>
                                        <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="task-card-label">Due Date</label>
                                        <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="task-card-label">Status</label>
                                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full mt-1">
                                            <option>Not Started</option><option>In Progress</option><option>Complete</option><option>On Hold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="task-card-label">Est. Cost (£)</label>
                                        <input type="number" step="0.01" value={editForm.estimatedCost}
                                            onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full mt-1" />
                                    </div>
                                </div>
                                <div>
                                    <label className="task-card-label">Assign to</label>
                                    {!editForm.isCustomOwner ? (
                                        <select value={editForm.ownerName}
                                            onChange={(e) => e.target.value === "___CUSTOM___" ? setEditForm({ ...editForm, isCustomOwner: true, ownerName: "" }) : setEditForm({ ...editForm, ownerName: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full mt-1">
                                            <option value="">None</option>
                                            {users.map((u: any) => (<option key={u.id} value={u.name}>{u.name}</option>))}
                                            <option value="___CUSTOM___" className="text-blue-400">+ Add Custom...</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2 mt-1">
                                            <input type="text" autoFocus value={editForm.ownerName} onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                                className="bg-slate-800 border border-blue-500/50 rounded-xl text-xs text-white p-2.5 flex-1" placeholder="Name..." />
                                            <button onClick={() => setEditForm({ ...editForm, isCustomOwner: false })} className="text-[10px] text-slate-400 hover:text-white underline px-2">List</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="task-card-label">Notes</label>
                                    <textarea value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="bg-slate-800 border border-white/10 rounded-xl text-xs text-white p-2.5 w-full min-h-[50px] resize-y mt-1" />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 text-xs text-slate-400">
                                {task.startDate && <div className="flex justify-between"><span className="task-card-label">Start</span><span>{new Date(task.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                                {task.dueDate && <div className="flex justify-between"><span className="task-card-label">Due</span><span>{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                                {task.durationDays > 0 && <div className="flex justify-between"><span className="task-card-label">Duration</span><span>{task.durationDays} days</span></div>}
                                {task.estimatedCost > 0 && <div className="flex justify-between"><span className="task-card-label">Cost</span><span>£{task.estimatedCost.toLocaleString()}</span></div>}
                                {task.resources && <div className="flex justify-between"><span className="task-card-label">Resources</span><span>{task.resources}</span></div>}
                                {task.notes && <div className="pt-2"><span className="task-card-label">Notes</span><p className="text-slate-400 mt-1 leading-relaxed">{task.notes}</p></div>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-l-2 border-r-2 border-purple-500 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-[95%] mx-auto space-y-6 animate-in">
                {/* ─── Header ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-white underline-sweep">Mobilisation Actions</h2>
                        <p className="text-slate-400 mt-1 text-sm">Manage and track all task items across phases</p>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="glass-card px-3 py-2 flex items-center gap-2 text-xs font-bold">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-slate-400">Total</span>
                            <span className="text-white">{totalCount}</span>
                        </div>
                        <div className="glass-card px-3 py-2 flex items-center gap-2 text-xs font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-400">Done</span>
                            <span className="text-emerald-400">{completeCount}</span>
                        </div>
                        {overdueCount > 0 && (
                            <div className="glass-card px-3 py-2 flex items-center gap-2 text-xs font-bold border-red-500/20">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-slate-400">Late</span>
                                <span className="text-red-400">{overdueCount}</span>
                            </div>
                        )}
                        {urgentCount > 0 && (
                            <div className="glass-card px-3 py-2 flex items-center gap-2 text-xs font-bold border-orange-500/20">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-slate-400">Urgent</span>
                                <span className="text-orange-400">{urgentCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Search & Filter Bar ─── */}
                <div className="glass-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search actions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-500 shrink-0 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
                        >
                            <option>All Statuses</option>
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Complete</option>
                            <option>On Hold</option>
                        </select>
                    </div>
                </div>

                {/* ─── Phases ─── */}
                {phases.map((phase) => {
                    const filteredTasks = phase.tasks.filter((task: any) => {
                        const matchesSearch = task.actionItem.toLowerCase().includes(search.toLowerCase());
                        const matchesStatus = statusFilter === "All Statuses" || task.status === statusFilter;
                        return matchesSearch && matchesStatus;
                    });

                    if (filteredTasks.length === 0 && search !== "") return null;
                    const isCollapsed = collapsedPhases.has(phase.id);
                    const phaseComplete = phase.tasks.filter((t: any) => t.status === 'Complete').length;
                    const phaseProgress = phase.tasks.length > 0 ? (phaseComplete / phase.tasks.length) * 100 : 0;

                    return (
                        <div key={phase.id} className="space-y-3">
                            {/* Phase Header */}
                            <div className="flex items-center gap-3 mt-6 md:mt-8 group">
                                <button onClick={() => togglePhaseCollapse(phase.id)}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                    <div className={`p-1.5 rounded-lg bg-blue-500/10 text-blue-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-0'}`}>
                                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate">{phase.name}</h3>
                                    <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
                                </button>
                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Phase progress micro-bar */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                                                style={{ width: `${phaseProgress}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{Math.round(phaseProgress)}%</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded-lg">{filteredTasks.length} items</span>
                                    <button
                                        onClick={() => { setQuickAddPhaseId(quickAddPhaseId === phase.id ? null : phase.id); setQuickAddText(""); }}
                                        className={`text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${quickAddPhaseId === phase.id ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
                                    >
                                        {quickAddPhaseId === phase.id ? <X size={13} /> : <Plus size={13} />}
                                        {quickAddPhaseId === phase.id ? 'Close' : 'Add'}
                                    </button>
                                </div>
                            </div>

                            {/* ─── Quick Add Bar ─── */}
                            {quickAddPhaseId === phase.id && (
                                <div className="glass-card p-3 border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row gap-2 animate-in">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={quickAddText}
                                        onChange={(e) => setQuickAddText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(phase.id)}
                                        placeholder="Type action item and press Enter..."
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                                    />
                                    <div className="flex items-center gap-2">
                                        <select value={quickAddPriority} onChange={(e) => setQuickAddPriority(e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none appearance-none font-bold">
                                            <option>High</option><option>Medium</option><option>Low</option>
                                        </select>
                                        <button onClick={() => handleQuickAdd(phase.id)} disabled={!quickAddText.trim()}
                                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all active:scale-95 shrink-0">
                                            <Send size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isCollapsed && (
                                <>
                                    {/* ─── Mobile Cards ─── */}
                                    <div className="md:hidden space-y-3 stagger-in">
                                        {filteredTasks.map((task: any) => renderMobileCard(task, phase.name))}
                                        {filteredTasks.length === 0 && (
                                            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                                <p className="text-slate-600 text-sm">No tasks in this phase</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* ─── Desktop Table ─── */}
                                    <div className="hidden md:block glass-card w-full">
                                        <table className="w-full text-left border-collapse text-xs table-fixed">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-white/[0.03] to-transparent text-slate-500 font-medium uppercase text-[9px] tracking-widest border-b border-white/5">
                                                    <th className="px-2 py-3 w-[8%]">Status</th>
                                                    <th className="px-2 py-3 w-[7%]">Priority</th>
                                                    <th className="px-2 py-3 w-[20%]">Action Item</th>
                                                    <th className="px-2 py-3 w-[10%]">Progress</th>
                                                    <th className="px-2 py-3 w-[8%]">Start</th>
                                                    <th className="px-2 py-3 w-[8%]">Due</th>
                                                    <th className="px-2 py-3 w-[5%]">Days</th>
                                                    <th className="px-2 py-3 w-[10%] text-center">Assign</th>
                                                    <th className="px-2 py-3 w-[9%] text-center">Resources</th>
                                                    <th className="px-2 py-3 w-[7%]">Cost</th>
                                                    <th className="px-2 py-3 w-[13%]">Notes</th>
                                                    <th className="px-1 py-3 w-[5%] text-center">Act</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {filteredTasks.map((t: any) => {
                                                    const isEditing = editingTaskId === t.id;
                                                    const urgency = getTaskUrgency(t);
                                                    const styles = getUrgencyStyles(urgency);
                                                    return (
                                                        <tr key={t.id} id={`task-row-${t.id}`}
                                                            className={`group transition-all duration-200 ${styles.border} ${styles.bg} ${isEditing ? 'bg-blue-900/10 ring-1 ring-inset ring-blue-500/20' : 'hover:bg-white/[0.02]'}`}>
                                                            {/* Indicator */}
                                                            <td className="px-2 py-3">
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    {styles.badgeText && (
                                                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold text-center ${styles.badge}`}>{styles.badgeText}</span>
                                                                    )}
                                                                    {!t.accepted && (
                                                                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 text-center">PENDING</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {/* Priority */}
                                                            <td className="px-2 py-3">
                                                                {isEditing ? (
                                                                    <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                                                        className="bg-slate-800 border-none rounded-lg text-xs text-white p-1 w-full">
                                                                        <option>High</option><option>Medium</option><option>Low</option>
                                                                    </select>
                                                                ) : (
                                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${getPriorityClasses(t.priority)}`}>
                                                                        {t.priority.toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 cursor-pointer group/cell" onClick={() => setSelectedTask({ ...t, phase: { name: phase.name } })}>
                                                                {isEditing ? (
                                                                    <textarea value={editForm.actionItem} onChange={(e) => setEditForm({ ...editForm, actionItem: e.target.value })}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="bg-slate-800 border border-white/10 rounded-xl text-[10px] sm:text-xs text-white p-2 w-full min-h-[40px] resize-y" />
                                                                ) : (
                                                                    <div className="text-[10px] sm:text-xs font-medium text-slate-200 leading-snug group-hover/cell:text-blue-400 transition-all duration-200 truncate">{t.actionItem}</div>
                                                                )}
                                                            </td>
                                                            {/* Status */}
                                                            <td className="px-2 py-3">
                                                                {isEditing ? (
                                                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                                        className="bg-slate-800 border-none rounded-lg text-xs text-white p-1 w-full flex-1 min-w-0">
                                                                        <option>Not Started</option><option>In Progress</option><option>Complete</option><option>On Hold</option>
                                                                    </select>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} shrink-0`} />
                                                                        <select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                                                                            className="bg-transparent border-none text-[10px] sm:text-xs text-slate-300 focus:ring-0 cursor-pointer hover:text-white transition-colors p-0 truncate">
                                                                            <option className="bg-slate-900">Not Started</option>
                                                                            <option className="bg-slate-900">In Progress</option>
                                                                            <option className="bg-slate-900">Complete</option>
                                                                            <option className="bg-slate-900">On Hold</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            {/* Start Date */}
                                                            <td className="px-2 py-3 text-[10px] sm:text-xs text-slate-400 truncate">
                                                                {isEditing ? (
                                                                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                                                        className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-1 w-full" />
                                                                ) : (
                                                                    t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit', year: '2-digit' }) : ''
                                                                )}
                                                            </td>
                                                            {/* Due Date */}
                                                            <td className={`px-2 py-3 text-[10px] sm:text-xs truncate ${urgency === 'late' ? 'text-red-400 font-bold' : urgency === 'urgent' ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>
                                                                {isEditing ? (
                                                                    <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                                        className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-1 w-full" />
                                                                ) : (
                                                                    <>
                                                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit', year: '2-digit' }) : ''}
                                                                        {t.dueDate && urgency === 'urgent' && (
                                                                            <div className="text-[8px] sm:text-[9px] text-orange-400 mt-0.5 flex items-center gap-0.5 truncate">
                                                                                <AlertTriangle size={8} />
                                                                                {Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </td>
                                                            {/* Duration */}
                                                            <td className="px-2 py-3 text-[10px] sm:text-xs text-slate-500">
                                                                {isEditing ? (
                                                                    <input type="number" value={editForm.durationDays} onChange={(e) => setEditForm({ ...editForm, durationDays: e.target.value })}
                                                                        className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-1 w-full" />
                                                                ) : (t.durationDays || '-')}
                                                            </td>
                                                            {/* Assign to */}
                                                            <td className="px-2 py-3 cursor-pointer hover:bg-white/[0.05] transition-colors" onClick={() => setSelectedTask({ ...t, phase: { name: phase.name } })}>
                                                                <div className="flex justify-center">
                                                                    {isEditing ? (
                                                                        <div onClick={(e) => e.stopPropagation()} className="w-full">
                                                                            {!editForm.isCustomOwner ? (
                                                                                <select value={editForm.ownerName}
                                                                                    onChange={(e) => e.target.value === "___CUSTOM___" ? setEditForm({ ...editForm, isCustomOwner: true, ownerName: "" }) : setEditForm({ ...editForm, ownerName: e.target.value })}
                                                                                    className="bg-slate-800 border-none rounded-lg text-[10px] sm:text-xs text-white p-1 w-full">
                                                                                    <option value="">None</option>
                                                                                    {users.map((u: any) => (<option key={u.id} value={u.name}>{u.name}</option>))}
                                                                                    <option value="___CUSTOM___" className="text-blue-400">+ Custom...</option>
                                                                                </select>
                                                                            ) : (
                                                                                <div className="flex gap-1 w-full">
                                                                                    <input type="text" autoFocus value={editForm.ownerName} onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                                                                        className="bg-slate-800 border border-blue-500/50 rounded-lg text-[10px] sm:text-xs text-white p-1 flex-1 min-w-0" placeholder="Name..." />
                                                                                    <button onClick={() => setEditForm({ ...editForm, isCustomOwner: false })} className="text-[8px] sm:text-[10px] text-slate-400 underline shrink-0">List</button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        t.owner?.name ? (
                                                                            <div className="flex items-center gap-1.5 w-full">
                                                                                <div className="w-5 h-5 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 text-[8px] font-bold ring-1 ring-blue-500/10">
                                                                                    {t.owner.name.charAt(0)}
                                                                                </div>
                                                                                <span className="text-[10px] sm:text-xs text-slate-300 truncate">{t.owner.name}</span>
                                                                            </div>
                                                                        ) : <span className="text-[10px] sm:text-xs text-slate-600 italic">None</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {/* Resources */}
                                                            <td className="px-2 py-3 text-[10px] sm:text-xs text-slate-500 cursor-pointer hover:bg-white/[0.05] transition-colors truncate" onClick={() => setSelectedTask({ ...t, phase: { name: phase.name } })}>
                                                                {isEditing ? (
                                                                    <input type="text" value={editForm.resources || ''} onChange={(e) => setEditForm({ ...editForm, resources: e.target.value })}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="bg-slate-800 border border-white/10 rounded-lg text-[10px] sm:text-xs text-white p-1 w-full min-w-0" />
                                                                ) : (<div className="w-full truncate max-w-[80px] sm:max-w-none">{t.resources || '-'}</div>)}

                                                            </td>
                                                            {/* Cost */}
                                                            <td className="px-2 py-3 text-[10px] sm:text-xs text-slate-500 truncate">
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-slate-400">£</span>
                                                                        <input type="number" step="0.01" value={editForm.estimatedCost}
                                                                            onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                                                                            className="bg-slate-800 border border-white/10 rounded-lg text-[10px] sm:text-xs text-white p-1 w-full" />
                                                                    </div>
                                                                ) : (
                                                                    t.estimatedCost ? `£${t.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '£ -'
                                                                )}
                                                            </td>
                                                            {/* Notes */}
                                                            <td className="px-2 py-3 text-[10px] sm:text-xs text-slate-500 cursor-pointer hover:bg-white/[0.05] transition-colors truncate" onClick={() => setSelectedTask({ ...t, phase: { name: phase.name } })}>
                                                                {isEditing ? (
                                                                    <input type="text" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="bg-slate-800 border border-white/10 rounded-lg text-[10px] sm:text-xs text-white p-1 w-full min-w-0" />
                                                                ) : (<div className="w-full truncate max-w-[80px] sm:max-w-none">{t.notes || ''}</div>)}
                                                            </td>
                                                            {/* Actions */}
                                                            <td className="px-1 py-3 text-center">
                                                                {isEditing ? (
                                                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                                        <button onClick={handleSaveEdit} className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 p-1.5 sm:p-2 rounded-xl transition-colors"><Save size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                                                                        <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white bg-white/5 p-1.5 sm:p-2 rounded-xl transition-colors"><X size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                                        {!t.accepted && canAcceptTasks && (
                                                                            <button onClick={() => acceptTask(t.id)} className="text-emerald-400 bg-emerald-500/10 p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-emerald-500/20" title="Accept"><CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                                                                        )}
                                                                        <button onClick={() => handleEditClick(t)} className="text-blue-400 bg-blue-500/10 p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-blue-500/20"><Edit2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                                                                        <button onClick={() => handleDeleteTask(t.id)} className="text-rose-400 bg-rose-500/10 p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-rose-500/20"><Trash2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {filteredTasks.length === 0 && (
                                            <div className="py-12 text-center">
                                                <p className="text-slate-600 text-sm">No tasks in this phase</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {DialogComponent}
            {selectedTask && (
                <TaskAssignModal
                    key={selectedTask.id}
                    task={selectedTask}
                    users={users}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleAssignSave}
                />
            )}
        </>
    );
};

export default TasksPage;
