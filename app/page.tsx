"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts"

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif"

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: "22px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #e5e5ea",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  background: "#fafafa",
  fontFamily: FONT,
  color: "#1c1c1e",
  boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#8e8e93",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
}

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#1c1c1e",
  letterSpacing: "-0.02em",
  margin: "0 0 20px",
}

const COLORS = ["#30d158", "#ff453a"]

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }: {
  label: string; value: string | number; color?: string; icon?: string
}) {
  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: "#8e8e93", fontWeight: 500 }}>{label}</span>
        {icon && <span style={{ fontSize: 18, opacity: 0.4 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#1c1c1e", letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5ea", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: FONT, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#8e8e93", marginBottom: 2 }}>Trade #{label}</div>
      <div style={{ fontWeight: 700, color: (payload[0].value ?? 0) >= 0 ? "#30d158" : "#ff453a" }}>
        ${Number(payload[0].value).toFixed(2)}
      </div>
    </div>
  )
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, children, danger }: {
  onClick: () => void; title: string; children: React.ReactNode; danger?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: "none",
        background: hover ? (danger ? "#fff1f2" : "#f2f2f7") : "transparent",
        cursor: "pointer", fontSize: 14,
        color: hover ? (danger ? "#ff453a" : "#3a3a3c") : "#c7c7cc",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", fontFamily: FONT,
      }}
    >
      {children}
    </button>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ trade, onClose, onSave }: {
  trade: any; onClose: () => void; onSave: (id: any, fields: any) => Promise<void>
}) {
  const [symbol, setSymbol] = useState(String(trade.symbol))
  const [entry, setEntry] = useState(String(trade.entry))
  const [exit, setExit] = useState(String(trade.exit))
  const [qty, setQty] = useState(String(trade.qty))
  const [saving, setSaving] = useState(false)

  const previewPnl = entry && exit && qty
    ? (Number(exit) - Number(entry)) * Number(qty)
    : null

  async function handleSave() {
    setSaving(true)
    await onSave(trade.id, {
      symbol: symbol.toUpperCase(),
      entry: Number(entry),
      exit: Number(exit),
      qty: Number(qty),
      pnl: (Number(exit) - Number(entry)) * Number(qty),
    })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, fontFamily: FONT,
    }}>
      <div style={{ background: "#fff", borderRadius: 22, padding: 32, width: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.16)" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.03em" }}>Edit Trade</div>
            <div style={{ fontSize: 12, color: "#8e8e93", marginTop: 3 }}>Update trade details below</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: "#f2f2f7", cursor: "pointer", fontSize: 20, color: "#8e8e93",
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT,
          }}>×</button>
        </div>

        {/* fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {([
            ["Symbol", symbol, setSymbol, "text"],
            ["Quantity", qty, setQty, "number"],
            ["Entry Price", entry, setEntry, "number"],
            ["Exit Price", exit, setExit, "number"],
          ] as [string, string, (v: string) => void, string][]).map(([lbl, val, setter, type]) => (
            <div key={lbl}>
              <label style={labelStyle}>{lbl}</label>
              <input type={type} value={val} onChange={(e) => setter(e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>

        {/* P&L preview */}
        {previewPnl !== null && (
          <div style={{
            background: "#f2f2f7", borderRadius: 12, padding: "10px 16px",
            marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "#8e8e93", fontWeight: 500 }}>Recalculated P&L</span>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em", color: previewPnl >= 0 ? "#30d158" : "#ff453a" }}>
              {previewPnl >= 0 ? "+" : ""}${previewPnl.toFixed(2)}
            </span>
          </div>
        )}

        {/* buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 12,
            border: "1px solid #e5e5ea", background: "#fff",
            cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#8e8e93", fontFamily: FONT,
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: "11px 0", borderRadius: 12,
            border: "none", background: saving ? "#c7c7cc" : "#1c1c1e",
            cursor: saving ? "default" : "pointer",
            fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: FONT,
          }}>{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ trade, onClose, onConfirm }: {
  trade: any; onClose: () => void; onConfirm: (id: any) => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  async function handleDelete() {
    setDeleting(true)
    await onConfirm(trade.id)
    setDeleting(false)
    onClose()
  }
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, fontFamily: FONT,
    }}>
      <div style={{
        background: "#fff", borderRadius: 22, padding: 32, width: 380,
        boxShadow: "0 24px 64px rgba(0,0,0,0.16)", textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: "#fff1f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, margin: "0 auto 16px",
        }}>🗑</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Delete Trade?
        </div>
        <div style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.6, marginBottom: 24 }}>
          <strong style={{ color: "#1c1c1e" }}>{trade.symbol}</strong> — entry $
          {Number(trade.entry).toFixed(2)}, exit ${Number(trade.exit).toFixed(2)}
          <br />This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 12,
            border: "1px solid #e5e5ea", background: "#fff",
            cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#8e8e93", fontFamily: FONT,
          }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{
            flex: 1, padding: "11px 0", borderRadius: 12,
            border: "none", background: deleting ? "#c7c7cc" : "#ff453a",
            cursor: deleting ? "default" : "pointer",
            fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: FONT,
          }}>{deleting ? "Deleting…" : "Delete"}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TradesPage() {
  const [symbol, setSymbol] = useState("")
  const [entry, setEntry] = useState("")
  const [exit, setExit] = useState("")
  const [qty, setQty] = useState("")
  const [message, setMessage] = useState("")
  const [messageOk, setMessageOk] = useState(false)

  const [trades, setTrades] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [winLoss, setWinLoss] = useState<any[]>([])
  const [assetStats, setAssetStats] = useState<any[]>([])

  const [totalPnL, setTotalPnL] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [totalTrades, setTotalTrades] = useState(0)

  const [aiReview, setAiReview] = useState("")
  const [coach, setCoach] = useState("")
  const [loadingCoach, setLoadingCoach] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<any>(null)

  const [editTrade, setEditTrade] = useState<any>(null)
  const [deleteTrade, setDeleteTrade] = useState<any>(null)

  // ── data ────────────────────────────────────────────────────────────────────
  async function loadTrades() {
    const { data } = await supabase
      .from("trades").select("*").order("created_at", { ascending: true })
    if (!data) return
    const clean = data.filter((t) => t.symbol)
    setTrades(clean)
    let cum = 0
    setChartData(clean.map((t: any, i: number) => { cum += t.pnl || 0; return { trade: i + 1, pnl: cum } }))
    const wins = clean.filter((t: any) => t.pnl > 0).length
    const losses = clean.filter((t: any) => t.pnl <= 0).length
    setWinLoss([{ name: "Wins", value: wins }, { name: "Losses", value: losses }])
    const pnlSum = clean.reduce((s: number, t: any) => s + (t.pnl || 0), 0)
    setTotalPnL(Number(pnlSum.toFixed(2)))
    setTotalTrades(clean.length)
    if (clean.length > 0) setWinRate(Math.round((wins / clean.length) * 100))
    const assets: any = {}
    clean.forEach((t: any) => { if (!assets[t.symbol]) assets[t.symbol] = 0; assets[t.symbol] += t.pnl })
    setAssetStats(Object.keys(assets).map((sym) => ({ symbol: sym, pnl: Number(assets[sym].toFixed(2)) })))
  }

  async function addTrade() {
    if (!symbol || !entry || !exit || !qty) { setMessage("Please fill all fields"); setMessageOk(false); return }
    const pnl = (Number(exit) - Number(entry)) * Number(qty)
    const { error } = await supabase.from("trades").insert([{
      symbol: symbol.toUpperCase(), entry: Number(entry), exit: Number(exit), qty: Number(qty), pnl,
    }])
    if (error) { setMessage("Error: " + error.message); setMessageOk(false) }
    else { setMessage("Trade added successfully"); setMessageOk(true); setSymbol(""); setEntry(""); setExit(""); setQty(""); loadTrades() }
  }

  async function updateTrade(id: any, fields: any) {
    await supabase.from("trades").update(fields).eq("id", id)
    loadTrades()
  }

  async function deleteTradeFn(id: any) {
    await supabase.from("trades").delete().eq("id", id)
    loadTrades()
  }

  async function analyzeTrade(trade: any) {
    setAnalyzingId(trade.id); setAiReview("")
    const res = await fetch("/api/ai-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trade }) })
    const data = await res.json()
    setAiReview(data.review)
    setAnalyzingId(null)
  }

  async function analyzeAllTrades() {
    setLoadingCoach(true); setCoach("")
    const res = await fetch("/api/ai-coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trades }) })
    const data = await res.json()
    setCoach(data.review)
    setLoadingCoach(false)
  }

  useEffect(() => { loadTrades() }, [])

  const pnlColor = totalPnL >= 0 ? "#30d158" : "#ff453a"
  const pnlFormatted = `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toLocaleString()}`

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", fontFamily: FONT, padding: "40px 32px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1c1c1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📈</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.04em" }}>TradeFlow</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.04em", margin: 0 }}>Trading Journal</h1>
            <p style={{ color: "#8e8e93", fontSize: 14, margin: "4px 0 0" }}>Track, analyze, and improve your trades</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <button onClick={analyzeAllTrades} disabled={loadingCoach || trades.length === 0} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
              background: loadingCoach ? "#f2f2f7" : "#1c1c1e",
              color: loadingCoach ? "#c7c7cc" : "#fff",
              border: "none", borderRadius: 12, cursor: loadingCoach ? "default" : "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: FONT, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>✦</span>
              {loadingCoach ? "Analyzing…" : "Analyze All Trades"}
            </button>

            {/* dnproduction badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px 5px 8px",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.07)",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", flexShrink: 0,
              }}>dn</div>
              <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 500 }}>
                by <span style={{ color: "#1c1c1e", fontWeight: 700 }}>dnproduction</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Trades" value={totalTrades} icon="≡" />
          <StatCard label="Win Rate" value={`${winRate}%`} color="#0a84ff" icon="%" />
          <StatCard label="Total P&L" value={pnlFormatted} color={pnlColor} icon="$" />
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={sectionTitle}>Profit Curve</p>
              <span style={{ fontSize: 12, color: pnlColor, fontWeight: 600, background: totalPnL >= 0 ? "#f0fdf4" : "#fff1f2", padding: "3px 10px", borderRadius: 20 }}>{pnlFormatted}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="trade" tick={{ fontSize: 11, fill: "#c7c7cc", fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#c7c7cc", fontFamily: FONT }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="pnl" stroke="#0a84ff" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#0a84ff", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Win / Loss</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={winLoss} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {winLoss.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e5ea", borderRadius: 10, fontFamily: FONT, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
              {winLoss.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }} />
                  <span style={{ fontSize: 13, color: "#8e8e93" }}>{e.name}: {e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PnL by Asset ── */}
        <div style={{ ...card, marginBottom: 24 }}>
          <p style={sectionTitle}>P&L by Asset</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={assetStats} barSize={32}>
              <XAxis dataKey="symbol" tick={{ fontSize: 12, fill: "#8e8e93", fontFamily: FONT }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#c7c7cc", fontFamily: FONT }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e5ea", borderRadius: 10, fontFamily: FONT, fontSize: 13 }} />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]} fill="#0a84ff">
                {assetStats.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? "#30d158" : "#ff453a"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Add Trade ── */}
        <div style={{ ...card, marginBottom: 24 }}>
          <p style={sectionTitle}>Add Trade</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
            {([
              ["Symbol", symbol, setSymbol, "text"],
              ["Entry Price", entry, setEntry, "number"],
              ["Exit Price", exit, setExit, "number"],
              ["Quantity", qty, setQty, "number"],
            ] as [string, string, (v: string) => void, string][]).map(([lbl, val, setter, type]) => (
              <div key={lbl}>
                <label style={labelStyle}>{lbl}</label>
                <input type={type} placeholder={lbl} value={val} onChange={(e) => setter(e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={addTrade} style={{
              padding: "10px 28px", background: "#1c1c1e", color: "#fff",
              border: "none", borderRadius: 12, cursor: "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: FONT,
            }}>Save Trade</button>
            {message && (
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: messageOk ? "#30d158" : "#ff453a",
                background: messageOk ? "#f0fdf4" : "#fff1f2",
                padding: "6px 14px", borderRadius: 20,
              }}>{message}</span>
            )}
          </div>
        </div>

        {/* ── Trade History ── */}
        <div style={{ ...card, marginBottom: 24, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "22px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={sectionTitle}>Trade History</p>
            <span style={{ fontSize: 12, color: "#8e8e93", paddingBottom: 20 }}>
              {trades.length} trade{trades.length !== 1 ? "s" : ""}
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Symbol", "Entry", "Exit", "Qty", "P&L", "AI Review", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 20px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#8e8e93",
                    letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#c7c7cc", fontSize: 14 }}>
                    No trades yet — add your first trade above
                  </td>
                </tr>
              )}
              {trades.map((trade, i) => (
                <tr key={trade.id} style={{ borderTop: "1px solid #f2f2f7", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#1c1c1e", letterSpacing: "-0.02em" }}>
                    {trade.symbol}
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#1c1c1e", fontVariantNumeric: "tabular-nums" }}>
                    ${Number(trade.entry).toFixed(2)}
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#1c1c1e", fontVariantNumeric: "tabular-nums" }}>
                    ${Number(trade.exit).toFixed(2)}
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#8e8e93" }}>{trade.qty}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: trade.pnl > 0 ? "#30d158" : "#ff453a",
                      background: trade.pnl > 0 ? "#f0fdf4" : "#fff1f2",
                      padding: "3px 10px", borderRadius: 20,
                    }}>
                      {trade.pnl > 0 ? "+" : ""}${Number(trade.pnl).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <button onClick={() => analyzeTrade(trade)} disabled={analyzingId === trade.id} style={{
                      padding: "6px 14px", background: "#f2f2f7",
                      color: analyzingId === trade.id ? "#c7c7cc" : "#1c1c1e",
                      border: "none", borderRadius: 8,
                      cursor: analyzingId === trade.id ? "default" : "pointer",
                      fontSize: 12, fontWeight: 600, fontFamily: FONT,
                    }}>
                      {analyzingId === trade.id ? "…" : "✦ Analyze"}
                    </button>
                  </td>

                  {/* ── Actions: Edit + Delete ── */}
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      <IconBtn onClick={() => setEditTrade(trade)} title="Edit trade">✎</IconBtn>
                      <IconBtn onClick={() => setDeleteTrade(trade)} title="Delete trade" danger>✕</IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── AI Results ── */}
        {(aiReview || coach) && (
          <div style={{ display: "grid", gridTemplateColumns: aiReview && coach ? "1fr 1fr" : "1fr", gap: 16 }}>
            {aiReview && (
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #0a84ff, #bf5af2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1c1e" }}>AI Trade Review</div>
                    <div style={{ fontSize: 12, color: "#8e8e93" }}>Single trade analysis</div>
                  </div>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 13, color: "#3a3a3c", fontFamily: FONT, margin: 0 }}>{aiReview}</pre>
              </div>
            )}
            {coach && (
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #30d158, #0a84ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1c1e" }}>AI Trading Coach</div>
                    <div style={{ fontSize: 12, color: "#8e8e93" }}>Full journal analysis</div>
                  </div>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 13, color: "#3a3a3c", fontFamily: FONT, margin: 0 }}>{coach}</pre>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e5ea",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📈</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#8e8e93" }}>TradeFlow</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#c7c7cc" }}>Designed & built by</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px 4px 6px",
              background: "#f2f2f7", borderRadius: 20,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: "linear-gradient(135deg, #1c1c1e, #4a4a4c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", flexShrink: 0,
              }}>dn</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1c1e" }}>dnproduction</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      {editTrade && (
        <EditModal trade={editTrade} onClose={() => setEditTrade(null)} onSave={updateTrade} />
      )}
      {deleteTrade && (
        <DeleteModal trade={deleteTrade} onClose={() => setDeleteTrade(null)} onConfirm={deleteTradeFn} />
      )}
    </div>
  )
}
