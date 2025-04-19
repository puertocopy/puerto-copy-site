export default function ColorSelector({ onSelect }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-[#004b71]">2. Selecciona el tipo de color</h2>
      <div className="flex gap-4">
        <button
          onClick={() => onSelect('bn')}
          className="w-1/2 p-4 bg-blue-100 hover:bg-blue-200 rounded text-[#004b71] font-semibold"
        >
          Blanco y Negro
        </button>
        <button
          onClick={() => onSelect('color')}
          className="w-1/2 p-4 bg-blue-100 hover:bg-blue-200 rounded text-[#004b71] font-semibold"
        >
          A Color
        </button>
      </div>
    </div>
  );
}
