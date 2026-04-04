import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { imageStore } from "./ImageStore"
import { getSessions, deleteSession, getPresignedUrls, uploadFileToS3 } from "../lib/api"
import { Session } from "../lib/types"
import Navbar from "../components/Navbar"

const MEDICAL_CLASSES = ["Heart", "Liver"]
const REALTIME_CLASSES = ["Car", "Road"]

type Step = "mode" | "upload" | "confirm" | "type" | "name" | "classes"

const STEPS: Step[] = ["mode", "upload", "confirm", "type", "name", "classes"]
const STEP_LABELS: Record<Step, string> = {
  mode: "Workflow",
  upload: "Upload",
  confirm: "New Model",
  type: "Model Type",
  name: "Model Name",
  classes: "Classes",
}

export default function SetupWizard() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stepRefs = useRef<Record<Step, HTMLElement | null>>({
    mode: null, upload: null, confirm: null, type: null, name: null, classes: null,
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<Step>("mode")
  const [step, setStep] = useState<Step>("mode")
  const [mode, setMode] = useState<"train" | "label" | null>(null)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [imageCount, setImageCount] = useState(0)
  const [modelType, setModelType] = useState<"medical" | "realtime" | null>(null)
  const [modelName, setModelName] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [existingSessions, setExistingSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadToast, setUploadToast] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(step)
  const viewIndex = STEPS.indexOf(activeView)
  const isVisible = (s: Step) => STEPS.indexOf(s) <= stepIndex

  // Track which section is in view via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    STEPS.forEach((s) => {
      const el = stepRefs.current[s]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveView(s) },
        { threshold: 0.6 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [stepIndex])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) navigate("/login")
  }, [navigate])

  function goTo(next: Step) {
    setStep(next)
    setTimeout(() => {
      stepRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  function scrollToStep(s: Step) {
    stepRefs.current[s]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleModeSelect(m: "train" | "label") {
    setMode(m)
    goTo("upload")
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files && files.length > 0) {
      const path = (files[0] as any).webkitRelativePath || ""
      const folder = path.split("/")[0]
      imageStore.setFiles(files)
      setFolderName(folder)
      setImageCount(imageStore.count())
      localStorage.setItem("imageCount", imageStore.count().toString())
    }
  }

  function handleUploadNext() {
    if (!folderName) return
    if (mode === "label") { navigate("/label-tool"); return }
    setLoadingSessions(true)
    getSessions()
      .then((data) => setExistingSessions(Array.isArray(data) ? data : []))
      .catch(() => setExistingSessions([]))
      .finally(() => setLoadingSessions(false))
    goTo("confirm")
  }

  function handleModelTypeSelect(t: "medical" | "realtime") {
    setModelType(t)
    setSelected([])
    goTo("name")
  }

  async function uploadToS3(sessionId: string) {
    const files = imageStore.getFiles()
    if (files.length === 0) throw new Error("No files to upload")
    const fileInfo = files.map((f) => ({ name: f.name, type: f.type }))
    const res = await getPresignedUrls(sessionId, fileInfo)
    if (!res.urls || res.urls.length === 0) throw new Error("Failed to get upload URLs")
    const results = await Promise.allSettled(
      res.urls.map((u: { url: string; filename: string }) => {
        const file = files.find((f) => f.name === u.filename)
        return file ? uploadFileToS3(u.url, file) : Promise.reject(new Error(`File not found: ${u.filename}`))
      })
    )
    const failed = results.filter((r) => r.status === "rejected")
    if (failed.length > 0) throw new Error(`${failed.length} of ${results.length} files failed to upload`)
  }

  async function handleSelectExisting(session: Session) {
    setUploading(true)
    try {
      await uploadToS3(session.id)
      setUploadToast({ text: "Dataset uploaded successfully!", type: "success" })
    } catch {
      setUploadToast({ text: "Dataset upload failed. Continuing anyway.", type: "error" })
    }
    setUploading(false)
    setTimeout(() => {
      setUploadToast(null)
      const params = new URLSearchParams({ type: session.task, name: session.name })
      if (session.classes) params.set("classes", session.classes)
      navigate(`/training-config?${params.toString()}`)
    }, 1500)
  }

  async function handleDeleteSession(id: string) {
    try {
      await deleteSession(id)
      setExistingSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {}
    setDeleteConfirm(null)
  }

  function handleNameNext() {
    if (!modelName.trim()) return
    goTo("classes")
  }

  async function handleFinish() {
    if (selected.length === 0) return
    setUploading(true)
    try {
      await uploadToS3(modelName.replace(/\s+/g, "-").toLowerCase())
      setUploadToast({ text: "Dataset uploaded successfully!", type: "success" })
    } catch {
      setUploadToast({ text: "Dataset upload failed. Continuing anyway.", type: "error" })
    }
    setUploading(false)
    setTimeout(() => {
      setUploadToast(null)
      navigate(`/training-config?type=${modelType}&name=${encodeURIComponent(modelName)}&classes=${encodeURIComponent(selected.join(","))}`)
    }, 1500)
  }

  const allClasses = modelType === "medical" ? MEDICAL_CLASSES : REALTIME_CLASSES
  const filtered = allClasses.filter((c) => c.toLowerCase().includes(search.toLowerCase()))

  function toggleClass(cls: string) {
    setSelected((prev) => prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls])
  }

  const stepContent: Record<Step, React.ReactNode> = {
    mode: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-2">What would you like to do?</h2>
        <p className="text-on-surface-variant text-sm mb-8">Choose your workflow to get started</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleModeSelect("train")} className={`p-8 rounded-2xl text-left transition-all duration-300 ${mode === "train" ? "liquid-glass-primary border-primary/30" : "liquid-glass"}`}>
            <span className="material-symbols-outlined text-3xl text-primary mb-4 block">model_training</span>
            <div className="font-headline font-bold text-xl mb-1">Train</div>
            <p className="text-on-surface-variant text-xs">Train a segmentation model with your dataset</p>
          </button>
          <button onClick={() => handleModeSelect("label")} className={`p-8 rounded-2xl text-left transition-all duration-300 ${mode === "label" ? "liquid-glass-primary border-primary/30" : "liquid-glass"}`}>
            <span className="material-symbols-outlined text-3xl text-secondary mb-4 block">label</span>
            <div className="font-headline font-bold text-xl mb-1">Label</div>
            <p className="text-on-surface-variant text-xs">Annotate images for training data</p>
          </button>
        </div>
      </div>
    ),
    upload: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-2">Upload Dataset</h2>
        <p className="text-on-surface-variant text-sm mb-8">Select a folder containing your images</p>
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
          <div onClick={() => fileInputRef.current?.click()} className="relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 bg-surface-container rounded-2xl p-12 transition-all hover:border-primary/50 cursor-pointer">
            <div className="w-16 h-16 mb-4 rounded-full bg-surface-variant flex items-center justify-center text-primary-fixed border border-primary/20">
              <span className="material-symbols-outlined text-3xl">cloud_upload</span>
            </div>
            <h3 className="text-lg font-bold mb-1">{folderName || "Drop your dataset here"}</h3>
            <p className="text-on-surface-variant text-sm">
              {folderName ? `${imageCount} ${imageCount === 1 ? "image" : "images"} found` : <>or <span className="text-primary">browse files</span> from your system</>}
            </p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFolderSelect} {...({ webkitdirectory: "true", directory: "true" } as object)} multiple />
        <button onClick={handleUploadNext} disabled={!folderName} className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest liquid-glass-primary-solid text-on-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          Continue <span className="material-symbols-outlined text-sm">arrow_downward</span>
        </button>
      </div>
    ),
    confirm: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-2">Select Model</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          {loadingSessions ? "Loading your models..." : existingSessions.length > 0 ? "Pick an existing model or create a new one" : "It looks like you haven't created any models yet. Let's set one up."}
        </p>

        {loadingSessions ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : existingSessions.length > 0 ? (
          <div className="space-y-3">
            {existingSessions.map((session) => (
              <div key={session.id} className="relative">
                <button
                  onClick={() => handleSelectExisting(session)}
                  className="w-full p-5 rounded-2xl text-left liquid-glass hover:bg-white/10 transition-all flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">model_training</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-headline font-bold text-sm truncate">{session.name}</div>
                    <div className="text-on-surface-variant text-xs">{session.architecture} · {session.task === "medical" ? "Medical" : "Real Time"}</div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(session.id) }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
            <button
              onClick={() => goTo("type")}
              className="w-full p-5 rounded-2xl text-left border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full liquid-glass-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">add</span>
              </div>
              <div className="font-headline font-bold text-sm">Add New Model</div>
            </button>
          </div>
        ) : (
          <button
            onClick={() => goTo("type")}
            className="w-full p-6 rounded-2xl text-left border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full liquid-glass-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">add</span>
            </div>
            <div>
              <div className="font-headline font-bold text-base">Add New Model</div>
              <div className="text-on-surface-variant text-xs">Set up your first model to start training</div>
            </div>
          </button>
        )}
      </div>
    ),
    type: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-2">Model Type</h2>
        <p className="text-on-surface-variant text-sm mb-8">Select the segmentation domain</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleModelTypeSelect("medical")} className={`p-8 rounded-2xl text-left transition-all duration-300 ${modelType === "medical" ? "liquid-glass-primary border-primary/30" : "liquid-glass"}`}>
            <span className="material-symbols-outlined text-3xl text-tertiary mb-4 block">cardiology</span>
            <div className="font-headline font-bold text-xl mb-1">Medical</div>
            <p className="text-on-surface-variant text-xs">Medical image segmentation (organs, tissues)</p>
          </button>
          <button onClick={() => handleModelTypeSelect("realtime")} className={`p-8 rounded-2xl text-left transition-all duration-300 ${modelType === "realtime" ? "liquid-glass-primary border-primary/30" : "liquid-glass"}`}>
            <span className="material-symbols-outlined text-3xl text-secondary mb-4 block">videocam</span>
            <div className="font-headline font-bold text-xl mb-1">Real Time</div>
            <p className="text-on-surface-variant text-xs">Real-time object segmentation (vehicles, objects)</p>
          </button>
        </div>
      </div>
    ),
    name: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-2">Model Name</h2>
        <p className="text-on-surface-variant text-sm mb-8">Give your model a unique identifier</p>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">badge</span>
            <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleNameNext() }} placeholder="e.g. Kidney-Segmentor-v1" className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-4 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border text-lg" />
          </div>
          <button onClick={handleNameNext} disabled={!modelName.trim()} className="w-14 h-14 rounded-full liquid-glass-primary-solid text-on-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shrink-0">
            <span className="material-symbols-outlined">arrow_downward</span>
          </button>
        </div>
      </div>
    ),
    classes: (
      <div className="bg-surface-container-low rounded-3xl p-10 ghost-border">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight mb-1">Class Selection</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          {modelType === "medical" ? "Medical Image Segmentation" : "Real Time Segmentation"} — {selected.length} selected
        </p>
        <div className="relative mb-6">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..." className="w-full bg-surface-container-lowest/50 backdrop-blur-md border-none focus:ring-1 focus:ring-tertiary py-3 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/50 transition-all outline-none ghost-border" />
        </div>
        <div className="bg-surface-container rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto no-scrollbar mb-6">
          {filtered.map((cls) => (
            <div key={cls} onClick={() => toggleClass(cls)} className="flex items-center justify-between px-6 py-3.5 cursor-pointer hover:bg-surface-container-high transition-colors">
              <span className="text-sm font-medium text-on-surface">{cls}</span>
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selected.includes(cls) ? "bg-primary text-on-primary" : "border border-outline-variant/40"}`}>
                {selected.includes(cls) && <span className="material-symbols-outlined text-sm">check</span>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleFinish} disabled={selected.length === 0} className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest liquid-glass-primary-solid text-on-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          Hyperparameter Configuration <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    ),
  }

  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex pt-16">
        {/* Fixed Timeline — centered between left screen edge and content left edge */}
        <div className="hidden md:flex fixed top-16 bottom-0 flex-col items-center justify-center z-30" style={{ left: 0, width: 'calc((100% - 48rem) / 2)' }}>
          {/* Vertical line behind everything */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[10%] bottom-[10%] w-[2px] bg-outline-variant/10" />
          <div className="relative flex flex-col items-center gap-0">
            {STEPS.map((s, i) => {
              const done = i < viewIndex
              const active = i === viewIndex
              return (
                <div key={s} className="flex flex-col items-center">
                  {/* Label */}
                  <button
                    onClick={() => { if (i <= stepIndex) scrollToStep(s) }}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-500 whitespace-nowrap ${
                      i <= stepIndex ? "cursor-pointer" : "cursor-default"
                    } ${
                      done ? "text-primary" : active ? "text-on-surface" : "text-on-surface-variant/30"
                    }`}
                  >
                    {active && <span className="absolute inset-0 rounded-full rainbow-border" />}
                    <span className="relative z-10">{STEP_LABELS[s]}</span>
                  </button>
                  {/* Dot */}
                  <div className={`mt-2 w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    done ? "bg-primary shadow-[0_0_8px_rgba(137,172,255,0.5)]" :
                    active ? "bg-primary shadow-[0_0_12px_rgba(137,172,255,0.6)] scale-150" :
                    "bg-surface-container-high"
                  }`} />
                  {/* Segment line */}
                  {i < STEPS.length - 1 && (
                    <div className={`w-[2px] h-6 transition-all duration-500 ${
                      done ? "bg-primary/40" : "bg-outline-variant/15"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Scrollable Content — snap scrolling, centered */}
        <main ref={scrollRef} className="flex-1">
          <div className="max-w-3xl mx-auto px-6">
            {STEPS.map((s, i) => {
              const visible = isVisible(s)
              const isLast = i === stepIndex
              return visible ? (
                <section
                  key={s}
                  ref={(el) => { stepRefs.current[s] = el }}
                  className="h-[calc(100vh-4rem)] flex items-center justify-center px-4"
                >
                  <div className="w-full">{stepContent[s]}</div>
                </section>
              ) : null
            })}
          </div>
        </main>
      </div>

      {/* Uploading Overlay */}
      {(uploading || uploadToast) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          {uploading && (
            <>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-on-surface font-headline font-bold text-lg">Uploading dataset to S3...</p>
              <p className="text-on-surface-variant text-sm mt-1">This may take a moment</p>
            </>
          )}
          {!uploading && uploadToast && (
            <div className={`backdrop-blur-xl rounded-2xl px-8 py-6 text-center flex flex-col items-center gap-3 ${
              uploadToast.type === "success"
                ? "bg-tertiary/15 border border-tertiary/25 text-tertiary shadow-[0_8px_32px_rgba(0,212,236,0.15)]"
                : "bg-error/15 border border-error/25 text-error shadow-[0_8px_32px_rgba(255,113,108,0.15)]"
            }`}>
              <span className="material-symbols-outlined text-3xl">
                {uploadToast.type === "success" ? "check_circle" : "error"}
              </span>
              <p className="font-semibold text-sm">{uploadToast.text}</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low rounded-3xl p-8 ghost-border max-w-sm w-full mx-4 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="font-headline font-bold text-lg">Delete Model</h3>
            </div>
            <p className="text-on-surface-variant text-sm mb-8">
              Are you sure you want to delete this model? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 rounded-full liquid-glass text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(deleteConfirm)}
                className="px-6 py-2 rounded-full liquid-glass-error text-on-surface text-sm font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
