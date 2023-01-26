from store_scrapers.spiders.amazon_scraper import AmazonScraperSpider
from store_scrapers.spiders.chewy_scraper import ChewyScraperSpider
from store_scrapers.spiders.petsmart_scraper import PetSmartScraperSpider
from scrapy.crawler import CrawlerRunner
from scrapy.utils.project import get_project_settings
import os
import logging
from configparser import ConfigParser
from twisted.internet import reactor

logger = logging.getLogger(__name__)


file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')

class StartScrapers:
    def run_crawl(scraper,mode=1,url=None,pid=None):

        settings_file_path = 'store_scrapers.settings' # The path seen from root, ie. from main.py
        os.environ.setdefault('SCRAPY_SETTINGS_MODULE', settings_file_path)
        runner = CrawlerRunner(get_project_settings())

        if scraper == 'amazon':
            deferred = runner.crawl(AmazonScraperSpider, mode=mode,url=url,pid=pid)
        elif scraper == 'chewy':
            deferred = runner.crawl(ChewyScraperSpider, mode=mode,url=url,pid=pid)
        elif scraper == 'petsmart':
            deferred = runner.crawl(PetSmartScraperSpider, mode=mode, url=url, pid=pid)

        reactor.run(0)

        return deferred