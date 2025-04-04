// pages/api/callback.js

export default async function handler(req, res) {
    const code = req.query.code
    const client_id = "A7ZaJoVv7FN2UkMJ7JWX"
    const client_secret = "T6JynZ2hFdbGSIBXy78wGowuiEj42HBJa79YfH1VPOn5XItNsg_vOgw=="
    const redirect_uri = "https://puerto-copy-site.vercel.app/api/callback"
  
    const tokenResponse = await fetch("https://api.loyverse.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id,
        client_secret,
        redirect_uri,
      }),
    })
  
    const data = await tokenResponse.json()
  
    console.log("ACCESS TOKEN:", data)
  
    // Aquí puedes redirigir a una página o guardar el token
    res.status(200).json({ success: true, token: data })
  }
  