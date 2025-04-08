import mongoose from "mongoose";

const datoSchema = new mongoose.Schema({
  nombre: { type: String },  
  email: {type: String, unique: true},
  password: String,
});

// 'datos' es el nombre de la colección
export const User = mongoose.model("datos", datoSchema);
