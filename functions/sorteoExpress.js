const { admin } = require('../config/firebase')
const { NewSorteo } = require('./sorteos')
const db = admin.firestore()

const resetExpress = async(id)=>{
    const sorteoref = db.collection('sorteos').doc(id)
    const sorteoDoc = await sorteoref.get()
    const sorteoData = sorteoDoc.data()
    if ( sorteoData.userGanador){
        await db.collection('sorteos').doc(id).update({
            'estado':'archivado'
        })
        const formData = {
            premio:'acumulado',
            valor: data.valor,
            puestos: data.puestos,
            typeLot: 'Express',
            premioBase: data.valor * 10
        }
        const dataSend = {
            formData,
            fileUrl: data.urlImg,
        }
        NewSorteo(dataSend)
        return
    }
    const ArrayPuestos = []
    for(let i = 0; i <= data.puestos-1;i++){
        const numero = i.toString().padStart(data.puestos.toString().length-1,'0')
        ArrayPuestos.push({[numero]:''})
    }
    await db.collection('sorteos').doc(id).update({
        'arryPuestos': ArrayPuestos,
        'ganador':''
    })

    
    
}
const initExpress = async(id) => {
    const sorteoref = db.collection('sorteos').doc(id)
    const sorteoDoc = await sorteoref.get()
    const sorteoData = sorteoDoc.data()
    const numeroGanador = Math.floor(Math.random() * sorteoData.puestos).toString().padStart(sorteoData.puestos.toString().length-1,'0')
    const userGanador = sorteoData.arryPuestos[Number(numeroGanador)][numeroGanador]
    await db.collection('sorteos').doc(id).update({
        'ganador':numeroGanador,
        'userGanador':userGanador,
    })
    if(userGanador){
        const userRef = db.collection('users').doc(userGanador)
        const userDoc = await userRef.get()
        if(userDoc.exists){
            const userData = userDoc.data()
            const newSaldo = sorteoData.premioBase + userData.saldo
            await db.collection('users').doc(userGanador).update({
                'saldo':newSaldo
            })
        }
    
    }
    

}
const listExpress = async(data) =>{
    await db.collection('sorteos').doc(data.id).update({
        'listo':data.bol
    })

}
module.exports = {resetExpress, initExpress, listExpress}