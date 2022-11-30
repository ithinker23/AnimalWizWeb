export default function ClearSelection({seller, setSelectedItems}){
    
    function clear(){
        setSelectedItems(prev=>{
            prev[seller]=null
            return prev
        })
    }

    return (<>
        <div className="button clearButton" onClick={clear}>Clear {seller} selection</div>
    </>)
}