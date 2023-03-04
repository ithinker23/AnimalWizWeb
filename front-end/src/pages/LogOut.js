import React from 'react'
import { useEffect } from 'react'

export default function LogOut() {

    useEffect(()=>{
        localStorage.removeItem('loginJWTToken')
    },[])

  return (
    <div style={{marginTop:'100px'}}>LOGGED OUT</div>
  )
}
