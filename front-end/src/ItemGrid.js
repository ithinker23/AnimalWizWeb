import { useState } from 'react'
import ItemPrev from './ItemPrev'
import axios from 'axios'
import ItemGridFilter from './ItemGridFilter'
import SellerCol from './SellerCol'

export default function ItemGrid({sellers, prevDB, matchesDB}) {

    var initData
    sellers.forEach((seller) => {
        initData = {...initData, [seller]:{data:[], seller:""}}
    })
    const [data, setData] = useState(initData)
    const [prevData, setPrevData] = useState({pid:null, images:[], title:"", description:"", price:""})

    var selectedItemsInitData = {pid: prevData.pid}
     sellers.forEach((seller)=>{
        selectedItemsInitData = {...selectedItemsInitData, [seller]:null}
     })
     
    const [selectedItems, setSelectedItems] = useState(selectedItemsInitData)

    function handleSelectedItems(seller, id){
        setSelectedItems((prev)=>{
            let obj = {...prev}
            obj[seller] = id
            return obj
        })
   }

    async function updateMatchesDB(){
        console.log("UPDATING MATCHES")
        console.log(selectedItems)
       await axios.post('http://localhost:5000/items/updateMatches', {ids: selectedItems, matchesDB:matchesDB, sellers:sellers, prevDB:prevDB})
       setSelectedItems(selectedItemsInitData)
    }

    return (<>
        <ItemGridFilter/>
        <div className="button clearButton" onClick={()=>{setSelectedItems(selectedItemsInitData)}}>Clear Selections</div>
        <div className='flexContent'> 
            <ItemPrev item={prevData} updateMatchesDB={updateMatchesDB} setSelectedItems={setSelectedItems}  selectedItemsInitData={selectedItemsInitData} initData={initData} setPrevData={setPrevData} prevDB={prevDB} data={data} setData={setData} sellers={sellers}/>
            <div className='itemGrid'>
                {
                    sellers.map(seller => {
                        return (
                            <SellerCol seller={seller} data={data} selectedItems={selectedItems} handleSelectedItems={handleSelectedItems} pid={prevData.pid}/>
                        )
                    })
                }
            </div>
        </div></>

    )
}