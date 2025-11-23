
// utils/log_errores.ts

export interface ErrorRegistro {
  timestamp: string;
  contexto: string; // Ej: "ProjectTableView", "useProjectData"
  idReferencia: string; // Ej: ID de la vivienda "B1-0-A"
  parametroBuscado: string; // Ej: "REAL I+EXT POND 50%"
  mensaje: string;
}

// Almacén en memoria de los errores (se reinicia al recargar la página)
const registroDeErrores: ErrorRegistro[] = [];

// Set para evitar spam masivo en consola de la misma columna fallando 100 veces
const erroresReportados = new Set<string>();

export const registrarError = (contexto: string, idRef: string, parametro: string, mensaje: string) => {
  const ahora = new Date().toISOString();
  const claveUnica = `${contexto}-${parametro}`; // Agrupamos por columna para no saturar, pero guardamos el detalle

  const nuevoError: ErrorRegistro = {
    timestamp: ahora,
    contexto,
    idReferencia: idRef,
    parametroBuscado: parametro,
    mensaje
  };

  registroDeErrores.push(nuevoError);

  // Solo imprimimos en consola si es un tipo de error nuevo para esta sesión/columna
  // para no ralentizar el navegador si hay 500 filas fallando en lo mismo.
  if (!erroresReportados.has(claveUnica)) {
    console.error(`[${ahora}] [${contexto}] Error en ${idRef}: ${mensaje}`);
    erroresReportados.add(claveUnica);
  }
};

export const obtenerErrores = () => registroDeErrores;

export const descargarLogErrores = () => {
  const contenido = registroDeErrores.map(e => 
    `[${e.timestamp}] | CTX: ${e.contexto} | REF: ${e.idReferencia} | PARAM: ${e.parametroBuscado} | MSG: ${e.mensaje}`
  ).join('\n');

  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `log_errores_${new Date().toISOString()}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
};
