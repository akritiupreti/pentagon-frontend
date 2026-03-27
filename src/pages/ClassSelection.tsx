import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const MEDICAL_CLASSES = [
    "Kidney", "Pancreas", "Spleen", "Liver", "Heart",
    "Lungs", "Brain", "Bladder", "Prostate", "Thyroid",
    "Gallbladder", "Stomach", "Colon", "Femur", "Aorta",
]

const REALTIME_CLASSES = [
    "Car", "Bike", "Bottle", "Glass", "Person",
    "Bus", "Truck", "Motorcycle", "Chair", "Table",
    "Dog", "Cat", "Tree", "Road", "Building",
]

export default function ClassSelection() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const type = searchParams.get("type") || "medical"
    const name = searchParams.get("name") || ""
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<string[]>(
        type === "medical" ? [...MEDICAL_CLASSES] : [...REALTIME_CLASSES]
    )

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) navigate("/login")
    }, [navigate])

    const allClasses = type === "medical" ? MEDICAL_CLASSES : REALTIME_CLASSES
    const filtered = allClasses.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
    )

    function toggleClass(cls: string) {
        setSelected((prev) =>
            prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
        )
    }

    function handleNext() {
        navigate(
            `/training-config?type=${type}&name=${encodeURIComponent(name)}&classes=${encodeURIComponent(selected.join(","))}`
        )
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
                        letterSpacing: "0.05em",
                        fontSize: "1.2rem",
                    }}
                >
                    {type === "medical" ? "Medical Image Segmentation" : "Real Time Segmentation"}
                </span>
            </header>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "32px 24px",
                    gap: "24px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "white",
                        borderRadius: "32px",
                        padding: "12px 20px",
                        gap: "10px",
                        width: "100%",
                        maxWidth: "520px",
                        boxShadow: "0 2px 8px rgba(26,35,50,0.08)",
                    }}
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search classes..."
                        style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "var(--navy)",
                            fontSize: "1rem",
                            fontWeight: 500,
                            flex: 1,
                        }}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>

                <div
                    style={{
                        width: "100%",
                        maxWidth: "720px",
                        background: "#6b8fa3",
                        borderRadius: "16px",
                        padding: "12px",
                        boxShadow: "0 4px 16px rgba(26,35,50,0.12)",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: "10px",
                            overflow: "hidden",
                            maxHeight: "400px",
                            overflowY: "auto",
                        }}
                    >
                        {filtered.map((cls, index) => (
                            <div
                                key={cls}
                                onClick={() => toggleClass(cls)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "14px 20px",
                                    cursor: "pointer",
                                    borderBottom: index < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                                    transition: "background 0.15s",
                                    background: "white",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fdf0")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                                <span
                                    style={{
                                        color: "var(--navy)",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    {cls}
                                </span>
                                <div
                                    style={{
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "4px",
                                        background: selected.includes(cls) ? "#5b4fcf" : "white",
                                        border: selected.includes(cls) ? "none" : "2px solid #ddd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.15s",
                                        flexShrink: 0,
                                    }}
                                >
                                    {selected.includes(cls) && (
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {selected.length} class{selected.length !== 1 ? "es" : ""} selected
                </p>

                <button
                    onClick={handleNext}
                    disabled={selected.length === 0}
                    style={{
                        background: selected.length > 0 ? "var(--navy)" : "#ccc",
                        color: selected.length > 0 ? "var(--accent)" : "#888",
                        border: "none",
                        borderRadius: "14px",
                        padding: "18px 64px",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        cursor: selected.length > 0 ? "pointer" : "not-allowed",
                        boxShadow: selected.length > 0 ? "0 4px 16px rgba(26,35,50,0.15)" : "none",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        if (selected.length > 0) e.currentTarget.style.opacity = "0.85"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1"
                    }}
                >
                    Next
                </button>

                <button
                    onClick={() => navigate("/model-name")}
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
