import ItemPricePrev from './ItemPricePrev'
import SellerPrice from './SellerPrice'

export default function MatchRow({price, sellers, storeDB, index}){

    return (<>
    <div className="matchRow">
        {index + 1}
        <ItemPricePrev prevData={price[storeDB]} storeDB={storeDB}/>
        {sellers.map((seller)=>{
            return <SellerPrice item={price[seller]}/>
        })}
    </div>
    </>)
}