import { useEffect, useState } from "react"
import PriceRow from '../components/priceOptimComponents/PriceRow'
import {AiOutlineDownload} from 'react-icons/ai'
import CsvDownloadButton from 'react-json-to-csv'

export default function PriceOptimization({ sellers, storeDB, socket, expressAPI }) {

    const [prices, setPrices] = useState([])

    useEffect(() => {
        socket.emit('getPriceOptimData', { sellers: sellers,  token:localStorage.getItem('loginJWTToken')})

        socket.on('postPrices', (data) => {
            setPrices(data)
        })
    }, [socket])

    function scrapePrices() {
        socket.emit('startScraper', { scraperDatas: sellers.map(seller => { return { scraper: seller, mode: 1 } }) ,  token:localStorage.getItem('loginJWTToken')})
    }

    function submitPrice(price, pid){
        expressAPI.post('/items/submitPrice', {price:price, pid:pid})

    }
    return (<>
        <div className="priceOptimPage">
            <div style={{"display":"flex"}}>
                <div className="button updateMatchesButton" onClick={scrapePrices}> UPDATE PRICES </div>
                <div className="button downloadCSV"><CsvDownloadButton data={prices.map((priceRow) => {return priceRow['animal_wiz']})} delimiter=","/></div>
            </div>
            <div className="PriceOptimizationWindow">
                {prices.map((price, index) => {
                    return <PriceRow price={price} sellers={sellers} storeDB={storeDB} index={index} submitPrice={submitPrice}/>
                })}
            </div>
        </div>
    </>)
}