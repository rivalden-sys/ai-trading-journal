"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function TradesPage() {

const [symbol,setSymbol] = useState("")
const [entry,setEntry] = useState("")
const [exit,setExit] = useState("")
const [qty,setQty] = useState("")

const [trades,setTrades] = useState<any[]>([])
const [aiReview,setAiReview] = useState("")
const [loading,setLoading] = useState(false)

const [totalPnL,setTotalPnL] = useState(0)
const [winRate,setWinRate] = useState(0)
const [totalTrades,setTotalTrades] = useState(0)

useEffect(()=>{

fetchTrades()

},[])

async function fetchTrades(){

const {data} = await supabase
.from("trades")
.select("*")
.order("created_at",{ascending:false})

if(data){

const cleanTrades = data.filter(
(t)=>t.symbol && t.entry > 0 && t.qty
)

setTrades(cleanTrades)

calculateStats(cleanTrades)

}

}

function calculateStats(trades:any[]){

const total = trades.length
setTotalTrades(total)

let wins = 0
let pnl = 0

trades.forEach((t)=>{

const tradePnL = (t.exit - t.entry) * t.qty
pnl += tradePnL

if(tradePnL > 0){
wins++
}

})

setTotalPnL(pnl)

if(total > 0){
setWinRate(Math.round((wins/total)*100))
}

}

async function saveTrade(){

if(!symbol || !entry || !qty) return

await supabase.from("trades").insert([
{
symbol,
entry:Number(entry),
exit:Number(exit),
qty:Number(qty)
}
])

setSymbol("")
setEntry("")
setExit("")
setQty("")

fetchTrades()

}

async function deleteTrade(id:string){

await supabase
.from("trades")
.delete()
.eq("id",id)

fetchTrades()

}

async function analyzeTrade(trade:any){

setLoading(true)
setAiReview("")

const res = await fetch("/api/ai-review",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
trade
})

})

const data = await res.json()

setAiReview(data.review)

setLoading(false)

}

return(

<div style={{padding:40,fontFamily:"sans-serif"}}>

<h1>AI Trading Journal</h1>

<h2>Add Trade</h2>

<input
placeholder="Symbol"
value={symbol}
onChange={(e)=>setSymbol(e.target.value)}
/>

<input
placeholder="Entry price"
value={entry}
onChange={(e)=>setEntry(e.target.value)}
/>

<input
placeholder="Exit price"
value={exit}
onChange={(e)=>setExit(e.target.value)}
/>

<input
placeholder="Quantity"
value={qty}
onChange={(e)=>setQty(e.target.value)}
/>

<br/><br/>

<button onClick={saveTrade}>
Save Trade
</button>

<h2>Statistics</h2>

<p>Total Trades: {totalTrades}</p>
<p>Win Rate: {winRate}%</p>
<p>Total PnL: {totalPnL}</p>

<h2>Trades History</h2>

<table border={1} cellPadding={10}>

<thead>

<tr>
<th>Symbol</th>
<th>Entry</th>
<th>Exit</th>
<th>Qty</th>
<th>PnL</th>
<th>AI</th>
<th>Delete</th>
</tr>

</thead>

<tbody>

{trades.map((trade)=>{

const pnl = (trade.exit - trade.entry) * trade.qty

return(

<tr key={trade.id}>

<td>{trade.symbol}</td>
<td>{trade.entry}</td>
<td>{trade.exit}</td>
<td>{trade.qty}</td>
<td>{pnl}</td>

<td>

<button
onClick={()=>analyzeTrade(trade)}
disabled={loading}
>

{loading ? "Analyzing..." : "Analyze"}

</button>

</td>

<td>

<button
onClick={()=>deleteTrade(trade.id)}
style={{color:"red"}}
>
Delete
</button>

</td>

</tr>

)

})}

</tbody>

</table>

<h2>AI Trade Review</h2>

<div style={{
background:"#f5f5f5",
padding:20,
marginTop:10,
borderRadius:10,
maxWidth:600
}}>

{aiReview}

</div>

</div>

)

}
