import { useState, useRef, useEffect } from "react"

interface GlassDropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  disabled?: boolean
}

export default function GlassDropdown({ value, options, onChange, disabled }: GlassDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open) }}
        className={`w-full text-left bg-surface-container-lowest/50 backdrop-blur-md text-on-surface text-sm py-3.5 px-5 rounded-full outline-none ghost-border transition-all flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-surface-container-lowest/70"
        } ${open ? "ring-1 ring-tertiary" : ""}`}
      >
        <span>{value}</span>
        <span className={`material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden glass-panel border border-outline-variant/15 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
          <div className="max-h-56 overflow-y-auto no-scrollbar py-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                  opt === value
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
