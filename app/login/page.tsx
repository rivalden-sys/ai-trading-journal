"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage(){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")

const router = useRouter()

async function login(){

const { error } = await supabase.auth.signInWithPassword({
email,
password
})

if(error){
setMessage(error.message)
}else{
router.push("/trades")
}

}

async function signup(){

const { error } = await supabase.auth.signUp({
email,
password
})

if(error){
setMessage(error.message)
}else{
setMessage("Account created. Now login.")
}

}

return(

<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh",
fontFamily:"-apple-system"
}}>

<div style={{
background:"#fff",
padding:40,
borderRadius:16,
boxShadow:"0 0 10px rgba(0,0,0,0.1)",
width:300
}}>

<h2>Login</h2>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",marginBottom:10,padding:8}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{width:"100%",marginBottom:10,padding:8}}
/>

<button onClick={login} style={{width:"100%",marginBottom:10}}>
Login
</button>

<button onClick={signup} style={{width:"100%"}}>
Sign Up
</button>

<p>{message}</p>

</div>

</div>

)

}
