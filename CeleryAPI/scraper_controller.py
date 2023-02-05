from store_scrapers.spiders.amazon_scraper import AmazonScraperSpider
from store_scrapers.spiders.chewy_scraper import ChewyScraperSpider
from store_scrapers.spiders.petsmart_scraper import PetSmartScraperSpider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import logging
from configparser import ConfigParser
import os
import sys

configFile = sys.argv[1]

os.environ['config'] = configFile

cfg = ConfigParser()
cfg.read(os.environ['config'])

logger = logging.getLogger(__name__)

class StartScrapers:
    def run_crawl(scraper,mode=1,url=None,pid=None):
        settings_file_path = 'store_scrapers.settings' # The path seen from root, ie. from main.py
        os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)
        process = CrawlerProcess(get_project_settings())

        if scraper == 'amazon':
            deferred = process.crawl(AmazonScraperSpider, mode=mode,url=url,pid=pid)
        elif scraper == 'chewy':
            deferred = process.crawl(ChewyScraperSpider, mode=mode,url=url,pid=pid)
        elif scraper == 'petsmart':
            deferred = process.crawl(PetSmartScraperSpider, mode=mode, url=url, pid=pid)

        process.start(install_signal_handlers=False, stop_after_crawl=True)

        return deferred

    def run_multi_crawl(scraperDatas):
        settings_file_path = 'store_scrapers.settings' # The path seen from root, ie. from main.py
        os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)
        process = CrawlerProcess(get_project_settings())
        for scraperData in scraperDatas:
            print(scraperData)
            if scraperData.get('scraper') == 'amazon':
                deferred = process.crawl(AmazonScraperSpider, mode=scraperData.get('mode',1),url=scraperData.get('url',None),pid=scraperData.get('pid',None))
            elif scraperData.get('scraper') == 'chewy':
                deferred = process.crawl(ChewyScraperSpider, mode=scraperData.get('mode',1),url=scraperData.get('url',None),pid=scraperData.get('pid',None))
            elif scraperData.get('scraper') == 'petsmart':
                deferred = process.crawl(PetSmartScraperSpider, mode=scraperData.get('mode',1), url=scraperData.get('url',None), pid=scraperData.get('pid',None))

        process.start(install_signal_handlers=False, stop_after_crawl=True)

        return deferred

#StartScrapers.run_multi_crawl([{'scraper':'amazon','mode':1}])