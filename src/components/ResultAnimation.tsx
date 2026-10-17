"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface ResultAnimationProps {
  correctRate: number
  totalWords: number
  correctCount: number
  wrongWords: { en: string; zh: string; phonetic: string }[]
  onConfirm: () => void
}

type Grade = "A" | "B" | "C" | "D"

function getGrade(rate: number): Grade {
  if (rate === 100) return "A"
  if (rate >= 90) return "B"
  if (rate >= 70) return "C"
  return "D"
}

// ─── A级: Canvas 烟花+撒花粒子 ───

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const colors = ["#fbbf24", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e", "#3b82f6", "#ec4899", "#f97316"]
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; shape: "rect" | "circle" }[] = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 4 + Math.random() * canvas.width / 2,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      })
    }

    let frame = 0
    let animId: number

    function draw() {
      frame++
      const w = canvas!.width / 2
      const h = canvas!.height / 2
      ctx!.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.rotation += p.rotSpeed

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = Math.max(0, 1 - frame / 300)

        if (p.shape === "rect") {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()

        if (p.y > h + 40) {
          p.y = -20
          p.x = w / 2 + (Math.random() - 0.5) * w * 0.8
          p.vy = 1 + Math.random() * 3
          p.color = colors[Math.floor(Math.random() * colors.length)]
        }
      }

      if (frame < 350) animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

// ─── 等级配置 ───

const gradeConfig = {
  A: { label: "完美", color: "#f59e0b", bg: "#fef3c7", border: "#fbbf24", message: "全部正确！太棒了！", character: "trophy" },
  B: { label: "优秀", color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd", message: "非常棒，继续加油！", character: "star" },
  C: { label: "良好", color: "#22c55e", bg: "#dcfce7", border: "#86efac", message: "不错，还有进步空间！", character: "wave" },
  D: { label: "加油", color: "#f97316", bg: "#fff7ed", border: "#fdba74", message: "别灰心，多练习就会进步！", character: "cheer" },
} as const

// ─── SVG 角色 ───

function Character({ type, visible }: { type: string; visible: boolean }) {
  const cls = `w-20 h-20 mx-auto transition-all duration-700 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`

  if (type === "trophy") {
    return (
      <svg className={cls} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" fill="#fef3c7" stroke="#fbbf24" strokeWidth="3" />
        <path d="M28 32h6v18h-6zM46 32h6v18h-6zM34 28h12v4H34zM34 50h12v4H34z" fill="#f59e0b" />
        <circle cx="40" cy="24" r="4" fill="#fbbf24" />
        <text x="40" y="29" textAnchor="middle" fill="#d97706" fontSize="6" fontWeight="bold">1</text>
      </svg>
    )
  }
  if (type === "star") {
    return (
      <svg className={cls} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" fill="#dbeafe" stroke="#93c5fd" strokeWidth="3" />
        <polygon points="40,14 48,34 68,34 52,46 58,66 40,54 22,66 28,46 12,34 32,34" fill="#3b82f6" />
        <circle cx="40" cy="37" r="6" fill="#dbeafe" />
        <text x="40" y="40" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">☆</text>
      </svg>
    )
  }
  if (type === "wave") {
    return (
      <svg className={cls} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" fill="#dcfce7" stroke="#86efac" strokeWidth="3" />
        <circle cx="40" cy="28" r="10" fill="#86efac" />
        <rect x="32" y="40" width="16" height="18" rx="6" fill="#22c55e" />
        <path d="M16 48l8-6m48 6l-8-6" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="35" cy="26" r="2" fill="#166534" />
        <circle cx="45" cy="26" r="2" fill="#166534" />
        <path d="M37 31 Q40 35 43 31" stroke="#166534" strokeWidth="1.5" fill="none" />
      </svg>
    )
  }
  // cheer
  return (
    <svg className={cls} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" fill="#fff7ed" stroke="#fdba74" strokeWidth="3" />
      <circle cx="40" cy="28" r="10" fill="#fdba74" />
      <rect x="32" y="40" width="16" height="18" rx="6" fill="#f97316" />
      <circle cx="35" cy="26" r="2" fill="#9a3412" />
      <circle cx="45" cy="26" r="2" fill="#9a3412" />
      <path d="M36 32 Q40 29 44 32" stroke="#9a3412" strokeWidth="1.5" fill="none" />
      <rect x="20" y="48" width="10" height="4" rx="2" fill="#fdba74" />
      <rect x="50" y="48" width="10" height="4" rx="2" fill="#fdba74" />
    </svg>
  )
}

// ─── 主组件 ───

export function ResultAnimation({ correctRate, totalWords, correctCount, onConfirm }: ResultAnimationProps) {
  const grade = getGrade(correctRate)
  const cfg = gradeConfig[grade]
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80)
    const t2 = setTimeout(() => setPhase(2), 450)
    const t3 = setTimeout(() => setPhase(3), 800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const barColor =
    grade === "A" ? "#f59e0b" : grade === "B" ? "#3b82f6" : grade === "C" ? "#22c55e" : "#f97316"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* A级烟花 */}
      {grade === "A" && <ConfettiCanvas />}

      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 overflow-hidden"
        style={{
          transform: phase >= 1 ? "scale(1)" : "scale(0.85)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
        }}
      >
        {/* 顶部色条 */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: cfg.border }}
        />

        <div className="text-center mb-6 relative">
          {/* 角色 */}
          <Character type={cfg.character} visible={phase >= 2} />

          {/* 等级字母 */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mt-3"
            style={{
              backgroundColor: cfg.bg,
              transform: phase >= 2 ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)",
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
            }}
          >
            <span className="text-4xl font-extrabold" style={{ color: cfg.color }}>{grade}</span>
          </div>

          <h2 className="text-2xl font-bold mt-3" style={{ color: cfg.color, opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.3s 0.3s" }}>
            {cfg.label}
          </h2>
          <p className="text-gray-500 text-sm mt-1" style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.3s 0.35s" }}>
            {cfg.message}
          </p>
        </div>

        {/* 统计 */}
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: cfg.bg }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">正确率</span>
            <span className="text-xl font-bold" style={{ color: cfg.color }}>{correctRate}%</span>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            正确 {correctCount} / 共 {totalWords} 题
          </div>
          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: phase >= 2 ? `${correctRate}%` : "0%",
                transition: "width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) 0.4s",
                backgroundColor: barColor,
              }}
            />
          </div>

          {/* B/C/D 装饰元素 */}
          {grade === "A" && phase >= 3 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {["★","★","★"].map((s, i) => (
                <span key={i} className="text-xl inline-block"
                  style={{
                    color: "#f59e0b",
                    animation: `bounce 0.6s ${i * 0.15}s both`,
                  }}
                >{s}</span>
              ))}
            </div>
          )}
          {grade === "B" && phase >= 3 && (
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="inline-block text-base"
                  style={{
                    animation: `twinkle 1.5s ${i * 0.2}s infinite`,
                    color: i % 2 === 0 ? "#3b82f6" : "#93c5fd",
                  }}
                >☆</span>
              ))}
            </div>
          )}
          {grade === "D" && phase >= 3 && (
            <p className="text-center text-xs mt-3 font-medium" style={{ color: cfg.color }}>
              再练一次，你能行！
            </p>
          )}
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-3 text-white font-medium rounded-lg transition active:scale-[0.98]"
          style={{
            backgroundColor: cfg.color,
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.3s 0.5s",
          }}
        >
          确认
        </button>
      </div>

      {/* 注入 keyframes */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

export { getGrade, type Grade }
