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
import os
import sys

configFile = sys.argv[1]

os.environ['config'] = configFile

cfg = ConfigParser()
cfg.read(os.environ['config'])

sio = socketio.Client()
celeryApp = celery.Celery()

#----------TASKS AND EVENTS--------------

class CallbackTask(Task):
    def on_success(self, retval, task_id, args, kwargs):
        updScraperStatus({'returnVal':retval, 'task_id':task_id,'isError':False })
        
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        updScraperStatus({'returnVal':str(einfo), 'task_id':task_id, 'isError':True })

@celeryApp.task(name='start_scrapy_process', base=CallbackTask)
def start_scrapy_process(data):
    try:
        p = Process(target=StartScrapers.run_crawl, kwargs={'scraper':data.get('scraper'), 'mode':data.get('mode'), 'url':data.get('url',None), 'pid':data.get('pid',None)})
        p.start()
        p.join()
        return "Scraper Has Finished Running"
    except SoftTimeLimitExceeded:
        raise SoftTimeLimitExceeded

# @celeryApp.task(name='test', base=CallbackTask)
# def test(data):
#     print("running test")
#     time.sleep(100)
#     return "done test"


@celeryApp.task(name='start_multi_scrapy_process',base=CallbackTask)
def start_multi_scrapy_process(data):
    print(data)
    try:
        p = Process(target=StartScrapers.run_multi_crawl, kwargs={'scraperDatas':data})
        p.start()
        p.join()
        return "Prices Have Been Updated"
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
    print(data)
    task = start_multi_scrapy_process.apply_async(kwargs={'data':data})
    sio.emit('celeryScraperID', {'scraper':'priceOptimTask', 'id':task.id})

@sio.event()
def updScraperStatus(data):
    sio.emit('updScraperStatus', data)

@sio.on('stopScraper')
def stopScraper(id):
    signalToSend = 'SIGKILL'
    print('sending signal: ' + signalToSend)
    celeryApp.control.revoke(id, terminate=True, signal=signalToSend)

if __name__ == "__main__":
    broker_url ='amqp://'+ cfg['rabbitMQ']['username'] +':'+ cfg['rabbitMQ']['password'] +'@'+ cfg['rabbitMQ']['hostname'] + ':5672/'
    print(broker_url)
    celeryApp.conf.update(broker_url=broker_url)

    sio_server = 'http://' + cfg['socket_connection']['hostname'] + ':' + cfg['socket_connection']['port']
    sio.connect(sio_server)
    registercelery()

    argv = [
            'worker',
            '-P', 'threads',]
    celeryApp.worker_main(argv)