# coding:utf8
from .MemcachedUtil import MemcachedClient;

mc = MemcachedClient(["127.0.0.1:11211"]);


class CommonUtil():
    def saveUrl(self, url):
        mc.set("url_"+str(url.__hash__()), url);

    def get(self, url):
        return mc.get("url_"+str(url.__hash__()));

    def hasUrl(self, url):
        return self.get(url) != None;

    def saveDep(self, url, depth):
        mc.set("dep_" + str(url.__hash__()), depth);

    def getDep(self, url):
        return mc.get("dep_" + str(url.__hash__()));

    def hasDep(self, url):
        return self.getDep("dep_" + str(url.__hash__())) != None;


if __name__ == '__main__':
    util = CommonUtil();
    key = "nadssme"
    print "key的hash结果：", key.__hash__()
    result = mc.set(key, "NeYsdsdsong")
    print "set的结果：", result
    name = mc.get(key)
    print "get的结果：", name
    print "has的结果：", mc.has(key);
    result = mc.delete(key)
    print "delete的结果：", result
    print "has的结果：", mc.has(key);
    url = 'http://www.sanwen.com/gsw/919304.html';
    print (url.__hash__())
