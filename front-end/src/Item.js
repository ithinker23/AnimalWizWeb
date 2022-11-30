import { useEffect, useRef } from 'react';
import uuid from 'react-uuid';

export default function Item({ seller, handleSelectedItems, item, selectedItems }) {

    const itemRef = useRef()

    function getImages() {
        if (item.images != null) {
            return item.images.map((image) => {
                return <img  key={uuid()} src={image} alt="img" />
            })
        }
    }
    function selectItem() {
        handleSelectedItems(seller, item.id)
    }

    
    useEffect(()=>{
        if(item.id === selectedItems[seller]){
            itemRef.current.style = "background-color:#ADD8E6";
        }else{
            itemRef.current.style = "background-color:white";
        }
    })

    return (
        <>
            <div ref={itemRef} className='item'>
                <div className="itemImages">
                    {
                        getImages()
                    }
                </div>
                <div className="itemContent">
                    <div className="itemTitle">{item.title} <span className="itemPrice">${item.price}</span></div>
                 
                    <div className="itemDesc">{item.description}</div>
                    <div className="button" onClick={selectItem}>THIS IS THE ITEM</div>
                </div>
            </div>
        </>
    )
}