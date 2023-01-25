import os
from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from store_scrapers.items import PetSmartItem;
from html.parser import HTMLParser
import psycopg2
import re
import sys

file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')


class PetSmartScraperSpider(scrapy.Spider):
    name = 'petsmart_scraper'

    table_name = 'petsmart'

    custom_settings = {
        "ITEM_PIPELINES": {
        'store_scrapers.pipelines.Pipeline': 300,
        }
    }

    updateMode = False 

    def start_requests(self):
        self.updateMode = self.mode
        ## Create/Connect to database
        connection = psycopg2.connect(host=cfg["db_connection"]["hostname"], user=cfg['db_connection']['username'], password=cfg['db_connection']['password'], dbname=cfg['db_connection']['database'])
        ## Create cursor, used to execute commands
        cur = connection.cursor()

        cur.execute("SELECT base_url, search_query FROM " + cfg['tables']['urls'] + " WHERE store_name = 'amazon'")

        urls = cur.fetchall()[0]

        self.base_url = urls[0]

        self.search_url = urls[1]

        ## Create quotes table if none exists
        cur.execute("""
        CREATE TABLE IF NOT EXISTS petsmart(
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            pid int NOT NULL REFERENCES animal_wiz (pid),
            title text,
            images text[],
            p_url text,
            price text, 
            description text,
            similarity integer
        )
        """)

        if(self.updateMode == 1):
            #UPDATE MAPPED ITEMS
            cur.execute("SELECT petsmart FROM " + cfg['tables']['matches'] + " WHERE petsmart is not null")
            for id in cur.fetchall():
                cur.execute("SELECT pid,p_url FROM petsmart WHERE id = " + str(id[0]))
                for res in cur.fetchall():
                    sel_script="document.querySelectorAll('.a-spacing-small.item.imageThumbnail.a-declarative').forEach((element)=>{element.click()});"
                    yield SeleniumRequest(url = res[1], callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]}, script=sel_script)
                    # yield SeleniumRequest(url = "https://portchecker.co/", callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]})
        elif(self.updateMode == 2):
            #SCRAPE NEW ITEMS FROM DATABASE
            cur.execute("SELECT aw.pid,aw.title FROM " + cfg['tables']['store'] + " aw LEFT JOIN petsmart am ON am.pid = aw.pid WHERE am.pid IS NULL and aw.title != ''")

            query_results = cur.fetchall()
            for result in query_results:
                yield scrapy.Request(url=self.base_url + self.search_url + self.sanitizeQuery(result[1]), callback=self.parse, cb_kwargs={"pid":result[0], "id":None})
        else:
            #SCRAPE MANUAL ENTRY
            yield scrapy.Request(url=self.url, callback=self.parse_product, cb_kwargs={"pid":self.pid, "id":None})

    def parse(self, response, pid, pages):
        pagesToScan = pages
        links = response.xpath(cfg['petsmart']['s_itemxpath']).getall()

        sel_script=""
        for link in links:
            yield SeleniumRequest(
                                     url=self.base_url + link, 
                                     callback=self.parse_product,
                                     script=sel_script, 
                                     cb_kwargs={"pid": pid},          
                )

        pagesToScan -= 1
        next_page = response.xpath(cfg['petsmart']['s_nextpagexpath']).get() if response.xpath(cfg['petsmart']['s_nextpagexpath']).get() != None  else []
        if(next_page != []):
            yield response.follow(next_page, callback=self.parse, cb_kwargs={"pid":pages, "pages":pid})
    
    def parse_product(self, response, pid):

        petsmart_item = PetSmartItem()

        petsmart_item["pid"] = pid
        petsmart_item['url'] = response.url


        if(response.xpath(cfg['petsmart']['p_titlexpath']).get() == None):
            f = open(str(pid) + ".txt", "w")
            f.write(response.xpath('//*').get())
            f.close()
            sys.exit()
            
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
