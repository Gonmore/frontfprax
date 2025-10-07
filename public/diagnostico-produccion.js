// 🚀 SCRIPT DE DIAGNÓSTICO PARA URLs DE PRODUCCIÓN
// Ejecutar en la consola del navegador en producción para verificar configuración

console.log('🔍 ===== DIAGNÓSTICO DE CONFIGURACIÓN DE PRODUCCIÓN =====');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('  - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('  - NEXT_PUBLIC_WEBSOCKET_URL:', process.env.NEXT_PUBLIC_WEBSOCKET_URL);
console.log('  - NODE_ENV:', process.env.NODE_ENV);

// Verificar ubicación actual
console.log('🌐 Información del navegador:');
console.log('  - Origin:', window.location.origin);
console.log('  - Hostname:', window.location.hostname);
console.log('  - Protocol:', window.location.protocol);
console.log('  - Port:', window.location.port);

// Verificar conectividad
console.log('🔗 Probando conectividad:');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
              (process.env.NEXT_PUBLIC_API_URL ?
               process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, 'wss://') :
               'ws://localhost:5000');

// Test API connectivity
fetch(`${apiUrl}/health`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  console.log('✅ API Health Check:', response.status, response.ok ? 'OK' : 'ERROR');
  return response.text();
})
.then(text => console.log('   Response:', text.substring(0, 100) + '...'))
.catch(error => console.log('❌ API Health Check Error:', error.message));

// Test WebSocket connectivity (basic connection test)
try {
  const testWs = new WebSocket(`${wsUrl}/ws/notifications?token=test`);
  testWs.onopen = () => {
    console.log('✅ WebSocket Connection: OPEN');
    testWs.close();
  };
  testWs.onerror = (error) => {
    console.log('❌ WebSocket Connection: ERROR');
  };
  testWs.onclose = (event) => {
    if (event.code !== 1000) {
      console.log('⚠️  WebSocket Connection: CLOSED with code', event.code);
    }
  };
} catch (error) {
  console.log('❌ WebSocket Creation Error:', error.message);
}

console.log('🔍 ===== FIN DEL DIAGNÓSTICO =====');
console.log('💡 Si ves "localhost" en las URLs, configura las variables de entorno en Railway dashboard');