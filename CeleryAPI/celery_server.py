import celery
from multiprocessing import Process
from configparser import ConfigParser
import socketio
from scraper_controller import StartScrapers
import datetime as dt
import time
import math
from celery import Task
from celery.exceptions import SoftTimeLimitExceeded

file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')

sio = socketio.Client()
celeryApp = celery.Celery()

#----------TASKS AND EVENTS--------------

class CallbackTask(Task):
    def on_success(self, retval, task_id, args, kwargs):
        updScraperStatus({'returnVal':retval, 'task_id':task_id })
        
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        updScraperStatus({'returnVal':exc, 'task_id':task_id })

# def update_mapped_items(hour):

#     while True:
#         hour_of_day = dt.datetime.now().second % 10

#         if(hour_of_day == hour):
#             pass
#             # for scraper in cfg['scrapers']['names']:
#             #     start_scrapy_process({'scraper':scraper, 'mode':1})
        
#         time.sleep(1)

# @celeryApp.task(name='updater')
# def updater(hour):
#     p = Process(target=update_mapped_items, kwargs={'hour':hour})
#     p.start()
#     p.join()

@celeryApp.task(name='start_scrapy_process', base=CallbackTask)
def start_scrapy_process(data):
    try:
        p = Process(target=StartScrapers.run_crawl, kwargs=data)
        p.start()
        p.join()
    except SoftTimeLimitExceeded:
        raise SoftTimeLimitExceeded

@celeryApp.task(name='start_multi_scrapy_process',base=CallbackTask)
def start_multi_scrapy_process(data):
    try:
        p = Process(target=StartScrapers.run_multi_crawl, kwargs={'scraperDatas':data})
        p.start()
        p.join()
    except SoftTimeLimitExceeded:
        raise SoftTimeLimitExceeded

@sio.event
def registercelery():
    sio.emit('registercelery')

@sio.on('startScraper')
def handle_scrapers(data):
    task = start_scrapy_process.apply_async(kwargs={'data':data})
    sio.emit('celeryScraperID',{'scraper':data.get('scraper'), "id":task.id})

@sio.on('updatePrices')
def update_prices(data):
    task = start_multi_scrapy_process.apply_async(kwargs={'data':data})
    sio.emit('celeryScraperID', {'scraper':'priceOptimTask', 'id':task.id})

@sio.event()
def updScraperStatus(data):
    sio.emit('updScraperStatus', data)

@sio.on('stopScraper')
def stopScraper(id):
    celeryApp.control.revoke(id, terminate=True, signal='SIGKILL')


# @sio.on('startTracker')
# def handle_trackers(data):
#     updater.delay(data)

# from celery import Task

if __name__ == "__main__":
    broker_url ='sqla+postgresql://'+ cfg['db_connection']['username'] +':'+ cfg['db_connection']['password'] +'@'+ cfg['db_connection']['hostname'] +'/'+ cfg['db_connection']['database']
    result_backend='db+postgresql://'+  cfg['db_connection']['username'] +':'+ cfg['db_connection']['password'] +'@'+ cfg['db_connection']['hostname'] +'/'+ cfg['db_connection']['database']
    celeryApp.conf.update(broker_url=broker_url)
    celeryApp.conf.update(result_backend=result_backend)

    sio_server = 'http://' + cfg['socket_connection']['hostname'] + ':' + cfg['socket_connection']['port']
    sio.connect(sio_server)
    registercelery()

    argv = [
            'worker',
            '--loglevel=DEBUG',
            '-P','threads'
        ]
    celeryApp.worker_main(argv)