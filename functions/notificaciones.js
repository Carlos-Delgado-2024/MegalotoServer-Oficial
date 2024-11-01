const { db, admin } = require('../config/firebase');

const ObtenerTokens = async (typeUser) => {
    try {
        const snapshot = await db.collection('users').get();
        const result = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.typeUser === typeUser) {
                if (data.tokenMesseger) {
                    result.push(data.tokenMesseger);
                }
            }
        });
        return result;

    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error; // Manejo de errores
    }
};

const sendNotificationToGroup = async (data) => {
    // Extraer title, body, image y url del objeto data
    const { title, body, image, url, groups } = data;

    await Promise.all(groups.map(async (grp) => {
        const tokens = await ObtenerTokens(grp);
        console.log(tokens.length);

        const promises = tokens.map((token) => {
            // Construir el mensaje de notificación
            const message = {
                notification: {
                    title: title || '', // Usar el title proporcionado o un string vacío
                    body: body || '', // Usar el body proporcionado o un string vacío
                    ...(image && { image }), // Incluir la imagen solo si existe
                },
                token: token,
                data: {
                    url: url || 'https://megaloto-express.web.app/', // Usar la URL proporcionada o la URL predeterminada
                }
            };

            return admin.messaging().send(message);
        });

        try {
            const responses = await Promise.all(promises); // Espera a que todas las promesas se resuelvan
            console.log('Successfully sent messages:', responses);
        } catch (error) {
            console.log('Error sending message:', error);
        }
    }));
};

module.exports = { sendNotificationToGroup };
