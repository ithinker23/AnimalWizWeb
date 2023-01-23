import { useEffect, useRef } from 'react';
import uuid from 'react-uuid';

export default function Item({ seller, item, mappedid, selectItem }) {

    const itemRef = useRef()

    function getImages() {
        if (item.images != null) {
            return item.images.map((image) => {
                return <img  key={uuid()} src={image} alt="img" />
            })
        }
    }

    function goToProduct(){
        window.open(item.p_url, '_blank');
    }
    useEffect(()=>{

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
                    <div className="itemTitle">{item.title}</div>
                 
                    <div className="itemDesc">{item.description}</div>
                    <div className="button" onClick={()=>{selectItem(item.pid, item.id, seller)}}>MATCH PRODUCT</div>
                    <div className="button" onClick={goToProduct}>FIND ON {seller} </div>
                </div>
            </div>
        </>
    )
}