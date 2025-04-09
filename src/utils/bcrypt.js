import bcrypt from "bcrypt";


//devuelve hash
export async function encriptarPassword(password){
    const saltRounds = 12; // entre 10 y 12 es lo común
    const hash = await bcrypt.hash(password, saltRounds);
        return hash;
}


export async function compararPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error("Error al comparar password:", error.message);
      return false;
    }
  }
  