

module.exports = (io, socket, setCeleryID) => {
    socket.on('registercelery', () => {
        setCeleryID(socket.id)
        console.log("celery connected")

        socket.on('celeryScraperID', data => {
            activeTasks[data.scraper] = { taskID: data.id }
        })

        socket.on('updScraperStatus', data => {
            for (let taskIndex = 0; taskIndex <= Object.keys(activeTasks).length - 1; taskIndex++) {
                if (activeTasks[Object.keys(activeTasks)[taskIndex]]['taskID'] == data['task_id']) {
                    delete activeTasks[Object.keys(activeTasks)[taskIndex]]
                    socket.broadcast.emit('displayNotif', {msg: data.returnVal, Title: "Scraper Finished", isError: data.isError })
                }
            }
        })
    })
}