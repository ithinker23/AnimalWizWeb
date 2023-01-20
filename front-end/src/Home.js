import { useEffect, useState } from 'react';
import io from 'socket.io-client'
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

const socket = io.connect('http://localhost:5001')

export default function Home({ sellers }) {
  let initItemData = {}
  sellers.forEach(seller => {
    initItemData[seller + " nullPids"] = []
  });
  console.log(initItemData)
  const [graphData, setGraphData] = useState({})
  const [itemData, setItemData] = useState(initItemData)

  useEffect(() => {
    socket.emit('startPostingData', sellers)

    socket.on("postGraphData", (data) => {
      setGraphData(data)
    })

    socket.on("postItemData", (data) => {
      setItemData(data)
    })

  }, [socket])

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
        data: labels.map((label) => graphData[label + " foundPids"]),
        backgroundColor: 'green',
      },
      {
        label: 'Non-Scraped Pids',
        data: labels.map((label) => graphData[label + " nullPids"]),
        backgroundColor: 'red',
      },
      {
        label: 'Mapped Pids',
        data: labels.map((label) => graphData[label + " mappedPids"]),
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
            return <NotScrapedItemsList seller={seller} items={itemData[seller + ' nullPids']}/> 
          })

        }
        
      </div>
    </div>
  </>)
}