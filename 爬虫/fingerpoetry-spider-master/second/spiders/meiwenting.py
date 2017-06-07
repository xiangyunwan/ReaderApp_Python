#-*- coding:utf-8 –*-
from scrapy.selector import Selector
import os
import scrapy

from ..items import SanWenItem
import time, datetime

from ..CommonUtil import  CommonUtil
util = CommonUtil();
maxdepth = 2
site = 'http://m.meiwenting.com'
acceptPre="http://m.meiwenting.com";
class SanwenSpider(scrapy.Spider):
    name = "meiwenting"
    allowed_domains = ["m.meiwenting.com"]
    start_urls = (
        "http://m.meiwenting.com/",
        # "http://m.meiwenting.com/a/201609/100588.html",
     )

    def parse(self, response):
        sel = Selector(response)
        for link in sel.xpath('//a/@href').extract():
            if link.startswith("/"):
                link = site + link;
            if link.startswith("m.meiwenting.com"):
                link = "http://" + link;
            if link.startswith(acceptPre):
                isContinue = True;
            else:
                isContinue = False;

            if isContinue:
                util.saveUrl(link);
                util.saveDep(link, 1);
                print "link:", link + " start crawled.";
                request = scrapy.Request(link, callback=self.parse_url_item)
                yield request

    def parse_url_item(self, response):
        sel = Selector(response)
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
            print "referer:"+response.url+" dep:"+str(fdep)
            if fdep is None:
                fdep = 1
            if isContinue:

                if link.find(".html") != -1 and link.find("list") == -1:
                    if (util.get(link) is None):
                        util.saveUrl(link)
                        request = scrapy.Request(link, callback=self.parseData)
                        yield request
                    else:
                        print "link:", link + " has crawled.";
                else:
                    if fdep <= maxdepth:
                        util.saveUrl(link);
                        util.saveDep(link, fdep + 1);
                        request = scrapy.Request(link, callback=self.parse_url_item)
                        yield request
                    else:
                        print "link:", link + " has beyond max depth.";
            else :
                print "link:", link + " has crawled.";

    def parse_item(self, response):
        try:
            if response.url.startswith(acceptPre):
                item = self.parseData(response);
            return item
        except:
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
            belong = sel.xpath('//div[@class="place"]/a/text()').extract();
        except Exception as e:
            pass;
        try:
            title = sel.xpath('//h1[@class="article-title"]/text()').extract()[0];
        except Exception as e:
            pass;
        try:
            info = sel.xpath('//div[@class="article-info"]').extract();
            date = "";
            info = info[0].split();
            readNum = 0;
            count = 0;
            author = "";
            for ins in info:
                if (count == 1):
                    index = ins.encode("utf-8").find("时间:");
                    date = ins[index + 3:];
                if (count == 2):
                    ins = ins.replace("<span>", "").replace("</span>", "")
                    index = ins.encode("utf-8").find("阅读:");
                    readNum = ins[index + 3:]
                if (count == 4):
                    ins = ins.replace("</a></div>", "");
                    index = ins.encode("utf-8").find(">");
                    author = ins[index + 1:]
                count = count + 1;
        except Exception as e:
            pass;
        try:
            content = sel.xpath('//div[@class="article-content"]').extract()[0];
            index = content.find("<center")
            content = content[0:index];
            content = content+"</div>";
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

