#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..items import  SanWenItem
import time, datetime
from ..CommonUtil import  CommonUtil
util = CommonUtil();
site = 'http://m.elanp.com'
domain = "m.elanp.com";

acceptPre="http://m.elanp.com";
class SanwenSpider(scrapy.Spider):
    name = "elanp"
    allowed_domains = ["m.elanp.com"]
    start_urls = (
        "http://m.elanp.com/",
        # "http://m.elanp.com/yuju/126234.html",
     )

    def parse(self, response):
        # self.parse_item(response);
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith(domain):
                link = "http://" + link;
            request = scrapy.Request(link, callback=self.parse_url_item)
            yield request

    def parse_url_item(self, response):
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith(domain):
                link = "http://" + link;

            if link.find(".html") != -1 and link.find("list") == -1:
                if(util.get(link) is None):
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
            belong = sel.xpath('//div[@class="mypos"]/a/text()').extract();
        except Exception as e:
            pass;
        try:
            title = sel.xpath('//h1/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            info = sel.xpath('//div[@class="writer"]/span').extract();
            count = 0;
            for ins in info:
                if (count == 0):
                    ins = ins.replace("<span>", "").replace("</span>", "")
                    date = ins;
                    break;
                    # insif(count == 1):
                    #     ins = ins.replace("</a></span>","");
                    #     index = ins.encode("utf-8").find(">");
                    #     author = ins[index+1:]
                    # count = count + 1;
        except Exception as e:
            pass;
        try:
            content = sel.xpath('//div[@class="content"]').extract()[0];
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
            # ftime = time.strptime(date, "%Y/%m/%d")
            # y, m, d = ftime[0:3]
            # item['publishAt'] = datetime.datetime(y, m, d);
            # ftime = time.localtime();
            # y, m, d, h, mi, s = ftime[0:6]
            # item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
            # item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
            # item['publishAt'] = datetime.datetime(y, m, d, h, mi, s);
            item['checked'] = False;
            return item;

