import { NextResponse } from "next/server"

export async function POST(req: Request) {

const body = await req.json()
const trade = body.trade

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
role:"system",
content:"You are a professional trading coach. Analyze trades very briefly. Maximum 3 short sentences."
},
{
role:"user",
content:`Analyze this trade: ${JSON.stringify(trade)}`
}

]

})

})

const data = await response.json()

return NextResponse.json({
review:data.choices?.[0]?.message?.content || "AI failed"
})

}