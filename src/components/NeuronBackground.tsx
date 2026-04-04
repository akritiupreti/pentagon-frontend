import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export default function NeuronBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const particles = useRef<Particle[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const COUNT = 80
    const CONNECT_DIST = 150
    const MOUSE_DIST = 200

    function resize() {
      canvas!.width = canvas!.offsetWidth * devicePixelRatio
      canvas!.height = canvas!.offsetHeight * devicePixelRatio
      ctx!.scale(devicePixelRatio, devicePixelRatio)
    }

    function init() {
      resize()
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      particles.current = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 1,
      }))
    }

    function draw() {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      ctx!.clearRect(0, 0, w, h)

      const pts = particles.current
      const mx = mouse.current.x
      const my = mouse.current.y

      for (const p of pts) {
        // Mouse repulsion
        const dmx = p.x - mx
        const dmy = p.y - my
        const dm = Math.sqrt(dmx * dmx + dmy * dmy)
        if (dm < MOUSE_DIST && dm > 0) {
          const force = (MOUSE_DIST - dm) / MOUSE_DIST * 0.8
          p.vx += (dmx / dm) * force
          p.vy += (dmy / dm) * force
        }

        // Damping
        p.vx *= 0.98
        p.vy *= 0.98

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.15
            ctx!.beginPath()
            ctx!.moveTo(pts[i].x, pts[i].y)
            ctx!.lineTo(pts[j].x, pts[j].y)
            ctx!.strokeStyle = `rgba(137, 172, 255, ${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      // Draw mouse connections
      for (const p of pts) {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < MOUSE_DIST) {
          const alpha = (1 - d / MOUSE_DIST) * 0.3
          ctx!.beginPath()
          ctx!.moveTo(p.x, p.y)
          ctx!.lineTo(mx, my)
          ctx!.strokeStyle = `rgba(129, 236, 255, ${alpha})`
          ctx!.lineWidth = 0.8
          ctx!.stroke()
        }
      }

      // Draw particles
      for (const p of pts) {
        const dm = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2)
        const glow = dm < MOUSE_DIST
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, glow ? p.r * 2 : p.r, 0, Math.PI * 2)
        ctx!.fillStyle = glow
          ? `rgba(129, 236, 255, ${0.6 + (1 - dm / MOUSE_DIST) * 0.4})`
          : "rgba(137, 172, 255, 0.4)"
        ctx!.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    function handleMouse(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function handleLeave() {
      mouse.current = { x: -1000, y: -1000 }
    }

    init()
    draw()

    window.addEventListener("resize", () => { resize(); init() })
    canvas.addEventListener("mousemove", handleMouse)
    canvas.addEventListener("mouseleave", handleLeave)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouse)
      canvas.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ""}`}
    />
  )
}
