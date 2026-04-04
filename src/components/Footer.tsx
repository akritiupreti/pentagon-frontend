export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-slate-800/30 bg-slate-950 flex flex-col items-center gap-4 mt-12">
      <div className="flex gap-8 mb-4">
        {["Documentation", "Privacy", "Terms", "Support"].map((label) => (
          <a key={label} href="#" className="text-slate-600 hover:text-blue-400 font-body text-xs uppercase tracking-widest transition-all">
            {label}
          </a>
        ))}
      </div>
      <div className="text-slate-400 font-body text-xs uppercase tracking-widest">© 2026 Pentagon · FusionAI</div>
    </footer>
  )
}
