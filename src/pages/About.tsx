import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const team = [
  { name: "Binod Subedi", role: "Team Lead", icon: "shield_person" },
  { name: "Akriti Upreti", role: "Full Stack Engineer", icon: "code" },
  { name: "Biraj Chhetri", role: "Full Stack Engineer", icon: "code" },
  { name: "Birendra Bohara", role: "DevOps Engineer", icon: "cloud" },
  { name: "Utsav Paudel", role: "ML Engineer", icon: "psychology" },
]

const milestones = [
  { label: "Idea & Research", icon: "lightbulb" },
  { label: "Architecture Design", icon: "architecture" },
  { label: "Core Development", icon: "code" },
  { label: "AI Pipeline", icon: "model_training" },
  { label: "Cloud Integration", icon: "cloud" },
  { label: "Launch", icon: "rocket_launch" },
]

export default function About() {
  return (
    <div className="bg-surface-dim text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-6">

          {/* Hero */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="material-symbols-outlined text-sm">groups</span>
              About Us
            </div>
            <h1 className="text-5xl font-extrabold font-headline tracking-tight mb-4">
              Built by <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Team Pentagon</span>
            </h1>
            <p className="text-on-surface-variant text-sm max-w-2xl mx-auto leading-relaxed">
              We're a team of five engineers passionate about making AI-powered image segmentation accessible to everyone.
              FusionAI is our answer to the complexity of training and labeling workflows — a single, unified platform
              that takes you from raw images to production-ready models.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-surface-container-low rounded-3xl p-10 ghost-border mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "target", title: "Our Mission", text: "Democratize semantic segmentation by providing an intuitive platform that combines labeling and training into one seamless experience." },
                { icon: "visibility", title: "Our Vision", text: "A world where any team — from medical researchers to autonomous vehicle engineers — can build segmentation models without infrastructure headaches." },
                { icon: "engineering", title: "Our Approach", text: "Teacher-Student knowledge distillation, cloud-native architecture, and a design-first philosophy that puts the user experience above everything." },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-center mb-10">
              The Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map((member, i) => (
                <div
                  key={member.name}
                  className={`bg-surface-container-low rounded-3xl p-6 ghost-border hover:translate-y-[-4px] transition-all duration-300 flex items-center gap-4 ${
                    i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{member.icon}</span>
                  </div>
                  <div>
                    <div className="font-headline font-bold text-sm">{member.name}</div>
                    <div className="text-primary text-xs font-semibold">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-surface-container-low rounded-3xl p-10 ghost-border mb-16">
            <h2 className="text-2xl font-extrabold font-headline tracking-tight text-center mb-8">Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "React + TypeScript", sub: "Frontend", icon: "web" },
                { label: "FastAPI + Python", sub: "Backend", icon: "api" },
                { label: "PostgreSQL", sub: "Database", icon: "database" },
                { label: "AWS (S3, Cognito, Lambda)", sub: "Cloud", icon: "cloud" },
                { label: "Tailwind CSS", sub: "Styling", icon: "palette" },
                { label: "PyTorch", sub: "ML Framework", icon: "psychology" },
                { label: "Docker", sub: "Containerization", icon: "deployed_code" },
                { label: "Recharts", sub: "Visualization", icon: "monitoring" },
              ].map((tech) => (
                <div key={tech.label} className="liquid-glass rounded-2xl p-4 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl mb-2 block">{tech.icon}</span>
                  <div className="text-xs font-bold text-on-surface">{tech.label}</div>
                  <div className="text-[10px] text-on-surface-variant">{tech.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey */}
          <div className="mb-16">
            <h2 className="text-2xl font-extrabold font-headline tracking-tight text-center mb-10">Our Journey</h2>
            <div className="flex items-center justify-between gap-2 px-10">
              {milestones.map((m, i) => (
                <div key={m.label} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-primary text-sm">{m.icon}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">{m.label}</span>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/30 to-primary/10 mb-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-on-surface-variant text-sm mb-6">Ready to experience FusionAI?</p>
            <a
              href="/register"
              className="liquid-glass-primary-solid text-on-primary px-10 py-4 font-bold text-sm uppercase tracking-widest rounded-full inline-block hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
