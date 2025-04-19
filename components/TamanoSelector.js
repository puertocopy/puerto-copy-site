export default function TamanoSelector({ onSelect }) {
  const tamanos = ['45x60', '60x90', '60x120', '90x120', '90x150'];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-[#004b71]">3. Selecciona el tamaño</h2>
      <div className="grid grid-cols-2 gap-4">
        {tamanos.map((tamano) => (
          <button
            key={tamano}
            onClick={() => onSelect(tamano)}
            className="p-4 bg-blue-100 hover:bg-blue-200 rounded text-[#004b71] font-medium"
          >
            {tamano}
          </button>
        ))}
      </div>
    </div>
  );
}
