import { AiOutlineHome } from 'react-icons/ai'
import { Link } from 'react-router-dom'


export default function Header() {
    return (<div className="header">
         <Link to="/" style={{ textDecoration: 'none' }}><div className='logo headerLink'>< AiOutlineHome size={30}/></div></Link>

        <div className='headerLinkGroup'>
            <Link to="/findItems" style={{ textDecoration: 'none' }}><div className='headerLink'>Item Selection</div></Link>
            <Link to="/priceOptimization" style={{ textDecoration: 'none' }}><div className='headerLink'>Price Optimization</div></Link>
            <Link to="/signUp" style={{ textDecoration: 'none' }}><div className='headerLink'>Sign Up</div></Link>
            <Link to="/login" style={{ textDecoration: 'none' }}><div className='headerLink'>Login</div></Link>
            <Link to="/logOut" style={{ textDecoration: 'none' }}><div className='headerLink'>Sign Out</div></Link>
        </div>
    </div>)
}