import jwt from "jsonwebtoken";



export function verificarToken(req, res, next) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado o mal formado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY); //  Valida firma y expiración
    req.usuario = decoded; // Guarda datos útiles en el request
    next(); // Sigue al siguiente middleware o controlador
  } catch (err) {
    return res.status(403).json({ mensaje: "Token inválido o expirado", err });
  }
}