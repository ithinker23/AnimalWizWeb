import { useEffect, useRef } from 'react';
import uuid from 'react-uuid';

export default function Item({ seller, handleSelectedItems, item, selectedItems, mappedid }) {

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

    function goToProduct(){
        window.open(item.p_url, '_blank');
    }
    useEffect(()=>{
        if(item.id === selectedItems[seller]){
            itemRef.current.style = "background-color:#ADD8E6";
        }else{
            itemRef.current.style = "background-color:white";
        }

        if(item.id == mappedid){
            itemRef.current.style = "background-color:#90EE90";
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
                    <div className="itemTitle">{item.title} <span className="itemPrice">{item.price}</span></div>
                 
                    <div className="itemDesc">{item.description}</div>
                    <div className="button" onClick={selectItem}>MATCH PRODUCT</div>
                    <div className="button" onClick={goToProduct}>FIND ON {seller} </div>
                </div>
            </div>
        </>
    )
}