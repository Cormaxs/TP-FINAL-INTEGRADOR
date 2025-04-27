import mongoose from "mongoose";

const datoSchema = new mongoose.Schema({
  nombre: { type: String, require: true },
  email: { type: String, unique: true, require: true},
  fotos : {
    perfil: {type: String, default : "img"},
    portada: {type: String, default: "img"}
  },
  numeroCelular: {type: Number, default: ""},
  ubicacion: {type: String,  default: ""},
  cuentaVerificada: {type: Boolean, default: false},
  puntuacion: {type:Number,  default: "0"},
  password:{ type: String, requiere: true},
  rol: { type: String, default: "cliente", require: true },       // Ej: "admin", "usuario", etc.
  plan: { type: String, default: "gratuito" },      // Ej: "gratuito", "premium"
  estado: {type: Boolean, default: false},          //sesion activa o cerrada
  termininos: {type:Boolean, require: true},
  descripcion: {type: String }, 

  //array de categorias que tiene el usuario
  categorias: [{
    categoria: { type: String},
    imagenes: [{ type: String }],
    precio: {type: Number}
  }]
  

});

// 'users' es el nombre de la colección
export const User = mongoose.model("users", datoSchema);


//el modelo usuario va a tener relacionado 3 esquemas 
// las fotos por categoria de trabajo
//la reseñas de los usuarios