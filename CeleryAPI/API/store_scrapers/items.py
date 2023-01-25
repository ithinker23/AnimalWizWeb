import scrapy
from scrapy.item import Item, Field


class AmazonItem(Item):
    pid = Field()
    title = Field()
    images = Field()
    url = Field()
    price = Field()
    description = Field()
    id = Field()

class PetSmartItem(Item):
    pid = Field()
    title = Field()
    images = Field()
    url = Field()
    price = Field()
    description = Field()
    id = Field()

# class WalmartItem(Item):
#     pid = Field()
#     title = Field()
#     images = Field()
#     url = Field()
#     price = Field()
#     description = Field()

class ChewyItem(Item):
    pid = Field()
    title = Field()
    images = Field()
    url = Field()
    price = Field()
    description = Field()
    id = Field()

# class PetFlowItem(Item):
#     pid = Field()
#     title = Field()
#     images = Field()
#     url = Field()
#     price = Field()
#     description = Field()

    
# class PetCoItem(Item):
#     pid = Field()
#     title = Field()
#     images = Field()
#     url = Field()
#     price = Field()
#     description = Field()