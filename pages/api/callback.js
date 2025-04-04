export default async function handler(req, res) {
  const code = req.query.code
  const client_id = process.env.LOYVERSE_CLIENT_ID
  const client_secret = process.env.LOYVERSE_CLIENT_SECRET

  console.log("🎯 CLIENT_ID:", client_id)
  console.log("🔐 CLIENT_SECRET:", client_secret)

  const redirect_uri = "https://puerto-copy-site.vercel.app/api/callback"

  ...
}
// Este es un cambio menor para forzar redeploy
