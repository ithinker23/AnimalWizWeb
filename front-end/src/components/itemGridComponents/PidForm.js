import { useEffect, useState, useRef } from 'react'

export default function PidForm({ expressAPI, initData, setData, sellers, storeDB, setPrevData }) {

  const [pid, setPid] = useState(null)
  const [pidList, setPidList] = useState([])
  const pidInputRef = useRef()

  useEffect(() => {
    getItems()
  }, [pid])

  useEffect(() => {
    getPidList()
  }, [])

  async function getPidList() {
    try {
      let list = await expressAPI.post("/items/getPidList", { table: storeDB })
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
    let init = initData
    sellers.forEach(async (seller) => {
      let res = await expressAPI.post("/items/getItems", { table: seller, pid: pid, sortBy: "similarity" })
      init[seller] = { data: res.data.rows, seller: seller }
      setData(init)
    });

    let res = await expressAPI.post("/items/getItems", { table: storeDB, pid: pid })
    if (res.data.rows[0] !== undefined) {
      setPrevData(res.data.rows[0])
    }
    else {
      setPrevData({ pid: null, images: [], title: "", description: "", price: "" })
    }
  }

  function changePid(){
    if(parseInt(pidInputRef.current.value) >= pidList[pidList.length-1]){
      setPid(pidList[pidList.length-1])
      return
    }
    for(let i = 0; i < pidList.length; i++){
      if(pidList[i] >= parseInt(pidInputRef.current.value)){
        setPid(pidList[i])
        break
      }
    }
  }

  return (<>
    <div className='nav'>
      <div className="navButton button" onClick={() => { setPid(pidList[pidList.indexOf(pid) - 1] ? pidList[pidList.indexOf(pid) - 1] : pidList[pidList.indexOf(pid)]) }}>Prev</div>
      <div className='navPrev'>{pid}</div>
      <div className='navButton button' onClick={() => { setPid(pidList[pidList.indexOf(pid) + 1] ? pidList[pidList.indexOf(pid) + 1] : pidList[pidList.indexOf(pid)]) }}>Next</div>
    </div>
    <div className='pidSelection'>
        <input ref={pidInputRef} className='pidInput' type="number"></input>
        <div className='pidInputSubmit button' onClick={changePid}>Go To Nearest Pid</div>
    </div>
  </>)
}