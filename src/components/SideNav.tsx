import { Link, useLocation } from "react-router-dom"

const steps = [
  { label: "Upload", icon: "upload_file", href: "/add-image-folder" },
  { label: "Configure", icon: "settings_input_component", href: "/training-config" },
  { label: "Train", icon: "model_training", href: "/dashboard" },
]

export default function SideNav({ phase }: { phase?: string }) {
  const location = useLocation()

  return (
    <aside className="h-full w-64 fixed left-0 top-16 bg-slate-900 flex flex-col py-6 font-body text-sm border-r border-outline-variant/10 z-40">
      <div className="px-6 mb-8">
        <h2 className="text-blue-400 font-bold text-sm">Training Wizard</h2>
        <p className="text-slate-500 text-xs mt-1">{phase || "Configuration"}</p>
      </div>
      <nav className="flex flex-col space-y-1">
        {steps.map((step) => {
          const active = location.pathname.startsWith(step.href)
          return (
            <Link
              key={step.href}
              to={step.href}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-300 text-sm ${
                active
                  ? "bg-blue-500/10 text-blue-400 border-r-4 border-blue-500"
                  : "text-slate-500 hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{step.icon}</span>
              {step.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
