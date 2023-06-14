import React from 'react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignUp({ socket }) {
    var usernameRef = useRef();
    var passwordRef = useRef();
    const [checked, setChecked] = useState([]);
    const checkList = ["Amazon", "Chewy", "Petsmart"];

    async function checkLoginHandler(e) {
        if (!(usernameRef.current.value === "" || passwordRef.current.value === "")) {
            const formData = { Username: usernameRef.current.value, Password: passwordRef.current.value, sellers:checked }

            socket.emit('users:signUp', formData)
        }
    }
    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else {
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
    };
    return (
        <>
            <div className='formContainer'>
                <div className='form'>
                    <div className="formInputFields">
                        <div className="formInputHeader">SIGN UP</div>
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
                        <div className="list-container">
                            {checkList.map((item, index) => (
                                <div key={index}>
                                    <input value={item} type="checkbox" onChange={handleCheck} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <div className='button' onClick={checkLoginHandler}>
                            <div className="slide"></div>
                            <div className='buttonText'>Sign Up</div>
                        </div>
                        <div className='formRedirectLink'>
                            Already have an account? click <Link to="/login">HERE</Link>
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
