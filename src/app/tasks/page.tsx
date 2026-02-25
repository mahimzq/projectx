"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    Plus,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useAlertDialog } from "@/components/AlertDialog";

interface Task {
    id: string;
    actionItem: string;
    priority: string;
    status: string;
    startDate: string | null;
    dueDate: string | null;
    durationDays: number;
    owner: { name: string } | null;
    phase: { name: string };
    resources: string;
    estimatedCost: number;
    notes: string;
}

const TasksPage = () => {
    const [phases, setPhases] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const { confirm: confirmDialog, DialogComponent } = useAlertDialog();

    const fetchPhasesAndUsers = async () => {
        try {
            const [phasesRes, usersRes] = await Promise.all([
                fetch("/api/phases"),
                fetch("/api/users")
            ]);

            if (!phasesRes.ok || !usersRes.ok) {
                throw new Error("One or more requests failed");
            }

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
    }, []);

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setPhases(currentPhases =>
                    currentPhases.map(p => ({
                        ...p,
                        tasks: p.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to update status:", err);
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


            const res = await fetch(`/api/tasks/${editingTaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setEditingTaskId(null);
                setEditForm({});
                fetchPhasesAndUsers();
            } else {
                console.error("Failed to patch:", await res.json());
            }
        } catch (err) {
            console.error("Failed to save edited task:", err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Task",
            message: "This action cannot be undone. Are you sure you want to permanently delete this task?",
            variant: "danger",
            confirmLabel: "Delete Task",
        });
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (res.ok) {
                setPhases(currentPhases =>
                    currentPhases.map(p => ({
                        ...p,
                        tasks: p.tasks.filter((t: any) => t.id !== taskId)
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    const handleAddTask = async (phaseId: string) => {
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phaseId,
                    actionItem: "",
                    priority: "Medium",
                    status: "Not Started",
                }),
            });
            if (res.ok) {
                const newTask = await res.json();
                fetchPhasesAndUsers();
                handleEditClick(newTask);
            }
        } catch (err) {
            console.error("Failed to create task:", err);
        }
    };

    const getPriorityClasses = (priority: string) => {
        if (priority === 'High') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
        if (priority === 'Medium') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    };

    const getStatusDotColor = (status: string) => {
        if (status === 'Complete') return 'bg-emerald-500';
        if (status === 'In Progress') return 'bg-blue-500';
        if (status === 'On Hold') return 'bg-amber-500';
        return 'bg-slate-500';
    };

    /* ─── Mobile Card View for a single task ─── */
    const renderMobileCard = (task: any) => {
        const isEditing = editingTaskId === task.id;
        const isExpanded = expandedTaskId === task.id;

        return (
            <div key={task.id} className={`task-card space-y-3 ${isEditing ? 'border-blue-500/30 bg-blue-900/10' : ''}`}>
                {/* Top row: Priority + Status + Actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isEditing ? (
                            <select
                                value={editForm.priority}
                                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                className="bg-slate-800 border-none rounded text-xs text-white p-1"
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getPriorityClasses(task.priority)}`}>
                                {task.priority.toUpperCase()}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(task.status)}`} />
                            {isEditing ? (
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="bg-slate-800 border-none rounded text-xs text-white p-1"
                                >
                                    <option>Not Started</option>
                                    <option>In Progress</option>
                                    <option>Complete</option>
                                    <option>On Hold</option>
                                </select>
                            ) : (
                                <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                    className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 cursor-pointer p-0 min-h-0"
                                >
                                    <option className="bg-slate-900">Not Started</option>
                                    <option className="bg-slate-900">In Progress</option>
                                    <option className="bg-slate-900">Complete</option>
                                    <option className="bg-slate-900">On Hold</option>
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveEdit} className="text-emerald-400 bg-emerald-500/10 p-2 rounded-lg active:scale-95">
                                    <Save size={14} />
                                </button>
                                <button onClick={handleCancelEdit} className="text-slate-400 bg-white/5 p-2 rounded-lg active:scale-95">
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEditClick(task)} className="text-blue-400 bg-blue-500/10 p-2 rounded-lg active:scale-95">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-rose-400 bg-rose-500/10 p-2 rounded-lg active:scale-95">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Item */}
                {isEditing ? (
                    <textarea
                        value={editForm.actionItem}
                        onChange={(e) => setEditForm({ ...editForm, actionItem: e.target.value })}
                        className="bg-slate-800 border border-white/10 rounded-lg text-sm text-white p-2.5 w-full min-h-[50px] resize-y"
                        placeholder="Action item..."
                    />
                ) : (
                    <p className="text-sm font-medium text-slate-200 leading-snug">{task.actionItem}</p>
                )}

                {/* Quick info row */}
                {!isEditing && (
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                        {task.owner?.name && (
                            <span className="flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[8px] font-bold">
                                    {task.owner.name.charAt(0)}
                                </span>
                                {task.owner.name}
                            </span>
                        )}
                        {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        )}
                        {task.estimatedCost > 0 && (
                            <span>£{task.estimatedCost.toLocaleString()}</span>
                        )}
                    </div>
                )}

                {/* Expand toggle (non-editing) */}
                {!isEditing && (
                    <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors w-full justify-center pt-1"
                    >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? 'Less' : 'More'}
                    </button>
                )}

                {/* Expanded details / Edit form */}
                {(isExpanded || isEditing) && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                        {isEditing ? (
                            <>
                                {/* Dates row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="task-card-label">Start Date</label>
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="task-card-label">Due Date</label>
                                        <input
                                            type="date"
                                            value={editForm.dueDate}
                                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Duration + Cost */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="task-card-label">Duration (days)</label>
                                        <input
                                            type="number"
                                            value={editForm.durationDays}
                                            onChange={(e) => setEditForm({ ...editForm, durationDays: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="task-card-label">Est. Cost (£)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.estimatedCost}
                                            onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                        />
                                    </div>
                                </div>
                                {/* Owner */}
                                <div>
                                    <label className="task-card-label">Owner</label>
                                    {!editForm.isCustomOwner ? (
                                        <select
                                            value={editForm.ownerName}
                                            onChange={(e) => {
                                                if (e.target.value === "___CUSTOM___") {
                                                    setEditForm({ ...editForm, isCustomOwner: true, ownerName: "" });
                                                } else {
                                                    setEditForm({ ...editForm, ownerName: e.target.value });
                                                }
                                            }}
                                            className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                        >
                                            <option value="">No Owner</option>
                                            {users.map((u: any) => (
                                                <option key={u.id} value={u.name}>{u.name}</option>
                                            ))}
                                            <option value="___CUSTOM___" className="text-blue-400 font-bold">+ Add Custom...</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editForm.ownerName}
                                                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                                className="bg-slate-800 border border-blue-500/50 rounded-lg text-xs text-white p-2 flex-1"
                                                placeholder="Enter name..."
                                            />
                                            <button
                                                onClick={() => setEditForm({ ...editForm, isCustomOwner: false })}
                                                className="text-[10px] text-slate-400 hover:text-white underline px-2"
                                            >
                                                List
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Resources */}
                                <div>
                                    <label className="task-card-label">Resources</label>
                                    <input
                                        type="text"
                                        value={editForm.resources || ''}
                                        onChange={(e) => setEditForm({ ...editForm, resources: e.target.value })}
                                        className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full mt-1"
                                    />
                                </div>
                                {/* Notes */}
                                <div>
                                    <label className="task-card-label">Notes</label>
                                    <textarea
                                        value={editForm.notes || ''}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="bg-slate-800 border border-white/10 rounded-lg text-xs text-white p-2 w-full min-h-[50px] resize-y mt-1"
                                    />
                                </div>
                            </>
                        ) : (
                            /* Expanded read-only details */
                            <div className="space-y-2">
                                {task.startDate && (
                                    <div className="task-card-field">
                                        <span className="task-card-label">Start</span>
                                        <span className="text-xs text-slate-300">{new Date(task.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {task.dueDate && (
                                    <div className="task-card-field">
                                        <span className="task-card-label">Due</span>
                                        <span className="text-xs text-slate-300">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {task.durationDays > 0 && (
                                    <div className="task-card-field">
                                        <span className="task-card-label">Duration</span>
                                        <span className="text-xs text-slate-300">{task.durationDays} days</span>
                                    </div>
                                )}
                                {task.resources && (
                                    <div className="task-card-field">
                                        <span className="task-card-label">Resources</span>
                                        <span className="text-xs text-slate-300">{task.resources}</span>
                                    </div>
                                )}
                                {task.notes && (
                                    <div className="pt-2">
                                        <span className="task-card-label">Notes</span>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.notes}</p>
                                    </div>
                                )}
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-white">Mobilisation Actions</h2>
                    <p className="text-slate-400 mt-1 text-sm">Manage and track all mobilization task items</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search actions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option>All Statuses</option>
                        <option>Complete</option>
                        <option>In Progress</option>
                        <option>Not Started</option>
                        <option>On Hold</option>
                    </select>
                </div>
            </div>

            {phases.map((phase) => {
                const filteredTasks = phase.tasks.filter((task: any) => {
                    const matchesSearch = task.actionItem.toLowerCase().includes(search.toLowerCase());
                    const matchesStatus = statusFilter === "All Statuses" || task.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });

                if (filteredTasks.length === 0 && search !== "") return null;

                return (
                    <div key={phase.id} className="space-y-3 md:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 md:mt-8 gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white uppercase tracking-wider whitespace-nowrap">{phase.name}</h3>
                                <div className="h-[1px] flex-1 bg-white/10 hidden sm:block"></div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-medium text-slate-500">{filteredTasks.length} items</span>
                                <button
                                    onClick={() => handleAddTask(phase.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors active:scale-95"
                                >
                                    <Plus size={14} /> Add Task
                                </button>
                            </div>
                        </div>

                        {/* ─── Mobile Card View ─── */}
                        <div className="md:hidden space-y-3 stagger-in">
                            {filteredTasks.map((task: any) => renderMobileCard(task))}
                        </div>

                        {/* ─── Desktop Table View ─── */}
                        <div className="hidden md:block glass-card overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 font-medium uppercase text-[10px] tracking-widest border-b border-white/10">
                                        <th className="px-3 py-3 text-left w-24">Priority</th>
                                        <th className="px-3 py-3 text-left w-64">Action Item</th>
                                        <th className="px-3 py-3 text-left w-32">Status</th>
                                        <th className="px-3 py-3 text-left w-28">Start Date</th>
                                        <th className="px-3 py-3 text-left w-28">Due Date</th>
                                        <th className="px-3 py-3 text-left w-24">Duration</th>
                                        <th className="px-3 py-3 text-left w-32">Owner</th>
                                        <th className="px-3 py-3 text-left w-32">Resources</th>
                                        <th className="px-3 py-3 text-left w-28">Est. Cost</th>
                                        <th className="px-3 py-3 text-left min-w-[150px]">Notes</th>
                                        <th className="px-3 py-3 text-center w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filteredTasks.map((task: any) => {
                                        const isEditing = editingTaskId === task.id;

                                        return (
                                            <tr key={task.id} className={`hover:bg-white/5 transition-colors group ${isEditing ? 'bg-blue-900/10' : ''}`}>
                                                {/* Priority */}
                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <select
                                                            value={editForm.priority}
                                                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                                            className="bg-slate-800 border-none rounded text-xs text-white p-1 w-full"
                                                        >
                                                            <option>High</option>
                                                            <option>Medium</option>
                                                            <option>Low</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getPriorityClasses(task.priority)}`}>
                                                            {task.priority.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action Item */}
                                                <td className="px-3 py-4">
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editForm.actionItem}
                                                            onChange={(e) => setEditForm({ ...editForm, actionItem: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-2 w-full min-h-[40px] resize-y"
                                                        />
                                                    ) : (
                                                        <div className="text-xs font-medium text-slate-200">{task.actionItem}</div>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <select
                                                            value={editForm.status}
                                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                            className="bg-slate-800 border-none rounded text-xs text-white p-1 w-full"
                                                        >
                                                            <option>Not Started</option>
                                                            <option>In Progress</option>
                                                            <option>Complete</option>
                                                            <option>On Hold</option>
                                                        </select>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`} />
                                                            <select
                                                                value={task.status}
                                                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                                                className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 cursor-pointer hover:text-white transition-colors p-0"
                                                            >
                                                                <option className="bg-slate-900">Not Started</option>
                                                                <option className="bg-slate-900">In Progress</option>
                                                                <option className="bg-slate-900">Complete</option>
                                                                <option className="bg-slate-900">On Hold</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Start Date */}
                                                <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={editForm.startDate}
                                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-1 w-full"
                                                        />
                                                    ) : (
                                                        task.startDate ? new Date(task.startDate).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric' }) : ''
                                                    )}
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={editForm.dueDate}
                                                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-1 w-full"
                                                        />
                                                    ) : (
                                                        task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric' }) : ''
                                                    )}
                                                </td>

                                                {/* Duration */}
                                                <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editForm.durationDays}
                                                            onChange={(e) => setEditForm({ ...editForm, durationDays: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-1 w-full"
                                                        />
                                                    ) : (
                                                        task.durationDays || 0
                                                    )}
                                                </td>

                                                {/* Owner */}
                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-1">
                                                            {!editForm.isCustomOwner ? (
                                                                <select
                                                                    value={editForm.ownerName}
                                                                    onChange={(e) => {
                                                                        if (e.target.value === "___CUSTOM___") {
                                                                            setEditForm({ ...editForm, isCustomOwner: true, ownerName: "" });
                                                                        } else {
                                                                            setEditForm({ ...editForm, ownerName: e.target.value });
                                                                        }
                                                                    }}
                                                                    className="bg-slate-800 border-none rounded text-xs text-white p-1 w-full"
                                                                >
                                                                    <option value="">No Owner</option>
                                                                    {users.map((u: any) => (
                                                                        <option key={u.id} value={u.name}>{u.name}</option>
                                                                    ))}
                                                                    <option value="___CUSTOM___" className="text-blue-400 font-bold">+ Add Custom...</option>
                                                                </select>
                                                            ) : (
                                                                <div className="flex gap-1">
                                                                    <input
                                                                        type="text"
                                                                        autoFocus
                                                                        value={editForm.ownerName}
                                                                        onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                                                        className="bg-slate-800 border border-blue-500/50 rounded text-xs text-white p-1 flex-1"
                                                                        placeholder="Enter name..."
                                                                    />
                                                                    <button
                                                                        onClick={() => setEditForm({ ...editForm, isCustomOwner: false })}
                                                                        className="text-[10px] text-slate-400 hover:text-white underline"
                                                                    >
                                                                        List
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">{task.owner?.name || ''}</span>
                                                    )}
                                                </td>

                                                {/* Resources */}
                                                <td className="px-3 py-4 text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.resources || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, resources: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-1 w-full"
                                                        />
                                                    ) : (
                                                        task.resources || ''
                                                    )}
                                                </td>

                                                {/* Estimated Cost */}
                                                <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1">
                                                            <span>£</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editForm.estimatedCost}
                                                                onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                                                                className="bg-slate-800 border border-white/10 rounded text-xs text-white p-1 w-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        task.estimatedCost ? `£${task.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '£ -'
                                                    )}
                                                </td>

                                                {/* Notes */}
                                                <td className="px-3 py-4 text-xs text-slate-400">
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editForm.notes || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                            className="bg-slate-800 border border-white/10 rounded text-xs text-white p-2 w-full min-h-[40px] resize-y"
                                                        />
                                                    ) : (
                                                        task.notes || ''
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-4 whitespace-nowrap text-center">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={handleSaveEdit} className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 p-1.5 rounded-lg transition-colors">
                                                                <Save size={14} />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-lg transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEditClick(task)} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded-lg transition-colors">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleDeleteTask(task.id)} className="text-rose-400 hover:text-rose-300 bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
            {DialogComponent}
        </div>
    );
};

export default TasksPage;
