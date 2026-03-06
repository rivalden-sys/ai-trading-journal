import Link from "next/link"

export default function Home() {
  return (
    <main style={{
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      height:"100vh",
      fontFamily:"sans-serif",
      textAlign:"center"
    }}>
      
      <h1 style={{fontSize:"48px"}}>
        AI Trading Journal
      </h1>

      <p style={{marginTop:"20px"}}>
        Track trades and get AI analysis.
      </p>

      <Link href="/trades">
        <button style={{
          marginTop:"40px",
          padding:"15px 30px",
          borderRadius:"10px",
          background:"black",
          color:"white",
          border:"none",
          fontSize:"18px",
          cursor:"pointer"
        }}>
          Open Trading Journal
        </button>
      </Link>

    </main>
  )
}
