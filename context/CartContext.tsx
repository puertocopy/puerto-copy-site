import React, { createContext, useContext, useState, ReactNode } from 'react';
import { validarArchivoPDF, PDFAnalysisResult } from '../lib/pdfAnalyzer';
import { calcularPrecioFinal, PrecioCalculado, UserConfig } from '../lib/cotizador';

/**
 * Representa un ítem en el carrito de compras de Puerto Copy.
 */
export interface CartItem {
  id: string;
  nombre: string;
  variante: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
  total: number;
  needsFile: boolean;
  fileAnalyzed: boolean;
  analisis?: PDFAnalysisResult;
  presupuesto?: {
    precioUnitario: number;
    cantidadPaginas: number;
    subtotal: number;
    iva: number;
    total: number;
    desglose: string;
  };
  pdfUrl?: string;
  cobertura?: 'LINEAS' | 'FONDO';
}

/**
 * Propiedades y acciones disponibles en el contexto del carrito.
 */
interface CartContextType {
  cart: CartItem[];
  addItem: (item: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  validarCarrito: () => { needsFile: boolean; item?: CartItem };
  processFile: (id: string, file: File, cobertura?: 'LINEAS' | 'FONDO') => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  itemToUpload: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Proveedor Global del Carrito. Implementa lógica de acumulación inteligente
 * y validación técnica de archivos PDF.
 */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToUpload, setItemToUpload] = useState<CartItem | null>(null);

  /**
   * Acumulación Inteligente: Si el producto ya existe (mismo nombre y variante),
   * incrementa su cantidad en lugar de duplicar la fila.
   */
  const addItem = (item: Partial<CartItem>) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => 
        i.nombre === item.nombre && i.variante === item.variante
      );

      const cantToAdd = item.cantidad || 1;

      if (existingIndex >= 0) {
        const newCart = [...prev];
        const existing = newCart[existingIndex];
        const newQuantity = existing.cantidad + cantToAdd;
        
        // Recalcular precios si el ítem no requiere archivo o ya fue analizado
        let { subtotal, iva, total } = existing;
        if (!existing.needsFile || existing.fileAnalyzed) {
          subtotal = existing.precioUnitario * newQuantity;
          iva = subtotal * 0.16;
          total = subtotal + iva;
        }

        newCart[existingIndex] = {
          ...existing,
          cantidad: newQuantity,
          subtotal,
          iva,
          total
        };
        return newCart;
      }

      // Detectar si el producto es de tipo impresión/plano
      const isPrinting = 
        item.nombre?.toLowerCase().includes('impresión') || 
        item.nombre?.toLowerCase().includes('copia') ||
        item.variante?.toLowerCase().includes('plano') ||
        item.nombre?.toLowerCase().includes('plano') ||
        item.nombre?.toLowerCase().includes('escaneo');

      const precio = item.precioUnitario || 0;
      const subtotal = precio * cantToAdd;
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: item.nombre || 'Producto',
        variante: item.variante || '',
        cantidad: cantToAdd,
        precioUnitario: precio,
        subtotal: isPrinting ? 0 : subtotal,
        iva: isPrinting ? 0 : iva,
        total: isPrinting ? 0 : total,
        needsFile: !!isPrinting,
        fileAnalyzed: false,
        ...item
      };

      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        let { subtotal, iva, total } = item;
        // Solo recalculamos si el precio es fijo (papelería) o ya está validado
        if (!item.needsFile || item.fileAnalyzed) {
          subtotal = item.precioUnitario * cantidad;
          iva = subtotal * 0.16;
          total = subtotal + iva;
        }
        return { ...item, cantidad, subtotal, iva, total };
      }
      return item;
    }));
  };

  const validarCarrito = () => {
    const needing = cart.find(item => item.needsFile && !item.fileAnalyzed);
    if (needing) {
      setItemToUpload(needing);
      setIsModalOpen(true);
      return { needsFile: true, item: needing };
    }
    return { needsFile: false };
  };

  /**
   * Procesa el archivo PDF, valida dimensiones y aplica el motor de precios dinámico.
   */
  const processFile = async (id: string, file: File, cobertura: 'LINEAS' | 'FONDO' = 'LINEAS') => {
    try {
      const buffer = await file.arrayBuffer();
      const datosPDF = await validarArchivoPDF(buffer);
      
      const item = cart.find(i => i.id === id);
      if (!item) return;

      // Normalizar tipo de servicio para el cotizador
      let tipoServicio: any = 'CARTA_BN';
      const v = item.variante.toUpperCase();
      const n = item.nombre.toUpperCase();

      if (n.includes('PLANO') || v.includes('PLANO')) {
        tipoServicio = v.includes('COLOR') ? 'PLANO_COLOR' : 'PLANO_BN';
      } else if (v.includes('OFICIO')) {
        tipoServicio = 'OFICIO_BN';
      } else if (v.includes('COLOR')) {
        tipoServicio = 'CARTA_COLOR';
      }

      const config: UserConfig = {
        tipoServicio,
        cobertura,
        cantidadJuegos: item.cantidad
      };

      // Ejecutar motor de precios
      const resultado = calcularPrecioFinal(datosPDF, config);
      
      setCart(prev => prev.map(i => {
        if (i.id === id) {
          return {
            ...i,
            precioUnitario: resultado.precio_unitario,
            subtotal: resultado.subtotal,
            iva: resultado.iva_16,
            total: resultado.total_final,
            fileAnalyzed: true,
            analisis: datosPDF,
            presupuesto: {
              precioUnitario: resultado.precio_unitario,
              cantidadPaginas: datosPDF.numeroDePaginas,
              subtotal: resultado.subtotal,
              iva: resultado.iva_16,
              total: resultado.total_final,
              desglose: `Formato: ${datosPDF.formato}`
            },
            pdfUrl: URL.createObjectURL(file),
            cobertura
          };
        }
        return i;
      }));

      setIsModalOpen(false);
      setItemToUpload(null);
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      alert(error.message);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, addItem, removeItem, updateQuantity, validarCarrito, processFile,
      isModalOpen, setIsModalOpen, itemToUpload 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
