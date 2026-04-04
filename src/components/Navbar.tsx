import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch { return null }
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const decoded = token ? decodeToken(token) : null
  const email = decoded?.email || decoded?.sub || "User"

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Setup", href: "/setup" },
  ]

  const isActive = (href: string) => location.pathname.startsWith(href)

  function handleSignOut() {
    localStorage.removeItem("token")
    setShowProfile(false)
    navigate("/login")
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-filter backdrop-blur-xl shadow-2xl shadow-blue-900/20 flex justify-between items-center px-8 h-16 font-headline tracking-wide">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ fontSize: '1.75rem' }}>neurology</span>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FusionAI
          </span>
        </Link>
        {token && (
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-colors scale-95 active:duration-100 ${
                  isActive(link.href)
                    ? "text-blue-400 border-b-2 border-blue-500 pb-1"
                    : "text-slate-400 hover:text-blue-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        <Link
          to="/about"
          className={`hidden md:block transition-colors scale-95 active:duration-100 ${
            isActive("/about")
              ? "text-blue-400 border-b-2 border-blue-500 pb-1"
              : "text-slate-400 hover:text-blue-300"
          }`}
        >
          About
        </Link>
        <Link
          to="/pricing"
          className={`hidden md:block transition-colors scale-95 active:duration-100 ${
            isActive("/pricing")
              ? "text-blue-400 border-b-2 border-blue-500 pb-1"
              : "text-slate-400 hover:text-blue-300"
          }`}
        >
          Pricing
        </Link>
        {token ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface text-sm">person</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-outline-variant/15 shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-[profileReveal_0.2s_ease-out] bg-surface-container">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-0.5">Signed in as</div>
                      <div className="text-sm font-semibold text-on-surface truncate">{email}</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-outline-variant/10 p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="liquid-glass-primary text-on-surface px-6 py-1.5 rounded-full text-sm font-semibold">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
