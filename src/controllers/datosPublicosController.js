import { traerTodosusuarios, buscadorSitioTodo} from "../services/datosPublicosServides.js"






//usa paginacion para traer de a pocos 10 usuarios(db poco potente)
export async function traerTodosUsuarios(req, res) {
  try {
    const page = parseInt(req.query.page) || 1; //por defecto pagina 1
    const limit = parseInt(req.query.limit) || 10; // por defecto 10 resultados

    const resultado = await traerTodosusuarios(page, limit);
    res.json(resultado); // ✅ aquí usamos res.json correctamente
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener los usuarios" });
  }
}


export async function buscadorSitio(req, res){
  const filtrosBusqueda = { //le paso un array y pongo por defecto para que no de error
    name: req.query.name || "usuario", 
    place: req.query.place ||  "catamarca",
    page: req.query.page ||  1,
    limit: req.query.limit ||  10,
  };
  try{
      const resultados = await buscadorSitioTodo(filtrosBusqueda)
    
      res.send(resultados)
  }catch(err){
    console.error(`error en datospublicos: `, err);
  }
}


