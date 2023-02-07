import { useEffect } from 'react'
import SellerHomeInfo from '../components/homeComponents/SellerHomeInfo'

export default function Home({ sellers, socket }) {

  function startScraperHome(seller){
    socket.emit('startScraper', {scraper:seller, mode:2})
  }

  function stopScraperHome(seller){
    socket.emit('stopScraper', {scraper:seller})
  }
  
  useEffect(()=>{
    socket.emit('getHomeData')
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