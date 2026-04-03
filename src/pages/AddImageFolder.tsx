import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { imageStore } from "./ImageStore"
import Navbar from "../components/Navbar"
import SideNav from "../components/SideNav"
import Footer from "../components/Footer"

export default function AddImageFolder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode") || "train"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [imageCount, setImageCount] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) navigate("/login")
  }, [navigate])

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

  function handleNext() {
    if (!folderName) return
    if (mode === "label") {
      navigate("/label-tool")
    } else {
      navigate("/add-new-model")
    }
  }

  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <SideNav phase="Phase 1: Preparation" />
        <main className="pl-64 pt-0 flex-1">
          <div className="max-w-6xl mx-auto p-12">
            <header className="mb-12">
              <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Data Upload</h1>
              <p className="text-on-surface-variant max-w-xl">
                Populate your training environment with high-fidelity datasets. Supported formats: JPG, PNG, DICOM, and NIfTI.
              </p>
            </header>

            <div className="grid grid-cols-12 gap-8">
              {/* Left: Drag & Drop Zone */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low rounded-xl p-16 transition-all hover:border-primary/50 cursor-pointer"
                  >
                    <div className="w-20 h-20 mb-6 rounded-full bg-surface-variant flex items-center justify-center text-primary-fixed border border-primary/20">
                      <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {folderName ? `Selected: ${folderName}` : "Drop your dataset here"}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-8">
                      {folderName
                        ? `${imageCount} ${imageCount === 1 ? "image" : "images"} found`
                        : <>or <span className="text-primary cursor-pointer hover:underline">browse files</span> from your local system</>
                      }
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 liquid-glass px-4 py-2 rounded-full text-xs text-on-surface font-medium">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Auto-tagging enabled
                      </div>
                      <div className="flex items-center gap-2 liquid-glass px-4 py-2 rounded-full text-xs text-on-surface font-medium">
                        <span className="material-symbols-outlined text-sm">verified</span> Quality Check On
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFolderSelect}
                  {...({ webkitdirectory: "true", directory: "true" } as object)}
                  multiple
                />
              </div>

              {/* Right: Info & Actions */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                  <h4 className="font-bold text-sm mb-4">Dataset Requirements</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-lg">info</span>
                      Minimum 1000 images per category for stable convergence.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-lg">aspect_ratio</span>
                      Recommended resolution: 512x512 or 1024x1024 pixels.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-lg">description</span>
                      JSON annotation files must follow the COCO format.
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!folderName}
                  className="liquid-glass-primary-solid w-full py-4 text-on-primary font-bold rounded-full flex items-center justify-center gap-2 group text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next: Configure Parameters
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>

                <button
                  onClick={() => navigate("/train-or-label")}
                  className="text-primary font-semibold text-sm hover:underline px-4 py-2 rounded-full hover:bg-primary/10 transition-colors text-center"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
