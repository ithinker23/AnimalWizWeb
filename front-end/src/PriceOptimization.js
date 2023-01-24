import axios from "axios"
import { useEffect, useState } from "react"
import MatchRow from './MatchRow'

export default function PriceOptimization({ sellers, storeDB}) {

    const [matches, setMatches] = useState([])

    async function getPriceIds() {
        try {
            let res = await axios.post('http://localhost:5000/items/getMatches', {sellers:sellers, store_name:storeDB })
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
                return <MatchRow match={match} sellers={sellers} storeDB={storeDB} index={index}/>
            })}
        </div>
    </>)
}