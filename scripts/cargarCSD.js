/**
 * scripts/cargarCSD.js
 * Script para cargar los Certificados de Sello Digital (CSD) a Facturama API Lite.
 */

const https = require('https');

// CONFIGURACIÓN DE CREDENCIALES (Obtenidas de tus variables de entorno)
// Asegúrate de tener estas variables en tu .env o reemplázalas aquí temporalmente
const USER = process.env.FACTURAMA_USER || 'puertocopy';
const PASS = process.env.FACTURAMA_PASSWORD || 'Ivan5885V.';

const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');

// DATOS DEL CSD
const payload = JSON.stringify({
  Rfc: 'PARI980727RWA',
  Certificate: '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',
  PrivateKey: 'MIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQIAgEAAoIBAQACAggAMBQGCCqGSIb3DQMHBAgwggS9AgEAMASCBMiVQr8FiCCp42Tm+W6/rwpr0zNEmxSpVUrqHrT29azId3lrDJUn5Z7/aNX1mDIrLRGVS6z+d+TPbepAg8NiKMNN49n/kl1JxTF1zl5wSJSuhHqFf/kwJ9yew3GpldWUz+bY7OXA4M69rp5iKpZY88w60brwgD+9aZuPMSrX43VvHJPd86qxxoHPMPzxlgc1oUU0qmnusJ8L39NsaasddGteGEzWScqyjgqbQbpiAY/WPDdW3baomysgQo/iP494NxUJ320AJLXnHSyB8JaxJ4f6fO5bmEkp7XW3wbqijqiG6ELALSBVLx1HYb5NgoG4cVO6A75JziTlAHJW7vWAzxpGSM9UB63YAzXkBGrUppP7oLq/2YzKlbC8PdZsIdy33bFMCPFVYUC4t3UIDlYWtyGLBhWGkPe0gKTNmM0o+XIzFVwF7FYG8X0yqvKr/eDcEXksTr5wOwe14Jb15QLIZOE584Fc4mpjr+ymcjCN8oIQYNFa1l+MZQp7AMZYECSvU4J1UldPK7ra7AqlOKV36/+TYCKBUc2fk/g2lnFCl+3F6BpJep4Bv3qNZlkwxufb5XMASYYNsufWAG8+xYlu060SRc7n+jMUIskhseTFtcQ+SFdI3emj5ile9tr53t1faCGpAsZ9LjZiafHTfQJeUXkG3AW5R7zjKm4D4L/0VtLhkOpCzTgt/M/YDfkt0L3oZnNQvYfxMnjqeGOrMQj/PULsqmdkiHqtlBAeto2HrEv/ZpFXpztTlU0v2LpynmWwQQhCSpTKeMfaPhR+QoUlpK/y3TEeUaz2G+HG2aypuOUQ/1xd1Qw2my6oAG8H8MiICthGW2NvVN/8kIEFjOOccXU2Bu/1XvQuFN9iEw/VvPwDzPsyAum4WRBBmBNiyWQtuKO3iJm7Oa7j/M7gW0y0BYSwPEX2puywlzOsBM1HKun1QefXmPPXQzAjHDaGfzZNvcLd0VHTjwr6xUtD9Gq06R4gRbpXogOS9ukQJqvkz3empP/+MEGcVaTu6mWUgB+xz/s6Yra14O7QJDPGZwSZ3iDPcpE3C0WxJWTgBrzQvVIl0Bxn94H7cuczi4T+3Uf/y8lWWax5bLwkqZVfP+gfT5ypgdudZVaOYg924I4hytfu2ghh9wMpWdPXPwvGJL9efsPGsYKI3SPNFbBCp2AjW25z25HZiAGzPI9C7g5mwVoGJX9i/qo9C9WaXWD1Q5jB95hNk3zNsKO65MJEq9bIhMpkW38A5WCNIK+iaHBfRDgFWnBUB8jGE3B2WEvym1AiBJXJZGQvjoe4IvUqPSgbLnESI8aPC6buMplcDp+HVS2Quhhf0Fn681ro44MLF3724skbCzn5qmud9m7o0ThrTC2IclJB1ei6cLsjI8F+lN/o8Xx4TfmWuy+4xVibeczk3wHJMz6l5JkyodQpmpk00aGY8if+/nHy5kliVIb5pzIRD9K3ORowK/Zlto0B2R1S6ACkeQH5qh2VWXtflBi2SjXKLgZ9tIPWF6+8tcX6Ww8jGq36QLYbidwhv6oGMtIQhOs1paDJ2E/2YYNRUo2QxIqYnBnCVhR8AmQqSFbOImkjSGXyaS5HVwmPMlywMpVcYxTVd2G7Gzlvp/4/IZsKnZ+PzBmJ0Y/to8Q=',
  PrivateKeyPassword: 'Sbct0077' // <-- IMPORTANTE: Pon la contraseña de tu .key aquí
});

const options = {
  hostname: 'api.facturama.mx',
  path: '/api-lite/csds',
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log('🚀 Iniciando carga de CSD a Facturama para RFC: PARI980727RWA...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n========================================`);
    console.log(`Estado: ${res.statusCode} ${res.statusMessage}`);
    console.log(`Respuesta:`);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data || '(Respuesta vacía)');
    }
    console.log(`========================================\n`);
    
    if (res.statusCode === 201 || res.statusCode === 200 || res.statusCode === 204) {
      console.log('✅ CSD cargado exitosamente.');
    } else {
      console.log('❌ Hubo un error al cargar el CSD.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.write(payload);
req.end();
