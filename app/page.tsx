"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

const FONT = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif"

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("tf-theme")
    setDark(saved === "dark")
    setMounted(true)
  }, [])

  function toggle() {
    setDark(d => {
      const next = !d
      localStorage.setItem("tf-theme", next ? "dark" : "light")
      return next
    })
  }

  return { dark, toggle, mounted }
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function theme(dark: boolean) {
  return {
    bg:         dark ? "#0a0a0b"         : "#f2f2f7",
    surface:    dark ? "#1c1c1e"         : "#ffffff",
    surfaceHov: dark ? "#2c2c2e"         : "#ffffff",
    border:     dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    text:       dark ? "#f5f5f7"         : "#1c1c1e",
    textSub:    dark ? "#8e8e93"         : "#8e8e93",
    textMuted:  dark ? "#48484a"         : "#c7c7cc",
    navBg:      dark ? "rgba(10,10,11,0.85)"  : "rgba(242,242,247,0.85)",
    cardShadow: dark ? "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)"
                     : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
    pillBg:     dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
    badgeBg:    dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
    ctaBtnBg:   dark ? "#f5f5f7"         : "#1c1c1e",
    ctaBtnText: dark ? "#1c1c1e"         : "#ffffff",
    dnBg:       dark ? "#2c2c2e"         : "#f2f2f7",
    dnText:     dark ? "#f5f5f7"         : "#1c1c1e",
    inputBorder:dark ? "rgba(255,255,255,0.1)" : "#e5e5ea",
    featureBadge: dark ? "#1a2a3a"       : "#e8f4ff",
  }
}

// ─── Toggle Button ────────────────────────────────────────────────────────────
function DarkToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return value
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ up = true }: { up?: boolean }) {
  const points = up
    ? "0,40 20,35 40,28 60,30 80,18 100,12 120,8"
    : "0,10 20,18 40,14 60,24 80,28 100,35 120,40"
  return (
    <svg viewBox="0 0 120 48" style={{ width: 80, height: 32 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${up}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#30d158" : "#ff453a"} stopOpacity="0.2" />
          <stop offset="100%" stopColor={up ? "#30d158" : "#ff453a"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${points} L120,48 L0,48 Z`} fill={`url(#g${up})`} />
      <polyline points={points} fill="none" stroke={up ? "#30d158" : "#ff453a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Trade Card ───────────────────────────────────────────────────────────────
function TradeCard({ symbol, pnl, setup, up, t }: {
  symbol: string; pnl: string; setup: string; up: boolean; t: ReturnType<typeof theme>
}) {
  return (
    <div style={{
      background: t.surface,
      backdropFilter: "blur(12px)",
      borderRadius: 16, padding: "14px 18px",
      boxShadow: t.cardShadow,
      display: "flex", alignItems: "center", gap: 14, minWidth: 220,
      border: `1px solid ${t.border}`,
      transition: "all 0.3s",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: up ? "#30d15818" : "#ff453a18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: up ? "#30d158" : "#ff453a", flexShrink: 0,
      }}>{up ? "▲" : "▼"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, letterSpacing: "-0.03em" }}>{symbol}</div>
        <div style={{ fontSize: 12, color: t.textSub, marginTop: 1 }}>{setup}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: up ? "#30d158" : "#ff453a" }}>{pnl}</div>
        <Sparkline up={up} />
      </div>
    </div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, t }: {
  icon: string; title: string; desc: string; color: string; t: ReturnType<typeof theme>
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? t.surfaceHov : t.surface,
        borderRadius: 20, padding: "28px 26px",
        boxShadow: hover
          ? `0 8px 32px rgba(0,0,0,${t === theme(true) ? "0.4" : "0.10"}), 0 0 0 1px ${t.border}`
          : t.cardShadow,
        border: `1px solid ${t.border}`,
        transition: "all 0.25s ease",
        transform: hover ? "translateY(-3px)" : "none",
        cursor: "default",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 16,
      }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: t.textSub, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, t }: { value: string; label: string; t: ReturnType<typeof theme> }) {
  return (
    <div style={{
      background: t.surface, borderRadius: 16, padding: "16px 24px", textAlign: "center",
      boxShadow: t.cardShadow, border: `1px solid ${t.border}`,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.05em" }}>{value}</div>
      <div style={{ fontSize: 12, color: t.textSub, marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { dark, toggle, mounted } = useDarkMode()
  const [pageReady, setPageReady] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [secHover, setSecHover] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  const trades = useCounter(2847, 1800, pageReady)
  const winRate = useCounter(68, 1400, pageReady)

  const t = theme(dark)

  // Avoid flash before localStorage is read
  if (!mounted) return null

  return (
    <main style={{
      minHeight: "100vh", background: t.bg,
      fontFamily: FONT, overflowX: "hidden",
      transition: "background 0.3s, color 0.3s",
    }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px", height: 64,
        background: t.navBg,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${t.border}`,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: dark ? "#f5f5f7" : "#1c1c1e",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📈</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: "-0.04em" }}>TradeFlow</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* dnproduction badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px 4px 7px",
            background: t.badgeBg, borderRadius: 20,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, fontWeight: 900, color: "#fff", flexShrink: 0,
            }}>dn</div>
            <span style={{ fontSize: 11, color: t.textSub, fontWeight: 500 }}>
              by <span style={{ color: t.text, fontWeight: 700 }}>dnproduction</span>
            </span>
          </div>

          {/* Dark mode toggle */}
          <DarkToggle dark={dark} toggle={toggle} />

          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 20px",
              background: dark ? "#f5f5f7" : "#1c1c1e",
              color: dark ? "#1c1c1e" : "#fff",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.2s",
            }}>Open App →</button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 40px 60px",
        position: "relative", textAlign: "center",
      }}>
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,132,255,0.10) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(48,209,88,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(191,90,242,0.07) 0%, transparent 70%)" }} />
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: t.pillBg, borderRadius: 20, padding: "6px 16px",
          border: `1px solid ${t.border}`,
          marginBottom: 32, zIndex: 1,
          opacity: pageReady ? 1 : 0,
          transform: pageReady ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30d158" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>AI-Powered Trading Intelligence</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(42px, 6vw, 72px)", fontWeight: 800, color: t.text,
          letterSpacing: "-0.05em", lineHeight: 1.05, maxWidth: 760,
          margin: "0 0 24px", zIndex: 1,
          opacity: pageReady ? 1 : 0,
          transform: pageReady ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.08s",
        }}>
          Trade smarter.<br />
          <span style={{ background: "linear-gradient(135deg, #0a84ff 0%, #bf5af2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Journal better.
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 18, color: t.textSub, maxWidth: 520,
          lineHeight: 1.65, margin: "0 0 40px", zIndex: 1,
          opacity: pageReady ? 1 : 0,
          transform: pageReady ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.16s",
        }}>
          Log every trade, track your edge, and get AI-powered analysis that actually helps you improve — all in one clean, fast journal.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          marginBottom: 64, zIndex: 1,
          opacity: pageReady ? 1 : 0,
          transform: pageReady ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.24s",
        }}>
          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                padding: "14px 32px",
                background: dark ? (btnHover ? "#e5e5e7" : "#f5f5f7") : (btnHover ? "#2c2c2e" : "#1c1c1e"),
                color: dark ? "#1c1c1e" : "#fff",
                border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
                boxShadow: btnHover ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 12px rgba(0,0,0,0.15)",
                transform: btnHover ? "translateY(-1px)" : "none",
                transition: "all 0.18s ease",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Open Trading Journal <span style={{ fontSize: 18 }}>→</span>
            </button>
          </Link>
          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button
              onMouseEnter={() => setSecHover(true)}
              onMouseLeave={() => setSecHover(false)}
              style={{
                padding: "14px 28px",
                background: secHover ? t.surface : "transparent",
                color: t.text,
                border: `1px solid ${t.border}`,
                borderRadius: 14, fontSize: 16, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT,
                boxShadow: secHover ? t.cardShadow : "none",
                transition: "all 0.18s ease",
              }}
            >
              ✦ See AI Analysis
            </button>
          </Link>
        </div>

        {/* Trade cards */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
          zIndex: 1, maxWidth: 780,
          opacity: pageReady ? 1 : 0,
          transform: pageReady ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.65s ease 0.32s",
        }}>
          <TradeCard symbol="AAPL" pnl="+$440" setup="Breakout"    up={true}  t={t} />
          <TradeCard symbol="TSLA" pnl="+$465" setup="Reversal"    up={true}  t={t} />
          <TradeCard symbol="NVDA" pnl="-$330" setup="Momentum"    up={false} t={t} />
          <TradeCard symbol="SPY"  pnl="+$165" setup="Trend Follow" up={true} t={t} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "0 40px 80px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 780, width: "100%" }}>
          <StatPill value={`${trades.toLocaleString()}+`} label="Trades logged" t={t} />
          <StatPill value={`${winRate}%`} label="Avg win rate" t={t} />
          <StatPill value="2.4×" label="Avg R:R ratio" t={t} />
          <StatPill value="✦ AI" label="Powered analysis" t={t} />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "0 40px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#0a84ff",
              background: t.featureBadge, padding: "4px 14px", borderRadius: 20, marginBottom: 16,
            }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: t.text, letterSpacing: "-0.04em", margin: 0 }}>
              Everything you need to level up
            </h2>
            <p style={{ color: t.textSub, fontSize: 16, marginTop: 12, lineHeight: 1.6 }}>
              Built for serious traders who want an edge.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <FeatureCard icon="📋" title="Trade Journal"     color="#0a84ff" desc="Log every trade with entry, exit, quantity, and notes. Your complete trading history in one place." t={t} />
            <FeatureCard icon="📊" title="Live Analytics"    color="#30d158" desc="Profit curve, win/loss ratio, P&L by asset. See exactly where your edge is — and where it isn't." t={t} />
            <FeatureCard icon="✦"  title="AI Coach"          color="#bf5af2" desc="Claude AI analyzes your trades and patterns, giving you actionable insights to improve your performance." t={t} />
            <FeatureCard icon="⚡" title="Instant Review"    color="#ff9f0a" desc="Get a per-trade AI breakdown in seconds. Understand what worked and what to avoid next time." t={t} />
            <FeatureCard icon="🔒" title="Supabase Backend"  color="#ff453a" desc="Your data is stored securely in your own Supabase database. Full control, zero lock-in." t={t} />
            <FeatureCard icon="🎨" title="Clean Design"      color="#0a84ff" desc="Minimal Apple-inspired interface that stays out of your way. Fast, focused, and distraction-free." t={t} />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "0 40px 80px" }}>
        <div style={{
          maxWidth: 860, margin: "0 auto",
          background: dark ? "#1c1c1e" : "#1c1c1e",
          borderRadius: 28, padding: "56px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
          border: dark ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}>
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: 400, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,132,255,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📈</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 14px" }}>
              Start journaling your trades today
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: "0 0 36px", lineHeight: 1.6 }}>
              Connect your Supabase project, add your first trade,<br />and let AI show you the patterns you've been missing.
            </p>
            <Link href="/trades" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 40px", background: "#fff", color: "#1c1c1e",
                border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: FONT,
                boxShadow: "0 4px 16px rgba(255,255,255,0.15)",
              }}>Open Trading Journal →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: "24px 40px 32px",
        borderTop: `1px solid ${t.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
        transition: "border-color 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: dark ? "#f5f5f7" : "#1c1c1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📈</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.03em" }}>TradeFlow</span>
          <span style={{ fontSize: 13, color: t.textMuted, marginLeft: 4 }}>— AI Trading Journal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>Designed & built by</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 4px 7px", background: t.dnBg, borderRadius: 20 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>dn</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.dnText }}>dnproduction</span>
          </div>
        </div>
      </footer>

    </main>
  )
}
