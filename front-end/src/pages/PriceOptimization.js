import { useEffect, useState } from "react"
import PriceRow from '../components/priceOptimComponents/PriceRow'
import {AiOutlineDownload} from 'react-icons/ai'

export default function PriceOptimization({ sellers, storeDB, socket, expressAPI }) {

    const [prices, setPrices] = useState([])

    useEffect(() => {
        socket.emit('getPriceOptimData', { sellers: sellers })

        socket.on('postPrices', (data) => {
            console.log(data)
            setPrices(data)
        })
    }, [socket])

    function scrapePrices() {
        socket.emit('startScraper', { scraperDatas: sellers.map(seller => { return { scraper: seller, mode: 1 } }) })
    }
    function downloadCSV() {
        expressAPI.post('/items/getMatchesCSV', {store:storeDB})
    }

    return (<>
        <div className="priceOptimPage">
            <div style={{"display":"flex"}}>
                <div className="button updateMatchesButton" onClick={scrapePrices}> UPDATE PRICES </div>
                <div className="button downloadCSV" onClick={downloadCSV}> <AiOutlineDownload/> CSV </div>
            </div>
            <div className="PriceOptimizationWindow">
                {prices.map((price, index) => {
                    return <PriceRow price={price} sellers={sellers} storeDB={storeDB} index={index} />
                })}
            </div>
        </div>
    </>)
}