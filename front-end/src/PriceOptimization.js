import axios from "axios"
import { useEffect, useState } from "react"
import MatchRow from './MatchRow'

export default function PriceOptimization({ sellers, matchesDB, prevDB, pricesDB }) {

    const [matches, setMatches] = useState([])

    async function getPriceIds() {
        try {
            let res = await axios.post('http://localhost:5000/items/getMatches', {matchesDB:matchesDB, sellers:sellers, pricesDB:pricesDB, prevDB:prevDB })
            setMatches(res.data)

        } catch (err) {
            throw err
        }
    }


    useEffect(() => {
        getPriceIds()
    }, [])

    return (<>
        <div className="PriceOptimizationWindow">
            {matches.map((match,index) => {
                return <MatchRow match={match} sellers={sellers} prevDB={prevDB} pricesDB={pricesDB} index={index}/>
            })}
        </div>
    </>)
}