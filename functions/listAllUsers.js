const { admin } = require('../config/firebase')

const listAllUsers = async(socket)=>{
    try{
        const result = await admin.auth().listUsers()
        socket.emit('dataUsers',result.users)
        // console.log('se emitio dataUsers')
        return result.users
    }catch (error){
        console.error('Error al listar usuarios:', error)
    }
}
module.exports = listAllUsers