import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
            <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                    <div style={{ background: "var(--accent)" }} className="w-24 h-24 rounded-full flex items-center justify-center">
                        <span style={{ color: "var(--navy)", fontSize: "2.5rem", fontWeight: 900 }}>P</span>
                    </div>
                </div>
                <h1 style={{ color: "var(--navy)", fontWeight: 900, fontSize: "2.5rem", letterSpacing: "0.2em" }}>
                    PENTAGON
                </h1>
                <p style={{ color: "var(--navy)", opacity: 0.5 }} className="mt-2 mb-8 text-sm">
                    AI-Powered Segmentation Training Platform
                </p>
                <Link
                    to="/login"
                    style={{ background: "var(--navy)", color: "var(--accent)" }}
                    className="px-10 py-4 font-bold text-lg rounded-lg inline-block"
                >
                    Get Started
                </Link>
            </div>
        </main>
    )
}