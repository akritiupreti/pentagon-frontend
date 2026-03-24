"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getInterventionSamples, submitIntervention } from "@/lib/api"
import { InterventionSample } from "@/lib/types"

export default function InterventionPage() {
  const router = useRouter()
  const [samples, setSamples] = useState<InterventionSample[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    const sid = new URLSearchParams(window.location.search).get("sessionId") || ""
    setSessionId(sid)
    if (sid) fetchSamples(sid)
    else setLoading(false)
  }, [])

  async function fetchSamples(sid: string) {
    try {
      const data = await getInterventionSamples(sid)
      setSamples(Array.isArray(data) ? data : [])
    } catch {
      setSamples([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDecision(sampleId: string, decision: "approve" | "reject") {
    setSubmitting(sampleId)
    try {
      await submitIntervention(sessionId, sampleId, decision)
      setSamples((prev) => prev.filter((s) => s.id !== sampleId))
    } catch {
      // handle error
    } finally {
      setSubmitting(null)
    }
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
        {/* Header */}
        <div className="mb-10">
          <div className="text-white/30 text-xs tracking-widest uppercase mb-1">
            Human in the Loop
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Intervention Queue
          </h1>
          <p className="text-white/40 text-sm">
            Review and approve or reject segmentation samples escalated by the AI agent.
          </p>
        </div>

        {!sessionId ? (
          <div className="border border-white/10 p-16 text-center">
            <div className="text-white/20 text-sm tracking-widest uppercase mb-2">
              No Session Selected
            </div>
            <p className="text-white/40 text-sm mb-6">
              Go to a session and click Review Samples to see its intervention queue.
            </p>
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-white/20 text-white/60 text-sm tracking-widest uppercase hover:border-white/50 hover:text-white transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : loading ? (
          <div className="text-white/30 text-sm tracking-widest uppercase">
            Loading samples...
          </div>
        ) : samples.length === 0 ? (
          <div className="border border-white/10 p-16 text-center">
            <div className="text-white/20 text-sm tracking-widest uppercase mb-2">
              Queue Empty
            </div>
            <p className="text-white/40 text-sm">
              No samples are waiting for review right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample) => (
              <div key={sample.id} className="border border-white/10 flex flex-col">
                {/* Image with mask overlay */}
                <div className="relative aspect-square bg-white/5 overflow-hidden">
                  <img
                    src={sample.imageUrl}
                    alt="Sample"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <img
                    src={sample.maskUrl}
                    alt="Mask"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 text-white/50 text-xs font-mono">
                    {sample.id.slice(0, 8)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-white/10">
                  <button
                    onClick={() => handleDecision(sample.id, "approve")}
                    disabled={submitting === sample.id}
                    className="flex-1 py-3 text-xs tracking-widest uppercase font-bold text-green-400 hover:bg-green-400/10 border-r border-white/10 transition-colors disabled:opacity-50"
                  >
                    {submitting === sample.id ? "..." : "Approve"}
                  </button>
                  <button
                    onCl