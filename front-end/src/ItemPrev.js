import { useEffect, useState } from 'react';
import PidForm from './PidForm';

export default function ItemPrev({ expressAPI, item, updateMatchesDB, setSelectedItems, initData, setPrevData, storeDB, data, setData, sellers, selectedItemsInitData }) {
    
    const [urls,setUrls] = useState([])

    useEffect(()=>{
        getUrls()
    },[item])

    async function getUrls(){
        let res = await expressAPI.post('/urls/getSearchUrl', {stores:sellers, searchQuery:item.title})
        setUrls(res.data)
    }

    function getImages() {
        if (item.image_src != null) {
            if (typeof item.image_src == Array) {
                return item.images.map((image) => {
                    return <img src={image} alt="img" />
                })
            } else {
                return <img src={item.image_src} alt="img" />
            }
        }
    }

    return (<>
        <div className='itemPrev'>
            <div className='itemPrevTitle'>PID ITEM PREVIEW</div>
            <div className='item'>
                <div className="itemImages">
                    {
                        getImages()
                    }
                </div>
                <div className="itemContent">
                <PidForm  expressAPI={expressAPI} selectedItemsInitData={selectedItemsInitData} updateMatchesDB={updateMatchesDB} setSelectedItems={setSelectedItems} initData={initData} setPrevData={setPrevData} storeDB={storeDB} data={data} setData={setData} sellers={sellers} />
                    <div className="itemTitle">{item.title}</div>

                    <div className="itemDesc">{item.tags}</div>
                    {
                        sellers.map(seller =>{
                            return <a className="storeSearchLink" href={urls[seller]} target="_blank">{seller} search query</a>
                        })
                    }
                </div>
            </div>
        </div>
    </>)
}
