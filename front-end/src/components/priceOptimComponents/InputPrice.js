import React from 'react'
import {useRef} from 'react'

export default function InputPrice({submitPrice, pid}) {

    const inputRef = useRef()

  return (
        <div className='inputPrice'>
            <div className='inputPriceTitle'>Enter Price:</div>
            <input ref={inputRef} type='number' min="0" step="0.01"></input>
            <div className='button' onClick={()=>{submitPrice(inputRef.current.value, pid)}}>SUBMIT PRICE</div>
        </div>
  )
}
