import jwt from "jsonwebtoken";


export async function crearToken(usuario) {
  const SECRET_KEY = process.env.SECRET_KEY;
  console.log("🔐 SECRET_KEY:", SECRET_KEY);

  return jwt.sign(
    { id: usuario._id, email: usuario.email },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
}

