#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..items import SanWenItem
import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://www.sanwen.com'
acceptPre0 = "http://www.sanwen.com/sanwen/"
acceptPre1 = "http://www.sanwen.com/quwen/"
acceptPre3 = "http://www.sanwen.com/lishigushi/"

filedir="sanwen"
class SanwenSpider(scrapy.Spider):
    name = "sanwen"
    allowed_domains = ["sanwen.com"]
    start_urls = (
        'http://www.sanwen.com',
        "http://www.sanwen.com/quwen/",
        "http://www.sanwen.com/lishigushi/"
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

            if isContinue:
                request = scrapy.Request(link, callback=self.parse_url_item)
                yield request

    def parse_url_item(self, response):
        sel = Selector(response)
        count = 0;
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.sanwen.com"):
                link = "http://" + link;
            if link.startswith(acceptPre0) or link.startswith(acceptPre1) or link.startswith(acceptPre3):
                isContinue = True;
            else:
                isContinue = False;

            if isContinue :
                if link.find(".html") != -1 and link.find("list") == -1:
                    if (util.get(link) is None):
                        util.saveUrl(link)
                        request = scrapy.Request(link, callback=self.parse_item)
                        yield request
                else:
                    request = scrapy.Request(link, callback=self.parse_url_item)
                    yield request


    def parse_item(self, response):
        try:
            if response.url.startswith(acceptPre0):
                item = self.parseSanwen(response);
            elif response.url.startswith(acceptPre1):
                item = self.parseQuwen(response);
            elif response.url.startswith(acceptPre3):
                item = self.parseLishi(response);
            return item
        except:
            return None
    # def saveFile(self, path, data):
    #     fo = open(path, "w");
    #     try:
    #         fo.write(data);
    #     finally:
    #         fo.close();

    def parseLishi(self, response):
        sel = Selector(response)
        url = response.url
        belong = sel.xpath('//div[@class="fl"]/a/text()').extract()[0];
        title = sel.xpath('//div[@class="newsbox01"]/h1/text()').extract()[0];
        date = sel.xpath('//div[@class="time"]/text()').extract()[0];
        content = sel.xpath('//div[@id="newscont"]').extract()[0];
        date = date.split(" ")[0]
        item = SanWenItem();
        item['url'] = url
        item['belong'] = belong
        item['title'] = title
        item['read'] = 0
        item['content'] = content
        ftime = time.strptime(date, "%Y-%m-%d")
        y, m, d = ftime[0:3]
        item['publishAt'] = datetime.datetime(y, m, d);
        ftime = time.localtime();
        y, m, d, h, mi, s = ftime[0:6]
        item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['checked'] = False;
        return item;

    def parseSanwen(self, response):
        sel = Selector(response)
        url = response.url
        belong = sel.xpath('//div[@class="breadcrumb"]/a/text()').extract();
        title = sel.xpath('//div[@class="row-article"]/h1/text()').extract()[0];
        date = sel.xpath('//div[@class="article-writer"]/div/text()').extract()[0];
        date = date.encode("utf-8").replace("阅读", "").replace("时间", "").replace("：", "").replace("\xc2\xa0\xc2\xa0",
                                                                                                 "").strip();
        readnum = sel.xpath('//div[@class="article-writer"]/div/span/text()').extract()[0];
        content = sel.xpath('//div[@class="article-content"]').extract()[0];
        item = SanWenItem();
        item['url'] = url
        item['belong'] = belong
        item['title'] = title
        item['read'] = readnum
        item['content'] = content
        ftime = time.strptime(date, "%Y-%m-%d")
        y, m, d = ftime[0:3]
        item['publishAt'] = datetime.datetime(y, m, d);
        ftime = time.localtime();
        y, m, d, h, mi, s = ftime[0:6]
        item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['checked'] = False;
        return item;

    def parseQuwen(self, response):
        sel = Selector(response)
        url = response.url
        belong = sel.xpath('//div[@class="z"]/a/text()').extract();
        title = sel.xpath('//h1[@class="ph"]/text()').extract()[0];
        paras = sel.xpath('//div[@class="h hm"]/p/text()').extract();
        readnum = paras[1].encode("utf-8").replace("共", "").replace("人围观", "").strip();
        date = paras[2].strip().encode("utf-8")
        content = sel.xpath('//td[@id="article_content"]').extract()[0];
        item = SanWenItem();
        item['url'] = url
        item['belong'] = belong
        item['title'] = title
        item['read'] = readnum
        item['content'] = content
        # ftime = time.strptime(date, "%Y-%m-%d")
        # y, m, d = ftime[0:3]
        # item['publishAt'] = datetime.datetime(y, m, d);
        ftime = time.localtime()
        y, m, d, h, mi, s = ftime[0:6]
        item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['publishAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['checked'] = False;
        return item;
