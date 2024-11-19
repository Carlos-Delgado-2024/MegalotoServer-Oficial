const { admin } = require('../config/firebase')
const db = admin.firestore()

const NewSorteo = async(sorteoData)=>{
    //console.log(sorteoData)
    const arrayPuesto = []
    for(let i = 0; i<=sorteoData.formData.puestos-1; i++){
        const numero = i.toString().padStart(sorteoData.formData.puestos.toString().length-1,'0')
        arrayPuesto.push({[numero]:''})
    }
    try{
        // Guarda el documento con un ID automático
        const docData = {
          estado: 'Participando',
          premio: sorteoData.formData.premio,
          valor: sorteoData.formData.valor,
          puestos: sorteoData.formData.puestos,
          urlImg: sorteoData.fileUrl,
          typeLot: sorteoData.formData.typeLot,
          arryPuestos: arrayPuesto // Ejemplo: Array de puestos
      };
      
      // Verificamos si el tipo de sorteo es 'Express' para añadir 'premioBase'
      if (sorteoData.formData.typeLot === 'Express') {
          docData.premioBase = sorteoData.formData.premioBase;
      }
      
      const docRef = await db.collection('sorteos').add(docData);

        //console.log('Sorteo guardado con ID:', docRef.id);
        return { success: true, message: 'Sorteo guardado correctamente', id: docRef.id };
    
    }catch (error) {
        //console.error('Error al guardar el sorteo:', error);
        return { success: false, message: error.message };
    }
}
const eliminarSorteo = async (idSorteo) => {
    try {
        // Eliminar el documento de la colección 'sorteos' con el ID especificado
        await db.collection('sorteos').doc(idSorteo).delete();
        //console.log(`Sorteo con ID ${idSorteo} eliminado correctamente.`);
        return { success: true, message: 'Sorteo eliminado correctamente' };
    } catch (error) {
        console.error('Error al eliminar el sorteo:', error);
        return { success: false, message: error.message };
    }
};
// Función para comprar números
const comprarNumeros = async (data) => {
  try {
    const docRef = db.collection('sorteos').doc(data.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, message: 'El sorteo no existe' };
    }

    const datadoc = doc.data();
    const arrayPuestos = datadoc['arryPuestos'];

    // Actualizar el array de puestos asignando los seleccionados al uid del usuario
    const newArrayPuesto = arrayPuestos.map(obj => {
      const clave = Object.keys(obj)[0];
      if (data.seleccionados.includes(clave)) {
        return { [clave]: data.uid }; // Asigna el uid del usuario a los números seleccionados
      }
      return obj;
    });

    // Calcular el acumulado si el tipo de sorteo es 'Express'
    if (datadoc.typeLot === 'Express') {
      const acumulado = datadoc.premioBase + (datadoc.valor * 0.5 * data.seleccionados.length);
      await db.collection('sorteos').doc(data.id).update({
        premioBase: acumulado
      });
    }

    // Actualizar los puestos en la base de datos
    await db.collection('sorteos').doc(data.id).update({
      arryPuestos: newArrayPuesto
    });

    // Si no es administrador, calcular el pago y actualizar el saldo del usuario
    if (!data.admin) {
      const userRef = db.collection('users').doc(data.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return { success: false, message: 'El usuario no existe' };
      }

      const userData = userDoc.data();
      const pago = datadoc['valor'] * data.seleccionados.length;
      const saldoActual = userData.saldo;

      // Validar si el usuario tiene saldo suficiente
      if (saldoActual < pago) {
        return { success: false, message: 'Saldo insuficiente para completar la compra' };
      }

      // Actualizar el saldo del usuario
      const newSaldo = saldoActual - pago;
      await db.collection('users').doc(data.uid).update({
        saldo: newSaldo
      });

      return { success: true, message: 'Números asignados correctamente', newSaldo, uid: data.uid };
    }

    // Comprobar si todos los números ya están ocupados
    const puestosDisponibles = newArrayPuesto.filter(obj => Object.values(obj)[0] === '').length;
    if (puestosDisponibles === 0) {
      // Si ya no hay puestos disponibles, actualizar el estado del sorteo a "Completado"
      await db.collection('sorteos').doc(data.id).update({
        estado: 'Completado',
        fecha: 'Sin Asignar'
      });
    }

    return { success: true, message: 'Números asignados correctamente', newSaldo: 0, uid: data.uid };

  } catch (error) {
    console.error('Error al comprar números:', error);
    return { success: false, message: 'Ocurrió un error al procesar la compra', error };
  }
};

  const AsignarFecha = async(data)=>{
    await db.collection('sorteos').doc(data.id).update({
      fecha: data.fecha
    })

  }
  const IniciarSorteo = async(id)=>{
    console.log('entro')
    const docRef = db.collection('sorteos').doc(id);
    const doc = await docRef.get();
    const datadoc = doc.data();
    const NumeroGanador = await Math.floor(Math.random() * datadoc.puestos).toString().padStart(datadoc.puestos.toString().length-1,'0')
    console.log(NumeroGanador)
    const uidGanador = await datadoc.arryPuestos[Number(NumeroGanador)][NumeroGanador]
    console.log(uidGanador)
    const userRef = db.collection('users').doc(uidGanador)
    const userdoc= await userRef.get()
    const userdata = userdoc.data()
    console.log(userdata.nombre)
    await db.collection('sorteos').doc(id).update({
      estado:'Realizado',
      ganador:NumeroGanador,
      uidGanador,
      nombreGanador:userdata.nombre
    })
    return NumeroGanador
  }
  
    


module.exports = {NewSorteo, eliminarSorteo, comprarNumeros, IniciarSorteo, AsignarFecha}