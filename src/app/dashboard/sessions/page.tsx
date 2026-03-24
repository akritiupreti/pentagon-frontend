"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { getSession, generateApiKey } from "@/lib/api"
import { Session, Metric, AgentDecision } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [decisions, setDecisions] = useState<AgentDecision[]>([])
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [keyVisible, setKeyVisible] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const decisionsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchSession()
    connectWebSocket(token)
    return () => {
      wsRef.current?.close()
    }
  }, [id])

  useEffect(() => {
    decisionsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decisions])

  async function fetchSession() {
    try {
      const data = await getSession(id)
      setSession(data)
      if (data.apiKey) setApiKey(data.apiKey)
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  function connectWebSocket(token: string) {
    const ws = new WebSocket(`ws://localhost:8000/ws/sessions/${id}?token=${token}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === "metric") {
        setMetrics((prev) => [...prev, msg.data])
      } else if (msg.type === "agent_decision") {
        setDecisions((prev) => [
          ...prev,
          { message: msg.data.message, timestamp: new Date().toISOString() },
        ])
      }
    }
  }

  async function handleGenerateKey() {
    setGeneratingKey(true)
    try {
      const res = await generateApiKey(id)
      if (res.key) {
        setApiKey(res.key)
        setKeyVisible(true)
      }
    } catch {
      // handle error
    } finally {
      setGeneratingKey(false)
    }
  }

  const statusColors: Record<string, string> = {
    running: "text-green-400 border-green-400/20 bg-green-400/5",
    completed: "text-blue-400 border-blue-400/20 bg-blue-400/5",
    pending: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
    failed: "text-red-400 border-red-400/20 bg-red-400/5",
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/30 text-sm tracking-widest uppercase">Loading...</div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/30 text-sm tracking-widest uppercase">Session not found</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10">
        <Link href="/" className="text-xl font-black tracking-[0.3em] text-white">
          PENTAGON
        </Link>
        <Link
          href="/dashboard"
          className="text-white/40 text-sm hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 px-10 py-12 max-w-6xl mx-auto w-full">
        {/* Session Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="text-white/30 text-xs tracking-widest uppercase mb-1">
              Session Detail
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{session.name}</h1>
            <div className="text-white/40 text-sm">
              {session.architecture} · {session.task}
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1.5 border ${statusColors[session.status] || "text-white/40 border-white/10"}`}
          >
            {session.status}
          </span>
        </div>

        {/* API Key */}
        <div className="border border-white/10 p-6 mb-6">
          <div className="text-white/30 text-xs tracking-widest uppercase mb-3">
            API Key
          </div>
          {apiKey ? (
            <div className="flex items-center gap-4">
              <code className="flex-1 text-sm text-white/70 bg-white/5 px-4 py-2 font-mono">
                {keyVisible ? apiKey : "••••••••••••••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors"
              >
                {keyVisible ? "Hide" : "Reveal"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateKey}
              disabled={generatingKey}
              className="px-6 py-2 border border-white/20 text-white/60 text-sm tracking-widest uppercase hover:border-white/50 hover:text-white transition-colors disabled:opacity-50"
            >
              {generatingKey ? "Generating..." : "Generate API Key"}
            </button>
          )}
        </div>

        {/* Charts + Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Loss Chart */}
          <div className="border border-white/10 p-6">
            <div className="text-white/30 text-xs tracking-widest uppercase mb-6">
              Loss Curve
            </div>
            {metrics.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/20 text-sm">
                Waiting for training data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics}>
                  <XAxis
                    dataKey="epoch"
                    stroke="#ffffff20"
                    tick={{ fill: "#ffffff40", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    tick={{ fill: "#ffffff40", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#000",
                      border: "1px solid #ffffff20",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Accuracy Chart */}
          <div className="border border-white/10 p-6">
            <div className="text-white/30 text-xs tracking-widest uppercase mb-6">
              Accuracy
            </div>
            {metrics.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/20 text-sm">
                Waiting for training data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics}>
                  <XAxis
                    dataKey="epoch"
                    stroke="#ffffff20"
                    tick={{ fill: "#ffffff40", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    tick={{ fill: "#ffffff40", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#000",
                      border: "1px solid #ffffff20",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Agent Decision Feed */}
        <div className="border border-white/10 p-6 mb-6">
          <div className="text-white/30 text-xs tracking-widest uppercase mb-4">
            Agent Decision Feed
          </div>
          <div className="h-48 overflow-y-auto flex flex-col gap-2">
            {decisions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/20 text-sm">
                Waiting for agent decisions...
              </div>
            ) : (
              decisions.map((d, i) => (
                <div key={i} className="flex items-start gap-4 text-sm">
                  <span className="text-white/20 text-xs font-mono shrink-0">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-white/70">{d.message}</span>
                </div>
              ))
            )}
            <div ref={decisionsEndRef} />
          </div>
        </div>

        {/* Intervention Link */}
        <div className="border border-yellow-400/20 bg-yellow-400/5 p-6 flex items-center justify-between">
          <div>
            <div className="text-yellow-400 text-xs tracking-widest uppercase mb-1">
              Human Intervention
            </div>
            <p className="text-white/50 text-sm">
              Review samples that the AI agent has escalated for human labeling.
            </p>
          </div>
          <Link
            href="/dashboard/intervention"
            className="px-6 py-2 border border-yellow-400/40 text-yellow-400 text-xs tracking-widest uppercase hover:bg-yellow-400/10 transition-colors shrink-0"
          >
            Review Samples
          </Link>
        </div>
      </div>
    </main>
  )
}