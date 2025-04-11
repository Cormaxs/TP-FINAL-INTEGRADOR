import bcrypt from "bcrypt";
import {CustomError} from "./crearError.js";

//devuelve hash
export async function encriptarPassword(password){
   try{ const saltRounds = 12; // entre 10 y 12 es lo común
    const hash = await bcrypt.hash(password, saltRounds);
      return hash;
      }catch(err){
          throw new CustomError(500, "no se pudo hashear")
        }
}


export async function compararPassword(password, hash) {
    try {const value =  await bcrypt.compare(password, hash);
    if(value){
      return value;
    }return value;
    } catch (error) {
      console.error("Error al comparar password:", error.message);
      throw new CustomError(500, "error en la comparacion del hash")
    }
  }
  