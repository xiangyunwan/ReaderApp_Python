# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: doc.scrapy.org/en/latest/topics/item-pipeline.html
import pymongo
import json
from bson import json_util
acceptPre0 = "sanwen.com/sanwen/"
acceptPre1 = "sanwen.com/quwen/"
acceptPre2 = "sanwen.com/xiaohua/"
acceptPre3 = "sanwen.com/lishigushi/"
acceptPre4 = "lookmw.cn/"
acceptPre5 = "m.meiwenting.com/"
acceptPre6 = "m.elanp.com";
acceptPre7 = "jj59.com";
acceptPre8 = "suibi8.com";
acceptPre9 = "rensheng5.com";
acceptPre10 = "sanwen.net";
class FilePipeline(object):
    def __init__(self):
        dir = "/Users/wizardholy/data/";
        self.sanwenFile = open(dir+'sanwen.json', 'a')
        self.quwenFile = open(dir+'quwen.json', 'a')
        self.xiaohuaFile = open(dir+'xiaohua.json', 'a')
        self.lishiFile = open(dir+'lishi.json', 'a')
        self.lookmwFile = open(dir+'lookmw.json', 'a')
        self.meiwentingFile = open(dir+'meiwenting.json', 'a')
        self.elanpFile = open(dir+'elanp.json', 'a')
        self.jj59File = open(dir+'jj59.json', 'a')
        self.suibi8File = open(dir+'suibi8.json', 'a')
        self.rensheng5File = open(dir+'rensheng5.json', 'a')
        self.sanwennetFile = open(dir+'sanwennet.json', 'a')


    def getFile(self, url):
        if url.find(acceptPre0) != -1:
            item = self.sanwenFile;
        elif url.find(acceptPre1) != -1:
            item = self.quwenFile;
        elif url.find(acceptPre2) != -1:
            item = self.xiaohuaFile;
        elif url.find(acceptPre3) != -1:
            item = self.lishiFile;
        elif url.find(acceptPre4) != -1:
            item = self.lookmwFile;
        elif url.find(acceptPre5) != -1:
            item = self.meiwentingFile;
        elif url.find(acceptPre6) != -1:
            item = self.elanpFile;
        elif url.find(acceptPre7) != -1:
            item = self.jj59File;
        elif url.find(acceptPre8) != -1:
            item = self.suibi8File;
        elif url.find(acceptPre9) != -1:
            item = self.rensheng5File;
        elif url.find(acceptPre10) != -1:
            item = self.sanwennetFile;
        return item;
    def process_item(self, item, spider):
        line = json.dumps(dict(item), default=json_util.default)
        file = self.getFile(item["url"])
        file.write(line)
        file.write("\n\r")
        return item

class MongoPipeline(object):

    def getCollectionName(self, url):
        if url.find(acceptPre0) != -1:
            item = "sanwen";
        elif url.find(acceptPre1) != -1:
            item = "quwen";
        elif url.find(acceptPre2) != -1:
            item = "xiaohua";
        elif url.find(acceptPre3) != -1:
            item = "lishi";
        elif url.find(acceptPre4) != -1:
            item = "lookmw";
        elif url.find(acceptPre5) != -1:
            item = "meiwenting";
        elif url.find(acceptPre6) != -1:
            item = "elanp";
        elif url.find(acceptPre7) != -1:
            item = "jj59";
        elif url.find(acceptPre8) != -1:
            item = "suibi8";
        elif url.find(acceptPre9) != -1:
            item = "rensheng5";
        elif url.find(acceptPre10) != -1:
            item = "sanwennet";
        return item;
    def __init__(self, mongo_uri, mongo_db):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE', 'corpus')
        )

    def open_spider(self, spider):
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        print "save item to mongodb";
        self.db[self.getCollectionName(item["url"])].insert(item)
        return item
