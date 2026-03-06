"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell,
BarChart,
Bar
} from "recharts"

export default function TradesPage() {

const [symbol,setSymbol] = useState("")
const [entry,setEntry] = useState("")
const [exit,setExit] = useState("")
const [qty,setQty] = useState("")
const [message,setMessage] = useState("")

const [trades,setTrades] = useState<any[]>([])
const [chartData,setChartData] = useState<any[]>([])
const [winLoss,setWinLoss] = useState<any[]>([])
const [assetStats,setAssetStats] = useState<any[]>([])

const [totalPnL,setTotalPnL] = useState(0)
const [winRate,setWinRate] = useState(0)
const [totalTrades,setTotalTrades] = useState(0)

const [aiReview,setAiReview] = useState("")
const [coach,setCoach] = useState("")

async function loadTrades(){

const { data } = await supabase
.from("trades")
.select("*")
.order("created_at",{ascending:true})

if(data){

const clean = data.filter(t => t.symbol)

setTrades(clean)

let cumulative = 0

const curve = clean.map((t:any,i:number)=>{

cumulative += t.pnl || 0

return{
trade:i+1,
pnl:cumulative
}

})

setChartData(curve)

const wins = clean.filter((t:any)=>t.pnl > 0).length
const losses = clean.filter((t:any)=>t.pnl <= 0).length

setWinLoss([
{ name:"Wins", value:wins },
{ name:"Losses", value:losses }
])

const pnlSum = clean.reduce((sum:any,t:any)=>sum + (t.pnl || 0),0)

setTotalPnL(Number(pnlSum.toFixed(2)))
setTotalTrades(clean.length)

if(clean.length > 0){
setWinRate(Math.round((wins/clean.length)*100))
}

const assets:any = {}

clean.forEach((t:any)=>{

if(!assets[t.symbol]){
assets[t.symbol] = 0
}

assets[t.symbol] += t.pnl

})

const assetArray = Object.keys(assets).map((symbol)=>({

symbol,
pnl:Number(assets[symbol].toFixed(2))

}))

setAssetStats(assetArray)

}

}

async function addTrade(){

if(!symbol || !entry || !exit || !qty){
setMessage("Fill all fields")
return
}

const pnl =
(Number(exit) - Number(entry)) * Number(qty)

const { error } = await supabase
.from("trades")
.insert([
{
symbol:symbol.toUpperCase(),
entry:Number(entry),
exit:Number(exit),
qty:Number(qty),
pnl:pnl
}
])

if(error){

setMessage("Error: "+error.message)

}else{

setMessage("Trade added ✅")

setSymbol("")
setEntry("")
setExit("")
setQty("")

loadTrades()

}

}

async function analyzeTrade(trade:any){

const res = await fetch("/api/ai-review",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({trade})

})

const data = await res.json()

setAiReview(data.review)

}

async function analyzeAllTrades(){

const res = await fetch("/api/ai-coach",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({trades})

})

const data = await res.json()

setCoach(data.review)

}

useEffect(()=>{
loadTrades()
},[])

const COLORS = ["#22c55e","#ef4444"]

return (

<div style={{
maxWidth:1100,
margin:"auto",
padding:40,
fontFamily:"Arial"
}}>

<h1>AI Trading Journal</h1>

<div style={{
display:"flex",
gap:20,
marginBottom:40
}}>

<div style={{flex:1,padding:20,background:"#111",borderRadius:12}}>
<p>Total Trades</p>
<h2>{totalTrades}</h2>
</div>

<div style={{flex:1,padding:20,background:"#111",borderRadius:12}}>
<p>Win Rate</p>
<h2>{winRate}%</h2>
</div>

<div style={{flex:1,padding:20,background:"#111",borderRadius:12}}>
<p>Total PnL</p>
<h2>{totalPnL}</h2>
</div>

</div>

<h2>Profit Curve</h2>

<div style={{
height:250,
background:"#111",
padding:20,
borderRadius:12,
marginBottom:40
}}>

<ResponsiveContainer width="100%" height="100%">

<LineChart data={chartData}>

<XAxis dataKey="trade"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="pnl"
stroke="#22c55e"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

<h2>Win / Loss</h2>

<div style={{
height:250,
background:"#111",
padding:20,
borderRadius:12,
marginBottom:40
}}>

<ResponsiveContainer width="100%" height="100%">

<PieChart>

<Pie
data={winLoss}
dataKey="value"
cx="50%"
cy="50%"
outerRadius={80}
label
>

{winLoss.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]} />
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<h2>PnL by Asset</h2>

<div style={{
height:250,
background:"#111",
padding:20,
borderRadius:12,
marginBottom:40
}}>

<ResponsiveContainer width="100%" height="100%">

<BarChart data={assetStats}>

<XAxis dataKey="symbol"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="pnl" fill="#22c55e"/>

</BarChart>

</ResponsiveContainer>

</div>

<h2>Add Trade</h2>

<input placeholder="Symbol" value={symbol} onChange={(e)=>setSymbol(e.target.value)}/>
<br/><br/>

<input placeholder="Entry price" value={entry} onChange={(e)=>setEntry(e.target.value)}/>
<br/><br/>

<input placeholder="Exit price" value={exit} onChange={(e)=>setExit(e.target.value)}/>
<br/><br/>

<input placeholder="Quantity" value={qty} onChange={(e)=>setQty(e.target.value)}/>
<br/><br/>

<button onClick={addTrade}>Save Trade</button>

<p>{message}</p>

<br/><br/>

<button onClick={analyzeAllTrades}>Analyze My Trading</button>

<br/><br/>

<h2>Trades History</h2>

<table>

<thead>
<tr>
<th>Symbol</th>
<th>Entry</th>
<th>Exit</th>
<th>Qty</th>
<th>PnL</th>
<th>AI</th>
</tr>
</thead>

<tbody>

{trades.map((trade)=>(

<tr key={trade.id}>

<td>{trade.symbol}</td>
<td>{trade.entry}</td>
<td>{trade.exit}</td>
<td>{trade.qty}</td>

<td style={{color: trade.pnl > 0 ? "#22c55e" : "#ef4444"}}>
{Number(trade.pnl).toFixed(2)}
</td>

<td>
<button onClick={()=>analyzeTrade(trade)}>
Analyze
</button>
</td>

</tr>

))}

</tbody>

</table>

<br/><br/>

<div style={{background:"#111",padding:20,borderRadius:12}}>
<h3>AI Trade Review</h3>
<pre style={{whiteSpace:"pre-wrap",lineHeight:"1.6"}}>
{aiReview}
</pre>
</div>

<br/><br/>

<div style={{background:"#111",padding:20,borderRadius:12}}>
<h3>AI Trading Coach</h3>
<pre style={{whiteSpace:"pre-wrap",lineHeight:"1.6"}}>
{coach}
</pre>
</div>

</div>

)

}