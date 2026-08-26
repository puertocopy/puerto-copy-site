import React, { useEffect } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useRouter } from 'next/router';

interface CardPaymentBrickProps {
  total: number;
  items: any[];
  onClose: () => void;
}

/**
 * Componente Card Payment Brick (Método A Recomendado)
 * 
 * Implementa el componente oficial de Mercado Pago para procesar tarjetas
 * de crédito y débito integrándose con el endpoint POST /v1/orders en el backend.
 */
export const CardPaymentBrickModal: React.FC<CardPaymentBrickProps> = ({ total, items, onClose }) => {
  const router = useRouter();

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-MX' });
    }
  }, []);

  const initialization = {
    amount: Number(total.toFixed(2)),
  };

  const onSubmit = async (formData: any, additionalData: any) => {
    return new Promise<void>((resolve, reject) => {
      const submitData = {
        token: formData.token,
        paymentMethodId: formData.payment_method_id,
        paymentTypeId: additionalData?.paymentTypeId || 'credit_card',
        installments: formData.installments,
        amount: formData.transaction_amount || total,
        payer: {
          email: formData.payer.email,
          identification: formData.payer.identification,
        },
        externalReference: `PC-${Date.now()}`
      };

      fetch('/api/mercadopago/procesar-orden', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            resolve();
            router.push(`/checkout/respuesta?status=success&payment_id=${data.orderId}&ref=${data.externalReference}`);
          } else {
            alert(data.error || 'La transacción fue rechazada. Verifica tus datos de tarjeta.');
            reject();
          }
        })
        .catch((err) => {
          console.error('❌ Error al conectar con /api/mercadopago/procesar-orden:', err);
          alert('Ocurrió un error al procesar el pago.');
          reject();
        });
    });
  };

  const onError = async (error: any) => {
    console.error('❌ Error en Card Payment Brick:', error);
  };

  const onReady = async () => {
    console.log('✅ Card Payment Brick cargado y listo.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5 max-h-[90vh] flex flex-col">
        
        {/* ENCABEZADO */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Card Payment Brick (Oficial)</span>
            <h3 className="text-2xl font-black tracking-tight">Pago Seguro con Tarjeta</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* BRICK CONTAINER */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <CardPayment
            initialization={initialization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
          />
        </div>

      </div>
    </div>
  );
};
