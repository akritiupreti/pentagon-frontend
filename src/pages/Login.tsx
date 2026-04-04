import { useEffect, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { login } from "../lib/api"
import NeuronBackground from "../components/NeuronBackground"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (localStorage.getItem("token")) { navigate("/setup"); return }
    if (searchParams.get("verified") === "true") {
      setSuccessMsg("Email verified! You can now sign in.")
      window.history.replaceState({}, "", "/login")
      setTimeout(() => setSuccessMsg(""), 5000)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.access_token) {
        localStorage.setItem("token", res.access_token)
        navigate("/setup")
      } else if (res.detail === "Please verify your email first") {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        setError(res.detail || "Invalid email or password")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Floating success toast */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeSlideDown_0.3s_ease-out]">
          <div className="bg-tertiary/15 border border-tertiary/25 text-tertiary backdrop-blur-xl rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-3 shadow-[0_8px_32px_rgba(0,212,236,0.15)]">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {successMsg}
            <button onClick={() => setSuccessMsg("")} className="ml-2 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Side */}
      <div className="hidden md:flex w-7/12 relative bg-surface-dim overflow-hidden">
        <NeuronBackground />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-dim via-transparent to-primary/10 z-[1]" />
        <div className="relative z-10 p-20 flex flex-col justify-between w-full h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ fontSize: '4rem' }}>neurology</span>
              <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FusionAI
              </span>
            </div>
            <div className="pt-12">
              <h1 className="text-6xl font-extrabold leading-tight tracking-tighter text-on-surface">
                Architecting <br />
                <span className="text-primary-fixed">Intelligence.</span>
              </h1>
              <p className="mt-6 text-on-surface-variant text-lg max-w-md leading-relaxed">
                Join the platform where models evolve in real-time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-xs uppercase tracking-widest">AI-Powered Semantic Segmentation</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] left-[40%] w-64 h-64 bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      {/* Form Side */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface-dim relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Login to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FusionAI</span></h2>
            <p className="text-on-surface-variant mt-2">Sign in to your account</p>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Enter credentials</span>
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 ml-4" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">alternate_email</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3.5 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 ml-4 mr-4">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3.5 pl-12 pr-12 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-on-surface transition-colors"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error-container/20 border border-error/30 text-on-error-container rounded-full px-6 py-3 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest liquid-glass-primary text-on-surface hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="pt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              New here?{" "}
              <Link to="/register" className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-primary/30 transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
