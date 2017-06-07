#coding:utf8
import memcache

class MemcachedClient():
    def __init__(self, hostList):
        self.__mc = memcache.Client(hostList);

    def set(self, key, value):
        result = self.__mc.set(key, value)
        return result
    def has(self, key):
        return self.get(key) != None;

    def get(self, key):
        name = self.__mc.get(key)
        return name

    def delete(self, key):
        result = self.__mc.delete(key)
        return result

if __name__ == '__main__':
    mc = MemcachedClient(["127.0.0.1:11211"])
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