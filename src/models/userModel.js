import mongoose from "mongoose";

const datoSchema = new mongoose.Schema({
  nombre: { type: String },
  email: { type: String, unique: true },
  numeroCelular: {type: Number, unique: true},
  ubicacion: {type: String},
  verificacionCuenta: {type: Boolean, default: true},
  puntuacion: {type:Number},
  password: String,
  rol: { type: String, default: "cliente" },       // Ej: "admin", "usuario", etc.
  plan: { type: String, default: "gratuito" },      // Ej: "gratuito", "premium"
  estado: {type: Boolean, default: false},          //sesion activa o cerrada

});

// 'users' es el nombre de la colección
export const User = mongoose.model("users", datoSchema);
