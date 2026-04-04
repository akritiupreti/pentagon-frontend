import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createSession, uploadDataset, suggestHyperparameters, startInferencing, createJob, getJob } from "../lib/api"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Navbar from "../components/Navbar"
import GlassDropdown from "../components/GlassDropdown"

type MetricPoint = { step: number; trainLoss: number; valLoss: number; accuracy: number }

export default function TrainingConfig() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get("type") || "medical"
  const name = searchParams.get("name") || ""
  const classes = searchParams.get("classes") || ""
  const classList = classes ? classes.split(",").filter((c) => c.trim()) : []

  const [acceptanceCriteria, setAcceptanceCriteria] = useState("80%")
  const [epochs, setEpochs] = useState("10")
  const [learningRate, setLearningRate] = useState("1e-4")
  const [isTraining, setIsTraining] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoadingParams, setIsLoadingParams] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [metrics, setMetrics] = useState<MetricPoint[]>([])
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null)
  const [isInferencing, setIsInferencing] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initRan = useRef(false)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRef = useRef(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }
    if (initRan.current) return
    initRan.current = true
    init()
  }, [navigate])

  function showToast(text: string, type: "success" | "info" | "error" = "info") {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 5000)
  }

  // Simulated progress + metrics
  useEffect(() => {
    if (isTraining && !isPaused) {
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressRef.current!)
            setIsTraining(false)
            showToast("Training complete!", "success")
            return 100
          }
          return prev + Math.random() * 1.5 + 0.3
        })

        stepRef.current += 1
        const s = stepRef.current
        const decay = Math.exp(-s * 0.04)
        setMetrics((prev) => [...prev, {
          step: s,
          trainLoss: 2.5 * decay + Math.random() * 0.15,
          valLoss: 2.8 * decay + Math.random() * 0.2 + 0.05,
          accuracy: Math.min(0.98, (1 - decay) * 0.95 + Math.random() * 0.02),
        }])
      }, 500)
    } else if (progressRef.current) {
      clearInterval(progressRef.current)
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [isTraining, isPaused])

  async function init() {
    setIsLoadingParams(true)
    try {
      if (classes) {
        const task = type === "medical" ? "medical" : "realtime"
        const sessionRes = await createSession(name, "deeplabv3+", task, classes)
        if (sessionRes.id) setSessionId(sessionRes.id)
      }

      const imageCountStr = localStorage.getItem("imageCount")
      const imageCount = imageCountStr ? parseInt(imageCountStr, 10) : 0

      if (classList.length > 0 && imageCount > 0) {
        const suggestions = await suggestHyperparameters(imageCount, classList)
        setAcceptanceCriteria(suggestions.acceptance_criteria || "80%")
        setEpochs(suggestions.epochs || "10")
        setLearningRate(suggestions.learning_rate || "1e-4")

        if (suggestions.from_claude) {
          showToast("Hyperparameters optimized by Claude!", "success")
        } else {
          showToast("Using default hyperparameters", "info")
        }
      }
    } catch (error) {
      console.error("Error initializing:", error)
      showToast("Failed to initialize. Using defaults.", "error")
    } finally {
      setIsLoadingParams(false)
    }
  }

  // Long-poll job status
  useEffect(() => {
    if (!jobId) return
    pollRef.current = setInterval(async () => {
      try {
        const job = await getJob(jobId)
        if (job.is_completed) {
          clearInterval(pollRef.current!)
          pollRef.current = null
          setIsTraining(false)
          setIsInferencing(false)
          setProgress(100)
          showToast(`${job.job_type === "training" ? "Training" : "Inferencing"} complete!`, "success")
          setJobId(null)
        }
      } catch {}
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [jobId])

  function getUserId(): string {
    const token = localStorage.getItem("token")
    if (!token) return ""
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.sub || ""
    } catch { return "" }
  }

  async function handleInferencing() {
    const storedUrls = localStorage.getItem("datasetUrls")
    const urls: string[] = storedUrls ? JSON.parse(storedUrls) : []
    if (urls.length === 0) { showToast("No dataset URLs found. Upload a dataset first.", "error"); return }
    if (!sessionId) { showToast("No session found.", "error"); return }
    setIsInferencing(true)
    try {
      // Create job record
      const job = await createJob(sessionId, "inferencing")
      if (job.id) setJobId(job.id)
      // Fire off inferencing request
      await startInferencing({
        urls,
        modelType: type === "medical" ? "medical" : "realtime",
        userId: getUserId(),
        sessionId,
      })
      showToast("Inferencing started! Polling for completion...", "info")
    } catch {
      showToast("Failed to start inferencing.", "error")
      setIsInferencing(false)
    }
  }

  function handleStart() {
    if (!sessionId) { showToast("No session found.", "error"); return }
    setIsTraining(true)
    setIsPaused(false)
    setProgress(0)
    setMetrics([])
    stepRef.current = 0
    // Create job record
    createJob(sessionId, "training").then((job) => {
      if (job.id) setJobId(job.id)
    }).catch(() => {})
  }

  function handlePauseResume() {
    setIsPaused((prev) => !prev)
  }

  const locked = isTraining || progress >= 100
  const latestMetric = metrics[metrics.length - 1]

  if (isLoadingParams) {
    return (
      <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm">Optimizing hyperparameters with Claude...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[60] animate-[profileReveal_0.2s_ease-out]">
          <div className={`backdrop-blur-xl rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-3 ${
            toastMsg.type === "success" ? "bg-tertiary/15 border border-tertiary/25 text-tertiary shadow-[0_8px_32px_rgba(0,212,236,0.15)]" :
            toastMsg.type === "error" ? "bg-error/15 border border-error/25 text-error shadow-[0_8px_32px_rgba(255,113,108,0.15)]" :
            "bg-primary/15 border border-primary/25 text-primary shadow-[0_8px_32px_rgba(137,172,255,0.15)]"
          }`}>
            <span className="material-symbols-outlined text-sm">
              {toastMsg.type === "success" ? "check_circle" : toastMsg.type === "error" ? "error" : "info"}
            </span>
            {toastMsg.text}
            <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-12 px-6">
          <div className="w-full max-w-5xl mx-auto">
            <div className="mb-10 flex flex-col gap-2 text-center">
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Hyperparameter Configuration</h1>
              <p className="text-on-surface-variant">
                Model: <span className="text-primary font-semibold">{name}</span> — {type === "medical" ? "Medical" : "Real Time"}
              </p>
            </div>

            <div className="relative">
              {/* Hyperparameters - centered */}
              <div className="max-w-2xl mx-auto relative">
                {(isTraining && !isPaused) && (
                  <>
                    <span className="absolute -inset-[3px] rounded-3xl rainbow-border-glow" />
                    <span className="absolute -inset-[1px] rounded-3xl rainbow-border-lg" />
                  </>
                )}
                <div className="relative bg-surface-container-low p-8 rounded-3xl">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Acceptance Criteria</label>
                        <span className="text-tertiary font-headline font-bold text-base">{acceptanceCriteria}</span>
                      </div>
                      <GlassDropdown
                        value={acceptanceCriteria}
                        options={["60%", "70%", "75%", "80%", "85%", "90%", "95%"]}
                        onChange={setAcceptanceCriteria}
                        disabled={locked}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Learning Rate</label>
                        <span className="text-tertiary font-headline font-bold text-base">{learningRate}</span>
                      </div>
                      <GlassDropdown
                        value={learningRate}
                        options={["1e-2", "1e-3", "1e-4", "1e-5", "1e-6"]}
                        onChange={setLearningRate}
                        disabled={locked}
                      />
                      <p className="text-xs text-on-surface-variant italic">Suggested for Adam Optimizer: 1e-4 - 1e-3</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Epochs</label>
                        <span className="text-tertiary font-headline font-bold text-base">{epochs} iterations</span>
                      </div>
                      <GlassDropdown
                        value={epochs}
                        options={["5", "10", "20", "30", "50", "100"]}
                        onChange={setEpochs}
                        disabled={locked}
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(isTraining || progress > 0) && (
                    <div className="mt-8 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {isTraining && !isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${!isTraining && progress >= 100 ? "bg-tertiary" : isPaused ? "bg-secondary" : "bg-tertiary"}`} />
                          </span>
                          <span className="text-xs font-semibold text-on-surface-variant">
                            {!isTraining && progress >= 100 ? "Complete" : isPaused ? "Paused" : "Training in progress..."}
                          </span>
                        </div>
                        <span className="text-sm font-headline font-bold text-tertiary">{Math.min(progress, 100).toFixed(1)}%</span>
                      </div>
                      <div className="relative h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                        {isTraining && !isPaused && (
                          <div
                            className="absolute top-0 left-0 h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move_1s_linear_infinite] rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Completed state */}
                  {!isTraining && progress >= 100 && (
                    <div className="mt-8 p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary">check_circle</span>
                      <span className="text-sm font-semibold text-tertiary">Training complete!</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-8 flex flex-col items-center gap-4 pt-6 border-t border-outline-variant/10">
                    {!isTraining && progress < 100 && (
                      <div className="flex gap-3 w-full max-w-lg">
                        <button
                          onClick={handleInferencing}
                          disabled={isInferencing}
                          className="flex-1 py-4 px-6 liquid-glass text-on-surface font-bold text-sm uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isInferencing ? "Starting..." : "Start Inferencing"}
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                        </button>
                        <button
                          onClick={handleStart}
                          className="flex-1 py-4 px-6 liquid-glass-primary-solid text-on-primary font-bold text-sm uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          Start Training
                          <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        </button>
                      </div>
                    )}

                    {isTraining && (
                      <button
                        onClick={handlePauseResume}
                        className={`w-full max-w-xs py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                          isPaused
                            ? "liquid-glass-primary-solid text-on-primary"
                            : "liquid-glass-error text-on-surface"
                        }`}
                      >
                        {isPaused ? (
                          <>Resume Training<span className="material-symbols-outlined text-sm">play_arrow</span></>
                        ) : (
                          <>Pause Training<span className="material-symbols-outlined text-sm">pause</span></>
                        )}
                      </button>
                    )}

                    {!isTraining && progress >= 100 && (
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full max-w-xs py-4 liquid-glass-primary-solid text-on-primary font-bold text-sm uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        Go to Dashboard
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    )}

                    {!isTraining && progress < 100 && (
                      <button
                        onClick={() => navigate("/setup")}
                        className="text-on-surface-variant text-sm hover:text-primary transition-colors"
                      >
                        Back
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Classes - positioned to the right */}
              {classList.length > 0 && (
                <div className="hidden lg:block absolute top-0" style={{ left: 'calc(50% + 21rem + 2rem)', width: '14rem' }}>
                  <div className="bg-surface-container-low p-6 rounded-3xl ghost-border">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-sm">category</span>
                      <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Selected Classes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classList.map((cls) => (
                        <span key={cls} className="px-3 py-1.5 rounded-full text-xs font-medium liquid-glass text-on-surface">
                          {cls}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <div className="text-on-surface-variant text-xs">{classList.length} {classList.length === 1 ? "class" : "classes"} selected</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Charts */}
            {metrics.length > 0 && (
              <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loss Chart */}
                <div className="bg-surface-container-low rounded-3xl p-8 ghost-border flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error" /> Loss
                    </h3>
                    {latestMetric && (
                      <span className="font-mono text-xs text-error">{latestMetric.trainLoss.toFixed(3)}</span>
                    )}
                  </div>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics}>
                        <XAxis dataKey="step" stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 10 }} />
                        <YAxis stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ background: "#060e20", border: "1px solid #40485d", color: "#dee5ff", fontSize: 11, borderRadius: "12px" }}
                          formatter={(value: any, name: any) => [Number(value).toFixed(4), name === "trainLoss" ? "Train Loss" : "Val Loss"]}
                        />
                        <Line type="monotone" dataKey="trainLoss" stroke="#ff716c" strokeWidth={2} dot={false} name="trainLoss" />
                        <Line type="monotone" dataKey="valLoss" stroke="#a68cff" strokeWidth={2} dot={false} name="valLoss" strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-[2px] bg-error rounded" />
                      <span className="text-[10px] text-on-surface-variant">Train</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-[2px] bg-secondary rounded" style={{ borderTop: "2px dashed #a68cff", height: 0 }} />
                      <span className="text-[10px] text-on-surface-variant">Validation</span>
                    </div>
                  </div>
                </div>

                {/* Accuracy Chart */}
                <div className="bg-surface-container-low rounded-3xl p-8 ghost-border flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary" /> Accuracy
                    </h3>
                    {latestMetric && (
                      <span className="font-mono text-xs text-tertiary">{(latestMetric.accuracy * 100).toFixed(1)}%</span>
                    )}
                  </div>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics}>
                        <XAxis dataKey="step" stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 10 }} />
                        <YAxis stroke="#40485d" tick={{ fill: "#a3aac4", fontSize: 10 }} domain={[0, 1]} />
                        <Tooltip
                          contentStyle={{ background: "#060e20", border: "1px solid #40485d", color: "#dee5ff", fontSize: 11, borderRadius: "12px" }}
                          formatter={(value: any) => [(Number(value) * 100).toFixed(2) + "%", "Accuracy"]}
                        />
                        <Line type="monotone" dataKey="accuracy" stroke="#81ecff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
