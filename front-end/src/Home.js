import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import NotScrapedItemsList from './NotScrapedItemsList'

export default function Home({ sellers, socket }) {
   let initItemData = {}
   sellers.forEach(seller => {
     initItemData[seller] = {}
     initItemData[seller]['nullItems'] = []
  });

  let initGraphData = {}
  sellers.forEach(seller => {
    initGraphData[seller] = {}
 });
  const [graphData, setGraphData] = useState(initGraphData)
  const [itemData, setItemData] = useState(initItemData)

  useEffect(() => {

    socket.emit('getHomeData', sellers)
    socket.on('homeData', (data)=>{
      setGraphData(prevData => {
        sellers.forEach(seller=>{
          prevData[seller] = data['graphData'][seller]
        })
        return prevData
      })
      setItemData(data['itemData'])
    })

    socket.on("homeDataUpdate", (data) => {
      setGraphData(prevData => {
        let newData = {...prevData}
        newData[data.seller] = data['graphData']
        return newData
      })
      setItemData(prevData => {
        let newData = {...prevData}
         newData[data.seller] = data['itemData']
         return newData
       })
    })
  }, [socket])

  function startScraperHome(seller){
    socket.emit('startScraper', {scraper:seller, mode:2})
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Count',
      },
    },
  };

  const labels = sellers;

  const data = {
    labels,
    datasets: [
      {
        label: 'Scraped Pids',
        data: labels.map((label) => graphData[label]['foundPids']),
        backgroundColor: 'green',
      },
      {
        label: 'Non-Scraped Pids',
        data: labels.map((label) => graphData[label]['nullPids']),
        backgroundColor: 'red',
      },
      {
        label: 'Mapped Pids',
        data: labels.map((label) => graphData[label]['mappedPids']),
        backgroundColor: 'Blue',
      },
    ],
  };

  return (<>
    <div className='homeInfo'>
      <div className='homeGraphs'>
        <Bar options={options} data={data} />
      </div>
       <div className='homeNotScrapedItems'>

        {
          sellers.map((seller) => {
            return <NotScrapedItemsList startScraperHome={startScraperHome} seller={seller} items={itemData[seller]['nullItems']}/> 
          })  
        }
        
      </div> 
    </div>
  </>)
}