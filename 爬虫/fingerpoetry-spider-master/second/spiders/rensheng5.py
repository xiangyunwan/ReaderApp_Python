#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..items import SanWenItem
import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://www.rensheng5.com'
domain = "www.rensheng5.com/";
acceptPre="http://www.rensheng5.com";
class SanwenSpider(scrapy.Spider):
    name = "rensheng5"
    allowed_domains = ["rensheng5.com"]
    start_urls = (
        "http://www.rensheng5.com/",
        # "http://www.rensheng5.com/renshengganwu/id-138003.html",
     )

    def parse(self, response):
        # self.parse_item(response);
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith(domain):
                link = "http://" + link;
            if link.startswith(acceptPre):
                isContinue = True;
            else:
                isContinue = False;

            if isContinue :
                request = scrapy.Request(link, callback=self.parse_url_item)
                yield request

    def parse_url_item(self, response):
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith(domain):
                link = "http://" + link;
            if link.startswith(acceptPre):
                isContinue = True;
            else:
                isContinue = False;

            if isContinue:
                if link.find(".html") != -1 and (link.find("list") == -1 or link.find("index") == -1):
                    if (util.get(link) is None):
                        util.saveUrl(link)
                        request = scrapy.Request(link, callback=self.parseData)
                        yield request
                else:
                    request = scrapy.Request(link, callback=self.parse_url_item)
                    yield request


    def parse_item(self, response):
        try:
            print "response url:",response.url
            if response.url.startswith(acceptPre):
                item = self.parseData(response);
            return item
        except Exception as e:
            print e;
            return None

    def parseData(self, response):
        print "parse data:"+response.url
        sel = Selector(response)
        url = response.url
        belong = "";
        title = "";
        author = "";
        readNum = 0;
        content = "";
        try:
            belong = sel.xpath('//div[@class="weizhi"]/a/text()').extract();
        except Exception as e:
            pass;
        try:
            title = sel.xpath('//h1/text()').extract()[0];
        except Exception as e:
            pass;
        # print "title:"+title
        try:
            info = sel.xpath('//div[@class="artinfo"]/text()').extract()[0];
            info = info.encode("utf-8").replace('时间:',"")\
                .replace("作者:","");
            date = "";
            readNum = 0;
            count = 0;
            info = info.strip().split("　");
            # print "size:",len(info);
            for ins in info:
                if (count == 0):
                    date = ins.strip(' ').strip(' ');
                if (count == 1):
                    author = ins.strip(' ').strip(' ');
                count = count + 1;
        except Exception as e:
            pass;
        # print "info:", info;
        # author = sel.xpath('//div[@class="article_info"]/a/text()').extract()[0];
        try:
            contents = sel.xpath('//div[@class="artbody"]/p').extract();
            for c in contents:
                content = content + c;
        except Exception as e:
            pass;

        # print belong,"\n",title,"\n",info,"\n",content,"\n",readNum,"\n",date,"\n",author
        if(len(content) > 10):
            item = SanWenItem();
            item['url'] = url
            item['belong'] = belong
            item['title'] = title
            item['read'] = readNum
            item['content'] = content
            item['author']=author
            # ftime = time.strptime(date, "%Y-%m-%d")
            # y, m, d = ftime[0:3]
            # item['publishAt'] = datetime.datetime(y, m, d);
            ftime = time.localtime();
            y, m, d, h, mi, s = ftime[0:6]
            item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['publishAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['checked'] = False;
            return item;

