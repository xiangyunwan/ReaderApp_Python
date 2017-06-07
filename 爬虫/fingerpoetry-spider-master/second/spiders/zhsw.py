#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import scrapy
from ..items import SanWenItem
import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://www.sanwen.net'
domain = "www.sanwen.net";
acceptPre="http://www.sanwen.net";
class SanwenSpider(scrapy.Spider):
    name = "zhsw"
    allowed_domains = ["sanwen.net"]
    start_urls = (
        "http://www.sanwen.net",
        # "http://www.sanwen.net/subject/3854508/",
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
                if (link.find("subject") != -1 or link.find("article") != -1) and link.find("list") == -1:
                    if (util.get(link) is None):
                        util.saveUrl(link)
                        request = scrapy.Request(link, callback=self.parse_item)
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
            belong = sel.xpath('//div[@class="subnav"]/a/text()').extract();
        except Exception as e:
            pass;
        print "belong:",belong

        try:
            sel.xpath('//h1/text()').extract()[0];
        except Exception as e:
            pass;
        print "title:", title
        try:
            author = sel.xpath('//div[@class="info"]/a/text()').extract()[0];
            print "author:",author
        except Exception as e:
            pass;

        try:
            contents = sel.xpath('//div[@class="content"]/p').extract();
            for c in contents:
                content = content + c;
        except Exception as e:
            pass;
        if (len(content) > 10):
            item = SanWenItem();
            item['url'] = url
            item['belong'] = belong
            item['title'] = title
            item['read'] = readNum
            item['content'] = content
            item['author']=author
            ftime = time.localtime();
            y, m, d, h, mi, s = ftime[0:6]
            item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['publishAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['checked'] = False;
            return item;

