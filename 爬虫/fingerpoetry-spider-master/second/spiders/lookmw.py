# -*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..items import XiaohuaItem, SanWenItem

import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://www.lookmw.cn'
domain = "lookmw.cn";
acceptPre = "http://www.lookmw.cn";


class SanwenSpider(scrapy.Spider):
    name = "lookmw"
    allowed_domains = ["lookmw.cn"]
    start_urls = (
        "http://www.lookmw.cn/",
        # "http://www.lookmw.cn/jidian/110176.html",
    )

    def parse(self, response):
        # self.parseData(response)
        sel = Selector(response)
        count = 0;
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.lookmw.cn"):
                link = "http://" + link;
            if link.find(domain) != -1:
                isContinue = True;
            else:
                isContinue = False;

            if isContinue:
                request = scrapy.Request(link, callback=self.parse_item)
                yield request

    def parse_url_item(self, response):
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.lookmw.cn"):
                link = "http://" + link;
            if link.find(domain) != -1:
                isContinue = True;
            else:
                isContinue = False;

            if isContinue:
                if link.find(".html") != -1 and link.find("list") == -1:
                    if (util.get(link) is None):
                        util.saveUrl(link)
                        request = scrapy.Request(link, callback=self.parseData)
                        yield request
                else:
                    request = scrapy.Request(link, callback=self.parse_url_item)
                    yield request


    def parse_item(self, response):
        try:
            if response.url.startswith(acceptPre):
                item = self.parseData(response);
            return item
        except:
            return None

    def parseData(self, response):
        sel = Selector(response)
        url = response.url
        belong = "";
        title = "";
        author = "";
        readNum = 0;
        content = "";
        try:
            belong = sel.xpath('//div[@class="atcpath"]/a/text()').extract();
        except Exception as e:
            pass;
        try:
            title = sel.xpath('//h1/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            author = sel.xpath('//div[@class="info"]/span/a/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            content = sel.xpath('//article').extract()[0];
            content = content[0:content.find('<ul class="diggts">')];
            content = content + '</article>';
            content = content.replace('src="/uploads/', 'src="http://www.lookmw.cn/uploads/');
        except Exception as e:
            pass;

        print belong, "\n", title, "\n", author, "\n", readNum, "\n", content
        if (len(content) > 10):
            item = SanWenItem();
            item['url'] = url
            item['belong'] = belong
            item['title'] = title
            item['read'] = readNum
            item['content'] = content
            item['author'] = author
            # ftime = time.strptime(date, "%Y-%m-%d %H:%M")
            # y, m, d = ftime[0:3]
            # item['publishAt'] = datetime.datetime(y, m, d);
            ftime = time.localtime();
            y, m, d, h, mi, s = ftime[0:6]
            item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['publishAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['checked'] = False;
            return item;
