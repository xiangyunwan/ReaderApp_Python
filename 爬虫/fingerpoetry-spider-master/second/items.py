# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class SanWenItem(scrapy.Item):
    # define the fields for your item here like:
    _id = scrapy.Field()
    url = scrapy.Field()
    belong = scrapy.Field()
    title = scrapy.Field()
    publishAt = scrapy.Field()
    read = scrapy.Field()
    content = scrapy.Field();
    createAt = scrapy.Field()
    author= scrapy.Field();
    updateAt  = scrapy.Field()
    checked = scrapy.Field()
class XiaohuaItem(scrapy.Item):
    # define the fields for your item here like:
    url = scrapy.Field()
    title = scrapy.Field()
    content = scrapy.Field()
    createAt = scrapy.Field()
    updateAt = scrapy.Field()
    checked = scrapy.Field()

