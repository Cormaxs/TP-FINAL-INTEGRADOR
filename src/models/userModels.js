import mongoose from "mongoose";

const datoSchema = new mongoose.Schema({
  nombre: { type: String },
  email: { type: String, unique: true },
  password: String,
  rol: { type: String, default: "cliente" },       // Ej: "admin", "usuario", etc.
  activado: { type: Boolean, default: true },       // Activo o no
  plan: { type: String, default: "gratuito" },      // Ej: "gratuito", "premium"
});

// 'users' es el nombre de la colección
export const User = mongoose.model("users", datoSchema);
