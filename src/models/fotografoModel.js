import mongoose from "mongoose";

const datoSchema = new mongoose.Schema({
  nombre: { type: String },
  email: { type: String, unique: true },
  fotos : {
    perfil: {type: String},
    portada: {type: String}
  },
  numeroCelular: {type: Number, unique: true},
  ubicacion: {type: String},
  cuentaVerificada: {type: Boolean, default: false},
  puntuacion: {type:Number},
  password: String,
  rol: { type: String, default: "cliente" },       // Ej: "admin", "usuario", etc.
  plan: { type: String, default: "gratuito" },      // Ej: "gratuito", "premium"
  estado: {type: Boolean, default: false},          //sesion activa o cerrada


});

// 'users' es el nombre de la colección
export const User = mongoose.model("users", datoSchema);


//el modelo usuario va a tener relacionado 3 esquemas 
// las fotos por categoria de trabajo
//la reseñas de los usuarios