import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function TrainingConfig() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const type = searchParams.get("type") || "medical"
    const name = searchParams.get("name") || ""
    const classes = searchParams.get("classes") || ""

    const [acceptanceCriteria, setAcceptanceCriteria] = useState("80%")
    const [epochs, setEpochs] = useState("10")
    const [learningRate, setLearningRate] = useState("1e-4")
    const [status, setStatus] = useState("Training Not Started Yet!")
    const [isTraining, setIsTraining] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) navigate("/login")
    }, [navigate])

    function handleStart() {
        setIsTraining(true)
        setIsPaused(false)
        setStatus("Training in progress...")
    }

    function handlePause() {
        if (!isTraining) return
        setIsPaused((prev) => {
            const next = !prev
            setStatus(next ? "Training Paused" : "Training in progress...")
            return next
        })
    }

    const selectStyle = {
        background: "white",
        border: "none",
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--navy)",
        cursor: "pointer",
        outline: "none",
        appearance: "none" as const,
        paddingRight: "36px",
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231a2332' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        minWidth: "140px",
    }

    const rowStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#e8ecef",
        borderRadius: "10px",
        padding: "16px 20px",
    }

    const labelStyle = {
        color: "var(--navy)",
        fontWeight: 700,
        fontSize: "1rem",
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
                    Training
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
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Model: <strong style={{ color: "var(--navy)" }}>{name}</strong> &mdash; <strong style={{ color: "var(--navy)" }}>{type === "medical" ? "Medical" : "Real Time"}</strong>
                    </p>
                    {classes && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            Classes: <strong style={{ color: "var(--navy)" }}>{classes}</strong>
                        </p>
                    )}
                </div>

                <div
                    style={{
                        background: "var(--navy)",
                        borderRadius: "12px",
                        padding: "18px 32px",
                        width: "100%",
                        maxWidth: "640px",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            color: isTraining && !isPaused ? "var(--accent)" : "white",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                        }}
                    >
                        {status}
                    </span>
                </div>

                <div
                    style={{
                        background: "#6b8fa3",
                        borderRadius: "16px",
                        padding: "16px",
                        width: "100%",
                        maxWidth: "640px",
                        boxShadow: "0 4px 16px rgba(26,35,50,0.12)",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Acceptance Criteria</span>
                            <select value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} style={selectStyle} disabled={isTraining}>
                                {["60%", "70%", "75%", "80%", "85%", "90%", "95%"].map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Epochs</span>
                            <select value={epochs} onChange={(e) => setEpochs(e.target.value)} style={selectStyle} disabled={isTraining}>
                                {["5", "10", "20", "30", "50", "100"].map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Learning Rate</span>
                            <select value={learningRate} onChange={(e) => setLearningRate(e.target.value)} style={selectStyle} disabled={isTraining}>
                                {["1e-2", "1e-3", "1e-4", "1e-5", "1e-6"].map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "24px",
                        width: "100%",
                        maxWidth: "640px",
                        marginTop: "8px",
                    }}
                >
                    <button
                        onClick={handleStart}
                        disabled={isTraining && !isPaused}
                        style={{
                            background: "#4a6fa5",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            padding: "16px 48px",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            cursor: isTraining && !isPaused ? "not-allowed" : "pointer",
                            opacity: isTraining && !isPaused ? 0.6 : 1,
                            transition: "all 0.2s",
                            boxShadow: "0 4px 12px rgba(74,111,165,0.3)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isTraining || isPaused) e.currentTarget.style.opacity = "0.85"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = isTraining && !isPaused ? "0.6" : "1"
                        }}
                    >
                        Start
                    </button>
                    <button
                        onClick={handlePause}
                        disabled={!isTraining}
                        style={{
                            background: "#c0436a",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            padding: "16px 48px",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            cursor: isTraining ? "pointer" : "not-allowed",
                            opacity: isTraining ? 1 : 0.5,
                            transition: "all 0.2s",
                            boxShadow: "0 4px 12px rgba(192,67,106,0.3)",
                        }}
                        onMouseEnter={(e) => {
                            if (isTraining) e.currentTarget.style.opacity = "0.85"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = isTraining ? "1" : "0.5"
                        }}
                    >
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                <button
                    onClick={() => navigate(`/class-selection?type=${type}&name=${encodeURIComponent(name)}`)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        marginTop: "8px",
                    }}
                >
                    Back
                </button>
            </div>
        </main>
    )
}
