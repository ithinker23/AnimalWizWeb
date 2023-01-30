import os
from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from store_scrapers.items import ScrapedItem;
from html.parser import HTMLParser
import psycopg2
import re
import sys
from scrapy.utils.response import open_in_browser


file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')


class PetSmartScraperSpider(scrapy.Spider):
    name = 'petsmart_scraper'

    table_name = 'petsmart'

    def start_requests(self):
        self.updateMode = 2
        ## Create/Connect to database
        connection = psycopg2.connect(host=cfg["db_connection"]["hostname"], user=cfg['db_connection']['username'], password=cfg['db_connection']['password'], dbname=cfg['db_connection']['database'])
        ## Create cursor, used to execute commands
        cur = connection.cursor()

        cur.execute("SELECT base_url, search_query FROM " + cfg['tables']['urls'] + " WHERE store_name = 'petsmart'")

        urls = cur.fetchall()[0]

        self.base_url = urls[0]

        self.search_url = urls[1]
        if(self.updateMode == 1):
            #UPDATE MAPPED ITEM
            cur.execute("SELECT id FROM " + cfg['tables']['matches'] + " WHERE store_name = 'petsmart'")
            for id in cur.fetchall():
                cur.execute("SELECT pid,p_url FROM petsmart WHERE id = " + str(id[0]))
                for res in cur.fetchall():
                    sel_script="document.querySelectorAll('.a-spacing-small.item.imageThumbnail.a-declarative').forEach((element)=>{element.click()});"
                    yield SeleniumRequest(url = res[1], callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0], 'pages':int(cfg['petsmart']['s_pages'])}, script=sel_script)
                    # yield SeleniumRequest(url = "https://portchecker.co/", callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]})
        elif(self.updateMode == 2):
            #SCRAPE NEW ITEMS FROM DATABASE
            cur.execute("SELECT aw.pid,aw.title FROM " + cfg['tables']['store'] + " aw LEFT JOIN petsmart am ON am.pid = aw.pid WHERE am.pid IS NULL and aw.title != ''")

            query_results = cur.fetchall()
            for result in query_results:
                yield scrapy.Request(url=self.base_url + self.search_url + self.sanitizeQuery(result[1]), callback=self.parse, cb_kwargs={"pid":result[0], "id":None, 'pages':int(cfg['petsmart']['s_pages'])})
        else:
            #SCRAPE MANUAL ENTRY
            yield scrapy.Request(url=self.url, callback=self.parse_product, cb_kwargs={"pid":self.pid, "id":None, 'pages':int(cfg['petsmart']['s_pages'])})

    def parse(self, response, pid, id, pages):
        pagesToScan = pages
        links = response.xpath(cfg['petsmart']['s_itemxpath']).getall()

        sel_script=""
        for link in links:
            yield scrapy.Request(
                                     url=self.base_url + link, 
                                     callback=self.parse_product,
                                     #script=sel_script, 
                                     cookies={'_schn':'_48jdl7',' SSLB':'1',' SSID_P':'CQAKQx3gAAAAAADQf9VjSlpBAdB_1WMBAAAAAAD8g6F20H_VYwAUmbfdAAMy4x4A0H_VYwEAggUBATncIgDQf9VjAQDk_gABn00iANB_1WMBAL0EAQGPyyIA0H_VYwEAYNAAASIlHQDQf9VjAQAaDwEBUKIjANB_1WMBAMUDAQEauCIA0H_VYwEA2xIBAXD8IwDQf9VjAQDWGQEB4XckANB_1WMBANH0AAGgjyEA0H_VYwEA7QEBAaeLIgDQf9VjAQBiFQED0S0kANB_1WMBAKQKAQGqQyMA0H_VYwEA99UAA3UkHgDQf9VjAQBXFgEBKT8kANB_1WMBANoSAQFu_CMA0H_VYwEA',' SSSC_P':'441.G7193796511145220682.1|53344.1910050:54775.1975413:56759.2024242:62673.2199456:65252.2248095:66029.2263975:66501.2275354:66749.2280335:66946.2284601:68260.2311082:69402.2335312:70362.2358382:70363.2358384:71010.2371025:71255.2375465:72150.2389985',' __cq_dnt':'0',' dwsid':'E_VI9len0Z7vpJ672WAR88lIZQfEH_2gNvsyJ9IfgleojL6IL6oPBRA_Pal77LlDmMyfcPwmzx58rRMnqp0a1w==',' dw_dnt':'0',' cquid':'||',' StoreCookie':'0395',' sid':'sWLAg_tuUyIf_4tSr2FWK2vf7XJo1n8cxqA',' cqcid':'abKX5JbGpNErHeVqitybQwJdER',' dwanonymous_97eb123f58861ca0e85c8ab7da0243f7':'abKX5JbGpNErHeVqitybQwJdER',' dwac_8bff7774ac20a09cf0c47379d7':'sWLAg_tuUyIf_4tSr2FWK2vf7XJo1n8cxqA%3D|dw-only|||USD|false|US%2FMountain|true',' _gcl_au':'1.1.1025830225.1674936274',' amp_365902':'9uWkAIODc1IZmgg19fqW3j...1gnsvmjsc.1gnsvmjse.0.1.1',' dw':'1',' dw_cookies_accepted':'1',' amp_f24a38':'67SZ8q9-aaqru7T-N75fvf...1gnsvmkoo.1gnsvmkoo.0.0.0',' _gid':'GA1.2.1316127984.1674936276',' _gat_UA-2102920-9':'1',' _gat_UA-2102920-39':'1',' _gat_ssTracker':'1',' cimcid':'46fa164a-83bf-44b3-a18f-5a22b2087b2f',' salsify_session_id':'31933a39-354e-4841-9a1d-b487494cdca3',' _fbp':'fb.1.1674936276384.1988987283',' SSRT_P':'1H_VYwADAA',' __cq_uuid':'abKX5JbGpNErHeVqitybQwJdER',' __cq_bc':'%7B%22abbb-PetSmart%22%3A%5B%7B%22id%22%3A%2218177%22%2C%22sku%22%3A%225142844%22%7D%5D%7D',' __cq_seg':'0~0.00!1~0.00!2~0.00!3~0.00!4~0.00!5~0.00!6~0.00!7~0.00!8~0.00!9~0.00',' bm_mi':'E11982287D38BA8A3E2D996B9DA28AA2~YAAQXMfCzwzuysOFAQAAO1b7+RKnJ4XHxIJmW5B3Ocf7nbsxmEvdsa6wxdK7weJqTmgY5G43cLuLoZvFa37+xtvfKWiJ6Zr/aAq7udYqIeOmssXBq4pQ4e13mHluha6knGGj+DXVmGpe60ikSiw4wG/pHTosy5v7HInTE8s/uCWBBo24jJCvWBw8hFcP8PjMBTofc9Te/lIYNwYKgNnSlIQRWF01PR/Wt90O3eDQKMt/moyjelr35XtBgqyJcqjugCZQkoK8m7tGLzvRbwYd6HXBCWYf6dNjvgkBzMikNm006ZIDQ9SCcVBOwUC2ZcgoLaIAMpXsGLwkOz82rkawxdj0kYhRZFcCA3NTRieI0g28w/et8VZnFMjj1nGOvRXsyyP1BFiCj/Ps8oXSkb25tTD2GwNmOzRN9dNiBEiegfo=~1',' _dpm_ses.e43b':'*',' _dpm_id.e43b':'a7d30059-d4c9-44ff-b27f-8cae5f896769.1674936277.1.1674936277.1674936277.b991b183-0d31-483d-8a14-6c0f8e09bccc',' IR_gbd':'petsmart.com',' IR_11083':'1674936275993%7C0%7C1674936275993%7C%7C',' fs_uid':'#Z833J#6417808825307136:5049242314133504:::#/1706472275',' BVBRANDID':'b9a1c02d-c0ac-44dc-9957-b27e3f3a3340',' BVBRANDSID':'71190067-0e0c-4da6-908a-01eb93556a00',' OptanonConsent':'isIABGlobal=false&datestamp=Sat+Jan+28+2023+12%3A04%3A36+GMT-0800+(Pacific+Standard+Time)&version=6.5.0&hosts=&landingPath=https%3A%2F%2Fwww.petsmart.com%2Ffish%2Ffood-and-care%2Fsalt-water-aquarium-care%2Fapi-aquarium-salt-18177.html%3Ffmethod%3DSearch&groups=C0004%3A0%2CC0005%3A0%2CC0002%3A0%2CC0003%3A0%2CC0001%3A1',' og_session_id':'37a498f412ec11e6a4a3bc764e106cf4.690055.1674936277',' _ga_YJSRPR4KN4':'GS1.1.1674936276.1.0.1674936276.60.0.0',' _ga':'GA1.1.297799553.1674936276',' BVImplmain_site':'4830',' __adroll_fpc':'050da06058ac961fcbcb91b12db7d1a4-1674936277035',' _scid':'4747634d-8d82-46fe-a00b-56871b5bf328',' __ar_v4':'%7COMMQVWAHEBD2LNMUKOBSKK%3A20230127%3A1%7CS2QCIQ347FED7GYPUJSA73%3A20230127%3A1%7C6O7CKZ6ON5ASNE6CNA62X4%3A20230127%3A1',' _sctr':'1|1674892800000',' _tt_enable_cookie':'1',' _ttp':'n4kxNQG2hyyjyHhUr_9o1qSELVz',' _pin_unauth':'dWlkPU5UZG1ZamRtT0RZdFpXVmtNeTAwWXpjM0xXRXdaR1F0T1RkbU9EQmlZamN4T1dJNA',' mdLogger':'false',' kampyle_userid':'aa64-016b-234d-ccc1-bdc2-6a78-d7be-7395',' kampyleUserSession':'1674936279787',' kampyleUserSessionsCount':'1',' kampyleSessionPageCounter':'1',' kampyleUserPercentile':'98.2779211676647',' _uetsid':'ff5b05109f4611eda849a7f83ad99e41',' _uetvid':'ff5b48009f4611ed81fb5d90a9f8622d',' ak_bmsc':'F8B61F446EFD5016D892C11D8B9EAF76~000000000000000000000000000000~YAAQXMfCz5juysOFAQAAiGj7+RJc5u9iTgTXVvW77f2rpnKYzvKQ8cJhVBBEvYHNAgwEwj9y0k9zxxBsclyaKAmKa6MuMx5ab/6QirVsCbiOwHN3aBU/ECQh4YBQXahK4bMFUeusOs6aP8P/uxntddTRD7zpctEzpAzbZXFJw8tlQRUhA3MNHQTA10alKLsgvRIO6tUVChqBZr+PsKGecxZmDicjUPNxYPInZHGwZCCkLyqpSXMWjKU4YsdESnCSrXQNFqPOYVMSZ8eZSGN2uZ35T75jtIHoRGRjb9hFrxQPr5tCu7b19FJER5matyyhFTGToS1yWrXqbQirUBeZYsvWR7hC3kUW4pWxLnqSl7+BWLglLs8jOuwoQb3whSTo4+3woZHRqDmeDwdBqiws8jere9O1hGF3Xw6k8cVtCBCTkakrWJwy6jko2mt25CpckCC8OjHIbByCECQM0y92PqslPp/aeYASA8QLJocxqSi1TuwhOW9HimZP5Su4s657XkxsnNU6vnHdFIVVS8JJ+FjDpXP/arqFzx8npfZ1Qr/BnuQPUOwzOxaDLdZv3vMnbLmSJKbGPDUtVJIF0WPwp5yWivyM/cjtXN2BKZrq4VMv',' bm_sv':'1F502611BAD76F44F223914187911719~YAAQXMfCz5nuysOFAQAAiGj7+RK/zjahNO9u6mhZALvKYzS0Bt2oh3lfGxd7IKNETQ2fg6IJZc8mWxOty5Ya2GOXa1uUBdZZ0ClfV5x8KweO3FyDwUzqtMt2G/vUknwGRdwQkYo86H/YgECt+/Q3XpzbmWk1K6PZwRaBXxRWBQv6NMwbZzjYTWHx8yNbUjhKskXjU31wArJ5XSQO1iO4uiGZ3SvNLNmEz/dzQiTXZqnLawF5oR9MtoZL1FQe5TBJqlc=~1',' SSOD_P':'ABaRAAAAJADABBEAAQAAANB_1WPQf9VjAQCswA4AAwAAANl_1WPZf9VjAwAAAA'},
                                     cb_kwargs={"pid": pid, 'id':id},          
                )

        pagesToScan -= 1
        next_page = response.xpath(cfg['petsmart']['s_nextpagexpath']).get() if response.xpath(cfg['petsmart']['s_nextpagexpath']).get() != None  else []
        if(next_page != []):
            yield response.follow(next_page, callback=self.parse, cb_kwargs={"pid":pid, "pages":pages, 'id':id})
    
    def parse_product(self, response, pid, id):

        petsmart_item = ScrapedItem()

        petsmart_item["pid"] = pid
        petsmart_item['url'] = response.url
        petsmart_item['id'] = id

        if(response.xpath(cfg['petsmart']['p_titlexpath']).get() == None):
            print(response.request.headers)
            
        petsmart_item["title"] = self.sanitizeQuery(response.xpath(cfg['petsmart']['p_titlexpath']).get())

        if(response.xpath(cfg['petsmart']['p_descxpath']).get() != None):
            petsmart_item["description"] = self.sanitizeQuery(self.removeHTMLFromText(response.xpath(cfg['petsmart']['p_descxpath']).get()))
        else:
            petsmart_item['description'] = ""

        petsmart_item["price"] = response.xpath(cfg['petsmart']['p_pricexpath']).get() if response.xpath(cfg['petsmart']['p_pricexpath']).get() != None else response.xpath(cfg['petsmart']['p_pricexpathbackup']).get() 
        
        images = []

        if(response.xpath(cfg['petsmart']['p_imagescarouselxpath']).getall() != []):
            for image in response.xpath(cfg['petsmart']['p_imagescarouselxpath']).getall():

                images.append(image.split("?")[0])
        else:
            images.append(response.xpath(cfg['petsmart']['p_imagesxpath']).get())

        petsmart_item['images'] = images
        
        yield petsmart_item

    def removeHTMLFromText(self, HTML):
        remover = HTMLTagsRemover()
        remover.feed(HTML)
        remover.close()

        return remover.get_data()
    
    def sanitizeQuery(self,query):
        return re.sub("""[^A-Za-z0-9 ]+""", '', query)
    
class HTMLTagsRemover(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.reset()
        self.convert_charrefs = True
        self.fed = []

    def handle_data(self, data):
        self.fed.append(data)

    def handle_entityref(self, name):
        self.fed.append(f'&{name};')

    def handle_charref(self, name):
        self.fed.append(f'&#{name};')

    def get_data(self):
        return ''.join(self.fed)
