const users = [];

// Función para enviar un usuario al servidor
async function postUser(user) {
  try {
    const response = await fetch('http://localhost:3000/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Usuario ${user.nombre} creado:`, data);
  } catch (error) {
    console.error(`❌ Fallo al crear ${user.nombre}:`, error.message);
  }
}

// Generar usuarios y enviarlos uno por uno con un retraso
async function generateAndPostUsers() {
  for (let i = 1; i <= 100; i++) {
    const user = {
      nombre: `tomas${i}`,
      email: `tomas${i}@example.com`,
      password: "Hola123@",
    };

    users.push(user);
    console.log(`🔄 Enviando usuario ${i}/50: ${user.nombre}`);

    await postUser(user);
    await new Promise(resolve => setTimeout(resolve, 300)); // Retraso de 300ms entre peticiones
  }

  console.log('\n📦 Todos los usuarios generados:');
  console.log(JSON.stringify(users, null, 2));
}

// Ejecutar
generateAndPostUsers();