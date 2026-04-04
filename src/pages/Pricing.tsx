import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const plans = [
  {
    name: "Label",
    price: 19,
    permission: "LABEL",
    icon: "label",
    color: "secondary",
    description: "For annotation teams who need powerful labeling tools",
    features: [
      "Semantic segmentation annotator",
      "Multi-class labeling",
      "Brush & eraser tools",
      "Single & batch mask export",
      "ZIP export with timestamps",
      "Up to 5,000 images/month",
    ],
    cta: "Start Labeling",
  },
  {
    name: "Train",
    price: 39,
    permission: "TRAIN",
    icon: "model_training",
    color: "primary",
    description: "For ML engineers with pre-labeled datasets ready to train",
    features: [
      "Teacher-Student distillation",
      "Hyperparameter configuration",
      "Real-time training dashboard",
      "Loss & accuracy charts",
      "S3 dataset upload",
      "Model download (.pt)",
      "AI agent decisions console",
      "Up to 10 training sessions",
    ],
    cta: "Start Training",
    popular: true,
  },
  {
    name: "Pro",
    price: 59,
    permission: "TRAIN_LABEL",
    icon: "neurology",
    color: "tertiary",
    description: "The full pipeline — label your data, then train on it",
    features: [
      "Everything in Label",
      "Everything in Train",
      "Unlimited images",
      "Unlimited training sessions",
      "Priority GPU queue",
      "Human intervention review",
      "API key access",
      "Early access to new features",
    ],
    cta: "Go Pro",
  },
]

const colorMap: Record<string, { icon: string; border: string; bg: string; glow: string; cta: string }> = {
  secondary: {
    icon: "text-secondary",
    border: "border-secondary/20",
    bg: "bg-secondary/10",
    glow: "",
    cta: "liquid-glass text-secondary font-bold",
  },
  primary: {
    icon: "text-primary",
    border: "border-primary/30",
    bg: "bg-primary/10",
    glow: "shadow-[0_0_60px_rgba(137,172,255,0.08)]",
    cta: "liquid-glass text-primary font-bold",
  },
  tertiary: {
    icon: "text-tertiary",
    border: "border-tertiary/20",
    bg: "bg-tertiary/10",
    glow: "",
    cta: "liquid-glass text-tertiary font-bold",
  },
}

export default function Pricing() {
  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="material-symbols-outlined text-sm">diamond</span>
              Pricing
            </div>
            <h1 className="text-5xl font-extrabold font-headline tracking-tight mb-4">
              Choose your <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">plan</span>
            </h1>
            <p className="text-on-surface-variant text-sm max-w-lg mx-auto">
              From annotation to training — pick what fits your workflow. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const c = colorMap[plan.color]
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-8 ghost-border transition-all duration-300 hover:translate-y-[-4px] flex flex-col ${c.glow} ${
                    plan.popular ? "bg-surface-container-low border border-primary/20" : "bg-surface-container-low"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-6`}>
                    <span className={`material-symbols-outlined ${c.icon}`}>{plan.icon}</span>
                  </div>

                  {/* Name & Price */}
                  <h3 className="font-headline font-extrabold text-2xl mb-1">{plan.name}</h3>
                  <p className="text-on-surface-variant text-xs mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-headline font-extrabold">${plan.price}</span>
                    <span className="text-on-surface-variant text-sm">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${c.icon}`}>check_circle</span>
                        <span className="text-on-surface-variant">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to="/register"
                    className={`block w-full text-center py-3.5 rounded-full text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all ${c.cta}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Bottom note */}
          <p className="text-center text-on-surface-variant/50 text-xs mt-12">
            All plans include SSL encryption, Cognito authentication, and S3-backed storage. No credit card required to start.
          </p>
        </div>
        <Footer />
      </main>
    </div>
  )
}
