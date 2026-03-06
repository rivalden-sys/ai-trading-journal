import { NextResponse } from "next/server"

export async function POST(req: Request) {

try{

const body = await req.json()
const trades = body.trades

if(!trades || trades.length === 0){

return NextResponse.json({
review:"No trades to analyze yet."
})

}

const response = await fetch("https://api.openai.com/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${process.env.OPENAI_API_KEY}`
},

body:JSON.stringify({

model:"gpt-4o-mini",

messages:[
{
role:"user",
content:`

You are an expert crypto trading coach.

Analyze this trading history:

${JSON.stringify(trades)}

Return ONLY:

Biggest mistake:
Best asset:
Worst asset:
Win rate insight:
Risk advice:

Each answer max 1 short sentence.

`
}

]

})

})

const data = await response.json()

return NextResponse.json({
review:data.choices?.[0]?.message?.content || "AI failed"
})

}catch(error){

return NextResponse.json({
review:"AI server error"
})

}

}