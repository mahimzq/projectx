"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Settings as SettingsIcon, UserPlus, Users } from "lucide-react";
import { useAlertDialog } from "@/components/AlertDialog";

export default function SettingsPage() {
    const [phases, setPhases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);

    // Phase & Task State
    const [newPhaseName, setNewPhaseName] = useState("");
    const [newTaskActionItem, setNewTaskActionItem] = useState("");
    const [selectedPhaseId, setSelectedPhaseId] = useState("");

    // User State
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState("DIRECTOR");
    const { confirm: confirmDialog, DialogComponent } = useAlertDialog();

    const fetchAllData = async () => {
        try {
            const [phasesRes, usersRes] = await Promise.all([
                fetch("/api/phases"),
                fetch("/api/users")
            ]);

            const phasesData = await phasesRes.json();
            const usersData = await usersRes.json();

            if (Array.isArray(phasesData)) {
                setPhases(phasesData);
                if (phasesData.length > 0 && !selectedPhaseId) {
                    setSelectedPhaseId(phasesData[0].id);
                }
            }
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: newUserEmail,
                    name: newUserName,
                    password: newUserPassword,
                    role: newUserRole,
                }),
            });
            if (res.ok) {
                setNewUserEmail("");
                setNewUserName("");
                setNewUserPassword("");
                fetchAllData();
            }
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };

    const handleDeleteUser = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete User",
            message: "This will permanently remove this user's account and access. Continue?",
            variant: "danger",
            confirmLabel: "Delete User",
        });
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAllData();
            }
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    const handleAddPhase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhaseName.trim()) return;

        try {
            const res = await fetch("/api/phases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newPhaseName, order: phases.length + 1 }),
            });
            if (res.ok) {
                setNewPhaseName("");
                fetchAllData();
            }
        } catch (err) {
            console.error("Error adding phase:", err);
        }
    };

    const handleDeletePhase = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Phase",
            message: "This will permanently delete this phase and all its associated tasks. This cannot be undone.",
            variant: "danger",
            confirmLabel: "Delete Phase",
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/phases/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAllData();
            }
        } catch (err) {
            console.error("Error deleting phase:", err);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskActionItem.trim() || !selectedPhaseId) return;

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actionItem: newTaskActionItem,
                    phaseId: selectedPhaseId,
                    priority: "Medium",
                    status: "Not Started",
                }),
            });
            if (res.ok) {
                setNewTaskActionItem("");
                fetchAllData();
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Task",
            message: "This task will be permanently removed. Are you sure?",
            variant: "danger",
            confirmLabel: "Delete Task",
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAllData();
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in pb-12">
            <div className="flex items-center gap-3">
                <div className="p-2.5 md:p-3 bg-blue-500/20 rounded-xl">
                    <SettingsIcon className="text-blue-400 w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">System Configuration</h2>
                    <p className="text-slate-400 mt-0.5 md:mt-1 text-xs md:text-base">Manage users, phases, and task templates</p>
                </div>
            </div>

            {/* User Management */}
            <div className="glass-card overflow-hidden">
                <div className="bg-white/5 px-4 md:px-8 py-3 md:py-4 border-b border-white/10 flex items-center gap-3">
                    <Users className="text-blue-400 w-5 h-5" />
                    <h3 className="text-sm md:text-lg font-bold text-white uppercase tracking-wider">User Management</h3>
                </div>
                <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                        <div className="lg:col-span-1 space-y-4 md:space-y-6">
                            <div>
                                <h4 className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-widest mb-1.5 md:mb-2 flex items-center gap-2">
                                    <UserPlus size={16} /> Add Team Member
                                </h4>
                                <p className="text-[10px] md:text-xs text-slate-500">Create new accounts with specific roles.</p>
                            </div>
                            <form onSubmit={handleAddUser} className="space-y-3 md:space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                <input
                                    type="password"
                                    placeholder="Temporary Password"
                                    required
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Access Level</label>
                                    <select
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-medium"
                                    >
                                        <option value="DIRECTOR">Director (Full Access)</option>
                                        <option value="PROJECT_MANAGER">Project Manager</option>
                                        <option value="STAFF">Staff (Member)</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <Plus size={18} /> Create Account
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            <div>
                                <h4 className="text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-widest mb-1.5 md:mb-2 flex items-center gap-2">
                                    <Users size={16} /> Active Users
                                </h4>
                                <p className="text-[10px] md:text-xs text-slate-500">Currently registered system users.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-h-[400px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                                {users.map((user) => (
                                    <div key={user.id} className="bg-white/5 border border-white/5 p-3 md:p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/10 shadow-inner shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white tracking-tight truncate">{user.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${user.role === 'DIRECTOR' ? 'bg-rose-500/20 text-rose-400' :
                                                        user.role === 'PROJECT_MANAGER' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {user.role.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium lowercase truncate max-w-[100px] md:max-w-[120px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-2 text-slate-600 hover:text-rose-400 transition-colors md:opacity-0 md:group-hover:opacity-100 transform hover:rotate-12 shrink-0 ml-2"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <p className="text-slate-500 text-sm font-medium">No users found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-12">
                {/* Phases Management */}
                <div className="glass-card overflow-hidden h-full flex flex-col">
                    <div className="bg-white/5 px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                        <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest">Mobilisation Phases</h3>
                    </div>
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
                        <form onSubmit={handleAddPhase} className="flex gap-2 md:gap-3">
                            <input
                                type="text"
                                placeholder="Phase title..."
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <button type="submit" className="bg-white hover:bg-slate-100 text-[#0f172a] px-3 md:px-4 py-2 rounded-xl flex items-center gap-1.5 md:gap-2 text-sm font-black transition-all shadow-xl active:scale-95 shrink-0">
                                <Plus size={16} /> Add
                            </button>
                        </form>
                        <div className="space-y-2 md:space-y-2.5 overflow-y-auto max-h-[350px] pr-1 md:pr-2 custom-scrollbar">
                            {phases.map((phase) => (
                                <div key={phase.id} className="flex items-center justify-between bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                    <span className="text-slate-200 font-bold text-sm tracking-tight truncate flex-1 pr-2">{phase.name}</span>
                                    <button onClick={() => handleDeletePhase(phase.id)} className="text-slate-500 hover:text-rose-400 transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tasks Management */}
                <div className="glass-card overflow-hidden h-full flex flex-col">
                    <div className="bg-white/5 px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                        <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest">Task Templates</h3>
                    </div>
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Target Phase</label>
                                <select
                                    value={selectedPhaseId}
                                    onChange={(e) => setSelectedPhaseId(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-medium"
                                    required
                                >
                                    <option value="" disabled>Select a phase...</option>
                                    {phases.map((phase) => (
                                        <option key={phase.id} value={phase.id}>{phase.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 md:gap-3">
                                <input
                                    type="text"
                                    placeholder="Action item..."
                                    value={newTaskActionItem}
                                    onChange={(e) => setNewTaskActionItem(e.target.value)}
                                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    onClick={handleAddTask}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 md:px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 shrink-0"
                                    disabled={!selectedPhaseId || !newTaskActionItem.trim()}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-2.5 overflow-y-auto max-h-[350px] pr-1 md:pr-2 custom-scrollbar">
                            {selectedPhaseId && phases.find(p => p.id === selectedPhaseId)?.tasks?.length === 0 && (
                                <div className="py-10 md:py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="text-slate-600 text-sm font-medium">No tasks defined for this phase.</p>
                                </div>
                            )}
                            {phases.find(p => p.id === selectedPhaseId)?.tasks?.map((task: any) => (
                                <div key={task.id} className="flex items-center justify-between bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                    <span className="text-slate-200 text-sm font-medium tracking-tight line-clamp-1 flex-1 pr-3">{task.actionItem}</span>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {DialogComponent}
        </div>
    );
}
