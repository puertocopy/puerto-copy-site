import dynamic from 'next/dynamic';

const FacturaPageClient = dynamic(() => import('../components/FacturaPageClient'), {
  ssr: false
});

export default function FacturaPage() {
  return <FacturaPageClient />;
}
