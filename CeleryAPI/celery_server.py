import celery
from multiprocessing import Process
from configparser import ConfigParser
import socketio
from scraper_controller import StartScrapers
import datetime as dt
import time
import math

file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')

sio = socketio.Client()
celeryApp = celery.Celery()

#----------TASKS AND EVENTS--------------

def update_mapped_items(hour):

    while True:
        hour_of_day = dt.datetime.now().second % 10

        if(hour_of_day == hour):
            pass
            # for scraper in cfg['scrapers']['names']:
            #     start_scrapy_process({'scraper':scraper, 'mode':1})
        
        time.sleep(1)


@celeryApp.task(name='updater')
def updater(hour):
    p = Process(target=update_mapped_items, kwargs={'hour':hour})
    p.start()
    p.join()

@celeryApp.task(name='start_scrapy_process')
def start_scrapy_process(data):
    p = Process(target=StartScrapers.run_crawl, kwargs=data)
    p.start()
    p.join()

@sio.event
def registercelery():
    sio.emit('registercelery')

@sio.on('startScraper')
def handle_scrapers(data):
    start_scrapy_process.delay(data)

@sio.on('updatePrices')
def update_prices(data):
    for scraper in data.get('scrapers', []):
        start_scrapy_process.delay({'scraper':scraper, 'mode':1})

@sio.on('startTracker')
def handle_trackers(data):
    updater.delay(data)

if __name__ == "__main__":
    db_url ='sqla+postgresql://'+ cfg['db_connection']['username'] +':'+ cfg['db_connection']['password'] +'@'+ cfg['db_connection']['hostname'] +'/'+ cfg['db_connection']['database']
    celeryApp.conf.update(broker_url=db_url)
        
    sio_server = 'http://' + cfg['socket_connection']['hostname'] + ':' + cfg['socket_connection']['port']
    sio.connect(sio_server)
    registercelery()

    argv = [
            'worker',
            '--loglevel=DEBUG',
            '-P','threads',
            '-E'
        ]
    celeryApp.worker_main(argv)