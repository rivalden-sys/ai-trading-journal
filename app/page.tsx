"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

const FONT = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Animated counter hook
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

// Tiny sparkline SVG
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

// Floating trade card
function TradeCard({ symbol, pnl, setup, up }: { symbol: string; pnl: string; setup: string; up: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      borderRadius: 16,
      padding: "14px 18px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
      display: "flex", alignItems: "center", gap: 14, minWidth: 220,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: up ? "#f0fdf4" : "#fff1f2",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: up ? "#30d158" : "#ff453a",
        flexShrink: 0,
      }}>{up ? "▲" : "▼"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.03em" }}>{symbol}</div>
        <div style={{ fontSize: 12, color: "#8e8e93", marginTop: 1 }}>{setup}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: up ? "#30d158" : "#ff453a", letterSpacing: "-0.02em" }}>{pnl}</div>
        <Sparkline up={up} />
      </div>
    </div>
  )
}

// Feature card
function FeatureCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#fff" : "rgba(255,255,255,0.7)",
        borderRadius: 20,
        padding: "28px 26px",
        boxShadow: hover
          ? "0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        transition: "all 0.25s ease",
        transform: hover ? "translateY(-3px)" : "none",
        cursor: "default",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 16,
      }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.03em", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

// Stat pill
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.9)",
      borderRadius: 16, padding: "16px 24px", textAlign: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.05em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8e8e93", marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [secHover, setSecHover] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const trades = useCounter(2847, 1800, mounted)
  const winRate = useCounter(68, 1400, mounted)

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f2f2f7",
      fontFamily: FONT,
      overflowX: "hidden",
    }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px", height: 64,
        background: "rgba(242,242,247,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: "#1c1c1e",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📈</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.04em" }}>TradeFlow</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* dnproduction badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px 4px 7px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 20, marginRight: 8,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.07)",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, fontWeight: 900, color: "#fff", flexShrink: 0,
            }}>dn</div>
            <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 500 }}>
              by <span style={{ color: "#1c1c1e", fontWeight: 700 }}>dnproduction</span>
            </span>
          </div>

          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 20px",
              background: "#1c1c1e", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
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
        position: "relative",
        textAlign: "center",
      }}>

        {/* Background blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "10%", left: "5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(48,209,88,0.08) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "40%", right: "20%",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(191,90,242,0.06) 0%, transparent 70%)",
          }} />
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 20, padding: "6px 16px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          marginBottom: 32, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30d158" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1c1e" }}>AI-Powered Trading Intelligence</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(42px, 6vw, 72px)",
          fontWeight: 800,
          color: "#1c1c1e",
          letterSpacing: "-0.05em",
          lineHeight: 1.05,
          maxWidth: 760,
          margin: "0 0 24px",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.08s",
        }}>
          Trade smarter.<br />
          <span style={{
            background: "linear-gradient(135deg, #0a84ff 0%, #bf5af2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Journal better.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 18, color: "#8e8e93", maxWidth: 520,
          lineHeight: 1.65, margin: "0 0 40px", zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.16s",
        }}>
          Log every trade, track your edge, and get AI-powered analysis that actually helps you improve — all in one clean, fast journal.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          marginBottom: 64, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s ease 0.24s",
        }}>
          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                padding: "14px 32px",
                background: btnHover ? "#2c2c2e" : "#1c1c1e",
                color: "#fff", border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: FONT,
                boxShadow: btnHover ? "0 8px 24px rgba(0,0,0,0.20)" : "0 4px 12px rgba(0,0,0,0.12)",
                transform: btnHover ? "translateY(-1px)" : "none",
                transition: "all 0.18s ease",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Open Trading Journal
              <span style={{ fontSize: 18 }}>→</span>
            </button>
          </Link>

          <Link href="/trades" style={{ textDecoration: "none" }}>
            <button
              onMouseEnter={() => setSecHover(true)}
              onMouseLeave={() => setSecHover(false)}
              style={{
                padding: "14px 28px",
                background: secHover ? "#fff" : "rgba(255,255,255,0.8)",
                color: "#1c1c1e", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14,
                fontSize: 16, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT,
                boxShadow: secHover ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              ✦ See AI Analysis
            </button>
          </Link>
        </div>

        {/* Floating trade cards */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
          zIndex: 1, maxWidth: 780,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.65s ease 0.32s",
        }}>
          <TradeCard symbol="AAPL" pnl="+$440" setup="Breakout" up={true} />
          <TradeCard symbol="TSLA" pnl="+$465" setup="Reversal" up={true} />
          <TradeCard symbol="NVDA" pnl="-$330" setup="Momentum" up={false} />
          <TradeCard symbol="SPY"  pnl="+$165" setup="Trend Follow" up={true} />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{
        padding: "0 40px 80px",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16, maxWidth: 780, width: "100%",
        }}>
          <StatPill value={`${trades.toLocaleString()}+`} label="Trades logged" />
          <StatPill value={`${winRate}%`} label="Avg win rate" />
          <StatPill value="2.4×" label="Avg R:R ratio" />
          <StatPill value="✦ AI" label="Powered analysis" />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "0 40px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#0a84ff",
              background: "#e8f4ff", padding: "4px 14px", borderRadius: 20, marginBottom: 16,
            }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.04em", margin: 0 }}>
              Everything you need to level up
            </h2>
            <p style={{ color: "#8e8e93", fontSize: 16, marginTop: 12, lineHeight: 1.6 }}>
              Built for serious traders who want an edge.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <FeatureCard icon="📋" title="Trade Journal" color="#0a84ff"
              desc="Log every trade with entry, exit, quantity, and notes. Your complete trading history in one place." />
            <FeatureCard icon="📊" title="Live Analytics" color="#30d158"
              desc="Profit curve, win/loss ratio, P&L by asset. See exactly where your edge is — and where it isn't." />
            <FeatureCard icon="✦" title="AI Coach" color="#bf5af2"
              desc="Claude AI analyzes your trades and patterns, giving you actionable insights to improve your performance." />
            <FeatureCard icon="⚡" title="Instant Review" color="#ff9f0a"
              desc="Get a per-trade AI breakdown in seconds. Understand what worked and what to avoid next time." />
            <FeatureCard icon="🔒" title="Supabase Backend" color="#ff453a"
              desc="Your data is stored securely in your own Supabase database. Full control, zero lock-in." />
            <FeatureCard icon="🎨" title="Clean Design" color="#0a84ff"
              desc="Minimal Apple-inspired interface that stays out of your way. Fast, focused, and distraction-free." />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "0 40px 80px" }}>
        <div style={{
          maxWidth: 860, margin: "0 auto",
          background: "#1c1c1e",
          borderRadius: 28, padding: "56px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {/* subtle glow */}
          <div style={{
            position: "absolute", top: "-60px", left: "50%",
            transform: "translateX(-50%)",
            width: 400, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(10,132,255,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📈</div>
            <h2 style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800, color: "#fff",
              letterSpacing: "-0.04em", margin: "0 0 14px",
            }}>Start journaling your trades today</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: "0 0 36px", lineHeight: 1.6 }}>
              Connect your Supabase project, add your first trade,<br />and let AI show you the patterns you've been missing.
            </p>
            <Link href="/trades" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 40px",
                background: "#fff", color: "#1c1c1e",
                border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: FONT,
                boxShadow: "0 4px 16px rgba(255,255,255,0.15)",
              }}>
                Open Trading Journal →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: "24px 40px 32px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, background: "#1c1c1e",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📈</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.03em" }}>TradeFlow</span>
          <span style={{ fontSize: 13, color: "#c7c7cc", marginLeft: 4 }}>— AI Trading Journal</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#c7c7cc" }}>Designed & built by</span>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px 4px 7px",
            background: "#f2f2f7", borderRadius: 20,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0,
            }}>dn</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1c1e" }}>dnproduction</span>
          </div>
        </div>
      </footer>

    </main>
  )
}
