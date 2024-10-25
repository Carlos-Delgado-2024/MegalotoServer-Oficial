const { admin } = require('../config/firebase');  // Asegúrate de que admin esté configurado correctamente
const { setSaldoChaim } = require('./saldo');    // Asumiendo que tienes otras funcionalidades
const listAllUsers = require('./listAllUsers');  // Asumiendo que tienes otras funcionalidades

const Login = async (userData,socket) => {
    try {
        const { uid, nombre, cc, correo, tel, nequi, typeUser, saldo, data } = userData;
        
        // Crear el nuevo usuario en Firestore usando el UID como identificación del documento
        const db = admin.firestore();
        // Crear el documento en la colección 'users'
        await db.collection('users').doc(uid).set({
            data,
            nombre: nombre,  
            cc: cc,          
            correo: correo,  
            tel: tel,        
            nequi: nequi,    
            typeUser: typeUser,  
            saldo: saldo      
        });

        console.log(`Usuario con UID: ${uid} creado exitosamente en la base de datos.`);

        // Emitir una respuesta de éxito al cliente (opcional)
        socket.emit('authResponse', { success: true, message: 'Usuario registrado correctamente' });

    } catch (error) {
        console.error('Error al crear el usuario en Firestore:', error);
        socket.emit('authResponse', { success: false, message: error.message });
    }
};

module.exports = { Login };
