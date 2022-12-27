export default function itemPricePrev({updatePrices, setShopifyPrice, prevItem}){
    return(<>
     <div className="match matchTitle">{prevItem.title}</div>
        <div className="match">{prevItem.seller} : 
        <div>Cost/Item  {prevItem.costPerItem}</div>
        <div>Shopify Listed Price :  {prevItem.variantPrice}</div> 
        <div>Amazon Listed Price : {prevItem.updatedPrice}</div> 
        <div>Updated Price : {prevItem.updatedPrice}</div> 
        </div>
    </>)
}