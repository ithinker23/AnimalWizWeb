import ItemGridForm from './ItemGridForm'

export default function itemPrev({ item, updateMatchesDB, setSelectedItems, initData, setHeader, headerTable, data, setData, sellers, selectedItemsInitData }) {


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
                    <div className="itemTitle">{item.title} <span className="itemPrice">${item.cost_per_item}</span></div>

                    <div className="itemDesc">{item.tags}</div>
                </div>
                <ItemGridForm  selectedItemsInitData={selectedItemsInitData} updateMatchesDB={updateMatchesDB} setSelectedItems={setSelectedItems} initData={initData} setHeader={setHeader} headerTable={headerTable} data={data} setData={setData} sellers={sellers} />
            </div>
        </div>
    </>)
}