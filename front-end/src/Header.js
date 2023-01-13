export default function Header() {
    return (<div className="header">
        <div className='logo headerLink' onClick={()=>{window.location.href = "/"}}>
            <img src="a_wizlogo.webp" alt='img' /></div>

        <div className='headerLinkGroup'>
            <div className='headerLink' onClick={()=>{window.location.href = "/findItems"}}>Item Selection</div>
            <div className='headerLink' onClick={()=>{window.location.href = "/priceOptimization"}}>Price Optimization</div>
        </div>
    </div>)
}