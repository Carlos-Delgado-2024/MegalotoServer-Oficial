const { admin } = require('../config/firebase')

// Función para suspender (deshabilitar) una cuenta de usuario
const suspendUserAccount = async (uid) => {
    try {
        await admin.auth().updateUser(uid, { disabled: true });
        //console.log(`Usuario con UID ${uid} ha sido suspendido.`);
        return { success: true, message: 'Cuenta suspendida con éxito', uid:uid};
    } catch (error) {
        console.error('Error al suspender la cuenta:', error);
        return { success: false, message: error.message, uid:uid };
    }
};

const enableUserAccount = async (uid) => {
    try {
        await admin.auth().updateUser(uid, { disabled: false });
        console.log(`Usuario con UID ${uid} ha sido habilitado.`);
        return { success: true, message: 'Cuenta reactivada con éxito',uid:uid };
    } catch (error) {
        console.error('Error al habilitar la cuenta:', error);
        return { success: false, message: error.message, uid:uid };
    }
};

module.exports = {suspendUserAccount, enableUserAccount}