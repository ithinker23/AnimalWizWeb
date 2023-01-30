import os
from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from scrapy.utils.response import open_in_browser
from store_scrapers.items import ScrapedItem;
from html.parser import HTMLParser
import psycopg2
import re


file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')

class ChewyScraperSpider(scrapy.Spider):
    name = 'chewy_scraper'

    table_name = 'chewy'
    
    def start_requests(self):
        self.updateMode = self.mode
        ## Create/Connect to database
        connection = psycopg2.connect(host=cfg["db_connection"]["hostname"], user=cfg['db_connection']['username'], password=cfg['db_connection']['password'], dbname=cfg['db_connection']['database'])
        ## Create cursor, used to execute commands
        cur = connection.cursor()

        cur.execute("SELECT base_url, search_query FROM " + cfg['tables']['urls'] + " WHERE store_name = 'chewy'")

        urls = cur.fetchall()[0]

        self.base_url = urls[0]

        self.search_url = urls[1]
        if(self.updateMode == 1):
            #UPDATE MAPPED ITEM
            cur.execute("SELECT id FROM " + cfg['tables']['matches'] + " WHERE store_name = 'chewy'")
            for id in cur.fetchall():
                cur.execute("SELECT pid,p_url FROM chewy WHERE id = " + str(id[0]))
                for res in cur.fetchall():
                    sel_script="document.querySelectorAll('.a-spacing-small.item.imageThumbnail.a-declarative').forEach((element)=>{element.click()});"
                    yield SeleniumRequest(url = res[1], callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]}, script=sel_script)
                    # yield SeleniumRequest(url = "https://portchecker.co/", callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]})
        elif(self.updateMode == 2):
            #SCRAPE NEW ITEMS FROM DATABASE
            cur.execute("SELECT aw.pid,aw.title FROM " + cfg['tables']['store'] + " aw LEFT JOIN chewy am ON am.pid = aw.pid WHERE am.pid IS NULL and aw.title != ''")

            query_results = cur.fetchall()
            for result in query_results:
                yield scrapy.Request(url=self.base_url + self.search_url + self.sanitizeQuery(result[1]), callback=self.parse, cb_kwargs={"pid":result[0], "id":None, 'pages':int(cfg['chewy']['s_pages'])})
        else:
            #SCRAPE MANUAL ENTRY
            yield scrapy.Request(url=self.url, callback=self.parse_product, cb_kwargs={"pid":self.pid, "id":None, 'pages':int(cfg['chewy']['s_pages'])})
 
    def parse(self, response, pid, id, pages):
        pagesToScan = pages
        if (pagesToScan > 0):
            links = response.xpath(cfg['chewy']['s_itemxpath']).getall()
            i_count = 0
            if(links != []):
                for link in links:
                    sel_script="""document.querySelectorAll("[data-testid='thumbnail']").forEach(elem=>{elem.click()});"""
                    yield SeleniumRequest(
                                        url=link, 
                                        callback=self.parse_product,
                                        cb_kwargs={"pid": pid, "id": id},
                                        script=sel_script
                    )
                    i_count += 1
                    if(i_count >= 8):
                        break

            pagesToScan -= 1
            next_page = response.xpath(cfg['chewy']['s_nextpagexpath']).get() if response.xpath(cfg['chewy']['s_nextpagexpath']).get() != None  else []
            if(next_page != []):
                yield response.follow(next_page, callback=self.parse,cb_kwargs={"pid": pid, "pages":pagesToScan, 'id':id} )
    
    def parse_product(self, response, pid, id):
        if(response.xpath(cfg['chewy']['p_titlexpath']).get() == None):
            open_in_browser(response)

        chewy_item = ScrapedItem()
        chewy_item["pid"] = pid
        chewy_item['url'] = response.url
        chewy_item["id"] = id
        chewy_item["title"] = self.sanitizeQuery(response.xpath(cfg['chewy']['p_titlexpath']).get())

        if(response.xpath(cfg['chewy']['p_descxpath']).get() != None):
            chewy_item["description"] = self.sanitizeQuery(self.removeHTMLFromText(response.xpath(cfg['chewy']['p_descxpath']).get()))
        else:
            chewy_item['description'] = ""

        chewy_item["price"] = response.xpath(cfg['chewy']['p_pricexpath']).get() 

        chewy_item['images'] = response.xpath(cfg['chewy']['p_imagescarouselxpath']).getall()
        
        yield chewy_item

    def removeHTMLFromText(self, HTML):
        remover = HTMLTagsRemover()
        remover.feed(HTML)
        remover.close()

        return remover.get_data()
    
    def sanitizeQuery(self,query):
        return re.sub('[^A-Za-z0-9 ]+', '', query)

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
