import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '../../lib/auth';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';

function getAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  const base64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${base64}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificación de seguridad
  if (!isAuthenticated(req)) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const auth = getAuthHeader();
  if (!auth) return res.status(500).json({ message: 'Faltan credenciales de Facturama' });

  const { factura, monto, formaPago, fechaPago, folio } = req.body;

  // Estructura para Complemento de Pago (CFDI Tipo P)
  const payload = {
    CfdiType: 'P',
    Serie: 'CP',
    Folio: folio || String(Date.now()).slice(-6),
    ExpeditionPlace: process.env.FACTURAMA_EXPEDITION_PLACE,
    Issuer: {
      Rfc: process.env.FACTURAMA_ISSUER_RFC,
      Name: process.env.FACTURAMA_ISSUER_NAME,
      FiscalRegime: process.env.FACTURAMA_ISSUER_REGIMEN
    },
    Receiver: {
      Rfc: factura.rfc,
      Name: factura.razonSocial,
      CfdiUse: 'CP01',
      FiscalRegime: factura.regimenFiscal || '616',
      TaxZipCode: factura.codigoPostal || process.env.FACTURAMA_EXPEDITION_PLACE
    },
    Complemento: {
      Pagos: [
        {
          Date: fechaPago || new Date().toISOString(),
          PaymentForm: formaPago || '01',
          Amount: Number(monto),
          RelatedDocuments: [
            {
              Uuid: factura.uuid || factura.facturamaId,
              Series: factura.serie || 'A',
              Folio: factura.folio || factura.ticket,
              Currency: 'MXN',
              PaymentMethod: 'PPD',
              PartialityNumber: 1,
              PreviousBalanceAmount: Number(monto),
              AmountPaid: Number(monto),
              ImpSaldoInsoluto: 0
            }
          ]
        }
      ]
    }
  };

  try {
    const baseUrl = process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL;
    const response = await fetch(`${baseUrl}/3/cfdis`, {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: 'Error en Facturama', detail: data });

    return res.status(200).json({ ok: true, cfdiId: data.Id, data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
