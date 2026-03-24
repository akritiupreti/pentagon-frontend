"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function ModelNameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "medical"
  const [modelName, setModelName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [])

  function handleNext() {
    if (!modelName.trim()) return
    router.push(`/class-selection?type=${type}&name=${encodeURIComponent(modelName)}`)
  }

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--header)",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <span
          style={{
            color: "var(--accent)",
            fontWeight: 800,
            letterSpacing: "0.25em",
            fontSize: "1.1rem",
          }}
        >
          Model
        </span>
      </header>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          gap: "32px",
        }}
      >
        {/* Input + Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            maxWidth: "560px",
          }}
        >
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleNext() }}
            placeholder="Type your Model Name"
            style={{
              flex: 1,
              background: "var(--navy)",
              color: "white",
              border: "2px solid transparent",
              borderRadius: "12px",
              padding: "20px 24px",
              fontSize: "1.1rem",
              fontWeight: 600,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />

          {/* Arrow Button */}
          <button
            onClick={handleNext}
            disabled={!modelName.trim()}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "2px solid var(--navy)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: modelName.trim() ? "pointer" : "not-allowed",
              opacity: modelName.trim() ? 1 : 0.4,
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!modelName.trim()) return
              e.currentTarget.style.background = "var(--navy)"
              const svg = e.currentTarget.querySelector("svg")
              if (svg) svg.style.stroke = "var(--accent)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              const svg = e.currentTarget.querySelector("svg")
              if (svg) svg.style.stroke = "var(--navy)"
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--navy)"
              strokeWidth="2.5"
              style={{ transition: "stroke 0.2s" }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/model-type")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Back
        </button>
      </div>
    </main>
  )
}

export default function ModelNamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModelNameContent />
    </Suspense>
  )
}