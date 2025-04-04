// pages/api/login.js

export default function handler(req, res) {
    const client_id = "A7ZaJoVv7FN2UkMJ7JWX"
    const redirect_uri = "https://puerto-copy-site.vercel.app/api/callback"
  
    // ✅ Scopes válidos con formato correcto desde la documentación oficial
    const scope = "RECEIPTS_READ CUSTOMERS_READ"
  
    const authURL = `https://api.loyverse.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(client_id)}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&scope=${encodeURIComponent(scope)}`
  
    res.redirect(authURL)
  }
  