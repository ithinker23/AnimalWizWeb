import ItemPricePrev from './ItemPricePrev'
import Match from './Match'

export default function MatchRow({match, sellers, storeDB, index}){

    return (<>
    <div className="matchRow">
        {index + 1}
        <ItemPricePrev prevData={match[storeDB]}/>
        {sellers.map((seller)=>{
            return <Match item={match[seller]}/>
        })}
    </div>
    </>)
}