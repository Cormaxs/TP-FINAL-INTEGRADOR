# TP FINAL - Plataforma Web para Fotógrafos 📸  
**Nodo Tecnológico - Proyecto Integrador**

Este proyecto es una plataforma web donde los fotógrafos pueden subir su trabajo y los usuarios pueden contactarlos. Se desarrolló aplicando todo lo aprendido durante la cursada, utilizando la arquitectura **MVC**.

---

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

---

## 🌐 Recorrido de una solicitud típica 
**Cliente → app.js → routes → middlewares → controllers → services → models/db**


---

## 📁 Estructura de Rutas

### 1. `routes/crudUser.js`  
Ruta base: `/user`  
Maneja operaciones CRUD para usuarios.

| Método | Ruta               | Descripción                    |
|--------|--------------------|--------------------------------|
| POST   | `/register`        | Crear un nuevo usuario         |
| GET    | `/:id`             | Obtener un usuario por ID      |
| PUT    | `/modificar/:id`   | Actualizar un usuario por ID   |
| DELETE | `/eliminar/:id`    | Eliminar un usuario por ID     |

---

### 2. `routes/datosPublicos.js`  
Ruta base: `/publico`  
Contiene datos accesibles sin autenticación.

| Método | Ruta         | Descripción                                |
|--------|--------------|--------------------------------------------|
| GET    | `/usuarios`  | Listar usuarios con paginación (query `page` y `limit`) |

---

### 3. `routes/auth.js`  
Ruta base: `/auth`  
Maneja autenticación y control de sesiones.

| Método | Ruta       | Descripción                  |
|--------|------------|------------------------------|
| POST   | `/login`   | Iniciar sesión               |
| POST   | `/lagout`  | Cerrar sesión                |
| POST   | `/sesion`  | Verificar o renovar sesión   |

---

## ✅ Estado del Proyecto

✔ Arquitectura modular y clara  
✔ CRUD de usuarios funcional  
✔ Paginación para datos públicos  
✔ Autenticación implementada con rutas protegidas

---

## 🛠️ A Mejorar o Agregar (TODOs)

- Validaciones más robustas (por ejemplo, usando Joi o express-validator)  
- Subida de imágenes (por ejemplo, con Multer)  
- Panel de administración  
- Mejora del manejo de errores  
- Tests automatizados

---

## 🧾 Nota final

El código sigue el patrón MVC, con separación clara de responsabilidades. Este documento sirve como guía inicial para entender el flujo de la aplicación y facilitar futuras modificaciones o colaboraciones.



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