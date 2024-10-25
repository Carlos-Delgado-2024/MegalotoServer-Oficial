const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON)
console.log(serviceAccount)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://megaloto-v2.firebaseio.com'
});

const db = admin.firestore();

module.exports = { admin, db };
