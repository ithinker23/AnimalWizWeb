export default function itemPricePrev({storeDB, prevData}){
    return(<>
     <div className="match matchTitle">{prevData.title} </div><div className="itemPrevImg"><img  src={prevData.image_src} alt="prev"></img></div>
        <div className="match">{storeDB} : 
        <div>Cost/Item  {prevData.costPerItem}</div>
        <div>Shop List Price :  {prevData.variantPrice}</div> 
        </div>
    </>)
}