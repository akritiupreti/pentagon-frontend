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
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Hero Side */}
      <div className="hidden md:flex w-7/12 relative bg-surface-dim overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="AI Landscape"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh3FHAyHiKj3ds1yI3h11f16WKofmN6x0wThfs9h_k_n_wpSa3EGM6qVewiHMEVPEpRvYgRhNBLSYOXGkDzH5BE5IjOb3RNieAmkNj5ps6yzmyQ7YbK8WfLjK3bneHfLxmE-pqb9HdSWbHrdUKqObCcPHRSqXZ6hSZ5UaentG4MgXTXV6qUouRfDbLvwj-0p2-R6TvdzFWDJNekNCMUVTRzw8OYHNpUEMvc7z-D6iIwdmg6zIY7A9Qd1GEz9mnljc0wo9doWKp-_M"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-dim via-transparent to-primary/10" />
        </div>
        <div className="relative z-10 p-20 flex flex-col justify-between w-full h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">cloud_done</span>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FusionAI
              </span>
            </div>
            <div className="pt-12">
              <h1 className="text-6xl font-extrabold leading-tight tracking-tighter text-on-surface">
                Architecting <br />
                <span className="text-primary-fixed">Intelligence.</span>
              </h1>
              <p className="mt-6 text-on-surface-variant text-lg max-w-md leading-relaxed">
                Create your account and start training models.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-primary-dim font-bold text-2xl">99.9%</span>
              <span className="text-on-surface-variant text-xs uppercase tracking-widest">Uptime reliability</span>
            </div>
            <div className="flex flex-col">
              <span className="text-secondary font-bold text-2xl">1.2M+</span>
              <span className="text-on-surface-variant text-xs uppercase tracking-widest">Models deployed</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] left-[40%] w-64 h-64 bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      {/* Form Side */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-surface-dim relative">
        <div className="w-full max-w-md space-y-5 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Sign up for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FusionAI</span></h2>
            <p className="text-on-surface-variant mt-2">Create your account</p>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Enter credentials</span>
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-4" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">alternate_email</span>
                  <input
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3.5 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-4" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                  <input
                    id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    placeholder="Create a password"
                    className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3.5 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-4" htmlFor="confirm">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                  <input
                    id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    placeholder="Repeat your password"
                    className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3.5 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error-container/20 border border-error/30 text-on-error-container rounded-full px-6 py-3 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest liquid-glass-primary text-on-surface hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-primary/30 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 md:left-auto md:right-12 md:translate-x-0">
          {["Terms", "Privacy", "Status"].map((label) => (
            <a key={label} href="#" className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
              {label}
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}
