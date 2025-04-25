
export function sanitizarDatos(req, res, next) {
    try {
      // Normalizamos la categoría: sin espacios alrededor y en minúsculas
      if (req.params.categoria) {
        req.params.categoria = req.params.categoria.trim().toLowerCase();
      }
      next(); // sigue con el siguiente middleware o controlador
    } catch (err) {
      res.status(500).json({ mensaje: "Error al procesar los datos" });
    }
  }
  


 export  const noUser = (req, res, next) => {
    const { rol } = req.usuario;
    if (rol === "photographer" || rol === "admin") {
        next(); // Permite continuar al siguiente middleware (subirImagenCategoria)
    } else {
        return res.status(403).json({ 
            success: false, 
            error: "Acceso denegado. Solo fotógrafos o administradores pueden subir imágenes." 
        });
    }
};