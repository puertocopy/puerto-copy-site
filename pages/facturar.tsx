import { useState } from 'react';

const usosCFDI = [
  { clave: 'G01', descripcion: 'Adquisición de mercancías' },
  { clave: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
  { clave: 'G03', descripcion: 'Gastos en general' },
  { clave: 'I01', descripcion: 'Construcciones' },
  { clave: 'I02', descripcion: 'Mobiliario y equipo de oficina por inversiones' },
  { clave: 'I03', descripcion: 'Equipo de transporte' },
  { clave: 'I04', descripcion: 'Equipo de cómputo y accesorios' },
  { clave: 'I05', descripcion: 'Dados, troqueles, moldes, matrices y herramental' },
  { clave: 'I06', descripcion: 'Comunicaciones telefónicas' },
  { clave: 'I07', descripcion: 'Comunicaciones satelitales' },
  { clave: 'I08', descripcion: 'Otra maquinaria y equipo' },
  { clave: 'D01', descripcion: 'Honorarios médicos, dentales y gastos hospitalarios' },
  { clave: 'D02', descripcion: 'Gastos médicos por incapacidad o discapacidad' },
  { clave: 'D03', descripcion: 'Gastos funerales' },
  { clave: 'D04', descripcion: 'Donativos' },
  { clave: 'D05', descripcion: 'Intereses reales efectivamente pagados por créditos hipotecarios' },
  { clave: 'D06', descripcion: 'Aportaciones voluntarias al SAR' },
  { clave: 'D07', descripcion: 'Primas por seguros de gastos médicos' },
  { clave: 'D08', descripcion: 'Gastos de transportación escolar obligatoria' },
  { clave: 'D09', descripcion: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
  { clave: 'D10', descripcion: 'Pagos por servicios educativos (colegiaturas)' },
  { clave: 'P01', descripcion: 'Por definir' },
];

const regimenesFiscales = [
  { clave: '601', descripcion: 'General de Ley Personas Morales' },
  { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
  { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { clave: '606', descripcion: 'Arrendamiento' },
  { clave: '608', descripcion: 'Demás ingresos' },
  { clave: '610', descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { clave: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)' },
  { clave: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { clave: '614', descripcion: 'Ingresos por intereses' },
  { clave: '615', descripcion: 'Régimen de los ingresos por obtención de premios' },
  { clave: '616', descripcion: 'Sin obligaciones fiscales' },
  { clave: '620', descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
  { clave: '621', descripcion: 'Incorporación Fiscal' },
  { clave: '622', descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { clave: '623', descripcion: 'Opcional para Grupos de Sociedades' },
  { clave: '624', descripcion: 'Coordinados' },
  { clave: '625', descripcion: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { clave: '626', descripcion: 'Régimen Simplificado de Confianza' },
];

export default function Facturar() {
  const [formData, setFormData] = useState({
    ticket: '',
    rfc: '',
    razonSocial: '',
    correo: '',
    codigoPostal: '',
    usoCfdi: '',
    regimenFiscal: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);

    try {
      const response = await fetch('/api/factura-com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket: formData.ticket,
          rfc: formData.rfc,
          razonSocial: formData.razonSocial,
          correo: formData.correo,
          cp: formData.codigoPostal,
          usoCfdi: formData.usoCfdi,
          regimenFiscal: formData.regimenFiscal
        })
      });      

      const result = await response.json();

      if (response.ok) {
        alert('✅ Factura generada correctamente');
        console.log('Resultado:', result);
      } else {
        alert('❌ Error al generar factura: ' + result.error);
        console.error('Error:', result);
      }
    } catch (error) {
      alert('❌ Error inesperado al generar factura');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Generar Factura</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">Número de Ticket</label>
          <input type="text" name="ticket" onChange={handleChange} required className="w-full mt-1 p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">RFC</label>
          <input type="text" name="rfc" onChange={handleChange} required className="w-full mt-1 p-2 border rounded uppercase" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Razón Social</label>
          <input type="text" name="razonSocial" onChange={handleChange} required className="w-full mt-1 p-2 border rounded capitalize" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Correo Electrónico</label>
          <input type="email" name="correo" onChange={handleChange} required className="w-full mt-1 p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Código Postal</label>
          <input type="text" name="codigoPostal" onChange={handleChange} required className="w-full mt-1 p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Uso de CFDI</label>
          <select name="usoCfdi" onChange={handleChange} required className="w-full mt-1 p-2 border rounded">
            <option value="">Selecciona una opción</option>
            {usosCFDI.map(({ clave, descripcion }) => (
              <option key={clave} value={clave}>
                {clave} - {descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">Régimen Fiscal</label>
          <select name="regimenFiscal" onChange={handleChange} required className="w-full mt-1 p-2 border rounded">
            <option value="">Selecciona una opción</option>
            {regimenesFiscales.map(({ clave, descripcion }) => (
              <option key={clave} value={clave}>
                {clave} - {descripcion}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Generar Factura
        </button>
      </form>
    </div>//nad
  );
}
