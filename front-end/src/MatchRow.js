import axios from "axios"
import ItemPricePrev from './ItemPricePrev'
import Match from './Match'
import { useState } from "react"

export default function MatchRow({match, sellers, prevDB, pricesDB,index}){

    const [shopifyPrice, setShopifyPrice] = useState()

    async function updatePrices(){
      await axios.post("http://localhost:5000/items/updatePrices", {pid:match[prevDB].pid, shopifyPrice:shopifyPrice, pricesDB:pricesDB})

    }

    return (<>
    <div className="matchRow">
        {index + 1}
        <ItemPricePrev updatePrices={updatePrices} setShopifyPrice={setShopifyPrice} prevItem={match[prevDB]}/>
        {sellers.map((seller)=>{
            return <Match item={match[seller]}/>
        })}
    </div>
    </>)
}