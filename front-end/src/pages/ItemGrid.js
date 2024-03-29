import { useState, useEffect } from 'react'
import ItemPrev from '../components/itemGridComponents/ItemPrev'
import ItemGridFilter from '../components/itemGridComponents/ItemGridFilter'
import SellerCol from '../components/itemGridComponents/SellerCol'

export default function ItemGrid({expressAPI, sellers, storeDB, socket}) {

    var initData
    sellers.forEach((seller) => {
        initData = {...initData, [seller]:{data:[], seller:""}}
    })
    const [data, setData] = useState(initData)
    const [prevData, setPrevData] = useState({pid:null, images:[], title:"", description:"", price:""})
   
    useEffect(() => {
        socket.emit('items:getData', {token:localStorage.getItem('loginJWTToken')})
        socket.on('scraperItems',(reqdata)=>{
            setData((prevData)=>{
                let newData = {...prevData}
                newData[reqdata.seller] = { data: reqdata.data, seller: reqdata.seller }
                return newData
            })
        })

    }, [socket])

    function selectItem(pid, id, seller){
        socket.emit('items:mapItem', {pid:pid, id:id, seller:seller, token:localStorage.getItem('loginJWTToken')})
    }

    return (<>
    {/* <ItemGridFilter/> */}
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