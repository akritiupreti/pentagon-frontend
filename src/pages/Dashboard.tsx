import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getSessions, deleteSession } from "../lib/api"
import { Session } from "../lib/types"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Dashboard() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
            onClick={() => navigate("/setup")}
            className="px-6 py-3 liquid-glass-primary-solid text-on-primary font-bold text-sm tracking-widest uppercase rounded-full"
          >
            + New Session
          </button>
        </div>

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
              <div key={session.id} className="bg-surface-container-low rounded-3xl p-6 ghost-border hover:bg-surface-container-high transition-colors group relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold font-headline text-on-surface mb-1">{session.name}</div>
                    <div className="text-on-surface-variant text-xs">{session.architecture} · {session.task === "medical" ? "Medical" : "Real Time"}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[session.status] || "text-on-surface-variant border-outline-variant/20"}`}>
                    {session.status}
                  </span>
                </div>
                <div className="text-on-surface-variant/40 text-xs mb-4">
                  Created {new Date(session.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/dashboard/sessions/${session.id}`}
                    className="text-xs tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors font-semibold"
                  >
                    View Session →
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(session.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low rounded-3xl p-8 ghost-border max-w-sm w-full mx-4 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="font-headline font-bold text-lg">Delete Session</h3>
            </div>
            <p className="text-on-surface-variant text-sm mb-8">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 rounded-full liquid-glass text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteSession(deleteConfirm)
                    setSessions((prev) => prev.filter((s) => s.id !== deleteConfirm))
                  } catch {}
                  setDeleteConfirm(null)
                }}
                className="px-6 py-2 rounded-full liquid-glass-error text-on-surface text-sm font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
