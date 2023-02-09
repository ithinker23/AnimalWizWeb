import ItemPricePrev from './ItemPricePrev'
import SellerPrice from './SellerPrice'
import InputPrice from './InputPrice'

export default function MatchRow({price, sellers, storeDB, index, submitPrice}){

    return (<>
    <div className="matchRow">
        {index + 1}
        <ItemPricePrev prevData={price[storeDB]}/>
        {sellers.map((seller)=>{
            return <SellerPrice item={price[seller]}/>
        })}
        <InputPrice pid={price[storeDB].pid} submitPrice={submitPrice}/>
    </div>
    </>)
}