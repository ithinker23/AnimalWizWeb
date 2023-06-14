const userQuerys = require('../models/userQuerys')

module.exports = (io,socket)=>{
    socket.on('users:signUp', async (data) => {
        let successful = await userQuerys.signUp(data.Username, data.Password, data.sellers)
        if (successful) {
          socket.emit('displayNotif', { msg: "Sign Up Is Successful", Title: "Signed Up!", isError: !successful })
        } else {
          socket.emit('displayNotif', { msg: "Store Is Already Signed Up", Title: "Sign Up Failed", isError: !successful })
        }
      })
      socket.on('users:login', async (data) => {
        let res = await userQuerys.login(data.Username, data.Password)
        if (res.successful) {
          socket.emit('loginRes', res)
          socket.emit('displayNotif', { msg: "Login Is Successful", Title: "Logging In!", isError: !res.successful })
        } else {
          socket.emit('displayNotif', { msg: "Store Doesnt Exist Or Password Is Incorrect", Title: "Login Failed", isError: !res.successful })
        }
      })
}