"use client";

import { useState, useEffect } from "react";
import { X, User, Calendar, FileText, AlertTriangle, Send, CheckCircle } from "lucide-react";

interface TaskModalProps {
    task: any;
    users: any[];
    onClose: () => void;
    onSave: (taskId: string, updates: any) => Promise<void>;
}

export default function TaskAssignModal({ task, users, onClose, onSave }: TaskModalProps) {
    const [ownerName, setOwnerName] = useState(task.owner?.name || '');
    const [priority, setPriority] = useState(task.priority || 'Medium');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [status, setStatus] = useState(task.status || 'Not Started');
    const [notes, setNotes] = useState(task.notes || '');
    const [resources, setResources] = useState(task.resources || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);



    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await onSave(task.id, {
                ownerName,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                status,
                notes,
                resources,
            });
            setSaved(true);
            setTimeout(() => onClose(), 800);
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const getStatusDot = (s: string) => {
        if (s === 'Complete') return 'bg-emerald-500';
        if (s === 'In Progress') return 'bg-blue-500';
        if (s === 'On Hold') return 'bg-amber-500';
        return 'bg-slate-500';
    };

    const getPriorityColor = (p: string) => {
        if (p === 'High') return 'border-rose-500 bg-rose-500/10 text-rose-400';
        if (p === 'Medium') return 'border-amber-500 bg-amber-500/10 text-amber-400';
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-[#1a2236] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 card-3d-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-purple-600/20 px-6 py-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">Assign Task</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Task ID: {task.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <button onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {/* Task Title */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Task Title & Description</label>
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 font-medium leading-relaxed">
                            {task.actionItem}
                        </div>
                        {task.phase?.name && (
                            <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
                                <FileText size={10} /> Phase: <span className="text-slate-400 font-medium">{task.phase.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Assign to Team Member */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <User size={12} /> Assign to Team Member
                        </label>
                        <select
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 appearance-none font-medium transition-all"
                        >
                            <option value="">Select team member...</option>
                            {users.map((u: any) => (
                                <option key={u.id} value={u.name}>{u.name} ({u.role?.replace('_', ' ')})</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${priority === p ? getPriorityColor(p) : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-slate-300 hover:border-white/10'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                            <div className="relative">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${getStatusDot(status)}`} />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none font-medium"
                                >
                                    <option>Not Started</option>
                                    <option>In Progress</option>
                                    <option>Complete</option>
                                    <option>On Hold</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Calendar size={12} /> Due Date
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium transition-all"
                        />
                    </div>

                    {/* Resources */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Resources / Equipment</label>
                        <input
                            type="text"
                            value={resources}
                            onChange={(e) => setResources(e.target.value)}
                            placeholder="e.g. Staff, Budget, Equipment..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium placeholder:text-slate-600 transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Additional Notes</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional instructions or notes..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium resize-y min-h-[80px] placeholder:text-slate-600 transition-all"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 bg-white/[0.02]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || saved}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg ${saved
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                            } disabled:opacity-70`}
                    >
                        {saved ? (
                            <><CheckCircle size={16} /> Saved!</>
                        ) : saving ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white/80" /> Saving...</>
                        ) : (
                            <><Send size={14} /> Assign Task</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
