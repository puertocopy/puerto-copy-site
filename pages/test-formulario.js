import { useState } from 'react';

export default function TestFormulario() {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('entry.370447580', 'TEST-RFC');
    formData.append('entry.1288438508', '1-12345'); // Número de ticket

    await fetch('https://docs.google.com/forms/d/e/1FAIpQLSclHDoFDAUl--M53kvbbqQqkt8QOhqcpTl7rTrPSCHr7uI_yA/formResponse', {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });

    setEnviado(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Test Formulario Google</h1>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enviar Prueba
        </button>
        {enviado && <p className="mt-4 text-green-600">Enviado correctamente.</p>}
      </form>
    </div>
  );
}
