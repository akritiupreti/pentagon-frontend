import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getSession, generateApiKey, getEpochMetrics, getOrchestratorLog } from "../lib/api"
import { Session } from "../lib/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function SessionDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [metrics, setMetrics] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [keyVisible, setKeyVisible] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const decisionsEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }
    if (id) { fetchSession(); fetchData(); connectWebSocket(token); startPolling() }
    return () => { wsRef.current?.close(); if (pollRef.current) clearInterval(pollRef.current) }
  }, [id, navigate])

  useEffect(() => {
    decisionsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decisions])

  async function fetchSession() {
    try {
      const data = await getSession(id)
      setSession(data)
      if (data.apiKey) setApiKey(data.apiKey)
    } catch {} finally { setLoading(false) }
  }

  async function fetchData() {
    try {
      const [metricsData, logsData] = await Promise.all([
        getEpochMetrics(id).catch(() => []),
        getOrchestratorLog(id).catch(() => []),
      ])
      if (Array.isArray(metricsData) && metricsData.length > 0) setMetrics(metricsData)
      if (Array.isArray(logsData) && logsData.length > 0) {
        setDecisions(logsData.reverse().map((l: any) => ({
          message: `[${l.decision}] ${l.rationale || ""} ${l.agents_called ? "→ " + l.agents_called.join(", ") : ""}`.trim(),
          timestamp: l.created_at,
        })))
      }
    } catch {}
  }

  function startPolling() {
    pollRef.current = setInterval(async () => {
      try {
        const [metricsData, logsData] = await Promise.all([
          getEpochMetrics(id).catch(() => []),
          getOrchestratorLog(id).catch(() => []),
        ])
        if (Array.isArray(metricsData) && metricsData.length > 0) setMetrics(metricsData)
        if (Array.isArray(logsData) && logsData.length > 0) {
          setDecisions(logsData.reverse().map((l: any) => ({
            message: `[${l.decision}] ${l.rationale || ""} ${l.agents_called ? "→ " + l.agents_called.join(", ") : ""}`.trim(),
            timestamp: l.created_at,
          })))
        }
      } catch {}
    }, 5000)
  }

  function connectWebSocket(token: string) {
    const ws = new WebSocket(`ws://localhost:8000/ws/sessions/${id}?token=${token}`)
    wsRef.current = ws
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === "metric") setMetrics((prev) => [...prev, msg.data])
      else if (msg.type === "agent_decision") setDecisions((prev) => [...prev, { message: msg.data.message, timestamp: new Date().toISOString() }])
    }
  }

  async function handleGenerateKey() {
    setGeneratingKey(true)
    try {
      const res = await generateApiKey(id)
      if (res.apiKey) { setApiKey(res.apiKey); setKeyVisible(true) }
    } catch {} finally { setGeneratingKey(false) }
  }

  const latestMetric = metrics[metrics.length - 1]
  const totalEpochs = latestMetric?.epoch || 20
  const progress = latestMetric ? ((latestMetric.epoch || 0) / totalEpochs * 100).toFixed(1) : "0"

  if (loading) {
    return (
      <div className="bg-surface-dim text-on-surface font-body min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-surface-dim text-on-surface font-body min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant text-sm uppercase tracking-widest">Session not found</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 flex-1">
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <Link to="/dashboard" className="inline-flex px-6 py-2 rounded-full liquid-glass text-on-surface text-sm font-medium items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
              </Link>
              <div className="flex justify-between items-end">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      {session.status}
                    </span>
                    <span className="text-on-surface-variant text-xs">Session ID: {session.id}</span>
                  </div>
                  <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-1">
                    {session.name}
                  </h1>
                  <p className="text-on-surface-variant text-sm">{session.architecture} · {session.task === "realtime" ? "Real Time" : session.task === "medical" ? "Medical" : (session.task as string).charAt(0).toUpperCase() + (session.task as string).slice(1)}</p>
                </div>
                <button
                  onClick={() => {
                    const p = new URLSearchParams({ type: session.task, name: session.name })
                    if (session.classes) p.set("classes", session.classes)
                    navigate(`/training-config?${p.toString()}`)
                  }}
                  className="px-6 py-2 rounded-full liquid-glass-primary text-on-surface text-sm font-medium flex items-center gap-2 mb-1"
                >
                  <span className="material-symbols-outlined text-sm">tune</span> Configure
                </button>
              </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Progress Card */}
              <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-3xl p-6 ghost-border relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-1">Overall Progress</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-headline font-bold text-on-surface">{progress}</span>
                      <span className="text-primary font-mono text-xl">%</span>
                    </div>
                  </div>
                </div>
                <div className="relative h-4 w-full bg-surface-container-highest rounded-full mb-4 overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-1000" style={{ width: `${progress}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move_1s_linear_infinite]" style={{ width: `${progress}%` }} />
                </div>
                {latestMetric && (
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    <div className="p-4 bg-surface-container rounded-2xl">
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">Epoch</p>
                      <p className="text-xl font-headline font-bold">{latestMetric.epoch || "—"}</p>
                    </div>
                    <div className="p-4 bg-surface-container rounded-2xl">
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">Loss</p>
                      <p className="text-xl font-headline font-bold text-error">{(latestMetric.loss ?? latestMetric.val_loss)?.toFixed(4) || "—"}</p>
                    </div>
                    <div className="p-4 bg-surface-container rounded-2xl">
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">Accuracy</p>
                      <p className="text-xl font-headline font-bold text-tertiary">{(latestMetric.val_accuracy ?? latestMetric.accuracy)?.toFixed(4) || "—"}</p>
                    </div>
                    <div className="p-4 bg-surface-container rounded-2xl">
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">Status</p>
                      <p className="text-xl font-headline font-bold">{session.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* API Key, Classes & Intervention */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-container rounded-3xl p-6 ghost-border glass-panel overflow-hidden flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">API Key</h3>
                    {apiKey ? (
                      <div className="space-y-3">
                        <code className="block text-xs text-on-surface/70 bg-surface-container-lowest p-3 rounded-xl font-mono break-all">
                          {keyVisible ? apiKey : "••••••••••••••••••••••••••••••••"}
                        </code>
                        <button onClick={() => setKeyVisible(!keyVisible)} className="text-xs text-primary hover:underline">
                          {keyVisible ? "Hide" : "Reveal"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateKey}
                        disabled={generatingKey}
                        className="px-6 py-2 rounded-full liquid-glass text-primary text-sm font-semibold disabled:opacity-50"
                      >
                        {generatingKey ? "Generating..." : "Generate API Key"}
                      </button>
                    )}
                  </div>
                  <div className="mt-8 pt-6 border-t border-outline-variant/10">
                    <Link
                      to="/dashboard/intervention"
                      className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-secondary">psychology</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Human Intervention</p>
                        <p className="text-[10px] text-on-surface-variant">Review escalated samples</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Selected Classes */}
                {session.classes && (
                  <div className="bg-surface-container rounded-3xl p-6 ghost-border glass-panel">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-sm">category</span>
                      <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Selected Classes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.classes.split(",").filter((c) => c.trim()).map((cls) => (
                        <span key={cls} className="px-3 py-1.5 rounded-full text-xs font-medium liquid-glass text-on-surface">
                          {cls.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Charts */}
              <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loss Chart */}
                <div className="bg-surface-container-low rounded-3xl p-6 ghost-border min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error" /> Training Loss
                    </h3>
                    {latestMetric && <span className="font-mono text-xs text-error">Current: {(latestMetric.loss ?? latestMetric.val_loss)?.toFixed(3)}</span>}
                  </div>
                  <div className="flex-grow">
                    {metrics.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-on-surface-variant/40 text-sm">Waiting for training data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics}>
                          <XAxis dataKey="epoch" stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 11 }} />
                          <YAxis stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: "#060e20", border: "1px solid #40485d", color: "#dee5ff", fontSize: 12, borderRadius: "12px" }} />
                          <Line type="monotone" dataKey="loss" stroke="#ff716c" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="val_loss" stroke="#a68cff" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Accuracy Chart */}
                <div className="bg-surface-container-low rounded-3xl p-6 ghost-border min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary" /> Validation Accuracy
                    </h3>
                    {latestMetric && <span className="font-mono text-xs text-tertiary">Current: {((latestMetric.val_accuracy ?? latestMetric.accuracy) * 100)?.toFixed(1)}%</span>}
                  </div>
                  <div className="flex-grow">
                    {metrics.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-on-surface-variant/40 text-sm">Waiting for training data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics}>
                          <XAxis dataKey="epoch" stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 11 }} />
                          <YAxis stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: "#060e20", border: "1px solid #40485d", color: "#dee5ff", fontSize: 12, borderRadius: "12px" }} />
                          <Line type="monotone" dataKey="val_accuracy" stroke="#81ecff" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Decision Console */}
              <div className="col-span-12 bg-surface-container-lowest rounded-3xl p-1 ghost-border border-outline-variant/30">
                <div className="bg-surface-container-low rounded-[22px] overflow-hidden">
                  <div className="px-6 py-3 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-high/50">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-error-dim/40" />
                        <div className="w-3 h-3 rounded-full bg-secondary-dim/40" />
                        <div className="w-3 h-3 rounded-full bg-tertiary-dim/40" />
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">stdout / agent_decisions</span>
                    </div>
                  </div>
                  <div className="p-6 font-mono text-[13px] leading-relaxed max-h-64 overflow-y-auto no-scrollbar bg-surface-container-lowest">
                    {decisions.length === 0 ? (
                      <div className="text-on-surface-variant/40">Waiting for agent decisions...</div>
                    ) : (
                      decisions.map((d, i) => (
                        <div key={i} className="text-on-surface-variant">
                          <span className="text-outline">[{new Date(d.timestamp).toLocaleTimeString()}]</span>{" "}
                          <span className="text-tertiary">AGENT:</span> {d.message}
                        </div>
                      ))
                    )}
                    <div ref={decisionsEndRef} />
                    <div className="animate-pulse text-tertiary inline-block ml-1">_</div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
