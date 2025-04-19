# TP FINAL - Plataforma Web para Fotógrafos 📸  
**Nodo Tecnológico - Proyecto Integrador - FOTOGRAFOS**

Este proyecto es una plataforma web donde los fotógrafos pueden subir su trabajo y los usuarios pueden contactarlos. Se desarrolló aplicando todo lo aprendido durante la cursada, utilizando la arquitectura **MVC**.

---

## INSTALACION 

1. **`Clonar el repositorio:`**
```bash
git clone [https://github.com/Cormaxs/TP-FINAL-INTEGRADOR.git]
```

2. **`Instala las dependencias:`**
```bash
npm install
```

3. **`Inicia el servidor:`**
```bash
npm run dev
```



## 🧠 Arquitectura General - Patrón MVC

1. **`app.js`**  
   Punto de entrada de la aplicación. Configura el servidor, middlewares generales y monta las rutas principales.

2. **`routes/`**  
   Define las rutas de la API y aplica middlewares específicos antes de llamar a los controladores.

3. **`controllers/`**  
   Implementa la lógica de negocio, procesamiento y validación de datos. Se comunica con los servicios.

4. **`services/`**  
   Encapsula la lógica de acceso a datos. Interactúa con la base de datos utilizando los modelos definidos.

5. **`models/`**  
   Define los esquemas y modelos de la base de datos, por ejemplo: `User` en `models/userModel.js`.

6. **`middleware/`**
   Verifica los datos requeridos para seguir la ruta

7. **`db/`**
   Unica coneccion a la bae de datos

8. **`utils/`**
   Recursos generales como JWT, customErrors, etc

---

## 🌐 Recorrido de una solicitud típica 
**Cliente → app.js → routes → middlewares → controllers → services → models/db**


---

## 📁 Estructura de Rutas

### 1. `routes/autenticacion/crudUser.js`  
Ruta base: `/user`  
Maneja operaciones CRUD para usuarios.

| Método | Ruta               | Descripción                    |
|--------|--------------------|--------------------------------|
| POST   | `/register`        | Crear un nuevo usuario         |
| GET    | `/:id`             | Obtener un usuario por ID      |
| PUT    | `/modificar/:id`   | Actualizar un usuario por ID   |
| DELETE | `/eliminar/:id`    | Eliminar un usuario por ID     |

---

### 2. `routes/publicas/datosPublicos.js`  
Ruta base: `/publico`  
Contiene datos accesibles sin autenticación.

| Método | Ruta         | Descripción                                |
|--------|--------------|--------------------------------------------|
| GET    | `/buscador`  | Listar usuarios con paginación (query `page`, `limit`, `nombre`, `ubicacion`, `rol`) |

---

### 3. `routes/autenticacion/auth.js`  
Ruta base: `/auth`  
Maneja autenticación y control de sesiones.

| Método | Ruta       | Descripción                  |
|--------|------------|------------------------------|
| POST   | `/login`   | Iniciar sesión               |
| POST   | `/lagout/:id`  | Cerrar sesión                |
| POST   | `/sesion/:id`  | Verificar o renovar sesión   |
| GET    | `/correo/:id`  | Verificar cuenta desde el correo |
| POST   | `/recuperarPassword` | Envia link de recuperacion al correo | 
| POST   | `/actualizarPassword` | Cambia la contraseña |

---



### 4. `routes/manejoImagenes/subirFotos.js`  
Ruta base: `/archivos`  
Maneja la subida de fotos y mas adelante archivos de otro tipo.

| Método | Ruta       | Descripción                  |
|--------|------------|------------------------------|
| POST   | `/:tipo/:id`   | Sube img de perfil y portada |
| POST   | `/categorias/:categoria/:id`  | sube img a categoria distintas categorias |
| DELETE   | `/categorias/:categoria/:id/:imagen`  | Elimina img especifica |
| DELETE   | `/categorias/:categoria/:id`  | Elimina una categoria especifica |

---

## ✅ Estado del Proyecto

✔ Arquitectura modular y clara  
✔ CRUD de usuarios funcional  
✔ Paginación para datos públicos  
✔ Autenticación implementada con rutas protegidas
✔ Subida de imagenes Perfil - Portada
✔ Creacion de categorias y subida de imagenes
✔ Verificacion por correo

---

# formato de errores
## los mensajes de error deben tener minimo el codigo de error y el mensaje
```bash
{
  "ok": false,
  "error": {
    "code": 400,
    "message": "El campo 'email' es obligatorio.",
    "details": [
      {
        "field": "email",
        "issue": "Faltante"
      }
    ]
  }
}
```

---

# EJEMPLOS DE USOS - ENDPOINTS 


### 1. `routes/autenticacion/crudUser.js`  

**POST**
```bash
   /user/register
```
Lo minimo necesario para crear un usuario es:
 ```bash
   {
      "email": "ejemplo@ejemplo.com",
      "password": "Contraseña123@",
      "rol": "client - photographer - admin"
   }
```

---

**GET**
para obtener el usuario por su id, cualquiera puede obtenerlo
```bash
   /user/:id
```

---

**PUT**
Modifica los datos por id, si mandamos datos vacios el middleware los filtra y solo actualiza los que no estan vacios
```bash
   /user/modificar/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**DELETE**
Elimina usuario, solo el mismo usuario o el admin puede eliminarlo.
Al borrar el usuario, todas las fotos y datos del mismo desaparecen
```bash
   /user/eliminar/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

### 2. `routes/publicas/datosPublicos.js`  
**GET**
Busca usuarios por filtros, si no se ponen filtros trae todos, usando paginacion para traer solo 10 de la pagina 1, si no paso algun parametro, simplemente lo ignora y busca coincidencias de los demas, ademas ignora datos como el correo y contraseña
```bash
   /publico/buscador?nombre=ejemplo&ubicacion=ninguna&rol=client&page=2&limit=10
```

---

### 3. `routes/autenticacion/auth.js`  

**POST**
   Inicia sesion
```bash
   /auth/login
```
solo requiere email y contraseña desde el body

 ```bash
   {
      "email": "ejemplo@ejemplo.com",
      "password": "Contraseña123@"
   }
```

---

**POST**
  Cierra sesion de la cuenta especifica
```bash
   /auth/lagout/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**POST**
  Verifica si la sesion esta iniciada, se pone true o false en db
```bash
   /auth/sesion/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**GET**
  Verificacion desde el gmail, cambia el estado de cuentaverificada a true y devuelve cuenta verificada
```bash
   /auth/correo/:id
```

---

**POST**
  Pasando el correo del usuario en el body, envia un correo que lo lleva a un formulario para cambiar la contraseña
```bash
   /auth/recuperarPassword
```

---

**POST**
  Recibe los datos del formulario de recuperar contraseña, requiere el email del usuario y la nueva contraseña
```bash
   /auth/actualizarPassword
```

---

### 4. `routes/manejoImagenes/subirFotos.js` 

**POST**
 Sube la foto de perfil o portada (de a 1), en `tipo` : `perfil o portada`, en el body debemos pasarla como form-data y en `key` : `imagen`
```bash
   /archivos/:tipo/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**POST**
 Sube las imagenes a la categoria determinada, debo pasar `:categoria` : `bodas o la que gustes`, se pueden subir 5 maximas por categorias y no permite categorias repetidas, solo pueden usarlas los fotografos y admin
```bash
   /archivos/categorias/:categoria/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**POST**
 Sube las imagenes a la categoria determinada, debo pasar `:categoria` : `bodas o la que gustes`, se pueden subir 5 maximas por categorias y no permite categorias repetidas
```bash
   /archivos/categorias/:categoria/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**DELETE**
Elimina una imagen especifica de la categoria, en `:imagen` : `nombre-imagen.webp`
```bash
   /archivos/categorias/:categoria/:id/:imagen
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---

**DELETE**
Elimina una categoria especifica de las categorias del usaurio, en `:categoria` : `nombre-categoria`
```bash
   /archivos/categorias/categorias/:categoria/:id
```
**REQUERIMIENTOS**
✔ **pasar Bearer por body `key : Authorization`**

---


## 🛠 Tecnologías Utilizadas

### **Backend (Dependencias)**

| Tecnología           | Versión       | Propósito                              |
|----------------------|---------------|----------------------------------------|
| [Node.js](#)         | `18.x+`       | Entorno de ejecución JavaScript        |
| [Express](#)         | `^5.1.0`      | Framework para el servidor web         |
| [Mongoose](#)        | `^8.13.2`     | ODM para MongoDB                       |
| [JSON Web Token](#)  | `^9.0.2`      | Autenticación vía JWT                  |
| [Bcrypt](#)          | `^5.1.1`      | Encriptación de contraseñas            |
| [CORS](#)            | `^2.8.5`      | Manejo de políticas CORS               |
| [Dotenv](#)          | `^16.4.7`     | Gestión de variables de entorno        |
| [Express Validator](#)| `^7.2.1`      | Validación de datos en endpoints       |
| [Multer](#)          | `^1.4.5-lts.2`| Manejo de uploads de archivos          |
| [Nodemailer](#)      | `^6.10.1`     | Envío de emails                        |
| [fs-extra](#)        | `^11.3.0`     | Mejoras al módulo `fs` de Node         |


---

## .ENV VARIABLES

```bash
#para la encriptacion y jwt
SECRET_KEY=
#coneccion a mongodb
URI=
#puerto en que va a correr
PORT=3000
#donde esta desplegado el backend
BASE_URL=
#roles admitidos
ROLES=['client', 'photographer', 'admin']


#para usar con nodemailer
CORREO=
#contraseña comun de acceso
PASSWORDCORREO=
#servicio smtps recomendado para correos seguros 465
SERVICE_MAIL=
```
