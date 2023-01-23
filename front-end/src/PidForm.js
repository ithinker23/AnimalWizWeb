import axios from 'axios'
import { useEffect, useState } from 'react'

export default function PidForm({ initData, setData, sellers, storeDB, setPrevData }) {

  const [pid, setPid] = useState(null)
  const [pidList, setPidList] = useState([])

  useEffect(() => {
    getItems()
  }, [pid])

  useEffect(() => {
    getPidList()
  }, [])

  async function getPidList() {
    try {
      let list = await axios.post("http://localhost:5000/items/getPidList", { table: storeDB })
      let newList = []
      list.data.rows.forEach(pid => {
        newList.push(pid.pid)
      })
      setPidList(newList)
      setPid(newList[0])
    } catch (err) {
      throw err
    }
  }

  async function getItems() {
    console.log("UPDATING ITEMS")
    let init = initData
    sellers.forEach(async (seller) => {
      let res = await axios.post("http://localhost:5000/items/getItems", { table: seller, pid: pid, sortBy: "similarity" })
      init[seller] = { data: res.data.rows, seller: seller }
      setData(init)
    });

    let res = await axios.post("http://localhost:5000/items/getItems", { table: storeDB, pid: pid })
    if (res.data.rows[0] !== undefined) {
      setPrevData(res.data.rows[0])
    }
    else {
      setPrevData({ pid: null, images: [], title: "", description: "", price: "" })
    }
  }

  return (<>
    <div className='nav'>
      <div className="navButton button" onClick={() => { setPid(pidList[pidList.indexOf(pid) - 1] ? pidList[pidList.indexOf(pid) - 1] : pidList[pidList.indexOf(pid)]) }}>Prev</div>
      <div className='navPrev'>{pid}</div>
      <div className='navButton button' onClick={() => { setPid(pidList[pidList.indexOf(pid) + 1] ? pidList[pidList.indexOf(pid) + 1] : pidList[pidList.indexOf(pid)]) }}>Next</div>
    </div>
  </>)
}