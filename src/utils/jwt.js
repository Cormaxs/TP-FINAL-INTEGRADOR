import jwt from "jsonwebtoken";


export async function crearToken(usuario) {
  const SECRET_KEY = process.env.SECRET_KEY;
  return jwt.sign(
    { id: usuario._id, 
      rol: usuario.rol, 
      estado: usuario.estado 
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
}

