# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from configparser import ConfigParser
import os
from itemadapter import ItemAdapter
import psycopg2

file = 'config.ini'
cfg = ConfigParser()
cfg.read('config.ini')

class Pipeline:

    def __init__(self):

        ## Create/Connect to database
        self.connection = psycopg2.connect(host=cfg["db_connection"]["hostname"], user=cfg['db_connection']['username'], password=cfg['db_connection']['password'], dbname=cfg['db_connection']['database'])
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()



    def process_item(self, item, spider):
        ## Create quotes table if none exists
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS """+ spider.table_name +"""(
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            pid int NOT NULL REFERENCES animal_wiz (pid),
            title text,
            images text[],
            p_url text,
            description text,
            similarity integer
        )
        """)

        try:
            if(item['id'] != None):
                self.cur.execute("""select price from """ + cfg['tables']['price_history'] + """ where pid = %s and id=%s and store_name='""" + spider.table_name + """' order by time_stamp """, (
                    item['pid'],
                    item['id']
                ))

                last_price = self.cur.fetchone()
                if(last_price != None):
                    if(last_price[0] != item['price']):
                        self.cur.execute("""insert into """ + cfg['tables']['price_history'] + """(store_name, pid, id, price) VALUES ('""" + spider.table_name + """',%s,%s,%s)""", (                  
                                item['pid'],
                                item['id'],
                                item['price']
                    ))

            else:
                self.cur.execute("select p_url from " +  spider.table_name + " where p_url = '" + item['url'] + "'")
                url = self.cur.fetchone()

                if(url == None):
                    ## Define insert statement
                    self.cur.execute(""" insert into """ + spider.table_name + """ (pid, title, images, p_url, description) values (%s,%s,%s,%s,%s) """,(                  
                        item["pid"],
                        item["title"],          
                        item["images"],
                        item['url'],
                        item["description"]))

                    self.cur.execute("SELECT id FROM " + spider.table_name + " WHERE p_url = '"+item['url']+"'")
                    id = self.cur.fetchone()
                    self.cur.execute("""select price from """ + cfg['tables']['price_history'] + """ where pid = %s and id=%s and store_name='""" + spider.table_name + """' order by time_stamp """, (
                    item['pid'],
                    id
                     ))

                    last_price = self.cur.fetchone()
                    if(last_price != None):
                        if(last_price[0] != item['price']):
                            self.cur.execute("""insert into """ + cfg['tables']['price_history'] + """(store_name, pid, id, price) VALUES ('""" + spider.table_name + """',%s,%s,%s)""", (                  
                                item['pid'],
                                id,
                                item['price']
                    ))

        except Exception as error:
            raise error
    
        ## Execute insert of data into database
        self.connection.commit()
        return item

    def close_spider(self, spider):

        ## Close cursor & connection to database 
        self.cur.close()
        self.connection.close()