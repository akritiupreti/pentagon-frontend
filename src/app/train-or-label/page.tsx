"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TrainOrLabelPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [])

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "var(--accent)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(125,196,33,0.4)",
            }}
          >
            <span style={{ color: "var(--navy)", fontWeight: 900, fontSize: "1.2rem" }}>P</span>
          </div>
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 800,
              letterSpacing: "0.25em",
              fontSize: "1.1rem",
            }}
          >
            PENTAGON
          </span>
        </div>
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
        <h1
          style={{
            color: "var(--navy)",
            fontWeight: 800,
            fontSize: "2rem",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          What would you like to do?
        </h1>

        {/* Train Button */}
        <button
          onClick={() => router.push("/add-image-folder")}
          style={{
            background: "var(--navy)",
            color: "var(--accent)",
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
            letterSpacing: "0.02em",
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
          Train
        </button>

        {/* Label Button */}
        <button
          onClick={() => router.push("/add-image-folder?mode=label")}
          style={{
            background: "var(--navy)",
            color: "var(--accent)",
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
            letterSpacing: "0.02em",
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
          Label
        </button>

        {/* Sign out */}
        <button
          onClick={() => {
            localStorage.removeItem("token")
            router.push("/login")
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            cursor: "pointer",
            marginTop: "16px",
            textDecoration: "underline",
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  )
}