import { Link, useLocation, useNavigate } from "react-router-dom"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Models", href: "/setup" },
    { label: "Datasets", href: "/setup" },
  ]

  const isActive = (href: string) => location.pathname.startsWith(href)

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-filter backdrop-blur-xl shadow-2xl shadow-blue-900/20 flex justify-between items-center px-8 h-16 font-headline tracking-wide">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          FusionAI
        </Link>
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
      </div>
      <div className="flex items-center gap-4">
        {token ? (
          <button
            onClick={() => { localStorage.removeItem("token"); navigate("/login") }}
            className="liquid-glass-primary text-on-surface px-6 py-1.5 rounded-full text-sm font-semibold"
          >
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="liquid-glass-primary text-on-surface px-6 py-1.5 rounded-full text-sm font-semibold">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
