import React, { useEffect, useState, useRef } from 'react'
import Item from './Item'

export default function SellerCol({ expressAPI, selectItem, seller, data, pid, socket }) {

    const [mappedItem, setMappedItem] = useState()
    const urlTextRef = useRef()

    useEffect(() => {
        checkMappingState()
    }, [pid])

    useEffect(() => {
        socket.on('postMappedItem', (data) => {
            if (data['seller'] == seller) {
                setMappedItem(data['id'])
            }
        })
    }, [socket])

    async function checkMappingState() {
        let res = await expressAPI.post('/items/checkMappingState', { seller: seller, pid: pid })
        setMappedItem(res.data.id)
    }
    function clearMapped() {
        socket.emit('items:clearMapped', { seller: seller, pid: pid, id: mappedItem, token:localStorage.getItem('loginJWTToken') })
    }
    async function scrapeUrl() {
        socket.emit('items:startScraper', { pid: pid, scraper: seller, url: urlTextRef.current.value, mode: 3,  token:localStorage.getItem('loginJWTToken') })
    }
    function addTick() {
        if (mappedItem == "-1") {
            return <></>
        } else {
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
            <div className="button clearButton" onClick={clearMapped}>Clear Selections</div>
            <div className='inputUrlToScrape'>
                <textarea ref={urlTextRef}></textarea>
                <div className='button' onClick={scrapeUrl}>SCRAPE URL</div>
            </div>
        </div>

    )
}
