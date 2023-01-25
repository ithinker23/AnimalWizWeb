import { useState, useEffect } from 'react'
import ItemPrev from './ItemPrev'
import ItemGridFilter from './ItemGridFilter'
import SellerCol from './SellerCol'

export default function ItemGrid({expressAPI,sellers, storeDB, socket}) {

    var initData
    sellers.forEach((seller) => {
        initData = {...initData, [seller]:{data:[], seller:""}}
    })
    const [data, setData] = useState(initData)
    const [prevData, setPrevData] = useState({pid:null, images:[], title:"", description:"", price:""})
   
    useEffect(() => {
        socket.on('scraperItems',(reqdata)=>{
            setData((prevData)=>{
                prevData[reqdata.seller] = { data: reqdata.data, seller: reqdata.seller }
                return prevData
            })
        })

    }, [socket])

    function selectItem(pid, id, seller){
        socket.emit('mapItem', {pid:pid, id:id, seller:seller})
    }

    return (<>
        <ItemGridFilter/>
        <div className="button clearButton">Clear Selections</div>
        <div className='flexContent'> 
            <ItemPrev expressAPI={expressAPI} item={prevData} initData={initData} setPrevData={setPrevData} storeDB={storeDB} data={data} setData={setData} sellers={sellers}/>
            <div className='itemGrid'>
                {
                    sellers.map(seller => {
                        return (
                            <SellerCol expressAPI={expressAPI} selectItem={selectItem} setData={setData} initData={initData} socket={socket} seller={seller} data={data} pid={prevData.pid}/>
                        )
                    })
                }
            </div>
        </div></>

    )
}