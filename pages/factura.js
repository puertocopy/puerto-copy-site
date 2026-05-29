import Head from 'next/head';
import dynamic from 'next/dynamic';

const FacturaPageClient = dynamic(() => import('../components/FacturaPageClient'), {
  ssr: false
});

export default function FacturaPage() {
  return (
    <>
      <Head>
        <title>Facturación de Tickets | Puerto Copy Puerto Vallarta</title>
        <meta name="description" content="Genera tu factura electrónica (CFDI) de forma fácil y rápida con tu ticket de compra de Puerto Copy." />
      </Head>
      <FacturaPageClient />
    </>
  );
}
//hola