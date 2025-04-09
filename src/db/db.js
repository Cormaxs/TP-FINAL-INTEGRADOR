import mongoose from "mongoose";



export const connectDB = async () => {
  const uri = process.env.URI;
  try {
    await mongoose.connect(uri, {
      dbName: "TrabajoIntegrador",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
  }
};
