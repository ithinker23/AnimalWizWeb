from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from store_scrapers.items import ScrapedItem;
from html.parser import HTMLParser
import psycopg2
import re
import logging
from scrapy.utils.response import open_in_browser
from scrapy.exceptions import CloseSpider
import os
import sys

configFile = sys.argv[1]

os.environ['config'] = configFile

cfg = ConfigParser()
cfg.read(os.environ['config'])


logger = logging.getLogger(__name__)


class AmazonScraperSpider(scrapy.Spider):

    table_name = 'amazon'
    name = 'amazon_scraper'

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
        if(self.updateMode == 1):
            #UPDATE MAPPED ITEM
            cur.execute("SELECT id FROM " + cfg['tables']['matches'] + " WHERE store_name = 'amazon'")
            for id in cur.fetchall():
                cur.execute("SELECT pid,p_url FROM amazon WHERE id = " + str(id[0]))
                for res in cur.fetchall():
                    sel_script="document.querySelectorAll('.a-spacing-small.item.imageThumbnail.a-declarative').forEach((element)=>{element.click()});"
                    yield SeleniumRequest(url = res[1], callback=self.parse_product, errback=self.closeSpider, cb_kwargs={"pid":res[0], "id":id[0]}, script=sel_script)
                    # yield SeleniumRequest(url = "https://portchecker.co/", callback=self.parse_product, cb_kwargs={"pid":res[0], "id":id[0]})
        elif(self.updateMode == 2):
            #SCRAPE NEW ITEMS FROM DATABASE
            cur.execute("SELECT aw.pid,aw.title FROM " + cfg['tables']['store'] + " aw LEFT JOIN amazon am ON am.pid = aw.pid WHERE am.pid IS NULL and aw.title != ''")

            query_results = cur.fetchall()
            for result in query_results:
                yield scrapy.Request(url=self.base_url + self.search_url + self.sanitizeQuery(result[1]), callback=self.parse,errback=self.closeSpider, cb_kwargs={"pid":result[0], "id":None,'pages':int(cfg['amazon']['s_pages'])})
        else:
            #SCRAPE MANUAL ENTRY
            yield scrapy.Request(url=self.url, callback=self.parse_product,errback=self.closeSpider, cb_kwargs={"pid":self.pid, "id":None})

    def parse(self, response, pid, id, pages):
        pagesToScan = pages

        links=response.xpath(cfg['amazon']['s_itemxpath']).getall()
        sel_script="document.querySelectorAll('.a-spacing-small.item.imageThumbnail.a-declarative').forEach((element)=>{element.click()});"
        if(links == []):
            links=response.xpath(cfg['amazon']['s_itemxpathbackup']).getall()

        i_count = 0
        for link in links:
            yield SeleniumRequest(
                            url=self.base_url + link, 
                            callback=self.parse_product,
                            errback=self.closeSpider,
                            script=sel_script, 
                            cb_kwargs={"pid": pid, "id": id},
                            # wait_time=10,
                            # wait_until=EC.presence_of_element_located((By.XPATH, "//*[@class='a-offscreen'][1]"))        
                 )
            i_count += 1
            if(i_count >= 8):
                break
        pagesToScan -= 1
        next_page = response.xpath(cfg['amazon']['s_nextpagexpath']).get() if response.xpath(cfg['amazon']['s_nextpagexpath']).get() != None  else []
        if(next_page != [] and pagesToScan > 0):
            yield response.follow(next_page, callback=self.parse,errback=self.closeSpider, cb_kwargs={"pid":pid, "pages":pagesToScan, 'id':id})
                
            

    def parse_product(self, response, pid, id):
        amazon_item = ScrapedItem()
        amazon_item["pid"] = pid
        amazon_item['url'] = response.url
        amazon_item["id"] = id

        amazon_item["title"] = self.sanitizeQuery(response.xpath(cfg['amazon']['p_titlexpath']).get())

        if(response.xpath(cfg['amazon']['p_descxpath']).get() != None):
            amazon_item["description"] = self.sanitizeQuery(self.removeHTMLFromText(response.xpath(cfg['amazon']['p_descxpath']).get()))
        else:
            amazon_item['description'] = ""

        amazon_item["price"] = response.xpath(cfg['amazon']['p_pricexpath']).get()

        if(amazon_item['price'] == '\n          0% (0%)\n        ' or amazon_item['price'] == None):
            amazon_item['price'] = 'N/A'
    
        amazon_item["images"] = response.xpath(cfg['amazon']['p_imagesxpath']).getall() if response.xpath(cfg['amazon']['p_imagesxpath']).getall() != [] else response.xpath(cfg['amazon']['p_imagesxpathbackup']).getall()

        yield amazon_item

    def removeHTMLFromText(self, HTML):
        remover = HTMLTagsRemover()
        remover.feed(HTML)
        remover.close()

        return remover.get_data()
    
    def sanitizeQuery(self,query):
        return re.sub("""[^A-Za-z0-9 ]+""", '', query)

    def closeSpider(self,failure):
        raise CloseSpider(failure)
    
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


#Run with output: scrapy crawl [spidername] -O [outputfilename].json
# scrapy shell: scrapy shell -s USER_AGENT='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' https://www.amazon.com/s?k=Zesty+Paws+Tear+Stain+Bites
# scrapy shell: scrapy shell -s USER_AGENT='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' https://www.amazon.com/Zesty-Paws-Stain-Support-Chews/dp/B09HJM9N1Z