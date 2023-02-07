import React, { useEffect, useRef } from 'react'

export default function Notif({key, notif }) {

    const notifRef = useRef()

    useEffect(() => {
        console.log(notif.isError)
        if(notif.isError == true){
            notifRef.current.style ="background-color:#F75D59";
        }
    }, [notif])

    return (
        <div ref ={notifRef} className='notif'>
            <div className='notifTitle'>{notif.Title}</div>
            <div className='notifDesc'>{notif.msg}</div>
         </div>
    )
}
