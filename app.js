import express from "express"; // Importamos express
import {userRoutes} from "./src/routes/crudUser.js"; // Importamos las rutas (¡no te olvides la extensión .js si estás usando ESModules!)
import { publico } from "./src/routes/datosPublicos.js";
import {autenticaciones} from "./src/routes/auth.js";
import {fotos} from "./src/routes/manejoImagenes/subirFotos.js";
import { connectDB} from "./src/db/db.js"
import dotenv from 'dotenv';
import cors from "cors";


dotenv.config();
const app = express(); 
const PORT = process.env.PORT || 3000; 
app.use(express.json()); // Esto permite leer JSON en las rutas POST



app.use(cors());
app.use(cors({
  origin: "*"// frontend
}));
app.use("/user", userRoutes);
app.use("/publico", publico);
app.use("/auth", autenticaciones)

app.use("/archivos", fotos);
// Esto permite acceder a las imágenes desde el navegador
app.use('/uploads', express.static('uploads'));
connectDB();




// Escuchamos el puerto
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}/publico/buscador`);
});
