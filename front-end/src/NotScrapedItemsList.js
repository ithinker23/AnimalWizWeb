import React from 'react'
import { useState } from 'react'

export default function NotScrapedItemsList({ seller, items,startScraperHome }) {
    const showPerPage = 10
    const [page, setPage] = useState(1)

    return (<div className='homeNotScrapedItemColumn'>
        <div className='homeNotScrapedItemTitle'>un-scraped {seller} items</div>
        <div className='homeNotScrapedItemsList'>
            {
                items.map((item, index) => {
                    if (index < page * showPerPage && index > page * showPerPage - showPerPage) {
                        return <div className='homeNotScrapedItem'>{item.title}</div>
                    }
                }
                )}
        </div>

        <div className='nav'>
            <div className='navButton button' onClick={() => { setPage((page) => { if(page - 1 > 0) {return page - 1}else{return page} }) }}>Back</div>
            <div className='navPrev'>{page} / {Math.round((items.length) / showPerPage)}</div>
            <div className='navButton button' onClick={() => { setPage((page) => { if (page <= (items.length) / showPerPage){ return page + 1}else{return page} }) }}>Next</div>
        </div>
        <div className='button' onClick={()=>{startScraperHome(seller)}}> START {seller} SCRAPER</div>
    </div>
    )
}
