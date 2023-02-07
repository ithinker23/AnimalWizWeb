import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Notif from './Notif'

export default function NotificationPanel({ socket }) {

    const [notifs, setNotifs] = useState([])

    useEffect(() => {
        socket.on('displayNotif', data => {
            console.log(data)
            setNotifs(prevNotifs => {
                return [{data:data, key:uuidv4()},...prevNotifs]
            })
        })
    }, [socket])

    useEffect(() => {
        if (notifs.length >= 4) {
            notifs.pop()
        }
    }, [notifs])

    return (

        <div className='notificationPanel'>
            {notifs.map(notif => {
                return <Notif key={notif.key} notif={notif.data} />
            })}
        </div>
    )
}
