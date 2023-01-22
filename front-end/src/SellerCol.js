import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import Item from './Item'

export default function SellerCol({ seller, data, selectedItems, handleSelectedItems,pid, socket, scraperStatus, setScraperStatus}) {

    const [isMapped, setIsMapped] = useState("")
    const urlTextRef = useRef()
    
    useEffect(()=>{
        checkMappingState()
    },[pid])

    async function checkMappingState(){
        let res = await axios.post('http://localhost:5000/items/checkMappingState', {seller:seller, pid:pid})
        setIsMapped(res.data)
    }

    async function scrapeUrl(){
        socket.emit('startScraperItemSelection', {pid:pid, scraper:seller, url:urlTextRef.current.value, mode:3})
        setScraperStatus(true)
    }

    return (
        <div className='sellerCol'>
            <div className='itemsCol'>
                <div className='sellerTitle'>{seller} items is {isMapped}</div>
                <div className='sellerItems'>
                    {
                        data[seller].data.map((item) => {
                            return (<>
                                <Item selectedItems={selectedItems} item={item} seller={data[seller].seller} handleSelectedItems={handleSelectedItems} />
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
