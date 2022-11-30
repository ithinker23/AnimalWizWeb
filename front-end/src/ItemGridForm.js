import axios from 'axios'
import { useEffect, useState } from 'react'

export default function ItemGridForm({  selectedItemsInitData, updateMatchesDB, setSelectedItems, initData, setData, sellers, headerTable, setHeader }) {

  const [pid, setPid] = useState(null)
  const [pidList, setPidList] = useState([])

  useEffect(() => {
    getItems()
    // eslint-disable-next-line 
  }, [pid])

  useEffect(() => {
    getPidList()
  }, [])

  async function getPidList() {
    try {
      let list = await axios.post("http://localhost:5000/items/getPidList", { table: "a_wiz" })
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
      let res = await axios.post("http://localhost:5000/items/getItems", { table: seller, pid: pid })
      init[seller] = { data: res.data.rows, seller: seller }
      setData(init)
      setSelectedItems(selectedItemsInitData)
    });

    let res = await axios.post("http://localhost:5000/items/getItems", { table: headerTable, pid: pid })
    if (res.data.rows[0] !== undefined) {
      setHeader(res.data.rows[0])
      setSelectedItems(prev => {
        prev["pid"] = pid
        return prev
      })
    }
    else {
      setHeader({ pid: null, images: [], title: "", description: "", price: "" })
    }
  }

  return (<>
    <div className='pidNav'>
      <div className="navButton button" onClick={() => { setPid(pidList[pidList.indexOf(pid) - 1] ? pidList[pidList.indexOf(pid) - 1] : pidList[pidList.indexOf(pid)]) }}>Prev</div>
      <div className='pidPrev'>{pid}</div>
      <div className='navButton button' onClick={() => { setPid(pidList[pidList.indexOf(pid) + 1] ? pidList[pidList.indexOf(pid) + 1] : pidList[pidList.indexOf(pid)]) }}>Next</div>
    </div>
    <div className='button updateMatchesButton' onClick={updateMatchesDB}>UPDATE MATCHES</div>
  </>)
}