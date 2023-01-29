import { useEffect } from 'react'
import SellerHomeInfo from './SellerHomeInfo'

export default function Home({ sellers, socket }) {

  function startScraperHome(seller){
    socket.emit('startScraper', {scraper:seller, mode:2})
  }

  useEffect(()=>{
    socket.emit('getHomeData')
  },[socket])

  return (<>
    <div className='homeInfo'>
       <div className='homeNotScrapedItems'>
        {
          sellers.map((seller) => {
            return <SellerHomeInfo socket={socket} startScraperHome={startScraperHome} seller={seller}/> 
          })  
        }
        
      </div> 
    </div>
  </>)
}