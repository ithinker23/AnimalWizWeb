import scrapy
from scrapy.item import Item, Field

class ScrapedItem(Item):
    pid = Field()
    title = Field()
    images = Field()
    url = Field()
    price = Field()
    description = Field()
    id = Field()