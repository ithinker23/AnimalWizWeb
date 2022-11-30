import Item from './Item'
import { useState } from 'react'
import ItemPrev from './itemPrev'
import axios from 'axios'
import ClearSelection from './ClearSelection'
import uuid from 'react-uuid';

export default function ItemGrid() {
    const sellers = ["amazon","chewy"]
    const headerTable = "a_wiz"
    const matchesDB = "aw_matches"

    var initData
    sellers.forEach((seller) => {
        initData = {...initData, [seller]:{data:[], seller:""}}
    })
    const [data, setData] = useState(initData)
    const [headerData, setHeader] = useState({pid:null, images:[], title:"", description:"", price:""})

    var selectedItemsInitData = {pid: headerData.pid}
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
       await axios.post('http://localhost:5000/items/updateMatches', {ids: selectedItems, matchesDB:matchesDB})
       setSelectedItems(selectedItemsInitData)
    }

    return (
        <div className='flexContent'>  
            <ItemPrev item={headerData} updateMatchesDB={updateMatchesDB} setSelectedItems={setSelectedItems}  selectedItemsInitData={selectedItemsInitData} initData={initData} setHeader={setHeader} headerTable={headerTable} data={data} setData={setData} sellers={sellers}/>
            <div className='itemGrid'>
                {
                    sellers.map(seller => {
                        return (
                        <div  key={uuid()} className='sellerCol'>
                            <ClearSelection seller={seller} setSelectedItems={setSelectedItems}/>
                            <div className='itemsCol'>
                            <div className='sellerTitle'>{seller} items</div>
                            <div className='sellerItems'>     
                            {
                            data[seller].data.map((item) => {
                                 return (<>
                                     <Item key={uuid} selectedItems={selectedItems} item={item} seller={data[seller].seller} handleSelectedItems={handleSelectedItems}/>
                                 </>)
                             })
                            }
                            </div>
                        </div>
                        </div>)
                    })
                }
            </div>
        </div>
    )
}