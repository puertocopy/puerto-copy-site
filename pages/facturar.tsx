import { useState } from 'react';

const usosCfdi = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina por inversiones' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
  { value: 'P01', label: 'P01 - Por definir' }
];

const regimenesFiscales = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' }
];

export default function Facturar() {
  const [ticket, setTicket] = useState('');
  const [ticketValidado, setTicketValidado] = useState(false);
  const [formData, setFormData] = useState({
    rfc: '',
    razonSocial: '',
    correo: '',
    cp: '',
    usoCfdi: '',
    regimenFiscal: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const validarTicket = async () => {
    setLoading(true);
    setMensaje('');
    try {
      const res = await fetch(`/api/factura?ticket=${ticket}`);
      const data = await res.json();
      if (res.ok) {
        setTicketValidado(true);
        setMensaje('Ticket válido. Por favor llena tus datos para facturar.');
      } else {
        setMensaje(data.error || 'Error al validar ticket.');
      }
    } catch (error) {
      setMensaje('Error en la validación del ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      const res = await fetch('/api/generar-factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ticket })
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje('✅ Factura generada exitosamente.');
      } else {
        setMensaje(`❌ Error: ${data.error || 'No se pudo generar la factura.'}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión al generar la factura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generar Factura</h1>

      {!ticketValidado ? (
        <>
          <label className="block mb-2 font-semibold">Número de Ticket</label>
          <input
            type="text"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
          />
          <button
            onClick={validarTicket}
            disabled={loading || !ticket}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {loading ? 'Validando...' : 'Validar Ticket'}
          </button>
        </>
      ) : (
        <form onSubmit={enviarFactura} className="space-y-4 mt-4">
          <input name="rfc" placeholder="RFC" required value={formData.rfc} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="razonSocial" placeholder="Razón Social" required value={formData.razonSocial} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="email" name="correo" placeholder="Correo electrónico" required value={formData.correo} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="cp" placeholder="Código Postal" required value={formData.cp} onChange={handleChange} className="w-full p-2 border rounded" />

          <select name="usoCfdi" required value={formData.usoCfdi} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Selecciona Uso de CFDI</option>
            {usosCfdi.map((uso) => (
              <option key={uso.value} value={uso.value}>{uso.label}</option>
            ))}
          </select>

          <select name="regimenFiscal" required value={formData.regimenFiscal} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Selecciona Régimen Fiscal</option>
            {regimenesFiscales.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {loading ? 'Enviando...' : 'Generar Factura'}
          </button>
        </form>
      )}

      {mensaje && <p className="mt-4 text-sm">{mensaje}</p>}
    </div>
  );
}

