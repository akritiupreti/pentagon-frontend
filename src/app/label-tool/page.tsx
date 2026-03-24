"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LabelToolPage() {
  const router = useRouter()
  const [className, setClassName] = useState("")
  const [pixelWidth, setPixelWidth] = useState("1")
  const [currentIndex, setCurrentIndex] = useState(0)

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
      {/* Top Toolbar */}
      <header
        style={{
          background: "var(--header)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Class Name Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg)",
            borderRadius: "24px",
            padding: "8px 16px",
            gap: "10px",
            width: "280px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Class Name"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--navy)",
              fontSize: "0.95rem",
              fontWeight: 500,
              flex: 1,
            }}
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Pixel Width Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg)",
            borderRadius: "24px",
            padding: "8px 16px",
            gap: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <select
            value={pixelWidth}
            onChange={(e) => setPixelWidth(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--navy)",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              appearance: "none",
              paddingRight: "8px",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((w) => (
              <option key={w} value={w}>
                {w} Pixel width
              </option>
            ))}
          </select>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </header>

      {/* Image Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          position: "relative",
        }}
      >
        {/* Canvas/Image placeholder */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "900px",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 24px rgba(26,35,50,0.10)",
            border: "2px dashed rgba(26,35,50,0.15)",
            position: "relative",
          }}
        >
          <span
            style={{
              color: "var(--navy)",
              fontWeight: 900,
              fontSize: "2.5rem",
              letterSpacing: "0.1em",
              opacity: 0.15,
            }}
          >
            IMAGE HERE
          </span>
        </div>

        {/* Next Arrow */}
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          style={{
            position: "absolute",
            bottom: "32px",
            right: "48px",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "2px solid var(--navy)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          background: "var(--header)",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => router.push("/add-image-folder?mode=label")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          Back
        </button>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
          Image {currentIndex + 1}
        </span>
        <button
          onClick={() => router.push("/train-or-label")}
          style={{
            background: "var(--accent)",
            border: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            color: "var(--navy)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </main>
  )
}