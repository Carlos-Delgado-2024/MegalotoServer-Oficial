// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Login } = require('./functions/login');
const listAllUsers = require('./functions/listAllUsers');
const { suspendUserAccount, enableUserAccount } = require('./functions/suspen-enable');
const { NewSorteo, eliminarSorteo, comprarNumeros, IniciarSorteo, AsignarFecha } = require('./functions/sorteos');
const { newCargaNequi, soliAprobada, eliminarRecargaNequi, soliCancelada, soliModificada } = require('./functions/saldo');
const { setAdminRole } = require('./functions/newAdmin')
const cron = require('node-cron');
const PORT = process.env.PORT || 5000



const app = express();
const server = http.createServer(app);
// Configuración de CORS para permitir solo ciertas URL
const io = new Server(server, {
    cors: {
      origin: ['https://megaloto-vfinal.web.app', 'http://localhost:3000'],  // URLs permitidas
      methods: ['GET', 'POST'],  // Métodos permitidos
    }
  });

  let count = 0;
// Cuando un cliente se conecta
io.on('connection', async(socket) => {
  count += 1
  console.log('Un cliente se ha conectado');
  console.log('clientes conectados', count);

  //////////////////////solo para prueba////////////////////////////
  // const idSorteo ='2r9Gq2yDM5AAHYr6lbWc'
  // IniciarSorteo(idSorteo)
  const ahora = new Date()
  console.log(ahora)
  //////////////////////manejo de cuenta////////////////////////////
  // Manejar autenticación con Google
  // socket.on('authToken', ({ token }) => {
  //   Login(token, socket, io);
  // }); 
  // socket.on('asigAdmin',(uid)=>{
  //   setAdminRole(uid)
  // })
  socket.on('newUser',(data)=>{
    Login(data, socket)
  })
  listAllUsers(socket)
  // Manejar suspensión de cuenta
  socket.on('suspen', async ({ id }) => {
    try {
      const response = await suspendUserAccount(id);
      socket.emit('ResponsSupen', response);
    } catch (error) {
      console.error('Error al suspender cuenta:', error);
      socket.emit('ErrorSupen', 'Error al suspender la cuenta');
    }
  });
  // Manejar habilitación de cuenta
  socket.on('enable', async ({ id }) => {
    try {
      const response = await enableUserAccount(id);
      socket.emit('ResponseEnable', response);
    } catch (error) {
      console.error('Error al habilitar cuenta:', error);
      socket.emit('ErrorEnable', 'Error al habilitar la cuenta');
    }
  });
  //solicitud de recarga de cuenta
  socket.on('newCargaCuenta', async (data) => {
    try {
      const response = await newCargaNequi(data);
      socket.emit('ReponseCargaCuenta', response);
      io.emit('NewRecargaCuenta')
    } catch (error) {
      console.error('Error en nueva carga Nequi:', error);
      socket.emit('ErrorCargaNequi', 'Error en nueva carga Nequi');
    }
  });
  //eliminar solicitud de recarga de cuenta
  socket.on('eliminarRecargaNequi', async (data) => {
    try {
      const response = await eliminarRecargaNequi(data);
      socket.emit('ReponseCargaCuenta', response);
    } catch (error) {
      console.error('Error al eliminar recarga Nequi:', error);
      socket.emit('ErrorEliminarRecargaNequi', 'Error al eliminar recarga Nequi');
    }
  });
  //cancelacion de la solicitud de recarga de cuenta por motivo
  socket.on('CancelRecargaCuenta', async (data) => {
    try {
      const response = await soliCancelada(data);
      socket.emit('ResponseCancelNequi', response);
    } catch (error) {
      console.error('Error al cancelar recarga Nequi:', error);
      socket.emit('ErrorCancelNequi', 'Error al cancelar recarga Nequi');
    }
  });
  //modificar monto de solicitud de recarga de cuenta 
  socket.on('modificarRecargaCuenta', async (data) => {
    try {
      const response = await soliModificada(data);
      socket.emit('ResponseModificarNequi', response);
    } catch (error) {
      console.error('Error al modificar recarga Nequi:', error);
      socket.emit('ErrorModificarNequi', 'Error al modificar recarga Nequi');
    }
  });
  //cargar saldo de cuenta con solicitud aprovada
  socket.on('aprobarRecargaCuenta', async (id) => {
    try {
      const response = await soliAprobada(id);
      //const users = await listAllUsers();
      io.emit('ResponseAprobarCuenta', response);
      // const users = await listAllUsers(socket)
      // io.emit('newSaldo',{users,result})
    } catch (error) {
      console.error('Error al aprobar recarga Nequi:', error);
      socket.emit('ErrorAprobarCuenta', 'Error al aprobar recarga Nequi');
    }
  });
  //////////////////////manejo de sorteo////////////////////////////
  // Crear nuevo sorteo
  socket.on('newSorteo', async (data) => {
    try {
      const result = await NewSorteo(data);
      socket.emit('ResponseSorteo', result.message);
    } catch (error) {
      console.error('Error al crear sorteo:', error);
      socket.emit('ErrorSorteo', 'Error al crear sorteo');
    }
  });
  // Eliminar sorteo
  socket.on('eliminarSorteo', async (id) => {
   
    try {
      const result = await eliminarSorteo(id);
      socket.emit('ResponseSorteo', result.message);
    } catch (error) {
      console.error('Error al eliminar sorteo:', error);
      socket.emit('ErrorEliminarSorteo', 'Error al eliminar sorteo');
    }
  });
  //comprar numeros
  socket.on('confirmarPago',async(data)=>{

    try {
      const result = await comprarNumeros(data)
      socket.emit('responsConfirmarPago',result)
      // const users = await listAllUsers(socket)
      // io.emit('newSaldoCarga',{users,result})
    }catch (error) {
      console.error('Error al comprar los numeros:', error);
      socket.emit('ErrorComprarNumeros', 'Error al eliminar sorteo');
    }
  })
  // Socket listener para 'iniciarSorteo'
socket.on('iniciarSorteo', async (data) => {
  console.log(`Fecha recibida para iniciar el sorteo: ${data.fecha}`);
  AsignarFecha(data)
  io.emit('fechaInicioSorteo',data.fecha)
  // Formato esperado: '2024-10-18T23:33'
  const fechaObjetivo = new Date(data.fecha);
  fechaObjetivo.setHours(fechaObjetivo.getHours() + 5);
  console.log('fecha asignada del servidor',fechaObjetivo)
  if (isNaN(fechaObjetivo)) {
    console.log('Formato de fecha inválido');
    return;
  }

  const minutos = fechaObjetivo.getMinutes();
  const horas = fechaObjetivo.getHours();
  const dia = fechaObjetivo.getDate();
  const mes = fechaObjetivo.getMonth() + 1; // Los meses en JS van de 0 a 11
  
  console.log(`Programando sorteo para: ${fechaObjetivo}`);

  // Programar el cron para la fecha objetivo
  const tarea = cron.schedule(`${minutos} ${horas} ${dia} ${mes} *`, async () => {
    console.log('¡Ejecutando sorteo!');

    try {
      const ganador = await IniciarSorteo(data.id); // Ejecutar la función del sorteo
      io.emit('InicioSorteo',ganador)
      console.log(`Ganador del sorteo con ID ${data.id}: ${ganador}`);
    } catch (error) {
      console.error('Error ejecutando el sorteo:', error);
    }

    tarea.stop(); // Detener la tarea cron después de ejecutar
  });
});

//////////////////////manejo de cierre////////////////////////////
    // Cuando el cliente se desconecta, limpia el intervalo
  socket.on('disconnect', () => {
    // clearInterval(intervalId);
    count -= 1
    console.log('Cliente desconectado');
    console.log('clientes conectados', count);
  });
});

// Iniciar el servidor en el puerto 3000
server.listen(PORT, () => {
  console.log('Servidor escuchando en el puerto: ',PORT);
});
