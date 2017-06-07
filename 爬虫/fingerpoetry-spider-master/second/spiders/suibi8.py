#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..items import XiaohuaItem, SanWenItem
import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://www.suibi8.com'
maxdepth = 100;
domain = "www.suibi8.com";
acceptPre="http://www.suibi8.com";
class SanwenSpider(scrapy.Spider):
    name = "suibi8"
    allowed_domains = ["suibi8.com"]
    start_urls = (
        "http://www.suibi8.com",
        # "http://www.suibi8.com/shige/46713/huaxie.html",
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

            if isContinue :
                if link.find(".html") != -1 and (link.find("list") == -1 or link.find("page") == -1):
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
            belong = sel.xpath('//div[@class="position"]/a/text()').extract();
        except Exception as e:
            pass;
        try:
            title = sel.xpath('//h1/a/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            info = sel.xpath('//div[@class="article_info"]').extract()[0];
            info = info.encode("utf-8").replace('<div class="article_info">时间：',"")\
                .replace("作者：","").replace("次</div>","").replace("</a> 阅读："," ");
            date = "";
            count = 0;
            info = info.split(" ");
            for ins in info:
                if (count == 0):
                    date = ins;
                if (count == 1):
                    date = date + " " + ins;
                if (count == 3):
                    author = ins[ins.find(">") + 1:];
                if (count == 4):
                    readNum = ins;
                count = count + 1;
        except Exception as e:
            pass;
        try:
            author = sel.xpath('//div[@class="article_info"]/a/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            contents = sel.xpath('//div[@class="article_content"]/p').extract();
            for c in contents:
                content = content + c;
        except Exception as e:
            pass;
        # print belong,"\n",title,"\n",info,"\n",content,"\n",readNum,"\n",date,"\n",author
        if (len(content) > 10):
            item = SanWenItem();
            item['url'] = url
            item['belong'] = belong
            item['title'] = title
            item['read'] = readNum
            item['content'] = content
            item['author']=author
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

