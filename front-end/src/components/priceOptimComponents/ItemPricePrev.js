export default function itemPricePrev({prevData}){
    return(<>
     <div className="match matchTitle">{prevData.title} </div><div className="itemPrevImg"><img  src={prevData.image_src} alt="prev"></img></div>
        <div className="match">Store : 
        <div>Cost/Item  {prevData.costPerItem}</div>
        <div>Shop List Price :  {prevData.variantPrice}</div>
        <div>Set Price :  {prevData.recommendedPrice}</div> 
        </div>
    </>)
}