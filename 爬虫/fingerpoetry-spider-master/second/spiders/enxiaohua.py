#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy
from ..CommonUtil import  CommonUtil
from ..items import XiaohuaItem, SanWenItem

import time, datetime
site = 'http://www.lookmw.cn'
maxdepth = 10;
util = CommonUtil();
acceptPre="http://www.lookmw.cn";
class SanwenSpider(scrapy.Spider):
    name = "lookmw"
    allowed_domains = ["lookmw.cn"]
    start_urls = (
        "http://www.neowin.net/forum/forum/48-jokes-funny-stuff/",
        # "http://www.lookmw.cn/lovesuibi/110172.html",
    )

    def parse(self, response):
        sel = Selector(response)
        count = 0;
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.lookmw.cn"):
                link = "http://" + link;
            if link.startswith(acceptPre):
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
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("www.lookmw.cn"):
                link = "http://" + link;
            if link.startswith(acceptPre):
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
                    request = scrapy.Request(link, callback=self.parseData)
                else:
                    request = scrapy.Request(link, callback=self.parse_url_item)
                yield request

    def parse_item(self, response):
        try:
            if response.url.startswith(acceptPre):
                item = self.parseSanwen(response);
            return item
        except:
            return None

    def parseData(self, response):
        sel = Selector(response)
        url = response.url
        belong = sel.xpath('//div[@class="place"]/a/text()').extract();
        title = sel.xpath('//div[@class="title"]/h2/text()').extract()[0];
        info = sel.xpath('//div[@class="info"]/text()').extract();
        content = sel.xpath('//div[@class="content"]').extract()[0];
        findex = content.find('<ul class="pagelist">');
        content= content[:findex-1]+"</div>";
        date = info[1].strip();
        author = info[3];
        # print belong,"\n",title,"\n",date,author,"\n",content

        item = SanWenItem();
        item['url'] = url
        item['belong'] = belong
        item['title'] = title
        item['read'] = 0
        item['content'] = content
        item['author']=author
        ftime = time.strptime(date, "%Y-%m-%d %H:%M")
        y, m, d = ftime[0:3]
        item['publishAt'] = datetime.datetime(y, m, d);
        ftime = time.localtime();
        y, m, d, h, mi, s = ftime[0:6]
        item['createAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['updateAt'] = datetime.datetime(y, m, d, h, mi, s);
        item['checked'] = False;
        return item;

