import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import Item from './Item'

export default function SellerCol({ selectItem, seller, data, pid, socket, scraperStatus, setScraperStatus}) {

    const [mappedItem, setMappedItem] = useState()
    const urlTextRef = useRef()
    
    useEffect(()=>{
        checkMappingState()
    },[pid])

    async function checkMappingState(){
        let res = await axios.post('http://localhost:5000/items/checkMappingState', {seller:seller, pid:pid})
        setMappedItem(res.data)
    }

    async function scrapeUrl(){
        socket.emit('startScraperItems', {pid:pid, scraper:seller, url:urlTextRef.current.value, mode:3})
        setScraperStatus(true)
    }
    function addTick(){
         if(mappedItem == "-1"){
            return <></>
         }else{
            return <img className='mappedItemIcon' src="tickMark.png"></img>
         }
    }
    return (
        <div className='sellerCol'>
            <div className='itemsCol'>
                <div className='sellerTitleWrapper'>
                <div className='sellerTitle'>{seller}</div> {addTick()}
                </div>
                <div className='sellerItems'>
                    {
                        data[seller].data.map((item) => {
                            return (<>
                                <Item selectItem={selectItem} mappedid={mappedItem} item={item} seller={data[seller].seller} />
                            </>)
                        })
                    }
                </div>
            </div>
            <div className='inputUrlToScrape'>
                <textarea ref={urlTextRef}></textarea>
                <div style={{ pointerEvents: scraperStatus ? 'none' : 'auto', backgroundColor: scraperStatus ? 'grey' : 'rgb(221, 109, 12)' }} className='button' onClick={scrapeUrl}>SCRAPE URL</div>
            </div>
        </div>

    )
}
