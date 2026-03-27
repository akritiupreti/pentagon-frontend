import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../lib/api"

export default function Register() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        if (password !== confirm) {
            setError("Passwords do not match")
            return
        }
        setLoading(true)
        try {
            const res = await register(email, password)
            if (res.message) {
                navigate("/login")
            } else {
                setError(res.detail || "Registration failed")
            }
        } catch {
            setError("Something went wrong. Try again.")
        } finally {
            setLoading(false)
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
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 24px",
                }}
            >
                <div style={{ width: "100%", maxWidth: "440px" }}>
                    {/* Title */}
                    <h1
                        style={{
                            color: "var(--accent)",
                            fontWeight: 800,
                            fontSize: "2.8rem",
                            textAlign: "center",
                            marginBottom: "40px",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Register
                    </h1>

                    {/* Card */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "40px 36px",
                            boxShadow: "0 4px 24px rgba(26,35,50,0.10)",
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {/* Email */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    style={{
                                        color: "var(--accent)",
                                        fontWeight: 700,
                                        fontSize: "0.95rem",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    style={{
                                        background: "var(--navy)",
                                        color: "white",
                                        border: "2px solid transparent",
                                        borderRadius: "10px",
                                        padding: "14px 16px",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    style={{
                                        color: "var(--accent)",
                                        fontWeight: 700,
                                        fontSize: "0.95rem",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Create a password"
                                    style={{
                                        background: "var(--navy)",
                                        color: "white",
                                        border: "2px solid transparent",
                                        borderRadius: "10px",
                                        padding: "14px 16px",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    style={{
                                        color: "var(--accent)",
                                        fontWeight: 700,
                                        fontSize: "0.95rem",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    placeholder="Repeat your password"
                                    style={{
                                        background: "var(--navy)",
                                        color: "white",
                                        border: "2px solid transparent",
                                        borderRadius: "10px",
                                        padding: "14px 16px",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    style={{
                                        background: "#fff0f0",
                                        border: "1px solid #ffcccc",
                                        color: "#cc0000",
                                        borderRadius: "8px",
                                        padding: "12px 16px",
                                        fontSize: "0.875rem",
                                        textAlign: "center",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: "var(--navy)",
                                    color: "var(--accent)",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "15px",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                    transition: "opacity 0.2s",
                                    marginTop: "4px",
                                }}
                                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85" }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = loading ? "0.7" : "1" }}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                margin: "24px 0",
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                            <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500 }}>
                                ALREADY HAVE AN ACCOUNT?
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                        </div>

                        {/* Login Link */}
                        <Link
                            to="/login"
                            style={{
                                display: "block",
                                background: "var(--accent)",
                                color: "var(--navy)",
                                borderRadius: "10px",
                                padding: "15px",
                                fontWeight: 700,
                                fontSize: "1rem",
                                textAlign: "center",
                                textDecoration: "none",
                                transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Footer */}
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            marginTop: "24px",
                        }}
                    >
                        PENTAGON &copy; 2025 &mdash; AI Segmentation Training Platform
                    </p>
                </div>
            </div>
        </main>
    )
}