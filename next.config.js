/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/facturacion',
        destination: '/factura',
        permanent: true, // SEO-friendly redirección 301
      },
    ];
  },
};

module.exports = nextConfig;
