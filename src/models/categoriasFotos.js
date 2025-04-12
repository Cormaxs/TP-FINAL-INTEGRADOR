import mongoose from "mongoose";



const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  imagen: { type: String, required: true }, // link de imagen
});

export const Categorias = mongoose.model("Categoria", categoriaSchema);
