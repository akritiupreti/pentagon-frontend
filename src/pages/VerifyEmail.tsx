import { useRef, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { confirmEmail, resendCode } from "../lib/api"

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") || ""

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const code = digits.join("")

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("")
      const next = [...digits]
      pasted.forEach((d, i) => { if (index + i < 6) next[index + i] = d })
      setDigits(next)
      const focusIdx = Math.min(index + pasted.length, 5)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const next = [...digits]
    next[index] = value
    setDigits(next)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ""
      setDigits(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return
    setError("")
    setLoading(true)
    try {
      const res = await confirmEmail(email, code)
      if (res.message && !res.detail) {
        navigate("/login?verified=true")
      } else {
        setError(res.detail || "Verification failed")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  function startCooldown() {
    setCooldown(60)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    setResending(true)
    setResent(false)
    try {
      await resendCode(email)
      setResent(true)
      startCooldown()
    } catch {
      setError("Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-md p-6 space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="material-symbols-outlined bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ fontSize: '3rem' }}>neurology</span>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FusionAI
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Verify your email</h2>
          <p className="text-on-surface-variant text-sm">
            We sent a verification code to <span className="text-primary font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 text-center">
              Verification Code
            </label>
            <div className="flex justify-center gap-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-12 h-14 text-center text-xl font-bold font-mono rounded-2xl bg-surface-container-lowest/50 backdrop-blur-md outline-none transition-all ghost-border ${
                    d ? "ring-1 ring-primary text-on-surface" : "text-on-surface-variant focus:ring-1 focus:ring-tertiary"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/30 text-on-error-container rounded-full px-6 py-3 text-sm text-center">
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-full px-6 py-3 text-sm text-center">
              New code sent!
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest liquid-glass-primary text-on-surface hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center space-y-3">
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-primary text-sm font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending ? "Sending..." : cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
          </button>
          <p className="text-on-surface-variant text-sm">
            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30">
              Back to Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
