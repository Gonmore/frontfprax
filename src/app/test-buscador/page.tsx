'use client';

export default function TestBuscador() {
  console.log('🚨 COMPONENTE DE PRUEBA CARGADO - BUSCADOR');
  console.log('🚨 Timestamp:', Date.now());
  console.log('🚨 Si ves estos logs, el componente se está ejecutando');

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffebee', minHeight: '100vh', border: '2px solid red' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>🚨 DIAGNÓSTICO: Componente Funciona</h1>
      <p style={{ fontSize: '18px', margin: '10px 0' }}>
        ✅ Si ves este mensaje, el componente React se está renderizando correctamente.
      </p>
      <p>Timestamp: {Date.now()}</p>
      <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'No navigator'}</p>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ color: 'green' }}>✅ Backend Funciona Correctamente</h2>
        <p>El problema está solo en el componente original de búsqueda inteligente.</p>
        <p>Usa el script de prueba: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px' }}>test-profamily-filters.mjs</code></p>

        <h3>Para arreglar el frontend:</h3>
        <ul>
          <li>Verifica errores de TypeScript: <code>npm run build</code></li>
          <li>Revisa las importaciones de componentes UI</li>
          <li>Verifica que estés autenticado como empresa</li>
        </ul>
      </div>
    </div>
  );
}