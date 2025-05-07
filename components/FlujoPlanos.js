import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import precios from '../data/preciosPlanosVariaciones.json';

export default function FlujoPlanos({ onAgregar }) {
  const [tipo, setTipo] = useState('');
  const [color, setColor] = useState('');
  const [fondo, setFondo] = useState('');
  const [tamano, setTamano] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const cantidadRef = useRef(null);
  const [precio, setPrecio] = useState(0);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const [mostrarColor, setMostrarColor] = useState(false);
  const [mostrarFondo, setMostrarFondo] = useState(false);
  const [mostrarTamano, setMostrarTamano] = useState(false);
  const [mostrarCantidad, setMostrarCantidad] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const tipos = ['Copia', 'Impresión'];
  const colores = ['B/N', 'COLOR'];
  const fondos = ['Lineas y Texto', 'Fondo Completo'];
  const tamanos = ['45X60', '60X90', '60X120', '90X120', '90X150'];

  const listo = tipo && color && fondo && tamano && cantidad > 0;

  useEffect(() => {
    if (tipo && !mostrarColor) setMostrarColor(true);
    if (color && !mostrarFondo) setMostrarFondo(true);
    if (fondo && !mostrarTamano) setMostrarTamano(true);
    if (tamano && !mostrarCantidad) setMostrarCantidad(true);
    if (listo && !mostrarResumen) setMostrarResumen(true);

    if (listo) {
      const clave = `${tipo}|${color}|${fondo}|${tamano}`;
      const precioEncontrado = precios[clave];
      setPrecio(precioEncontrado || 0);
    } else {
      setPrecio(0);
    }
  }, [tipo, color, fondo, tamano, cantidad]);

  const agregarProducto = () => {
    const nombre = `Plano ${tipo} ${color} ${fondo} ${tamano}`;
    onAgregar({
      nombre,
      variante: tamano,
      precio,
      cantidad: parseInt(cantidad)
    });
    setTipo('');
    setColor('');
    setFondo('');
    setTamano('');
    setCantidad(1);
    if (cantidadRef.current) cantidadRef.current.value = 1;
    setPrecio(0);
    setMostrarColor(false);
    setMostrarFondo(false);
    setMostrarTamano(false);
    setMostrarCantidad(false);
    setMostrarResumen(false);
  };

  const OpcionGrupo = ({ titulo, opciones, seleccion, setSeleccion }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">{titulo}</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {opciones.map((op, i) => (
          <button
            key={i}
            onClick={() => {
              setSeleccion(op);
              if (titulo === 'Fondo' && (op === 'Fondo Completo' || op === 'Lineas y Texto')) {
                setMostrarPopup(true);
              }
            }}
            className={`min-w-[120px] px-5 py-3 text-sm font-medium rounded-xl border shadow transition-all duration-200
              ${
                seleccion === op
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
              }
            `}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );

  const Paso = ({ visible, animar, children }) => {
    if (!visible) return null;
    return animar ? (
      <motion.div
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 1.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    ) : (
      <div>{children}</div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto text-center overflow-hidden">
      <h2 className="text-3xl font-bold text-blue-700 mb-10">Configura tu plano</h2>

      <OpcionGrupo titulo="Tipo" opciones={tipos} seleccion={tipo} setSeleccion={setTipo} />

      <Paso visible={tipo} animar={!mostrarColor}>
        <OpcionGrupo titulo="Color" opciones={colores} seleccion={color} setSeleccion={setColor} />
      </Paso>

      <Paso visible={color} animar={!mostrarFondo}>
        <OpcionGrupo titulo="Fondo" opciones={fondos} seleccion={fondo} setSeleccion={setFondo} />
      </Paso>

      <Paso visible={fondo} animar={!mostrarTamano}>
        <OpcionGrupo titulo="Tamaño" opciones={tamanos} seleccion={tamano} setSeleccion={setTamano} />
      </Paso>

      <Paso visible={tamano} animar={!mostrarCantidad}>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Cantidad:</label>
          <div className="flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const actual = parseInt(cantidadRef.current.value) || 1;
                const nueva = Math.max(1, actual - 1);
                cantidadRef.current.value = nueva;
                setCantidad(nueva);
              }}
              className="w-10 h-10 text-xl font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
            >
              –
            </button>
            <input
              ref={cantidadRef}
              defaultValue={cantidad}
              inputMode="numeric"
              pattern="[0-9]*"
              onBlur={() => {
                const num = parseInt(cantidadRef.current.value);
                setCantidad(isNaN(num) || num < 1 ? 1 : num);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseInt(cantidadRef.current.value);
                  setCantidad(isNaN(num) || num < 1 ? 1 : num);
                  e.target.blur();
                }
              }}
              className="w-20 border rounded-lg px-4 py-2 text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => {
                const actual = parseInt(cantidadRef.current.value) || 1;
                const nueva = actual + 1;
                cantidadRef.current.value = nueva;
                setCantidad(nueva);
              }}
              className="w-10 h-10 text-xl font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
            >
              +
            </button>
          </div>
        </div>
      </Paso>

      <Paso visible={listo} animar={!mostrarResumen}>
        <div className="mt-8">
          <p className="mb-4 text-lg font-semibold text-gray-700">
            Precio unitario: <span className="text-blue-700">${precio.toFixed(2)}</span> <br />
            Total: <span className="text-blue-700 font-bold">${(precio * cantidad).toFixed(2)}</span>
          </p>
          <button
            onClick={agregarProducto}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 text-sm rounded-xl font-medium shadow-md transition"
          >
            Agregar al carrito
          </button>
        </div>
      </Paso>

      {mostrarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm text-center border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Atención</h3>
            <p className="text-sm text-gray-600">
              Si tu archivo contiene imágenes o elementos fuera de la solapa, será considerado como "Fondo Completo".
              Asegúrate de seleccionar correctamente para evitar ajustes de precio.
            </p>
            <button
              onClick={() => setMostrarPopup(false)}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-800"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
