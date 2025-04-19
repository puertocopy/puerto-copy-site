export default function ServicioSelector({ onSelect }) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-[#004b71]">1. ¿Qué necesitas?</h2>
        <div className="flex gap-4">
          <button
            onClick={() => onSelect('copias')}
            className="w-1/2 p-4 bg-blue-100 hover:bg-blue-200 rounded text-[#004b71] font-semibold"
          >
            Copias
          </button>
          <button
            onClick={() => onSelect('planos')}
            className="w-1/2 p-4 bg-blue-100 hover:bg-blue-200 rounded text-[#004b71] font-semibold"
          >
            Impresión de Planos
          </button>
        </div>
      </div>
    );
  }
  