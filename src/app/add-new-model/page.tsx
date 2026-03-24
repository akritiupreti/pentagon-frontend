"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AddNewModelPage() {
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
          PENTAGON
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
          gap: "40px",
        }}
      >
        <h1
          style={{
            color: "var(--navy)",
            fontWeight: 800,
            fontSize: "2rem",
            letterSpacing: "-0.02em",
          }}
        >
          Add New Model
        </h1>

        {/* Plus Circle */}
        <button
          onClick={() => router.push("/model-type")}
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            border: "3px solid var(--navy)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--navy)"
            const span = e.currentTarget.querySelector("span")
            if (span) span.style.color = "var(--accent)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            const span = e.currentTarget.querySelector("span")
            if (span) span.style.color = "var(--navy)"
          }}
        >
          <span
            style={{
              fontSize: "4rem",
              fontWeight: 200,
              color: "var(--navy)",
              lineHeight: 1,
              userSelect: "none",
              transition: "color 0.2s",
            }}
          >
            +
          </span>
        </button>

        {/* Back */}
        <button
          onClick={() => router.push("/add-image-folder")}
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