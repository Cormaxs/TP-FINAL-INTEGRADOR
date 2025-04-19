import jwt from "jsonwebtoken";



//verifica el token y si es admin, en caso de que no se admin debe coincidir el id de querry con jwt
export function verificarToken(req, res, next) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers.authorization;
  const idPasado = req.params.id;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado o mal formado" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { id, rol } = decoded;
   
    if (id === idPasado || rol === 'admin') {
      req.usuario = decoded;
      return next(); 
    }
    return res.status(403).json({ 
      message: "No tienes permisos para acceder a este recurso" 
    });
  } catch (err) {
    return res.status(403).json({ 
      mensaje: "Token inválido o expirado"
    });
  }
}