export default function itemPricePrev({updatePrices, setShopifyPrice, prevItem}){
    return(<>
     <div className="match matchTitle">{prevItem.title} </div><img className="itemPrevImg" src={prevItem.image_src} alt="prev"></img>
        <div className="match">{prevItem.seller} : 
        <div>Cost/Item  {prevItem.costPerItem}</div>
        <div>Shopify Listed Price :  {prevItem.variantPrice}</div> 
        </div>
    </>)
}