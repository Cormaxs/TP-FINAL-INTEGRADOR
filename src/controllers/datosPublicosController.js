import { buscadorSitioTodo} from "../services/datosPublicosServides.js"


export async function buscadorSitio(req, res){
  const filtrosBusqueda = {
    nombre: req.query.nombre , 
    ubicacion: req.query.ubicacion,
    page: parseInt(req.query.page) ||  1,
    limit: parseInt(req.query.limit) ||  10,
  };
  try{
      const resultados = await buscadorSitioTodo(filtrosBusqueda)
      res.status(200).send(resultados)
  }catch(err){
    console.error(`error en datos publicos: `, err);
  }
}


