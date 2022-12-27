import PidForm from './PidForm'

export default function itemPrev({ item, updateMatchesDB, setSelectedItems, initData, setPrevData, prevDB, data, setData, sellers, selectedItemsInitData }) {


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
                <PidForm  selectedItemsInitData={selectedItemsInitData} updateMatchesDB={updateMatchesDB} setSelectedItems={setSelectedItems} initData={initData} setPrevData={setPrevData} prevDB={prevDB} data={data} setData={setData} sellers={sellers} />
                    <div className="itemTitle">{item.title} <span className="itemPrice">${item.variant_price}</span></div>

                    <div className="itemDesc">{item.tags}</div>
                </div>
            </div>
        </div>
    </>)
}