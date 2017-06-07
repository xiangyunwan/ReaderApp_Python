#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..CommonUtil import  CommonUtil
from ..items import XiaohuaItem

import time, datetime
site = 'http://www.sanwen.com'
acceptPre0 = "http://www.sanwen.com/xiaohua/"
acceptPre1 = "http://www.sanwen.com/xiaohua/"
acceptPre3 = "http://www.sanwen.com/xiaohua/"

filedir="sanwen"
maxdepth = 3;
util = CommonUtil();
class SanwenSpider(scrapy.Spider):
    name = "xiaohua"
    allowed_domains = ["sanwen.com"]
    start_urls = (
        "http://www.sanwen.com/xiaohua/baoxiaonannv/",
        "http://www.sanwen.com/xiaohua/youmoxiaohua/",
        "http://www.sanwen.com/xiaohua/lengxiaohua/",
        "http://www.sanwen.com/xiaohua/fuqixiaohua/",
        "http://www.sanwen.com/xiaohua/duanxinxiaohua/",
        "http://www.sanwen.com/xiaohua/shehuixiaohua/",
        "http://www.sanwen.com/xiaohua/xiaoyuanxiaohua/",
    )

    def parse(self, response):
        sel = Selector(response)
        count = 0;
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.sanwen.com"):
                link = "http://" + link;
            if link.startswith(acceptPre0) or link.startswith(acceptPre1) or  link.startswith(acceptPre3):
                isContinue = True;
            else:
                isContinue = False;
            fdep = util.getDep(response.url);
            if fdep is None:
                fdep = 1
            if isContinue and not util.hasUrl(link) and fdep <= maxdepth:
                util.saveUrl(link);
                util.saveDep(link, fdep+1);
                count += 1;
                request = scrapy.Request(link, callback=self.parse_url_item)
                yield request

    def parse_url_item(self, response):
        sel = Selector(response)
        count = 0;
        urls = "";
        isSave = False
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.sanwen.com"):
                link = "http://" + link;
            if link.startswith(acceptPre0) or link.startswith(acceptPre1) or link.startswith(acceptPre3):
                isContinue = True;
            else:
                isContinue = False;
            fdep = util.getDep(response.url);
            if fdep is None:
                fdep = 1
            if isContinue and not util.hasUrl(link) and fdep <= maxdepth:
                util.saveUrl(link);
                util.saveDep(link, fdep + 1);
                count += 1;
                if link.find(".html") != -1 and link.find("list") == -1:
                    urls = urls+link+"\n"
                    isSave = True
                    request = scrapy.Request(link, callback=self.parse_item)
                else:
                    request = scrapy.Request(link, callback=self.parse_url_item)
                yield request
        if response.url.find(".html") == -1 or response.url.find("list") != -1:
            self.file = open(response.url.replace(".","_").replace("http://","").replace("/","_"), 'wb')
            self.file.write(urls);

    def parse_item(self, response):
        try:
           return self.parseXiaohua(response);
        except:
            return None

    def parseXiaohua(self, response):
        sel = Selector(response)
        url = response.url
        title = sel.xpath('//div[@class="tit"]/h1/text()').extract()[0];
        content = sel.xpath('//div[@class="text"]/p').extract();
        item = XiaohuaItem();
        item['url'] = url
        item['title'] = title
        item['content'] = content
        return item;
