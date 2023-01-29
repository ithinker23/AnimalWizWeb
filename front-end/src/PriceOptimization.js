import { useEffect, useState } from "react"
import PriceRow from './PriceRow'

export default function PriceOptimization({ sellers, storeDB, socket }) {

    const [prices, setPrices] = useState([])

    useEffect(() => {
        socket.emit('getPriceOptimData', {sellers:sellers})

        socket.on('postPrices', (data)=>{
            console.log(data)
            setPrices(data)
        })
    }, [socket])

    function scrapePrices(){
        socket.emit('startScraper', {scraperDatas: sellers.map(seller=>{return {scraper:seller, mode:1}})})
    }

    return (<>
        <div className="priceOptimPage">
        <div className="button updateMatchesButton" onClick={scrapePrices}> UPDATE PRICES </div>
        <div className="PriceOptimizationWindow">
            {prices.map((price,index) => {
                return <PriceRow price={price} sellers={sellers} storeDB={storeDB} index={index}/>
            })}
        </div>
        </div>
    </>)
}