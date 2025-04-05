// pages/facturar.tsx
import { useState } from 'react';

export default function FacturarPage() {
  const [ticketValido, setTicketValido] = useState(false);
  const [ticket, setTicket] = useState('');
  const [datos, setDatos] = useState({
    rfc: '',
    razonSocial: '',
    correo: '',
    cp: '',
    usoCfdi: '',
    regimenFiscal: '',
  });

  const validarTicket = async () => {
    const res = await fetch(`/api/factura?ticket=${ticket}`);
    const data = await res.json();
    if (res.ok) {
      setTicketValido(true);
    } else {
      alert(data.error || 'Ticket inválido');
    }
  };

  const enviar = async () => {
    const res = await fetch('/api/generar-factura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datos, ticket }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Factura generada con éxito');
      console.log(data);
    } else {
      alert(data.error || 'Error al generar factura');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      {!ticketValido ? (
        <>
          <h2 className="text-lg font-bold mb-2">Verifica tu número de ticket</h2>
          <input
            className="border p-2 w-full"
            type="text"
            placeholder="Número de ticket"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 mt-4" onClick={validarTicket}>
            Verificar ticket
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-4">Datos de facturación</h2>
          <div className="grid gap-4">
            <input className="border p-2" placeholder="RFC" onChange={(e) => setDatos({ ...datos, rfc: e.target.value })} />
            <input className="border p-2" placeholder="Razón Social" onChange={(e) => setDatos({ ...datos, razonSocial: e.target.value })} />
            <input className="border p-2" placeholder="Correo" onChange={(e) => setDatos({ ...datos, correo: e.target.value })} />
            <input className="border p-2" placeholder="Código Postal" onChange={(e) => setDatos({ ...datos, cp: e.target.value })} />
            <select className="border p-2" onChange={(e) => setDatos({ ...datos, usoCfdi: e.target.value })}>
              <option value="">Uso de CFDI</option>
              <option value="G01">G01 - Adquisición de mercancías</option>
              <option value="G03">G03 - Gastos en general</option>
              <option value="P01">P01 - Por definir</option>
            </select>
            <select className="border p-2" onChange={(e) => setDatos({ ...datos, regimenFiscal: e.target.value })}>
              <option value="">Régimen Fiscal</option>
              <option value="601">601 - General de Ley Personas Morales</option>
              <option value="605">605 - Sueldos y Salarios</option>
              <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
            </select>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 mt-4" onClick={enviar}>
            Generar Factura
          </button>
        </>
      )}
    </div>
  );
}
