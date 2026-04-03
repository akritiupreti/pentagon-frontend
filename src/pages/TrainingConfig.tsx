import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createSession, uploadDataset, suggestHyperparameters } from "../lib/api"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navbar from "../components/Navbar"
import GlassDropdown from "../components/GlassDropdown"

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
        <main className="flex-1 flex items-center justify-center pt-28 pb-12 px-6">
          <div className="w-full max-w-2xl">
            <div className="mb-10 flex flex-col gap-2 text-center">
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Hyperparameter Configuration</h1>
              <p className="text-on-surface-variant">
                Model: <span className="text-primary font-semibold">{name}</span> — {type === "medical" ? "Medical" : "Real Time"}
              </p>
            </div>

            {isTraining && (
              <div className="mb-8 glass-panel p-4 rounded-full flex items-center justify-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? "bg-secondary" : "bg-tertiary"} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? "bg-secondary" : "bg-tertiary"}`} />
                </span>
                <span className="text-sm font-semibold">{status}</span>
              </div>
            )}

            <div className="bg-surface-container-low p-8 rounded-3xl ghost-border">
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
                    disabled={isTraining}
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
                    disabled={isTraining}
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
                    disabled={isTraining}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 pt-6 border-t border-outline-variant/10">
                <button
                  onClick={handleStart}
                  disabled={isTraining && !isPaused}
                  className="w-full max-w-xs py-4 liquid-glass-primary-solid text-on-primary font-bold text-sm uppercase tracking-widest rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isTraining ? (
                    <>Training...<span className="material-symbols-outlined text-sm animate-spin">progress_activity</span></>
                  ) : (
                    <>Start Training<span className="material-symbols-outlined text-sm">rocket_launch</span></>
                  )}
                </button>
                {isTraining && (
                  <button
                    onClick={handlePause}
                    className="px-8 py-2 liquid-glass text-primary font-semibold text-sm rounded-full"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                )}
                <button
                  onClick={() => navigate("/setup")}
                  className="text-on-surface-variant text-sm hover:text-primary transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  )
}
