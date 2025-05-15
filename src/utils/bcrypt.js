import bcrypt from "bcrypt";
import { coleccionErrores } from "../middleware/manejoDeErrores/coleccion-errores.js";

//devuelve hash
export async function encriptarPassword(password){
   try{ const saltRounds = 12; // entre 10 y 12 es lo común
    const hash = await bcrypt.hash(password, saltRounds);
      return hash;
      }catch(err){
          throw coleccionErrores.failHash(err)
        }
}


export async function compararPassword(password, hash) {
    try {const value =  await bcrypt.compare(password, hash);
    if(value){
      return value;
    }return value;
    } catch (error) {
      throw coleccionErrores.compareHashError(error)
    }
  }
  