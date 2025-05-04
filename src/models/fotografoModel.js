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
  rol: { type: String, default: "cliente", require: true },       
  plan: { type: String, default: "gratuito" },      
  estado: {type: Boolean, default: false},          //sesion activa o cerrada
  termininos: {type:Boolean, require: true},
  descripcion: {type: String }, 

  //array de categorias que tiene el usuario
  categorias: [{
    categoria: { type: String},
    imagenes: [{ type: String }],
    precio: {type: Number}
  }]
  

},{
  timestamps: true
});


export const User = mongoose.model("users", datoSchema);

