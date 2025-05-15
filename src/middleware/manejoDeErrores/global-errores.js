


// atrapa y muestra los errores que se produzcan en la aplicacion
export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    const details = err.details || null;

    res.status(status).json({
      error: message,
      ...(details && { details })
    });
  }
  