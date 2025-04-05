export default async function handler(req, res) {
    const token = process.env.LOYVERSE_API_TOKEN || "0dd18d29d9d041a48b3224f8b95ae068";
  
    try {
      const response = await fetch("https://api.loyverse.com/v1.0/receipts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      // Mostrar todo el resultado para entender qué está pasando
      return res.status(response.status).json({
        status: response.status,
        success: response.ok,
        data,
      });
    } catch (error) {
      console.error("❌ Error general:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  