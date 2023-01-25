import os
from configparser import ConfigParser
import scrapy
from scrapy_selenium import SeleniumRequest
from scrapy.utils.response import open_in_browser
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from store_scrapers.items import PetFlowItem;
from html.parser import HTMLParser
import logging
from selenium.webdriver.remote.remote_connection import LOGGER
import psycopg2
import re
import time

LOGGER.setLevel(logging.ERROR)

logger=logging.getLogger()
logger.setLevel(logging.ERROR)



file = 'store_scrapers/config.ini'
cfg = ConfigParser()
cfg.read(file)


class PetFlowScraperSpider(scrapy.Spider):
    name = 'petflow_scraper'

    custom_settings = {
        "ITEM_PIPELINES": {
        'store_scrapers.pipelines.PetFlowPipeline': 300,
        },
        "COOKIES_ENABLED" : True
    }

    def start_requests(self):
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
            yield scrapy.Request(url=cfg['petflow']['s_baseurl'] + "/explorer?search=" + self.sanitizeQuery(query[1]), cookies={"petflow4" : "J6pq6zOchVoFvvd0nR72uqyYVPMr3EKPHpfX1DZ4;", "ConstructorioID_client_id": "48c98727-1c71-492a-8725-c34365d8c084;", "_wchtbl_uid":"e702fa9a-0d80-4f35-a5cd-40e749cfd934;", "_wchtbl_sid":"9b026c2a-e2e7-42a9-94df-1194ae7729ef;", "t025-fired":"undefined;", "_wchtbl_do_not_process":"0;", "_wchtbl_pixel_sync":"1;", "__idcontext":"eyJjb29raWVJRCI6IjI5ekFKV1U5Rjh0YnlwVEZ6RTcxVDFwSlY4NCIsImRldmljZUlEIjoiMjl6QUpVanBDYnkyMEpUM0gxcWk4WVRrYW1qIiwiaXYiOiIiLCJ2IjoiIn0%3D;", "__pr.10o7":"joSraB31Tm;", "cf_clearance":"Y1k2EWhhXA4I_8wCPCBvOpiqYyJhFG7irLuK6QeCJR4-1669107778-0-150;", "__cf_bm":"Ywo94UjrX2dGH3a5UYm.EBAFsfIMCp7ktssQj.cjx4o-1669107797-0-AXTZumF7BCHh1ij7DkccqswsoZ0FvD1j1ldsZitifsrb1fVvlj764Xp6m3pFPO6fyim3fdybDp+p3TzLYzIY2m17tRCOwhHJvBdi3hjhlKqFZIdhLgenk0ecjhPUcqqRN4lkFkYmVBmC+/RyLq91GBE=;", "shq":"638047046015303894%5E01849e71-38d1-4ea0-aaeb-27dbd9be1928%5E01849e71-38d1-456a-8fa9-5ba8c7cf6086%5E0%5E75.156.16.212"}, callback=self.parse, cb_kwargs={"pid":query[0], "pages":int(cfg['petflow']['s_pages'])})


    def parse(self, response, pid, pages):
        open_in_browser(response)
        pagesToScan = pages
        links = response.xpath(cfg['petflow']['s_itemxpath']).getall()

        sel_script=""
        for link in links:
            yield SeleniumRequest(
                                     url=cfg['petflow']['s_baseurl'] + link, 
                                     callback=self.parse_product,
                                     script=sel_script, 
                                     wait_time=10,
                                     cb_kwargs={"pid": pid},

                )

        pagesToScan -= 1
        next_page = response.xpath(cfg['petflow']['s_nextpagexpath']).get() if response.xpath(cfg['petflow']['s_nextpagexpath']).get() != None  else []
        if(next_page != []):
            yield response.follow(next_page, callback=self.parse, cb_kwargs={"pid":pid, "pages":pagesToScan})
    
    def parse_product(self, response, pid):
        petflow_item = PetFlowItem()
        petflow_item["pid"] = pid
        petflow_item['url'] = response.url
        petflow_item["title"] = response.xpath(cfg['petflow']['p_titlexpath']).get().strip()

        if(response.xpath(cfg['petflow']['p_descxpath']).get() != None):
            petflow_item["description"] = self.sanitizeQuery(self.removeHTMLFromText(response.xpath(cfg['petflow']['p_descxpath']).get()))
        else:
            petflow_item['description'] = ""

        petflow_item["price"] = response.xpath(cfg['petflow']['p_pricexpath']).get() if response.xpath(cfg['petflow']['p_pricexpath']).get() != None else response.xpath(cfg['petflow']['p_pricexpathbackup']).get() 
        
        images = []

        if(response.xpath(cfg['petflow']['p_imagescarouselxpath']).getall() != []):
            for image in response.xpath(cfg['petflow']['p_imagescarouselxpath']).getall():

                images.append(cfg['petflow']['s_baseurl'] + image.replace("50x50","maximal"))
        else:
            images.append(response.xpath(cfg['petflow']['p_imagesxpath']).get())

        petflow_item['images'] = images
        
        yield petflow_item

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
