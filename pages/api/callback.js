export default async function handler(req, res) {
  const code = req.query.code;

  const client_id = process.env.LOYVERSE_CLIENT_ID;
  const client_secret = process.env.LOYVERSE_CLIENT_SECRET;
  const redirect_uri = "https://puerto-copy-site.vercel.app/api/callback";

  console.log("📥 CODE:", code);
  console.log("🧾 CLIENT_ID:", client_id);
  console.log("🧾 CLIENT_SECRET:", client_secret);

  const tokenURL = "https://api.loyverse.com/oauth/token";

  try {
    const response = await fetch(tokenURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id,
        client_secret,
        redirect_uri,
      }),
    });

    const data = await response.json();

    console.log("🎉 RESPONSE FROM LOYVERSE:", data);

    if (data.access_token) {
      res.status(200).json({
        success: true,
        token: data.access_token,
        refresh: data.refresh_token,
        expires: data.expires_in,
      });
    } else {
      res.status(400).json({ success: false, error: data });
    }
  } catch (error) {
    console.error("❌ FETCH ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
