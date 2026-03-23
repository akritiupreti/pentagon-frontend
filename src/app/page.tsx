import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10">
        <span className="text-xl font-black tracking-[0.3em] text-white">PENTAGON</span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-block mb-6 px-4 py-1.5 border border-white/20 text-white/50 text-xs tracking-widest uppercase">
          AI-Powered · Knowledge Distillation · Semantic Segmentation
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
          PENTAGON
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mb-4 leading-relaxed">
          Train high-quality image segmentation models through Teacher-Student
          knowledge distillation — supervised by an autonomous AI agent.
        </p>

        <p className="text-white/30 text-sm max-w-xl mb-12">
          Supports medical imaging and real-time object segmentation.
          Powered by DeepLabV3+ and U-Net with Attention architectures.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-colors"
          >
            Start Training
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border border-white/20 text-white/70 font-bold text-sm tracking-widest uppercase hover:border-white/50 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
        {[
          { label: "Teacher Models", value: "DeepLabV3+ · U-Net" },
          { label: "Architecture", value: "MoE + Custom Router" },
          { label: "Supervision", value: "Agentic AI Loop" },
          { label: "Distillation", value: "Teacher → Student" },
        ].map((item) => (
          <div key={item.label} className="px-8 py-6">
            <div className="text-white/30 text-xs tracking-widest uppercase mb-1">
              {item.label}
            </div>
            <div className="text-white font-semibold text-sm">{item.value}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="px-10 py-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-white/20 text-xs tracking-widest">PENTAGON © 2025</span>
        <span className="text-white/20 text-xs">Biraj · Akriti · Birendra · Utsav · Binod</span>
      </footer>
    </main>
  )
}