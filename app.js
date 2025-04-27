import express from "express"; // Importamos express
import {userRoutes} from "./src/routes/autenticacion/crudUser.js"; // Importamos las rutas (¡no te olvides la extensión .js si estás usando ESModules!)
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
app.use(express.json({limit: '100mb'})); // Esto permite leer JSON en las rutas POST



app.use(cors());
app.use(cors({
  origin: "*"// frontend
}));
app.use("/user", userRoutes);
app.use("/publico", publico);
app.use("/auth", autenticaciones)
app.use("/archivos", fotos);

// Esto permite acceder a las imágenes desde el navegador
app.use('/imagenes', express.static('imagenes'));

app.use(errorHandler)//agarra errores del coleccion de errores
connectDB();




// Escuchamos el puerto
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}/publico/buscador`);
});
