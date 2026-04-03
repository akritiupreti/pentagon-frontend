import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getSessions, createSession } from "../lib/api"
import { Session } from "../lib/types"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

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
    if (!token) { navigate("/login"); return }
    fetchSessions()
  }, [navigate])

  async function fetchSessions() {
    try {
      const data = await getSessions()
      setSessions(Array.isArray(data) ? data : [])
    } catch { setSessions([]) } finally { setLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await createSession(name, architecture, task)
      setShowForm(false)
      setName("")
      fetchSessions()
    } catch {} finally { setCreating(false) }
  }

  const statusColors: Record<string, string> = {
    running: "text-tertiary border-tertiary/20 bg-tertiary/5",
    completed: "text-primary border-primary/20 bg-primary/5",
    pending: "text-secondary border-secondary/20 bg-secondary/5",
    failed: "text-error border-error/20 bg-error/5",
  }

  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 px-10 py-12 pt-28 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-on-surface-variant text-xs tracking-widest uppercase mb-1">Dashboard</div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight">Training Sessions</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 liquid-glass-primary-solid text-on-primary font-bold text-sm tracking-widest uppercase rounded-full"
          >
            {showForm ? "Cancel" : "+ New Session"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-10 bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 flex flex-col gap-4">
            <div className="text-on-surface-variant text-xs tracking-widest uppercase mb-2">New Training Session</div>
            <div className="flex flex-col gap-1.5">
              <label className="text-on-surface-variant text-xs tracking-widest uppercase">Session Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="e.g. Medical Scan Experiment 1"
                className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder-outline/50 px-4 py-3 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-tertiary transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant text-xs tracking-widest uppercase">Task Type</label>
                <select
                  value={task} onChange={(e) => setTask(e.target.value as "medical" | "realtime")}
                  className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-tertiary transition-colors appearance-none"
                >
                  <option value="realtime">Real-time Object Segmentation</option>
                  <option value="medical">Medical Imaging</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant text-xs tracking-widest uppercase">Architecture</label>
                <select
                  value={architecture} onChange={(e) => setArchitecture(e.target.value as "deeplabv3+" | "unet_attention")}
                  className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-tertiary transition-colors appearance-none"
                >
                  <option value="deeplabv3+">DeepLabV3+</option>
                  <option value="unet_attention">U-Net with Attention</option>
                </select>
              </div>
            </div>
            <button
              type="submit" disabled={creating}
              className="mt-2 px-8 py-4 liquid-glass-primary-solid text-on-primary font-bold text-sm tracking-widest uppercase rounded-full disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Session"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-surface-container-low rounded-3xl p-16 text-center ghost-border">
            <div className="text-on-surface-variant/40 text-sm tracking-widest uppercase mb-2">No Sessions Yet</div>
            <p className="text-on-surface-variant text-sm">Create your first training session to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-surface-container-low rounded-3xl p-6 ghost-border hover:bg-surface-container-high transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold font-headline text-on-surface mb-1">{session.name}</div>
                    <div className="text-on-surface-variant text-xs">{session.architecture} · {session.task}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[session.status] || "text-on-surface-variant border-outline-variant/20"}`}>
                    {session.status}
                  </span>
                </div>
                <div className="text-on-surface-variant/40 text-xs mb-4">
                  Created {new Date(session.createdAt).toLocaleDateString()}
                </div>
                <Link
                  to={`/dashboard/sessions/${session.id}`}
                  className="text-xs tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors font-semibold"
                >
                  View Session →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
