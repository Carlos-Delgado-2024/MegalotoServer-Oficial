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
      const acumulado = datadoc.premioBase + (datadoc.valor * 0.7 * data.seleccionados.length);
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
