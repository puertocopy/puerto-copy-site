import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/**
 * Página de Respuesta del Checkout
 * 
 * Muestra el resultado de la transacción en Mercado Pago
 * (Aprobado, Pendiente, Rechazado/Cancelado) con diseño adaptado a Puerto Copy.
 */
export default function RespuestaCheckout() {
  const router = useRouter();
  const { status, collection_status, payment_id, external_reference, preference_id } = router.query;

  // Determinar el estado general
  const esExitoso = status === 'success' || collection_status === 'approved';
  const esPendiente = status === 'pending' || collection_status === 'in_process';
  const esFallido = status === 'failure' || collection_status === 'rejected';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-[#003399]">
      <Head>
        <title>Estado del Pago | Puerto Copy</title>
        <meta name="description" content="Confirmación del resultado de tu pago en Puerto Copy." />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 sm:p-12 text-center ring-1 ring-black/5">
          
          {/* ESTADO ÉXITO */}
          {esExitoso && (
            <div>
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-100">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
                ¡Pago Confirmado! (Pruebas)
              </span>

              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                ¡Gracias por tu pedido!
              </h1>

              <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md mx-auto">
                Tu transacción se ha procesado con éxito a través de Mercado Pago. Estamos listos para preparar tus impresiones y trabajos de papelería.
              </p>

              {/* Detalle del Pedido */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Número de Referencia:</span>
                  <span className="font-black text-slate-800">{external_reference || 'PC-SANDBOX'}</span>
                </div>
                {payment_id && (
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-200">
                    <span>ID Transacción Mercado Pago:</span>
                    <span className="font-black text-slate-800">{payment_id}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-200">
                  <span>Entorno:</span>
                  <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Sandbox (Modo Prueba)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tienda"
                  className="w-full sm:w-auto bg-[#003399] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-center"
                >
                  Volver a la Tienda
                </Link>
              </div>
            </div>
          )}

          {/* ESTADO PENDIENTE */}
          {esPendiente && (
            <div>
              <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-amber-100">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>

              <span className="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
                Pago en Proceso
              </span>

              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Tu pago está pendiente
              </h1>

              <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md mx-auto">
                Mercado Pago está procesando tu pago (por ejemplo, si elegiste pago en efectivo como OXXO o transferencia bancaria). Te notificaremos en cuanto se confirme.
              </p>

              <div className="flex justify-center">
                <Link
                  href="/tienda"
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  Regresar a la Tienda
                </Link>
              </div>
            </div>
          )}

          {/* ESTADO FALLIDO O CANCELADO */}
          {esFallido && (
            <div>
              <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-100">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>

              <span className="bg-rose-100 text-rose-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
                No se completó el pago
              </span>

              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                El pago no pudo procesarse
              </h1>

              <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md mx-auto">
                La transacción fue cancelada o rechazada en Mercado Pago. No se realizó ningún cargo a tu cuenta. Puedes intentarlo de nuevo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tienda"
                  className="w-full sm:w-auto bg-[#003399] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg active:scale-95 text-center"
                >
                  Reintentar Pago
                </Link>
              </div>
            </div>
          )}

          {/* ESTADO POR DEFECTO (Si entra directo sin params) */}
          {!esExitoso && !esPendiente && !esFallido && (
            <div>
              <div className="w-24 h-24 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-4">
                Consulta de Pedido
              </h1>

              <p className="text-slate-500 font-medium mb-8">
                Esta página recibe la confirmación de pagos de Mercado Pago.
              </p>

              <Link
                href="/tienda"
                className="bg-[#003399] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg active:scale-95 inline-block"
              >
                Ir a la Tienda
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
