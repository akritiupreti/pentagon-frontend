import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createSession, uploadDataset, suggestHyperparameters } from "../lib/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navbar from "../components/Navbar"
import SideNav from "../components/SideNav"
import Footer from "../components/Footer"

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
  const [isLoadingParams, setIsLoadingParams] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) navigate("/login")
    else getSuggestedHyperparameters()
  }, [navigate])

  async function getSuggestedHyperparameters() {
    try {
      setIsLoadingParams(true)
      const imageCountStr = localStorage.getItem("imageCount")
      const imageCount = imageCountStr ? parseInt(imageCountStr, 10) : 0
      const classList = classes ? classes.split(",").filter((c) => c.trim()) : []

      if (imageCount > 0 && classList.length > 0) {
        const suggestions = await suggestHyperparameters(imageCount, classList)
        setAcceptanceCriteria(suggestions.acceptance_criteria || "80%")
        setEpochs(suggestions.epochs || "10")
        setLearningRate(suggestions.learning_rate || "1e-4")

        if (suggestions.from_claude) {
          toast.success("Hyperparameters optimized by Claude!", { position: "top-right", autoClose: 3000 })
        } else {
          toast.info("Using default hyperparameters. Configure AWS credentials for Claude optimization.", { position: "top-right", autoClose: 4000 })
        }
      }
    } catch (error) {
      console.error("Error getting hyperparameter suggestions:", error)
      toast.error("Failed to fetch parameters. Using defaults.", { position: "top-right", autoClose: 3000 })
    } finally {
      setIsLoadingParams(false)
    }
  }

  function handleStart() {
    setIsTraining(true)
    setIsPaused(false)
    setStatus("Creating session...")
    createSessionAndStartTraining()
  }

  async function createSessionAndStartTraining() {
    try {
      const task = type === "medical" ? "medical" : "realtime"
      const architecture = "deeplabv3+"
      const sessionRes = await createSession(name, architecture, task)
      if (!sessionRes.id) {
        setStatus("Failed to create session")
        setIsTraining(false)
        return
      }
      const imageCountStr = localStorage.getItem("imageCount")
      const imageCount = imageCountStr ? parseInt(imageCountStr, 10) : 0
      if (imageCount > 0) await uploadDataset(sessionRes.id, imageCount)
      localStorage.removeItem("imageCount")
      navigate(`/dashboard/session/${sessionRes.id}`)
    } catch (error) {
      console.error("Error starting training:", error)
      setStatus("Error creating session")
      setIsTraining(false)
    }
  }

  function handlePause() {
    if (!isTraining) return
    setIsPaused((prev) => {
      const next = !prev
      setStatus(next ? "Training Paused" : "Training in progress...")
      return next
    })
  }

  const lrValue = parseFloat(learningRate.replace("1e-", "0.".padEnd(parseInt(learningRate.split("-")[1]) + 1, "0") + "1")) || 0.0001

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
      <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
        <Navbar />
        <div className="flex min-h-screen pt-16">
          <SideNav phase="Phase 2: Configuration" />
          <main className="flex-1 ml-64 p-10 max-w-7xl">
            <div className="mb-10 flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Hyperparameter Configuration</h1>
              <p className="text-on-surface-variant max-w-2xl">
                Refine the computational parameters. Model: <span className="text-primary font-semibold">{name}</span> — {type === "medical" ? "Medical" : "Real Time"}
              </p>
            </div>

            {/* Status Bar */}
            {isTraining && (
              <div className="mb-8 glass-panel p-4 rounded-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? "bg-secondary" : "bg-tertiary"} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? "bg-secondary" : "bg-tertiary"}`} />
                  </span>
                  <span className="text-sm font-semibold">{status}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* Configuration Form */}
              <div className="col-span-12 lg:col-span-7 space-y-8">
                <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/15">
                  <div className="space-y-10">
                    {/* Acceptance Criteria */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Acceptance Criteria</label>
                        <span className="text-tertiary font-mono text-sm">{acceptanceCriteria}</span>
                      </div>
                      <select
                        value={acceptanceCriteria}
                        onChange={(e) => setAcceptanceCriteria(e.target.value)}
                        disabled={isTraining}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-sm p-3 rounded-full focus:ring-1 focus:ring-tertiary transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {["60%", "70%", "75%", "80%", "85%", "90%", "95%"].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    {/* Learning Rate */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Learning Rate</label>
                        <span className="text-tertiary font-mono text-sm">{learningRate}</span>
                      </div>
                      <select
                        value={learningRate}
                        onChange={(e) => setLearningRate(e.target.value)}
                        disabled={isTraining}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-sm p-3 rounded-full focus:ring-1 focus:ring-tertiary transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {["1e-2", "1e-3", "1e-4", "1e-5", "1e-6"].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <p className="text-xs text-on-surface-variant italic">Suggested for Adam Optimizer: 1e-4 - 1e-3</p>
                    </div>

                    {/* Epochs */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="font-headline font-semibold text-on-surface">Epochs</label>
                        <span className="text-tertiary font-mono text-sm">{epochs} iterations</span>
                      </div>
                      <select
                        value={epochs}
                        onChange={(e) => setEpochs(e.target.value)}
                        disabled={isTraining}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-sm p-3 rounded-full focus:ring-1 focus:ring-tertiary transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {["5", "10", "20", "30", "50", "100"].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-12 flex justify-between items-center pt-8 border-t border-outline-variant/10">
                    <button
                      onClick={() => navigate(`/class-selection?type=${type}&name=${encodeURIComponent(name)}`)}
                      className="text-primary font-semibold text-sm hover:underline px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      Back
                    </button>
                    <div className="flex gap-4">
                      {isTraining && (
                        <button
                          onClick={handlePause}
                          className="px-8 py-2 liquid-glass text-primary font-semibold text-sm rounded-full"
                        >
                          {isPaused ? "Resume" : "Pause"}
                        </button>
                      )}
                      <button
                        onClick={handleStart}
                        disabled={isTraining && !isPaused}
                        className="px-10 py-2 liquid-glass-primary-solid text-on-primary font-bold text-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTraining ? "Training..." : "Start Training"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualization Panel */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {/* Convergence Projection */}
                <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/15 overflow-hidden relative">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-tertiary text-sm">insights</span>
                    <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Convergence Projection</span>
                  </div>
                  <div className="h-48 w-full flex items-end gap-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-tertiary/10 to-transparent" />
                    {[10, 15, 22, 35, 50, 68, 82, 92, 95, 98, 96, 93, 88].map((h, i) => (
                      <div key={i} className="w-2 rounded-t-full" style={{ height: `${h}%`, background: `rgba(129, 236, 255, ${0.2 + i * 0.06})` }} />
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] text-on-surface-variant leading-relaxed">
                    Based on your configuration, we project convergence within {epochs} epochs using the selected dataset.
                  </p>
                </div>

                {/* Tip Card */}
                <div className="glass-panel p-6 rounded-lg border border-outline-variant/15 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <span className="material-symbols-outlined text-4xl text-tertiary">lightbulb</span>
                  </div>
                  <h4 className="text-sm font-bold text-tertiary mb-2">Expert Insight</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Decreasing the learning rate towards the end of training (scheduler) can help settle the model into a sharper local minimum, potentially boosting accuracy by 0.5-1%.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  )
}
