import { useEffect } from 'react'
import SellerHomeInfo from '../components/homeComponents/SellerHomeInfo'

export default function Home({ sellers, socket }) {

  function startScraperHome(seller){
    socket.emit('startScraper', {scraper:seller, mode:2, token:localStorage.getItem('loginJWTToken')})
  }

  function stopScraperHome(seller){
    socket.emit('stopScraper', {scraper:seller, token:localStorage.getItem('loginJWTToken')})
  }
  
  useEffect(()=>{
    socket.emit('getHomeData', {token: localStorage.getItem('loginJWTToken') })
  },[socket])

  return (<>
    <div className='homeInfo'>
       <div className='homeNotScrapedItems'>
        {
          sellers.map((seller) => {
            return <SellerHomeInfo socket={socket} startScraperHome={startScraperHome} stopScraperHome={stopScraperHome} seller={seller}/> 
          })  
        }
        
      </div> 
    </div>
  </>)
}