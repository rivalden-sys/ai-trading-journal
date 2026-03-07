"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts"

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setDark(localStorage.getItem("tf-theme") === "dark")
    setReady(true)
  }, [])
  function toggle() {
    setDark(d => {
      const next = !d
      localStorage.setItem("tf-theme", next ? "dark" : "light")
      return next
    })
  }
  return { dark, toggle, ready }
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function theme(dark: boolean) {
  return {
    bg:        dark ? "#0a0a0b"   : "#f2f2f7",
    surface:   dark ? "#1c1c1e"   : "#ffffff",
    surface2:  dark ? "#2c2c2e"   : "#f2f2f7",
    border:    dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    borderInput: dark ? "rgba(255,255,255,0.12)" : "#e5e5ea",
    text:      dark ? "#f5f5f7"   : "#1c1c1e",
    textSub:   dark ? "#8e8e93"   : "#8e8e93",
    textMuted: dark ? "#48484a"   : "#c7c7cc",
    inputBg:   dark ? "#2c2c2e"   : "#fafafa",
    shadow:    dark ? "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
                    : "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
    chartGrid: dark ? "#2c2c2e"   : "#f2f2f7",
    tooltipBg: dark ? "#1c1c1e"   : "#ffffff",
  }
}

const FONT = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif"

// ─── Shared styles ────────────────────────────────────────────────────────────
function makeStyles(t: ReturnType<typeof theme>) {
  return {
    card: {
      background: t.surface, borderRadius: 18,
      padding: "22px 24px",
      boxShadow: t.shadow,
      border: `1px solid ${t.border}`,
    } as React.CSSProperties,
    input: {
      width: "100%", padding: "10px 14px",
      border: `1px solid ${t.borderInput}`, borderRadius: 10,
      fontSize: 14, outline: "none",
      background: t.inputBg, fontFamily: FONT,
      color: t.text, boxSizing: "border-box" as const,
    } as React.CSSProperties,
    label: {
      fontSize: 12, fontWeight: 600, color: t.textSub,
      letterSpacing: "0.04em", textTransform: "uppercase" as const,
      marginBottom: 6, display: "block",
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: 15, fontWeight: 600, color: t.text,
      letterSpacing: "-0.02em", margin: "0 0 20px",
    } as React.CSSProperties,
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, dark }: any) {
  const t = theme(dark)
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", fontFamily: FONT, boxShadow: t.shadow }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: payload[0].value >= 0 ? "#30d158" : "#ff453a" }}>
        {Number(payload[0].value).toFixed(2)} USDT
      </div>
      <div style={{ fontSize: 11, color: t.textSub }}>Trade #{payload[0].payload?.trade ?? ""}</div>
    </div>
  )
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({ icon, color, onClick, title }: { icon: string; color: string; onClick: () => void; title: string }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: 7, border: "none", cursor: "pointer",
        background: hover ? `${color}18` : "transparent",
        color: hover ? color : "#8e8e93",
        fontSize: 13, fontFamily: FONT, transition: "all 0.15s",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</button>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ trade, onSave, onClose, dark }: { trade: any; onSave: (id: string, f: any) => void; onClose: () => void; dark: boolean }) {
  const t = theme(dark)
  const s = makeStyles(t)
  const [sym, setSym] = useState(trade.symbol)
  const [entry, setEntry] = useState(String(trade.entry))
  const [exit, setExit] = useState(String(trade.exit ?? ""))
  const [qty, setQty] = useState(String(trade.qty))
  const preview = exit ? ((Number(exit) - Number(entry)) * Number(qty)).toFixed(2) : "—"
  const previewColor = Number(preview) >= 0 ? "#30d158" : "#ff453a"
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ ...s.card, width: 420, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: "-0.03em" }}>Edit Trade</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: t.textSub, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[["Symbol", sym, setSym, "text", "AAPL"], ["Qty", qty, setQty, "number", "100"], ["Entry", entry, setEntry, "number", "0.00"], ["Exit", exit, setExit, "number", "0.00"]].map(([lbl, val, set, type, ph]) => (
            <div key={lbl as string}>
              <label style={s.label}>{lbl as string}</label>
              <input type={type as string} placeholder={ph as string} value={val as string} onChange={e => (set as any)(e.target.value)} style={s.input} />
            </div>
          ))}
        </div>
        {exit && (
          <div style={{ background: t.surface2, borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: t.textSub }}>Projected P&L</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: previewColor }}>{preview} USDT</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${t.borderInput}`, background: "transparent", color: t.text, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(trade.id, { symbol: sym.toUpperCase(), entry: Number(entry), exit: Number(exit), qty: Number(qty), pnl: (Number(exit) - Number(entry)) * Number(qty) })} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#0a84ff", color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ trade, onConfirm, onClose, dark }: { trade: any; onConfirm: (id: string) => void; onClose: () => void; dark: boolean }) {
  const t = theme(dark)
  const s = makeStyles(t)
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ ...s.card, width: 380, padding: 28, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "#ff453a18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🗑</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", marginBottom: 8 }}>Delete Trade?</div>
        <div style={{ fontSize: 14, color: t.textSub, marginBottom: 6 }}>{trade.symbol} · Entry {trade.entry} · Exit {trade.exit}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: trade.pnl >= 0 ? "#30d158" : "#ff453a", marginBottom: 24 }}>
          {trade.pnl >= 0 ? "+" : ""}{Number(trade.pnl).toFixed(2)} USDT
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${t.borderInput}`, background: "transparent", color: t.text, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(trade.id)} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#ff453a", color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TradesPage() {
  const { dark, toggle, ready } = useDarkMode()
  const t = theme(dark)
  const s = makeStyles(t)

  const [symbol, setSymbol] = useState("")
  const [entry, setEntry] = useState("")
  const [exit, setExit] = useState("")
  const [qty, setQty] = useState("")
  const [message, setMessage] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [coachLoading, setCoachLoading] = useState(false)

  const [trades, setTrades] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [winLoss, setWinLoss] = useState<any[]>([])
  const [assetStats, setAssetStats] = useState<any[]>([])
  const [totalPnL, setTotalPnL] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [totalTrades, setTotalTrades] = useState(0)
  const [avgPnL, setAvgPnL] = useState(0)

  const [aiReview, setAiReview] = useState("")
  const [coach, setCoach] = useState("")

  const [editTrade, setEditTrade] = useState<any>(null)
  const [deleteTrade, setDeleteTrade] = useState<any>(null)

  async function loadTrades() {
    const { data } = await supabase.from("trades").select("*").order("created_at", { ascending: true })
    if (!data) return
    const clean = data.filter(t => t.symbol)
    setTrades(clean)
    let cum = 0
    setChartData(clean.map((t: any, i: number) => { cum += t.pnl || 0; return { trade: i + 1, pnl: Number(cum.toFixed(2)) } }))
    const wins = clean.filter((t: any) => t.pnl > 0).length
    const losses = clean.filter((t: any) => t.pnl <= 0).length
    setWinLoss([{ name: "Wins", value: wins }, { name: "Losses", value: losses }])
    const sum = clean.reduce((s: number, t: any) => s + (t.pnl || 0), 0)
    setTotalPnL(Number(sum.toFixed(2)))
    setTotalTrades(clean.length)
    setAvgPnL(clean.length ? Number((sum / clean.length).toFixed(2)) : 0)
    setWinRate(clean.length ? Math.round((wins / clean.length) * 100) : 0)
    const assets: any = {}
    clean.forEach((t: any) => { assets[t.symbol] = (assets[t.symbol] || 0) + (t.pnl || 0) })
    setAssetStats(Object.keys(assets).map(sym => ({ symbol: sym, pnl: Number(assets[sym].toFixed(2)) })))
  }

  async function addTrade() {
    if (!symbol || !entry || !exit || !qty) { setMessage("Please fill all fields"); return }
    const pnl = (Number(exit) - Number(entry)) * Number(qty)
    const { error } = await supabase.from("trades").insert([{ symbol: symbol.toUpperCase(), entry: Number(entry), exit: Number(exit), qty: Number(qty), pnl }])
    if (error) { setMessage("Error: " + error.message) } else {
      setMessage("Trade added ✅")
      setSymbol(""); setEntry(""); setExit(""); setQty("")
      loadTrades()
      setTimeout(() => setMessage(""), 3000)
    }
  }

  async function updateTrade(id: string, fields: any) {
    await supabase.from("trades").update(fields).eq("id", id)
    setEditTrade(null)
    loadTrades()
  }

  async function deleteTradeFn(id: string) {
    await supabase.from("trades").delete().eq("id", id)
    setDeleteTrade(null)
    loadTrades()
  }

  async function analyzeTrade(trade: any) {
    setAiLoading(true)
    const res = await fetch("/api/ai-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trade }) })
    const data = await res.json()
    setAiReview(data.review)
    setAiLoading(false)
  }

  async function analyzeAllTrades() {
    setCoachLoading(true)
    const res = await fetch("/api/ai-coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trades }) })
    const data = await res.json()
    setCoach(data.review)
    setCoachLoading(false)
  }

  useEffect(() => { loadTrades() }, [])

  if (!ready) return null

  const PIE_COLORS = ["#30d158", "#ff453a"]

  const statCards = [
    { label: "Total Trades", value: totalTrades, color: "#0a84ff" },
    { label: "Win Rate", value: `${winRate}%`, color: winRate >= 50 ? "#30d158" : "#ff453a" },
    { label: "Total P&L", value: `${totalPnL >= 0 ? "+" : ""}${totalPnL}`, color: totalPnL >= 0 ? "#30d158" : "#ff453a" },
    { label: "Avg P&L", value: `${avgPnL >= 0 ? "+" : ""}${avgPnL}`, color: avgPnL >= 0 ? "#30d158" : "#ff453a" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: FONT, transition: "background 0.3s" }}>

      {/* ── Header ── */}
      <header style={{
        background: t.surface, borderBottom: `1px solid ${t.border}`,
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(20px)",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: dark ? "#f5f5f7" : "#1c1c1e",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📈</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: "-0.04em" }}>TradeFlow</span>
          <span style={{ fontSize: 12, color: t.textSub, marginLeft: 4 }}>Trading Journal</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* dnproduction badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 4px 7px", background: t.surface2, borderRadius: 20, border: `1px solid ${t.border}` }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg,#1c1c1e,#4a4a4c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff" }}>dn</div>
            <span style={{ fontSize: 11, color: t.textSub, fontWeight: 500 }}>by <span style={{ color: t.text, fontWeight: 700 }}>dnproduction</span></span>
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggle} title={dark ? "Light mode" : "Dark mode"} style={{
            width: 36, height: 36, borderRadius: 10,
            background: t.surface2, border: `1px solid ${t.border}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "all 0.2s",
          }}>{dark ? "☀️" : "🌙"}</button>

          <button onClick={analyzeAllTrades} disabled={coachLoading} style={{
            padding: "8px 18px", background: coachLoading ? t.surface2 : "#1c1c1e",
            color: coachLoading ? t.textSub : "#fff",
            border: `1px solid ${t.border}`, borderRadius: 10, cursor: coachLoading ? "default" : "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: FONT, transition: "all 0.2s",
          }}>
            {coachLoading ? "Analyzing…" : "✦ Analyze All"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px" }}>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {statCards.map(sc => (
            <div key={sc.label} style={{ ...s.card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textSub, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>{sc.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: sc.color, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{sc.value}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 28 }}>

          {/* Profit Curve */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Profit Curve</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="trade" tick={{ fontSize: 11, fill: t.textSub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.textSub }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<ChartTooltip dark={dark} />} />
                <Line type="monotone" dataKey="pnl" stroke={totalPnL >= 0 ? "#30d158" : "#ff453a"} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Win / Loss */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Win / Loss</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={winLoss} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {winLoss.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 2]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} trades`, ""]} contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 10, fontFamily: FONT }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* P&L by Asset */}
          <div style={s.card}>
            <div style={s.sectionTitle}>P&L by Asset</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={assetStats} barSize={28}>
                <XAxis dataKey="symbol" tick={{ fontSize: 11, fill: t.textSub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.textSub }} axisLine={false} tickLine={false} width={42} />
                <Tooltip contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 10, fontFamily: FONT }} />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {assetStats.map((entry, i) => <Cell key={i} fill={entry.pnl >= 0 ? "#30d158" : "#ff453a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Add Trade ── */}
        <div style={{ ...s.card, marginBottom: 28 }}>
          <div style={s.sectionTitle}>Add Trade</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
            {[
              ["Symbol", symbol, setSymbol, "text", "AAPL"],
              ["Entry Price", entry, setEntry, "number", "0.00"],
              ["Exit Price", exit, setExit, "number", "0.00"],
              ["Quantity", qty, setQty, "number", "100"],
            ].map(([lbl, val, set, type, ph]) => (
              <div key={lbl as string}>
                <label style={s.label}>{lbl as string}</label>
                <input
                  type={type as string} placeholder={ph as string}
                  value={val as string} onChange={e => (set as any)(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTrade()}
                  style={s.input}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={addTrade} style={{
              padding: "10px 28px", background: "#1c1c1e", color: "#fff",
              border: "none", borderRadius: 12, cursor: "pointer",
              fontSize: 14, fontWeight: 700, fontFamily: FONT,
            }}>Save Trade</button>
            {message && (
              <span style={{ fontSize: 13, color: message.includes("✅") ? "#30d158" : "#ff453a", fontWeight: 600 }}>
                {message}
              </span>
            )}
          </div>
        </div>

        {/* ── Trade History ── */}
        <div style={{ ...s.card, marginBottom: 28 }}>
          <div style={s.sectionTitle}>Trade History</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Symbol", "Entry", "Exit", "Qty", "P&L", "AI Review", ""].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: t.textSub, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr key={trade.id} style={{ background: i % 2 === 0 ? "transparent" : `${t.surface2}60` }}>
                    <td style={{ padding: "11px 12px", fontWeight: 700, color: t.text }}>{trade.symbol}</td>
                    <td style={{ padding: "11px 12px", color: t.textSub, fontVariantNumeric: "tabular-nums" }}>{trade.entry}</td>
                    <td style={{ padding: "11px 12px", color: t.textSub, fontVariantNumeric: "tabular-nums" }}>{trade.exit ?? "—"}</td>
                    <td style={{ padding: "11px 12px", color: t.textSub, fontVariantNumeric: "tabular-nums" }}>{trade.qty}</td>
                    <td style={{ padding: "11px 12px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: trade.pnl >= 0 ? "#30d158" : "#ff453a" }}>
                      {trade.pnl >= 0 ? "+" : ""}{Number(trade.pnl).toFixed(2)}
                    </td>
                    <td style={{ padding: "11px 12px", maxWidth: 260 }}>
                      <button onClick={() => analyzeTrade(trade)} disabled={aiLoading} style={{
                        padding: "5px 12px", background: t.surface2, color: t.text,
                        border: `1px solid ${t.border}`, borderRadius: 8,
                        cursor: "pointer", fontSize: 12, fontFamily: FONT,
                      }}>
                        {aiLoading ? "…" : "Analyze ✦"}
                      </button>
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <IconBtn icon="✎" color="#0a84ff" onClick={() => setEditTrade(trade)} title="Edit" />
                        <IconBtn icon="✕" color="#ff453a" onClick={() => setDeleteTrade(trade)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", color: t.textSub, fontSize: 14 }}>No trades yet. Add your first trade above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── AI Panels ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {[
            { title: "AI Trade Review", content: aiReview, empty: 'Click "Analyze ✦" on any trade to get a per-trade breakdown.' },
            { title: "AI Trading Coach", content: coach, empty: 'Click "✦ Analyze All" in the header to get coaching on your full journal.' },
          ].map(panel => (
            <div key={panel.title} style={s.card}>
              <div style={{ ...s.sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0a84ff", display: "inline-block" }} />
                {panel.title}
              </div>
              {panel.content ? (
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 13, color: t.text, margin: 0, fontFamily: FONT }}>{panel.content}</pre>
              ) : (
                <div style={{ fontSize: 13, color: t.textSub, lineHeight: 1.6 }}>{panel.empty}</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: 12, paddingBottom: 8, borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg,#1c1c1e,#4a4a4c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff" }}>dn</div>
            <span style={{ fontSize: 11, color: t.textMuted }}>by <span style={{ color: t.textSub, fontWeight: 700 }}>dnproduction</span></span>
          </div>
        </div>

      </div>

      {/* Modals */}
      {editTrade   && <EditModal   trade={editTrade}   onSave={updateTrade}  onClose={() => setEditTrade(null)}   dark={dark} />}
      {deleteTrade && <DeleteModal trade={deleteTrade} onConfirm={deleteTradeFn} onClose={() => setDeleteTrade(null)} dark={dark} />}

    </div>
  )
}

