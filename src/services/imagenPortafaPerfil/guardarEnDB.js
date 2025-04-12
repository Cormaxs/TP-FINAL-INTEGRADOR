import { User } from "../../models/fotografoModel.js"


export async function guardarPerfilnDB(link, id) {
    try {
      // Buscar el usuario por ID
      const guardar = await User.findById(id);
  
      if (guardar) {
        // Asignar el link al campo fotos.perfil
        guardar.fotos.perfil = link;
  
        // Guardar los cambios
        await guardar.save();
  
        console.log("Imagen de perfil guardada correctamente.");
      } else {
        console.log("Usuario no encontrado.");
      }
    } catch (err) {
      console.error("Error al guardar la imagen de perfil:", err);
    }
  }

  export async function guardarPortadaDB(link, id) {
    try {
      // Buscar el usuario por ID
      const guardar = await User.findById(id);
  
      if (guardar) {
        // Asignar el link al campo fotos.perfil
        guardar.fotos.portada = link;
  
        // Guardar los cambios
        await guardar.save();
  
        console.log("Imagen de perfil guardada correctamente.");
      } else {
        console.log("Usuario no encontrado.");
      }
    } catch (err) {
      console.error("Error al guardar la imagen de perfil:", err);
    }
  }