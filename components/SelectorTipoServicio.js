export default function SelectorTipoServicio({ tipos, seleccionado, onSelect }) {
    return (
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {tipos.map((tipo, index) => (
          <button
            key={index}
            onClick={() => onSelect(tipo)}
            className={`text-lg font-semibold px-6 py-3 rounded-xl border shadow transition ${
              seleccionado === tipo
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>
    );
  }
  