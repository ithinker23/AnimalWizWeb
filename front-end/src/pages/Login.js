import React from 'react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Login({expressAPI, socket, setSellers}) {
    var usernameRef = useRef();
    var passwordRef = useRef();

    async function checkLoginHandler(e) {
        if (!(usernameRef.current.value === "" || passwordRef.current.value === "")) {
            const formData = { Username: usernameRef.current.value, Password: passwordRef.current.value }

            socket.emit('login', formData)

            socket.on('loginRes', data => {
                if(data.successful){
                    localStorage.setItem('loginJWTToken', data.jwtToken)
                    setTimeout(()=>{
                        window.location.href = "/"
                    }, 1000)
                }
            })
        }
    }
    return (
        <>
            <div className='formContainer'>
                <div className='form'>
                    <div className="formInputFields">
                        <div className="formInputHeader">LOGIN</div>
                        <div className='textField'>
                            <input className="textInput" ref={usernameRef} type="text" />
                            <span className="bar"></span>
                            <label> Store Name </label>
                        </div>
                        <div className='textField'>
                            <input className="textInput" ref={passwordRef} type="password" />
                            <span className="bar"></span>
                            <label> Password </label>
                        </div>
                        <div className='button' onClick={checkLoginHandler}>
                            <div className="slide"></div>
                            <div className='buttonText'>Login</div>
                        </div>
                        <div className='formRedirectLink'>
                            Don't have an account? click <Link to="/signUp">HERE</Link>
                        </div>
                    </div>
                </div>
                <div className="formCover">
                    <div className="formCoverText">
                        PRICE OPTIM
                    </div>
                    <div className="formCoverUnderline"></div>
                </div>
            </div>
        </>
    )
}
