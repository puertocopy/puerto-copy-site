// pages/api/login.js

export default function handler(req, res) {
    const redirect_uri = "https://puerto-copy-site.vercel.app/api/callback"
    const client_id = "A7ZaJoVv7FN2UkMJ7JWX"
    const scope = "receipts.read customers.read"
  
    const authURL = `https://api.loyverse.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`
  
    res.redirect(authURL)
  }
  