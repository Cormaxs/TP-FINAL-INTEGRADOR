import { buscadorSitioTodo} from "../services/datosPublicosServides.js"


export async function buscadorSitio(req, res){
  const filtrosBusqueda = {
    nombre: req.query.nombre , 
    ubicacion: req.query.ubicacion,
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


