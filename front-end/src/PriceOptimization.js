import { useEffect, useState } from "react"
import MatchRow from './MatchRow'

export default function PriceOptimization({ sellers, storeDB, socket }) {

    const [matches, setMatches] = useState([])

    useEffect(() => {
        socket.emit('getMatches', {sellers:sellers, store_name:storeDB})

        socket.on('postMatches', (data)=>{
            setMatches(data)
        })
    }, [socket])

    function updatePrices(){
        socket.emit('startScraperPriceOptim', {scrapers:sellers})
    }

    return (<>
        <div className="button updateMatchesButton" onClick={updatePrices}> UPDATE PRICES </div>
        <div className="PriceOptimizationWindow">
            {matches.map((match,index) => {
                return <MatchRow match={match} sellers={sellers} storeDB={storeDB} index={index}/>
            })}
        </div>
    </>)
}