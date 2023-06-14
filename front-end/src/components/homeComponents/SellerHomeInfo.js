import React, { useEffect } from 'react'
import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

export default function NotScrapedItemsList({ socket, seller, startScraperHome, stopScraperHome }) {
    const showPerPage = 10
    const [page, setPage] = useState(1)
    const [items, setItems] = useState([])
    const [graphData, setGraphData] = useState({ foundPids: 0, nullPids: 0, mappedPids: 0 })

    ChartJS.register(ArcElement, Tooltip, Legend);

    const data = {
        labels: ['Not Scraped', 'Scraped', 'Mapped'],
        datasets: [
            {
                label: 'Items',
                data: [graphData['nullPids'], graphData['foundPids'], graphData['mappedPids']],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    useEffect(() => {
        socket.emit('home:getData', {seller: seller,  token:localStorage.getItem('loginJWTToken') })

        socket.on('home:updateInfo', (data) => {
            console.log(data)
            if (data['seller'] == seller) {
                setItems(data['itemData'])
                setGraphData(data['graphData'])
            }
        })
    }, [socket])

    function showStartBtn() {
        console.log("ENV:" + process.env.REACT_APP_ENVI)
        if (process.env.REACT_APP_ENVI == "development") {
            return <div className='button' onClick={() => { startScraperHome(seller) }}> START {seller} SCRAPER</div>
        }
    }
    return (<>
        <div className='homeNotScrapedItemTitle'>{seller} NOT SCRAPED ITEMS</div>

        <div className='homeNotScrapedItemSeller'>
            <div className='homeNotScrapedItemColumn'>
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
                    <div className='navButton button' onClick={() => { setPage((page) => { if (page - 1 > 0) { return page - 1 } else { return page } }) }}>Back</div>
                    <div className='navPrev'>{page} / {Math.round((items.length) / showPerPage)}</div>
                    <div className='navButton button' onClick={() => { setPage((page) => { if (page <= (items.length) / showPerPage) { return page + 1 } else { return page } }) }}>Next</div>
                </div>{
                    showStartBtn()
                }
                <div className='button' onClick={() => { stopScraperHome(seller) }}> STOP {seller} SCRAPER</div>
            </div>
            <div className='homeNotScrapedItemDoughnut'>
                <Doughnut data={data} />
            </div>
        </div>
        </>)
}
