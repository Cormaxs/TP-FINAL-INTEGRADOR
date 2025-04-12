import { User } from "../../models/fotografoModel.js"

//guarda img perfil - portada en DB
  export const guardarEnDB = async (link, id, tipo) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Actualiza el campo correspondiente dinámicamente
        usuario.fotos[tipo] = link;
        await usuario.save();
        
        return true;
    } catch (error) {
        console.error(`Error al guardar imagen de ${tipo}:`, error);
        throw error;
    }
};