import express from "express"; // Importamos express
import {userRoutes} from "./src/routes/autenticacion/crudUser.js"; 
import { publico } from "./src/routes/publicas/datosPublicos.js";
import {autenticaciones} from "./src/routes/autenticacion/auth.js";
import {fotos} from "./src/routes/manejoImagenes/subirFotos.js";
import { connectDB} from "./src/db/db.js"
import { errorHandler } from "./src/middleware/manejoDeErrores/global-errores.js";
import dotenv from 'dotenv';
import cors from "cors";


dotenv.config();
const app = express(); 
const PORT = process.env.PORT || 3000; 
app.use(express.json({limit: '500mb'})); 




app.use(cors({
  origin: "*"
}));

app.get("/", (req, res) =>{
  res.send("las rutas estan desde el frontend /publico/buscador")
})

app.use("/user", userRoutes);
app.use("/publico", publico);
app.use("/auth", autenticaciones)
app.use("/archivos", fotos);

//permite acceder a las imágenes desde el navegador
app.use('/imagenes', express.static('imagenes'));

app.use(errorHandler)//agarra errores del coleccion de errores
connectDB();


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}/publico/buscador`);
});
