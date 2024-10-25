const { admin } = require('../config/firebase')

// Función para establecer un usuario como administrador
const setAdminRole = async (uid) => {
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log(`Se ha asignado el rol de administrador al usuario ${uid}`);
    } catch (error) {
      console.error('Error al establecer el rol de administrador:', error);
    }
  };
module.exports = {setAdminRole}