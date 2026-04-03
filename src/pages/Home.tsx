import { Link } from "react-router-dom"
import NeuronBackground from "../components/NeuronBackground"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-dim relative overflow-hidden">
      <NeuronBackground />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-secondary/5 rounded-full blur-[80px]" />

      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="material-symbols-outlined bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ fontSize: '4.5rem' }}>neurology</span>
          <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-headline">
            FusionAI
          </span>
        </div>
        <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-4">
          Architecting <span className="text-primary-fixed">Intelligence.</span>
        </h1>
        <p className="text-on-surface-variant mt-2 mb-10 text-sm max-w-md mx-auto">
          AI-Powered Image Semantic Segmentation Training Platform
        </p>
        <Link
          to="/login"
          className="liquid-glass-primary-solid text-on-primary px-10 py-4 font-bold text-sm uppercase tracking-widest rounded-full inline-block hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}
