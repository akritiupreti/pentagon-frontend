"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ModelTypePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [])

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
          gap: "24px",
        }}
      >
        {/* Medical Button */}
        <button
          onClick={() => router.push("/model-name?type=medical")}
          style={{
            background: "var(--navy)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            padding: "28px 0",
            fontWeight: 800,
            fontSize: "1.6rem",
            width: "100%",
            maxWidth: "480px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(26,35,50,0.15)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,35,50,0.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,35,50,0.15)"
          }}
        >
          Medical
        </button>

        {/* Real Time Button */}
        <button
          onClick={() => router.push("/model-name?type=realtime")}
          style={{
            background: "var(--navy)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            padding: "28px 0",
            fontWeight: 800,
            fontSize: "1.6rem",
            width: "100%",
            maxWidth: "480px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(26,35,50,0.15)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,35,50,0.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,35,50,0.15)"
          }}
        >
          Real Time
        </button>

        {/* Back */}
        <button
          onClick={() => router.push("/add-new-model")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
            marginTop: "16px",
          }}
        >
          Back
        </button>
      </div>
    </main>
  )
}