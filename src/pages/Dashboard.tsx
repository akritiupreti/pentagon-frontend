import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getSessions, createSession } from "../lib/api"
import { Session } from "../lib/types"

export default function Dashboard() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState("")
    const [architecture, setArchitecture] = useState<"deeplabv3+" | "unet_attention">("deeplabv3+")
    const [task, setTask] = useState<"medical" | "realtime">("realtime")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        fetchSessions()
    }, [navigate])

    async function fetchSessions() {
        try {
            const data = await getSessions()
            setSessions(Array.isArray(data) ? data : [])
        } catch {
            setSessions([])
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setCreating(true)
        try {
            await createSession(name, architecture, task)
            setShowForm(false)
            setName("")
            fetchSessions()
        } catch {
            // handle error
        } finally {
            setCreating(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem("token")
        navigate("/login")
    }

    const statusColors: Record<string, string> = {
        running: "text-green-400 border-green-400/20 bg-green-400/5",
        completed: "text-blue-400 border-blue-400/20 bg-blue-400/5",
        pending: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
        failed: "text-red-400 border-red-400/20 bg-red-400/5",
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10">
                <Link to="/" className="text-xl font-black tracking-[0.3em] text-white">
                    PENTAGON
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                >
                    Sign Out
                </button>
            </nav>

            <div className="flex-1 px-10 py-12 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="text-white/30 text-xs tracking-widest uppercase mb-1">
                            Dashboard
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Training Sessions</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-colors"
                    >
                        {showForm ? "Cancel" : "+ New Session"}
                    </button>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleCreate}
                        className="mb-10 border border-white/10 bg-white/5 p-8 flex flex-col gap-4"
                    >
                        <div className="text-white/50 text-xs tracking-widest uppercase mb-2">
                            New Training Session
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-white/50 text-xs tracking-widest uppercase">Session Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g. Medical Scan Experiment 1"
                                className="bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white/50 text-xs tracking-widest uppercase">Task Type</label>
                                <select
                                    value={task}
                                    onChange={(e) => setTask(e.target.value as "medical" | "realtime")}
                                    className="bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
                                >
                                    <option value="realtime">Real-time Object Segmentation</option>
                                    <option value="medical">Medical Imaging</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white/50 text-xs tracking-widest uppercase">Architecture</label>
                                <select
                                    value={architecture}
                                    onChange={(e) => setArchitecture(e.target.value as "deeplabv3+" | "unet_attention")}
                                    className="bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
                                >
                                    <option value="deeplabv3+">DeepLabV3+</option>
                                    <option value="unet_attention">U-Net with Attention</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="mt-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Session"}
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="text-white/30 text-sm tracking-widest uppercase">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="border border-white/10 p-16 text-center">
                        <div className="text-white/20 text-sm tracking-widest uppercase mb-2">No Sessions Yet</div>
                        <p className="text-white/40 text-sm">Create your first training session to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="font-bold text-white mb-1">{session.name}</div>
                                        <div className="text-white/40 text-xs">{session.architecture} · {session.task}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 border ${statusColors[session.status] || "text-white/40 border-white/10"}`}>
                                        {session.status}
                                    </span>
                                </div>
                                <div className="text-white/20 text-xs mb-4">
                                    Created {new Date(session.createdAt).toLocaleDateString()}
                                </div>
                                <Link
                                    to={`/dashboard/sessions/${session.id}`}
                                    className="text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                                >
                                    View Session →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
