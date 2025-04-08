import mongoose from "mongoose";

const uri = "mongodb://admin:secure_password@45.236.128.209:27017/?authSource=admin";

export const connectDB = async () => {
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
