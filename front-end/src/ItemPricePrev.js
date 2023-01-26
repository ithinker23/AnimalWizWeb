export default function itemPricePrev({prevData}){
    return(<>
     <div className="match matchTitle">{prevData.title} </div><img className="itemPrevImg" src={prevData.image_src} alt="prev"></img>
        <div className="match">{prevData.seller} : 
        <div>Cost/Item  {prevData.costPerItem}</div>
        <div>Shop List Price :  {prevData.variantPrice}</div> 
        </div>
    </>)
}