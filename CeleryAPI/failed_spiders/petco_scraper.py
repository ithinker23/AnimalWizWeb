import os
from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from scrapy.utils.response import open_in_browser
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from store_scrapers.items import PetCoItem;
from html.parser import HTMLParser
import logging
from selenium.webdriver.remote.remote_connection import LOGGER
import psycopg2
import re
import time
from selenium.webdriver.support.wait import WebDriverWait
import random
LOGGER.setLevel(logging.ERROR)

file = 'store_scrapers/config.ini'
cfg = ConfigParser()
cfg.read(file)

class PetCoScraperSpider(scrapy.Spider):
    name = 'petco_scraper'

    custom_settings = {
        "ITEM_PIPELINES": {
        'store_scrapers.pipelines.PetCoPipeline': 300,
        }
    }

    def start_requests(self):
        yield SeleniumRequest(url= cfg['petco']['s_setlocationurl'], callback=self.search, script='document.querySelectorAll(".btn.btn-primary.btn-large")[1].click()')
        
    def search(self, response):
         ## Connection Details
        hostname = 'localhost'
        username = 'postgres'
        password = 'Bush1234%' # your password
        database = 'scrapyproducts'

        ## Create/Connect to database
        connection = psycopg2.connect(host=hostname, user=username, password=password, dbname=database)
        
        ## Create cursor, used to execute commands
        cur = connection.cursor()

        cur.execute("SELECT pid,title FROM animal_wiz ORDER BY pid")
        search_querys = cur.fetchall()
        for query in search_querys:
            time.sleep(random.randint(2,5))
            yield SeleniumRequest(
                url=cfg['petco']['s_baseurl'] + "/shop/en/petcostore/search?query=" + self.sanitizeQuery(query[1]), 
                callback=self.parse,
                cb_kwargs={"pid":query[0], "pages":int(cfg['petco']['s_pages'])}
                )



    def parse(self, response, pid, pages):
        driver = response.request.meta['driver']
        WebDriverWait(driver,timeout=100).until(EC.presence_of_element_located((By.XPATH,cfg['petco']['s_waitforitemsxpath'])))
        pagesToScan = pages
        links = response.xpath(cfg['petco']['s_itemxpath']).getall()
        sel_script=""
        for link in links:
            time.sleep(random.randint(2,5))
            yield SeleniumRequest(
                                     url=cfg['petco']['s_baseurl'] + link, 
                                     callback=self.parse_product,
                                     script=sel_script, 
                                     wait_time=10,
                                     cb_kwargs={"pid": pid}                   
                )

        pagesToScan -= 1
        next_page = response.xpath(cfg['petco']['s_nextpagexpath']).get() if response.xpath(cfg['petco']['s_nextpagexpath']).get() != None  else []
        if(next_page != []):
            yield response.follow(next_page, callback=self.parse, cb_kwargs={"pid":pid, "pages":pagesToScan})
    
    def parse_product(self, response, pid):
        petco_item = PetCoItem()

        petco_item["pid"] = pid
        petco_item['url'] = response.url
        petco_item["title"] = response.xpath(cfg['petco']['p_titlexpath']).get().strip()

        if(response.xpath(cfg['petco']['p_descxpath']).get() != None):
            petco_item["description"] = self.sanitizeQuery(self.removeHTMLFromText(response.xpath(cfg['petco']['p_descxpath']).get()))
        else:
            petco_item['description'] = ""

        petco_item["price"] = response.xpath(cfg['petco']['p_pricexpath']).get() if response.xpath(cfg['petco']['p_pricexpath']).get() != None else response.xpath(cfg['petco']['p_pricexpathbackup']).get() 
        
        petco_item['images'] = response.xpath(cfg['petco']['p_imagescarouselxpath']).getall()
        
        yield petco_item

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
