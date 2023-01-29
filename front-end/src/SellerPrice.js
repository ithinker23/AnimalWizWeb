
export default function Match({item}){

    function convertTime(full_date){
       let date = new Date(full_date)
       const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

       return date.getDate() + "-" + monthNames[date.getMonth()] + "-" + date.getFullYear()
    }

    return (<>
    
    <div className="match">{item.seller} : {item.price.map(price=>{
        return <div className="matchDateTime"> {price.price}, {convertTime(price.date_stamp)} </div>
    })}</div>
    </>)
}