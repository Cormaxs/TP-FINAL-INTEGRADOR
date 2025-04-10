import express from "express"; // Importamos express
import {userRoutes} from "./src/routes/crudUser.js"; // Importamos las rutas (¡no te olvides la extensión .js si estás usando ESModules!)
import { cuenta } from "./src/routes/cuenta.js";
import { connectDB} from "./src/db/db.js"
import dotenv from 'dotenv';


dotenv.config();
const app = express(); // Creamos una instancia de la app
const PORT = 3000; // Puerto donde se va a levantar el servidor
app.use(express.json()); // Esto permite leer JSON en las rutas POST




app.use("/user", userRoutes);
app.use("/cuenta", cuenta);
connectDB();

// Escuchamos el puerto
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
