import jwt from "jsonwebtoken";



export function verificarToken(req, res, next) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado o mal formado" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY); //  Valida firma y expiración
    req.usuario = decoded; // Guarda datos útiles en el request
    //console.log(req.usuario)
    next(); // Sigue al siguiente middleware o controlador
  } catch (err) {
    return res.status(403).json({ mensaje: "Token inválido o expirado", err });
  }
}


export function verificarRol(rolesRequeridos = []) {
  return (req, res, next) => {
      const { rol, id} = req.usuario;
      // Verificar si el rol del usuario está en los roles requeridos y si es el mismo id del jwt y el pasado por querry
      if (!rolesRequeridos.includes(rol) && id == req.params.id) {
          return res.status(403).json({ 
              message: `Acceso denegado. Rol ${rol} no tiene permisos`,
              rolesPermitidos: rolesRequeridos
          });
      }
      
      next();
  };
}