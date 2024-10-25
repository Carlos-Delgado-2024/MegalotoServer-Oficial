const {db} = require('../config/firebase');

const BuscarCollection = async(CollectionName)=>{
    try{
        const collectionRef = db.collection(CollectionName)
        const snapshot = await collectionRef.get()
        if (snapshot.empty) {
            return res.status(404).send('No documents found.');
        }

        let results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });
        return results
    }catch (error) {
        console.error('Error fetching collection:', error);
        return ('Error fetching collection:', error);
    }

}
const listenChanges = (collectionName, io) => {
    const collectionRef = db.collection(collectionName);
    
    // Escuchar cambios en la colección
    collectionRef.onSnapshot( snapshot => {
      let changes = [];
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          changes.push({ id: change.doc.id, ...change.doc.data() });
        } else if (change.type === 'modified') {
            const x =await BuscarCollection(collectionName)
            await io.emit('collectionChanged', { collection: collectionName, x })
          //changes.push({ id: change.doc.id, ...change.doc.data() });
        } else if (change.type === 'removed') {
          changes.push({ id: change.doc.id });
        }
      });
      
      // Emitir cambios a todos los clientes conectados
      if (changes.length > 0) {
        io.emit('collectionChanged', { collection: collectionName, changes });
      }
    });
  };
module.exports = {
    BuscarCollection,
    listenChanges
}