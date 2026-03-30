import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function AddImageFolder() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const mode = searchParams.get("mode") || "train"
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [folderName, setFolderName] = useState<string | null>(null)
    const [imageCount, setImageCount] = useState<number>(0)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) navigate("/login")
    }, [navigate])

    function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (files && files.length > 0) {
            const path = (files[0] as any).webkitRelativePath || ""
            const folder = path.split("/")[0]
            setFolderName(folder)
            setImageCount(files.length)
            // Store image count in localStorage for later use in TrainingConfig
            localStorage.setItem("imageCount", files.length.toString())
        }
    }

    function handleNext() {
        if (!folderName) return
        if (mode === "label") {
            navigate("/label-tool")
        } else {
            navigate("/add-new-model")
        }
    }

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
                    gap: "32px",
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
                    Add Image Folder
                </h1>

                {/* Upload Circle */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "50%",
                        border: "3px solid var(--navy)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background: folderName ? "var(--navy)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--navy)"
                        e.currentTarget.style.transform = "scale(1.04)"
                        const span = e.currentTarget.querySelector("span")
                        if (span) span.style.color = "var(--accent)"
                    }}
                    onMouseLeave={(e) => {
                        if (!folderName) e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.transform = "scale(1)"
                        const span = e.currentTarget.querySelector("span")
                        if (span) span.style.color = folderName ? "var(--accent)" : "var(--navy)"
                    }}
                >
                    <span
                        style={{
                            fontSize: "3.5rem",
                            fontWeight: 200,
                            color: folderName ? "var(--accent)" : "var(--navy)",
                            lineHeight: 1,
                            userSelect: "none",
                        }}
                    >
                        +
                    </span>
                    {folderName && (
                        <span
                            style={{
                                color: "var(--accent)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                marginTop: "8px",
                                textAlign: "center",
                                padding: "0 16px",
                                wordBreak: "break-all",
                            }}
                        >
                            {folderName}
                        </span>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFolderSelect}
                    {...({ webkitdirectory: "true", directory: "true" } as object)}
                    multiple
                />

                {folderName && (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                            Folder selected: <strong>{folderName}</strong>
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                            <strong>{imageCount}</strong> {imageCount === 1 ? "image" : "images"} found
                        </p>
                    </div>
                )}

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={!folderName}
                    style={{
                        background: folderName ? "var(--navy)" : "#ccc",
                        color: folderName ? "var(--accent)" : "#888",
                        border: "none",
                        borderRadius: "14px",
                        padding: "18px 64px",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        cursor: folderName ? "pointer" : "not-allowed",
                        boxShadow: folderName ? "0 4px 16px rgba(26,35,50,0.15)" : "none",
                        transition: "all 0.2s",
                        marginTop: "8px",
                    }}
                    onMouseEnter={(e) => {
                        if (folderName) e.currentTarget.style.opacity = "0.85"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1"
                    }}
                >
                    Next
                </button>

                {/* Back */}
                <button
                    onClick={() => navigate("/train-or-label")}
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
